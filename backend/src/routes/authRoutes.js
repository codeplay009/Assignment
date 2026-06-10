const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passwordController = require("../controllers/passwordController");
const auth = require("../middleware/auth");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", passwordController.forgotPassword);
router.post("/reset-password", passwordController.resetPassword);

// Protected routes
router.get("/me", auth, authController.getMe);

module.exports = router;
