const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
const express = require('express');
const { seed } = require('./db/seed');
const { getPlacesCount } = require('./db/database');

// ─── Security & Logging ─────────────────────────────────────
const { secureCors, securityHeaders, generalLimiter, sanitizeBody } = require('../../shared/security');
const { createLogger, requestLogger, errorHandler } = require('../../shared/logger');

const logger = createLogger('agent');

// ─── API Routes (exported for unified server) ───────────────
const apiRoutes = require('./routes/api');

// ─── Agent Static Files Path ────────────────────────────────
const AGENT_PUBLIC_PATH = path.join(__dirname, '..', 'public');

/**
 * Initialize the agent subsystem (seed DB if needed).
 * Called by the unified server or standalone startup.
 */
function initAgent() {
    const count = getPlacesCount();
    if (count === 0) {
        logger.info('Seeding database...');
        seed();
    } else {
        logger.info(`Database has ${count} places`);
    }
}

/**
 * Export for unified server:
 *   - apiRoutes: Express Router to mount at /api/agent
 *   - initAgent: DB initialization function
 *   - agentPublicPath: Path to static files to serve at /agent
 */
module.exports = {
    apiRoutes,
    initAgent,
    agentPublicPath: AGENT_PUBLIC_PATH,
    logger
};

// ─── Standalone Mode ────────────────────────────────────────
// Only runs when executed directly: `node src/server.js`
if (require.main === module) {
    const app = express();
    const PORT = process.env.AGENT_PORT || 3000;

    // ─── Security Middleware ─────────────────────────────────────
    app.use(securityHeaders());       // Helmet headers
    app.use(secureCors());            // Restricted CORS
    app.use(generalLimiter());        // Global rate limit
    app.use(express.json({ limit: '1mb' }));
    app.use(sanitizeBody);            // Strip HTML from inputs
    app.use(requestLogger(logger));   // Structured request logging

    // ─── Static Files (Agent Chat UI) ───────────────────────────
    app.use(express.static(AGENT_PUBLIC_PATH, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            } else if (filePath.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css; charset=utf-8');
            }
        }
    }));

    // ─── API Routes ─────────────────────────────────────────────
    app.use('/api', apiRoutes);

    // ─── Fallback to Agent UI ───────────────────────────────────
    app.get('*', (req, res) => {
        res.sendFile(path.join(AGENT_PUBLIC_PATH, 'index.html'));
    });

    // ─── Global Error Handler (must be last) ────────────────────
    app.use(errorHandler(logger));

    // ─── Startup ────────────────────────────────────────────────
    let server;

    async function start() {
        logger.info('╔══════════════════════════════════════════╗');
        logger.info('║     🙏 BrajYatra AI Multi-Agent System    ║');
        logger.info('╚══════════════════════════════════════════╝');

        initAgent();

        server = app.listen(PORT, () => {
            logger.info(`Agent server running on http://localhost:${PORT}`);
            logger.info(`LLM Mode: ${process.env.LLM_MODE || 'gemini'}`);
            logger.info(`CORS: ${process.env.ALLOWED_ORIGINS || 'localhost (development)'}`);
            logger.info(`Rate limiting: ✅ Enabled`);
            logger.info(`Ready to plan your Braj Yatra! 🛕`);
        });
    }

    // ─── Graceful Shutdown ──────────────────────────────────────
    function gracefulShutdown(signal) {
        logger.info(`${signal} received. Shutting down gracefully...`);
        if (server) {
            server.close(() => {
                logger.info('Agent server closed.');
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

    start().catch(err => {
        logger.error(`Failed to start server: ${err.message}`);
        process.exit(1);
    });
}
