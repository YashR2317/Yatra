const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controllers");
const ensureAuthenticated = require("../middleware/auth.middleware");
const {
    validate,
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    changePasswordSchema,
    deleteAccountSchema
} = require("../../shared/validators");
const { authLimiter } = require("../../shared/security");
const { googleLogin } = require("../controllers/google-auth.controller");

// Public routes — with input validation
router.post("/signup", validate(signupSchema), authController.userSignup);
router.post("/login", validate(loginSchema), authController.userLogin);
router.post("/google", authLimiter, googleLogin);

// Password reset (public, rate-limited)
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.get("/me", ensureAuthenticated, authController.getMe);
router.post("/logout", ensureAuthenticated, authController.logout);

// Profile & account management (protected)
router.put("/profile", ensureAuthenticated, validate(updateProfileSchema), authController.updateProfile);
router.put("/change-password", ensureAuthenticated, validate(changePasswordSchema), authController.changePassword);
router.delete("/account", ensureAuthenticated, validate(deleteAccountSchema), authController.deleteAccount);

module.exports = router;