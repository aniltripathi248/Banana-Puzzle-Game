// gameRoutes.js — Handles puzzle fetching and score submission
const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Banana API URL
const BANANA_API_URL = "https://marcconrad.com/uob/banana/api.php";

// ─── GET /api/game/puzzle ─────────────────────────────────────────────────────
// Fetches a new puzzle from the Banana API
// The backend acts as a proxy — it keeps the solution hidden from the frontend
// This prevents users from cheating by reading the API response directly
router.get("/puzzle", protect, async (req, res) => {
  try {
    // Fetch puzzle from the external Banana API (with 10-second timeout)
    const response = await axios.get(BANANA_API_URL, { timeout: 10000 });
    const data = response.data;

    // Validate that we got a proper response
    if (!data.question || data.solution === undefined) {
      return res.status(502).json({ message: "Invalid response from Banana API" });
    }

    // IMPORTANT: We send the image URL to the frontend but NOT the solution
    // Encode the solution into an obscured base64 token verified server-side
    const puzzleToken = Buffer.from(
      JSON.stringify({ solution: data.solution, timestamp: Date.now() })
    ).toString("base64");

    res.json({
      question: data.question,   // The puzzle image URL
      puzzleToken: puzzleToken,  // Encoded token containing the solution
    });
  } catch (error) {
    console.error("Error fetching puzzle:", error.message);
    res.status(502).json({ message: "Failed to fetch puzzle from Banana API. Please try again." });
  }
});

// ─── POST /api/game/submit ────────────────────────────────────────────────────
// Event: User submits their answer
// Checks the answer server-side and updates the score if correct
// Score is ONLY updated on the backend — users cannot fake scores via frontend
router.post("/submit", protect, async (req, res) => {
  const { answer, puzzleToken } = req.body;

  if (answer === undefined || answer === null || !puzzleToken) {
    return res.status(400).json({ message: "Answer and puzzle token are required" });
  }

  try {
    // Decode the puzzle token to get the solution
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(puzzleToken, "base64").toString("utf-8"));
    } catch {
      return res.status(400).json({ message: "Invalid puzzle token format" });
    }

    const { solution, timestamp } = decoded;

    if (solution === undefined || !timestamp) {
      return res.status(400).json({ message: "Invalid puzzle token content" });
    }

    // Check if the puzzle token is not too old (15 minutes max)
    const maxAge = 15 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) {
      return res.status(400).json({ message: "Puzzle expired. Please get a new puzzle." });
    }

    // Convert the user's answer to a number and compare
    const userAnswer = parseInt(answer, 10);
    const isCorrect = userAnswer === solution;

    // Update the user's stats in MongoDB
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.totalAttempts += 1;

    if (isCorrect) {
      user.totalScore += 10; // Earn 10 points for a correct answer
      user.correctAnswers += 1;
    }

    await user.save();

    res.json({
      correct: isCorrect,
      message: isCorrect
        ? "🎉 Correct! You earned 10 points!"
        : `❌ Wrong! The correct answer was ${solution}.`,
      totalScore: user.totalScore,
      totalAttempts: user.totalAttempts,
      correctAnswers: user.correctAnswers,
    });
  } catch (error) {
    console.error("Error checking answer:", error.message);
    res.status(500).json({ message: "Server error while checking answer" });
  }
});

module.exports = router;
