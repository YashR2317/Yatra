/**
 * Lightweight JWT auth middleware for the agent.
 * Uses the SAME JWT_SECRET as the auth server so tokens are interoperable.
 * Non-blocking: sets req.userId if valid, null if not.
 */
const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL: JWT_SECRET is not set');
        }
        return 'brajyatra-dev-secret-do-not-use-in-production';
    }
    return secret;
};

function agentAuth(req, res, next) {
    req.userId = null;
    req.userName = null;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, getJwtSecret(), {
            issuer: process.env.JWT_ISSUER || 'brajyatra.ai'
        });
        req.userId = decoded.id || null;
        req.userName = decoded.name || null;
    } catch (e) {
        // Invalid/expired token — continue as anonymous
    }

    next();
}

/**
 * Strict version — returns 401 if not authenticated
 */
function requireAuth(req, res, next) {
    agentAuth(req, res, () => {
        if (!req.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        next();
    });
}

module.exports = { agentAuth, requireAuth };
