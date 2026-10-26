// server.js — Main entry point for the Node.js/Express backend
require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import route handlers
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

// Allow requests from the React frontend (CORS policy)
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter(Boolean),
    credentials: true,
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);           // Registration, login, profile
app.use("/api/game", gameRoutes);           // Puzzle fetching, answer submission
app.use("/api/leaderboard", leaderboardRoutes); // Leaderboard data

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "🍌 Banana Puzzle Game API is running!" });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
