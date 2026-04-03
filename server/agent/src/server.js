/**
 * BrajYatra AI Agent — Module Exports
 * ====================================
 * Provides the agent subsystem to the unified server:
 *   - apiRoutes: Express Router to mount at /api/agent
 *   - initAgent: DB initialization function (seeds data if needed)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
const { seed } = require('./db/seed');
const { getPlacesCount } = require('./db/database');
const { createLogger } = require('../../shared/logger');

const logger = createLogger('agent');

// ─── API Routes ─────────────────────────────────────────────
const apiRoutes = require('./routes/api');

/**
 * Initialize the agent subsystem (seed DB if needed).
 * Called by the unified server at startup.
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

module.exports = { apiRoutes, initAgent, logger };
