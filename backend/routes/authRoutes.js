// authRoutes.js — Handles user registration and login
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Helper function to generate a JWT token for a user
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

// ─── POST /api/auth/register ─────────────────────────────────────────────────
// Event: User submits the registration form
// Creates a new user account with a hashed password
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const cleanUsername = username?.trim();
  const cleanEmail = email?.trim().toLowerCase();

  // Basic input validation
  if (!cleanUsername || !cleanEmail || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return res.status(400).json({ message: "Username must be 3-20 characters" });
  }

  try {
    // Check if a user with this email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return res.status(400).json({ message: "Email is already registered" });
      }
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Hash the password before storing it — security best practice
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user in MongoDB
    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
    });

    // Return user info and a JWT token
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      totalScore: user.totalScore,
      totalAttempts: user.totalAttempts,
      correctAnswers: user.correctAnswers,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
// Event: User submits the login form
// Verifies credentials and returns a JWT token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanEmail || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the submitted password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Return user info and a JWT token
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      totalScore: user.totalScore,
      totalAttempts: user.totalAttempts,
      correctAnswers: user.correctAnswers,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ─── GET /api/auth/profile ───────────────────────────────────────────────────
// Protected route — returns the logged-in user's profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

module.exports = router;
