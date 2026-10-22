// authMiddleware.js — Protects routes by verifying the JWT token
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // JWT tokens are sent in the Authorization header as "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract the token from the header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database and attach to the request object
      // We exclude the password field for security
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized — user not found" });
      }

      next(); // Continue to the actual route handler
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized — invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized — no token provided" });
  }
};

module.exports = { protect };
