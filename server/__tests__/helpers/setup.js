/**
 * Test helper — creates the Express app without starting a listener.
 * supertest handles the actual server lifecycle internally.
 */
const path = require('path');
const dotenv = require('dotenv');

// Load env before anything else
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const express = require('express');
const { secureCors, securityHeaders, sanitizeBody } = require('../../shared/security');
const connectDB = require('../../auth/config/db');
const authRoutes = require('../../auth/routes/auth.routes');
const { apiRoutes: agentRoutes, initAgent } = require('../../agent/src/server');
const userRoutes = require('../../routes/user.routes');

let dbConnected = false;
let agentInitialized = false;

/**
 * Create a fresh Express app for testing.
 * Does NOT call app.listen() — supertest handles that.
 */
function createApp() {
    const app = express();

    app.use(securityHeaders());
    app.use(secureCors());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '100kb' }));
    app.use(sanitizeBody);

    // Mount routes (same as unified server)
    app.use('/api/auth', authRoutes);
    app.use('/api/agent', agentRoutes);
    app.use('/api/user', userRoutes);

    app.get('/api/health', (req, res) => {
        res.json({ service: 'brajyatra-unified', status: 'ok' });
    });

    // Error handler
    app.use((err, req, res, next) => {
        res.status(err.status || 500).json({ error: err.message });
    });

    return app;
}

/**
 * Initialize databases (run once before all tests).
 */
async function initDatabases() {
    if (!dbConnected) {
        await connectDB();
        dbConnected = true;
    }
    if (!agentInitialized) {
        initAgent();
        agentInitialized = true;
    }
}

module.exports = { createApp, initDatabases };
