const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controllers");
const ensureAuthenticated = require("../middleware/auth.middleware");

// Public routes
router.post("/signup", authController.userSignup);
router.post("/login", authController.userLogin);

// Protected routes
router.get("/me", ensureAuthenticated, authController.getMe);
router.post("/logout", ensureAuthenticated, authController.logout);

module.exports = router;