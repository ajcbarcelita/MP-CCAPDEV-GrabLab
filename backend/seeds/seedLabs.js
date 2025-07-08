import mongoose from "mongoose";
import dotenv from "dotenv";
import Lab from "../models/Lab.js";
import labs from "./labs.js";

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
