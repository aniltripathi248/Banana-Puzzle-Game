// db.js — Connects to MongoDB using Mongoose with auto-start fallback
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const mongoose = require("mongoose");

// Helper to find the mongod executable on Windows
const findMongodPath = () => {
  const commonPaths = [
    "C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe",
  ];
  for (const p of commonPaths) {
    if (fs.existsSync(p)) return p;
  }
  const base = "C:\\Program Files\\MongoDB\\Server";
  if (fs.existsSync(base)) {
    try {
      const versions = fs.readdirSync(base);
      for (const v of versions) {
        const candidate = path.join(base, v, "bin", "mongod.exe");
        if (fs.existsSync(candidate)) return candidate;
      }
    } catch {
      // Ignore directory read errors
    }
  }
  return null;
};

// Helper to auto-start local mongod
const autoStartMongod = async () => {
  const mongodPath = findMongodPath();
  if (!mongodPath) return false;

  const dbPath = path.resolve(__dirname, "..", "data", "db");
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  console.log("⚡ Auto-starting MongoDB server in the background...");
  try {
    const child = spawn(
      mongodPath,
      ["--dbpath", dbPath, "--bind_ip", "127.0.0.1", "--port", "27017"],
      { detached: true, stdio: "ignore" }
    );
    child.unref();

    // Wait up to 5 seconds for mongod to accept connections
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        await mongoose.connect("mongodb://127.0.0.1:27017/banana_puzzle_game", {
          serverSelectionTimeoutMS: 1500,
        });
        return true;
      } catch {
        // Keep waiting
      }
    }
  } catch (err) {
    console.error("Failed to auto-start MongoDB:", err.message);
  }
  return false;
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/banana_puzzle_game";

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    // If local connection was refused, attempt to auto-launch local mongod
    if (
      (error.message.includes("ECONNREFUSED") || error.message.includes("connect")) &&
      mongoUri.includes("127.0.0.1")
    ) {
      const started = await autoStartMongod();
      if (started) {
        console.log("✅ MongoDB auto-started and connected successfully");
        return;
      }
    }

    console.error("❌ MongoDB connection failed:", error.message);
    console.error("\n👉 Tip: If MongoDB is not running, start it using:");
    console.error("   net start MongoDB");
    console.error("   Or run start.bat from the project folder.\n");
    process.exit(1);
  }
};

module.exports = connectDB;
