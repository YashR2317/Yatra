const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../utils/email");

const getJwtSecret = () => process.env.JWT_SECRET || "dev-secret";

// Helper: sign JWT and return token + sanitised user
const signTokenAndRespond = (user, statusCode, res, message) => {
    const token = jwt.sign({ id: user._id }, getJwtSecret(), { expiresIn: "7d" });

    // Strip password from response
    const userObj = user.toObject();
    delete userObj.password;

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
