import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";

dotenv.config(); // Load environment variables from .env file
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Serve static files from the "uploads/profile_pictures" directory for use in profile pictures
app.use("/uploads/profile_pictures", express.static(path.join(__dirname, "uploads", "profile_pictures")));

app.use("/api/users", userRoutes);

// Connect to MongoDB using the MongoDB URI from .env file
if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in .env file");
    process.exit(1); // Exit if MONGODB_URI is not set
}

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB!");
    })
    .catch((err) => {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1); // Quit if DB connection fails
    });

// Start the server and listen on specified port in .env for requests
app.listen(process.env.PORT, () => {
    console.log(`✅ Server is running on port ${process.env.PORT}`);
});
