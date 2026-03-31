/**
 * Google OAuth Controller
 * Verifies Google ID tokens and creates/links user accounts.
 */
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/email');

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
    expiresIn: '24h',
    issuer: process.env.JWT_ISSUER || 'brajyatra.ai',
};

/**
 * POST /api/auth/google
 * Body: { credential: "<Google ID Token>" }
 *
 * Flow:
 * 1. Verify Google ID token
 * 2. Extract email, name, picture, Google sub ID
 * 3. Find existing user by googleId OR email
 * 4. If found by email (local account) → link Google account
 * 5. If not found → create new user
 * 6. Return JWT + user
 */
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is required.',
            });
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.error('❌ GOOGLE_CLIENT_ID not set in environment');
            return res.status(500).json({
                success: false,
                message: 'Google authentication is not configured.',
            });
        }

        // Verify the Google ID token
        const client = new OAuth2Client(clientId);
        let payload;
        try {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: clientId,
            });
            payload = ticket.getPayload();
        } catch (verifyErr) {
            console.error('❌ Google token verification failed:', verifyErr.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid Google credential.',
            });
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Google account does not have an email address.',
            });
        }

        // --- Find or create user ---
        let user = await User.findOne({ googleId });
        let isNewUser = false;

        if (!user) {
            // Check if a local account exists with same email → link
            user = await User.findOne({ email: email.toLowerCase() });

            if (user) {
                // Link Google to existing local account
                user.googleId = googleId;
                if (!user.avatar && picture) user.avatar = picture;
                // Keep authProvider as 'local' if they had a password,
                // so they can still use email/password login too
                await user.save();
                console.log(`🔗 Google linked to existing account: ${email}`);
            } else {
                // Create brand new Google-only account
                user = await User.create({
                    name: name || email.split('@')[0],
                    email: email.toLowerCase(),
                    authProvider: 'google',
                    googleId,
                    avatar: picture || '',
                    isVerified: true, // Google accounts are pre-verified
                });
                isNewUser = true;
                console.log(`👤 New Google user: ${email} (${name})`);
            }
        } else {
            // Returning Google user — update avatar if changed
            if (picture && user.avatar !== picture) {
                user.avatar = picture;
                await user.save();
            }
        }

        // Sign our JWT
        const token = jwt.sign(
            { id: user._id, name: user.name },
            getJwtSecret(),
            JWT_OPTIONS
        );

        // Send welcome email for new users (async, don't block response)
        if (isNewUser) {
            sendWelcomeEmail(user.email, user.name).catch(err => {
                console.warn('📧 Welcome email failed:', err.message);
            });
        }

        res.status(isNewUser ? 201 : 200).json({
            success: true,
            message: isNewUser ? 'Account created with Google!' : 'Logged in with Google!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                authProvider: user.authProvider,
                hasPassword: !!user.password,
            },
        });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during Google authentication.',
        });
    }
};

module.exports = { googleLogin };
