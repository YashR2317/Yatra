
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

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

const ensureAuthenticated = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Not authorized, no token" });
        }

        // Verify with issuer check
        const decoded = jwt.verify(token, getJwtSecret(), {
            issuer: process.env.JWT_ISSUER || "brajyatra.ai"
        });

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res
                .status(401)
                .json({ success: false, message: "Token expired. Please log in again." });
        }
        if (err.name === 'JsonWebTokenError') {
            return res
                .status(401)
                .json({ success: false, message: "Invalid token." });
        }
        console.error("Auth error:", err.message);
        return res
            .status(401)
            .json({ success: false, message: "Authentication failed." });
    }
};

module.exports = ensureAuthenticated;