import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";
import labRoutes from "./routes/labRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import labSlotRoutes from "./routes/labSlotRoutes.js";

// Load environment variables from .env file
dotenv.config();
console.log(
  "Environment loaded. MONGODB_URI exists:",
  !!process.env.MONGODB_URI
);

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configure profile pictures directory
const profilePicsDir = path.join(__dirname, "uploads", "profile_pictures");

// Ensure directory exists
if (!fs.existsSync(profilePicsDir)) {
  fs.mkdirSync(profilePicsDir, { recursive: true });
  console.log(`Created profile pictures directory: ${profilePicsDir}`);
}

// Serve profile pictures
app.use("/uploads/profile_pictures", express.static(profilePicsDir));
app.use(express.static(path.join(__dirname, "public")));

// API Routes with error handling
app.use("/api/users", userRoutes);
app.use(
  "/api/labs",
  (req, res, next) => {
    console.log("Lab route accessed:", req.method, req.path);
    next();
  },
  labRoutes
);
app.use("/api/reservations", reservationRoutes);
app.use("/api/labslots", labSlotRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ message: err.message });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB!");
    console.log("Database name:", conn.connection.name);
    console.log("Connected to host:", conn.connection.host);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Catch-all route to serve index.html for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

connectDB();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
