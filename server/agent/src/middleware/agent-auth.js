/**
 * Lightweight JWT auth middleware for the agent.
 * Uses the SAME JWT_SECRET as the auth server so tokens are interoperable.
 * Non-blocking: sets req.userId if valid, null if not.
 */
const jwt = require('jsonwebtoken');

function agentAuth(req, res, next) {
    req.userId = null;
    req.userName = null;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
        const secret = process.env.JWT_SECRET || 'dev-secret';
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.id || null;
        req.userName = decoded.name || null;
    } catch (e) {
        // Invalid token — continue as anonymous
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
