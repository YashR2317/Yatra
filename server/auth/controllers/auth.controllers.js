const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/email");

// JWT secret — MUST be set in .env. No unsafe fallback in production.
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL: JWT_SECRET environment variable is not set');
        }
        return 'brajyatra-dev-secret-do-not-use-in-production';
    }
    return secret;
};

const JWT_OPTIONS = {
    expiresIn: "24h",
    issuer: process.env.JWT_ISSUER || "brajyatra.ai",
};

// Helper: sign JWT and return token + sanitised user
const signTokenAndRespond = (user, statusCode, res, message) => {
    const token = jwt.sign(
        { id: user._id, name: user.name },
        getJwtSecret(),
        JWT_OPTIONS
    );

    // Strip password from response, add auth metadata
    const userObj = user.toObject();
    const hasPassword = !!userObj.password;
    delete userObj.password;
    userObj.hasPassword = hasPassword;

    res.status(statusCode).json({
        success: true,
        message,
        token,
        user: userObj,
    });
};


// ── REGISTER ────────────────────────────────────────────────────────
exports.userSignup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: "An account with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            authProvider: "local",
        });

        // Fire-and-forget welcome email
        console.log(`\n👤 User registered: ${user.email} (${user.name})`);
        console.log(`📧 Triggering welcome email...`);
        sendWelcomeEmail(user.email, user.name).catch((err) =>
            console.error("❌ Welcome email failed:", err.message)
        );

        signTokenAndRespond(user, 201, res, "Account created successfully! Welcome to BrajYatra.");
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// ── LOGIN ───────────────────────────────────────────────────────────
exports.userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Email not registered. Please sign up first." });
        }

        // If user signed up via Google, they don't have a password
        if (user.authProvider === "google" && !user.password) {
            return res.status(401).json({
                success: false,
                message: "This account uses Google sign-in. Please use the Google button.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        signTokenAndRespond(user, 200, res, "Logged in successfully.");
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// ── GET ME (protected) ──────────────────────────────────────────────
exports.getMe = async (req, res) => {
    // req.user is set by auth middleware (password already excluded)
    res.status(200).json({ success: true, user: req.user });
};

// ── LOGOUT ──────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
    // JWT is stateless — client simply discards the token.
    // This endpoint exists for API completeness.
    res.status(200).json({ success: true, message: "Logged out successfully." });
};

// ── FORGOT PASSWORD ─────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account with that email exists, we've sent a password reset link.",
            });
        }

        // Google OAuth users can't reset passwords
        if (user.authProvider === "google" && !user.password) {
            return res.status(200).json({
                success: true,
                message: "If an account with that email exists, we've sent a password reset link.",
            });
        }

        // Create a reset token using JWT (1 hour expiry)
        // The secret is derived from the user's current password hash,
        // so the token auto-invalidates when the password changes.
        const resetSecret = getJwtSecret() + (user.password || '');
        const resetToken = jwt.sign(
            { id: user._id, purpose: 'password-reset' },
            resetSecret,
            { expiresIn: '1h', issuer: process.env.JWT_ISSUER || 'brajyatra.ai' }
        );

        // Send reset email (fire-and-forget)
        console.log(`\n🔑 Password reset requested for: ${user.email}`);
        sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) =>
            console.error("❌ Reset email failed:", err.message)
        );

        res.status(200).json({
            success: true,
            message: "If an account with that email exists, we've sent a password reset link.",
            // In development, return the token for easier testing
            ...(process.env.NODE_ENV !== 'production' && { resetToken }),
        });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// ── RESET PASSWORD ──────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        // Decode token WITHOUT verification first to get user ID
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.id || decoded.purpose !== 'password-reset') {
            return res.status(400).json({ success: false, message: "Invalid or expired reset link." });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset link." });
        }

        // Now verify with the derived secret (includes current password hash)
        const resetSecret = getJwtSecret() + (user.password || '');
        try {
            jwt.verify(token, resetSecret, {
                issuer: process.env.JWT_ISSUER || 'brajyatra.ai'
            });
        } catch (verifyErr) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset link." });
        }

        // Hash new password and save
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        console.log(`\n✅ Password reset successful for: ${user.email}`);

        res.status(200).json({
            success: true,
            message: "Password reset successfully! You can now log in with your new password.",
        });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// ── UPDATE PROFILE (protected) ──────────────────────────────────
exports.updateProfile = async (req, res) => {
    const { name, avatar } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (name) user.name = name;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        const userObj = user.toObject();
        delete userObj.password;

        console.log(`\n✏️  Profile updated: ${user.email} → name="${user.name}"`);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: userObj,
        });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// ── CHANGE PASSWORD (protected) ─────────────────────────────────
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Google OAuth users can't change password (they don't have one)
        if (user.authProvider === "google" && !user.password) {
            return res.status(400).json({
                success: false,
                message: "Google accounts cannot change password. Use Google to manage your credentials.",
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect." });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ success: false, message: "New password must be different from the current one." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        console.log(`\n🔑 Password changed for: ${user.email}`);

        // Return a new token since the old one should be considered stale
        const token = jwt.sign(
            { id: user._id, name: user.name },
            getJwtSecret(),
            JWT_OPTIONS
        );

        res.status(200).json({
            success: true,
            message: "Password changed successfully.",
            token,
        });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// ── DELETE ACCOUNT (protected) ──────────────────────────────────
exports.deleteAccount = async (req, res) => {
    const { password } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Verify password for local accounts
        if (user.authProvider === "local" && user.password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Password is incorrect." });
            }
        }

        const email = user.email;
        const userId = user._id.toString();

        // Delete user from MongoDB
        await User.findByIdAndDelete(user._id);

        // Attempt to purge agent data (SQLite) — fire-and-forget
        try {
            const path = require('path');
            const Database = require('better-sqlite3');
            const dbPath = path.join(__dirname, '..', '..', 'agent', 'data', 'braj_yatra.db');
            const db = new Database(dbPath);
            db.prepare('DELETE FROM itineraries WHERE user_id = ?').run(userId);
            db.prepare('DELETE FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE user_id = ?)').run(userId);
            db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
            db.close();
            console.log(`\n🗑️ Agent data purged for user: ${userId}`);
        } catch (sqliteErr) {
            // SQLite cleanup is best-effort — don't fail the request
            console.warn(`⚠️  Agent data cleanup skipped: ${sqliteErr.message}`);
        }

        console.log(`\n❌ Account deleted: ${email} (${userId})`);

        res.status(200).json({
            success: true,
            message: "Your account has been permanently deleted.",
        });
    } catch (err) {
        console.error("Delete account error:", err);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};
