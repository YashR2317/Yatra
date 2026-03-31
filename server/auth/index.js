
const path = require('path');
const express = require("express");
const connectDB = require("./config/db");
const dotenv = require('dotenv');

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// ─── Security & Logging ─────────────────────────────────────
const { secureCors, securityHeaders, generalLimiter, authLimiter, sanitizeBody } = require('../shared/security');
const { createLogger, requestLogger, errorHandler } = require('../shared/logger');

const logger = createLogger('auth');

// ─── Validate critical environment variables ────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret') {
    if (process.env.NODE_ENV === 'production') {
        logger.error('FATAL: JWT_SECRET is not set or is using the default. Set a strong secret in .env');
        process.exit(1);
    } else {
        logger.warn('JWT_SECRET is using default value. Set a strong secret in .env for production.');
    }
}

const authRoutes = require('./routes/auth.routes');
const { sendWelcomeEmail } = require('./utils/email');

const app = express();

// ─── Security Middleware ─────────────────────────────────────
app.use(securityHeaders());       // Helmet: CSP, HSTS, X-Frame-Options, etc.
app.use(secureCors());            // Restricted CORS (not origin: true)
app.use(generalLimiter());        // Global: 100 req/15min per IP
app.use(express.json({ limit: '100kb' }));  // Body size limit
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(sanitizeBody);            // Strip HTML tags from all inputs
app.use(requestLogger(logger));   // Structured request logging

// ─── API Routes ─────────────────────────────────────────────
// Auth routes get extra-strict rate limiting
app.use('/api/auth', authLimiter(), authRoutes);

// ─── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        service: 'auth',
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ─── Email Test (development only) ──────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.get('/api/test-email', async (req, res) => {
        const testTo = req.query.to || "delivered@resend.dev";
        logger.info(`Test email requested — sending to: ${testTo}`);
        try {
            await sendWelcomeEmail(testTo, "Test User");
            res.json({ success: true, message: `Test email sent to ${testTo}` });
        } catch (err) {
            logger.error(`Test email failed: ${err.message}`);
            res.status(500).json({ success: false, message: err.message });
        }
    });
}

// ─── Global Error Handler (must be last) ────────────────────
app.use(errorHandler(logger));

// ─── Database Connection & Server Startup ───────────────────
connectDB();

const port = process.env.AUTH_PORT || 5000;

// ─── Graceful Shutdown ──────────────────────────────────────
let server;
function gracefulShutdown(signal) {
    logger.info(`${signal} received. Shutting down gracefully...`);
    if (server) {
        server.close(() => {
            logger.info('Auth server closed.');
            process.exit(0);
        });
        // Force exit after 10s
        setTimeout(() => process.exit(1), 10000);
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception: ${err.message}`, { stack: err.stack });
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled rejection: ${reason}`);
});

server = app.listen(port, () => {
    logger.info(`Auth server running on http://localhost:${port}`);
    logger.info(`Email: Resend API ${process.env.RESEND_API_KEY ? "✅ Configured" : "⚠️  NOT SET"}`);
    logger.info(`CORS: ${process.env.ALLOWED_ORIGINS || 'localhost (development)'}`);
    logger.info(`Rate limiting: ✅ Enabled`);
});