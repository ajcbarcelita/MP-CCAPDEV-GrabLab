import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file
const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

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
    });

// Start the server and listen on specified port in .env for requests
app.listen(process.env.PORT, () => {
    console.log(`✅ Server is running on port ${process.env.PORT}`);
});
