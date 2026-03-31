/**
 * Security Middleware — Shared across auth and agent servers
 * Rate limiting, CORS config, Helmet headers, input sanitization
 */
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

/**
 * Parse allowed origins from environment variable.
 * Falls back to localhost in development.
 */
function getAllowedOrigins() {
    const envOrigins = process.env.ALLOWED_ORIGINS;
    if (envOrigins) {
        return envOrigins.split(',').map(o => o.trim());
    }
    // Default development origins
    return [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5000'
    ];
}

/**
 * Configured CORS middleware — restricts to allowed origins only.
 */
function secureCors() {
    const allowedOrigins = getAllowedOrigins();

    return cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, curl, server-to-server)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // In development, allow all localhost origins
            if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')) {
                return callback(null, true);
            }

            return callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
        maxAge: 86400 // Cache preflight for 24h
    });
}

/**
 * Security headers via Helmet — sets Content-Security-Policy, HSTS, etc.
 */
function securityHeaders() {
    return helmet({
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
        crossOriginEmbedderPolicy: false // Allow iframe embedding for agent
    });
}

// ─── Rate Limiters ──────────────────────────────────────────

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 */
function generalLimiter() {
    return rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: 'Too many requests. Please try again later.'
        }
    });
}

/**
 * Auth rate limiter — strict: 10 attempts per 15 minutes for login/signup.
 * Prevents brute-force attacks on credentials.
 */
function authLimiter() {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: 'Too many authentication attempts. Please wait 15 minutes.'
        },
        keyGenerator: (req) => {
            // Rate limit by email to prevent brute-force on one account
            return req.body?.email || 'unknown';
        },
        validate: { xForwardedForHeader: false }
    });
}

/**
 * AI chat rate limiter — moderate: 30 requests per minute per user.
 * Each request costs Gemini API credits.
 */
function chatLimiter() {
    return rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: 'Too many AI requests. Please wait a moment before trying again.'
        },
        keyGenerator: (req) => {
            // Use authenticated userId if available, else let default IP key handle it
            return req.userId || req.headers['x-forwarded-for'] || 'anonymous';
        },
        validate: { xForwardedForHeader: false }
    });
}

/**
 * Basic input sanitization — strips HTML/script tags from string values.
 * Apply as middleware on routes that accept user text input.
 */
function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        for (const key of Object.keys(req.body)) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key]
                    .replace(/<[^>]*>/g, '')  // Strip HTML tags
                    .trim();
            }
        }
    }
    next();
}

module.exports = {
    secureCors,
    securityHeaders,
    generalLimiter,
    authLimiter,
    chatLimiter,
    sanitizeBody,
    getAllowedOrigins
};
