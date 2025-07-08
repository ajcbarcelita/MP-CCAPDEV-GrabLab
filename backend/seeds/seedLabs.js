import mongoose from "mongoose";
import dotenv from "dotenv";
import Lab from "../models/Lab.js"; // adjust path if needed
import labs from "../../frontend/src/data/labs.js"; // your hardcoded user array

dotenv.config();

const seedLabs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🌱 Connected to MongoDB");

        await Lab.deleteMany({});
        console.log("🧹 Existing labs removed");

        await Lab.insertMany(labs);
        console.log("✅ Labs seeded successfully");
    } catch (err) {
        console.error("❌ Seeding labs failed:", err);
    } finally {
        mongoose.connection.close();
    }
};

seedLabs();
