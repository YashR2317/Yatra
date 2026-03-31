/**
 * Structured Logger — Winston-based logging for production
 * Provides consistent log format across both auth and agent servers.
 */
const winston = require('winston');

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, service, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0
        ? ` ${JSON.stringify(meta)}`
        : '';
    return `${timestamp} [${service || 'app'}] ${level}: ${message}${metaStr}`;
});

/**
 * Create a logger instance for a service.
 * @param {string} service — 'auth' | 'agent'
 */
function createLogger(service = 'app') {
    const isProduction = process.env.NODE_ENV === 'production';

    const transports = [
        new winston.transports.Console({
            format: combine(
                colorize(),
                logFormat
            )
        })
    ];

    // In production, also log to files
    if (isProduction) {
        transports.push(
            new winston.transports.File({
                filename: `logs/${service}-error.log`,
                level: 'error',
                maxsize: 5 * 1024 * 1024, // 5MB
                maxFiles: 5
            }),
            new winston.transports.File({
                filename: `logs/${service}-combined.log`,
                maxsize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5
            })
        );
    }

    return winston.createLogger({
        level: isProduction ? 'info' : 'debug',
        defaultMeta: { service },
        format: combine(
            errors({ stack: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
        ),
        transports,
        // Don't exit on uncaught exceptions
        exitOnError: false
    });
}

/**
 * Express request logging middleware.
 * Logs method, URL, status code, and response time.
 */
function requestLogger(logger) {
    return (req, res, next) => {
        const start = Date.now();

        // Log when response finishes
        res.on('finish', () => {
            const duration = Date.now() - start;
            const level = res.statusCode >= 500 ? 'error'
                : res.statusCode >= 400 ? 'warn'
                : 'info';

            logger.log(level, `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration,
                ip: req.ip,
                userId: req.userId || req.user?._id || null
            });
        });

        next();
    };
}

/**
 * Global error handler middleware.
 * Catches unhandled errors and returns a standardized error response.
 */
function errorHandler(logger) {
    return (err, req, res, next) => {
        logger.error(`Unhandled error: ${err.message}`, {
            stack: err.stack,
            method: req.method,
            url: req.originalUrl,
            userId: req.userId || req.user?._id || null
        });

        // Don't leak error details in production
        const isProduction = process.env.NODE_ENV === 'production';
        res.status(err.status || 500).json({
            success: false,
            message: isProduction
                ? 'An internal server error occurred. Please try again.'
                : err.message,
            ...(isProduction ? {} : { stack: err.stack })
        });
    };
}

module.exports = { createLogger, requestLogger, errorHandler };
