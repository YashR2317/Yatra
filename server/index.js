/**
 * BrajYatra Unified Server
 * ========================
 * Single Express server combining auth + agent services.
 *
 * Route structure:
 *   /api/auth/*   — Authentication (login, signup, profile, etc.)
 *   /api/agent/*  — AI Agent (chat, places, itinerary, weather, etc.)
 *   /api/user/*   — User data (saved itineraries, chat sessions)
 *   /api/health   — Server health check
 *   /agent/*      — Agent static UI (HTML/CSS/JS)
 */

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

// Load environment from root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ─── Security & Logging ─────────────────────────────────────
const { secureCors, securityHeaders, generalLimiter, authLimiter, sanitizeBody } = require('./shared/security');
const { createLogger, requestLogger, errorHandler } = require('./shared/logger');

const logger = createLogger('server');

// ─── Validate critical environment variables ────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret') {
    if (process.env.NODE_ENV === 'production') {
        logger.error('FATAL: JWT_SECRET is not set or is using the default. Set a strong secret in .env');
        process.exit(1);
    } else {
        logger.warn('JWT_SECRET is using default value. Set a strong secret in .env for production.');
    }
}

// ─── Import Sub-systems ─────────────────────────────────────
const connectDB = require('./auth/config/db');
const authRoutes = require('./auth/routes/auth.routes');
const { sendWelcomeEmail } = require('./auth/utils/email');
const { apiRoutes: agentRoutes, initAgent, agentPublicPath } = require('./agent/src/server');
const userRoutes = require('./routes/user.routes');

// ─── Express App ────────────────────────────────────────────
const app = express();

// ─── Security Middleware (shared for both services) ─────────
app.use(securityHeaders());                            // Helmet headers
app.use(secureCors());                                 // Restricted CORS
app.use(generalLimiter());                             // Global rate limit
app.use(express.json({ limit: '1mb' }));               // Larger limit for agent payloads
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(sanitizeBody);                                 // Strip HTML from inputs
app.use(requestLogger(logger));                        // Structured request logging

// ─── Auth Routes (/api/auth/*) ──────────────────────────────
app.use('/api/auth', authLimiter(), authRoutes);

// ─── Agent Routes (/api/agent/*) ────────────────────────────
app.use('/api/agent', agentRoutes);

// ─── User Data Routes (/api/user/*) ─────────────────────────
app.use('/api/user', userRoutes);

// ─── Agent Static UI (/agent/*) ─────────────────────────────
app.use('/agent', express.static(agentPublicPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
    }
}));

// SPA fallback for agent UI (serve index.html for all /agent/* paths)
app.get('/agent/*', (req, res) => {
    res.sendFile(path.join(agentPublicPath, 'index.html'));
});

// ─── Client Static Files (production build) ─────────────────
const clientBuildPath = path.join(__dirname, 'public', 'client');
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(clientBuildPath, { maxAge: '1y', immutable: true }));

    // SPA fallback: serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
        // Skip API and agent routes
        if (req.path.startsWith('/api/') || req.path.startsWith('/agent')) {
            return next();
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
    logger.info('Production mode: serving built client from /public/client');
}

// ─── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        service: 'brajyatra-unified',
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        subsystems: { auth: 'ok', agent: 'ok' }
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
connectDB();      // MongoDB for auth
initAgent();      // SQLite for agent (seeds data if needed)

const PORT = process.env.AUTH_PORT || 5000;

// ─── Graceful Shutdown ──────────────────────────────────────
let server;
function gracefulShutdown(signal) {
    logger.info(`${signal} received. Shutting down gracefully...`);
    if (server) {
        server.close(() => {
            logger.info('Server closed.');
            process.exit(0);
        });
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

server = app.listen(PORT, () => {
    logger.info('╔══════════════════════════════════════════════╗');
    logger.info('║   🙏 BrajYatra.AI — Unified Server           ║');
    logger.info('╚══════════════════════════════════════════════╝');
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Routes:`);
    logger.info(`  /api/auth/*   — Authentication`);
    logger.info(`  /api/agent/*  — AI Agent`);
    logger.info(`  /api/user/*   — User Data`);
    logger.info(`  /agent/*      — Agent UI`);
    logger.info(`Email: Resend API ${process.env.RESEND_API_KEY ? "✅ Configured" : "⚠️  NOT SET"}`);
    logger.info(`CORS: ${process.env.ALLOWED_ORIGINS || 'localhost (development)'}`);
    logger.info(`Rate limiting: ✅ Enabled`);
    logger.info(`Ready to plan your Braj Yatra! 🛕`);
});
