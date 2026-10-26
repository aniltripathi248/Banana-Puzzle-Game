// leaderboardRoutes.js — Returns the top players ranked by score
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// ─── GET /api/leaderboard ─────────────────────────────────────────────────────
// Returns the top 10 users sorted by total score (descending)
// Protected — user must be logged in to see the leaderboard
router.get("/", protect, async (req, res) => {
  try {
    // Query MongoDB for the top 10 users by totalScore (tie-break with correctAnswers and creation date)
    const topUsers = await User.find({})
      .sort({ totalScore: -1, correctAnswers: -1, createdAt: 1 })
      .limit(10)
      .select("username totalScore totalAttempts correctAnswers createdAt");

    // Add a rank number to each user
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      totalScore: user.totalScore,
      totalAttempts: user.totalAttempts,
      correctAnswers: user.correctAnswers,
      accuracy:
        user.totalAttempts > 0
          ? Math.round((user.correctAnswers / user.totalAttempts) * 100)
          : 0,
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error.message);
    res.status(500).json({ message: "Server error fetching leaderboard" });
  }
});

module.exports = router;
