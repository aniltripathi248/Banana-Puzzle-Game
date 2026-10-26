// User.js — MongoDB schema for user accounts
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Username is unique — this is the user's virtual identity in the game
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    // Email for login and identification
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Password is stored as a hashed value — never stored as plain text
    password: {
      type: String,
      required: true,
    },

    // Track the user's total score across all games
    totalScore: {
      type: Number,
      default: 0,
    },

    // Track total number of puzzles attempted
    totalAttempts: {
      type: Number,
      default: 0,
    },

    // Track total number of correct answers
    correctAnswers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);
