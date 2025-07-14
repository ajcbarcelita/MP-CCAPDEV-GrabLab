import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import users from "./users.js";

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🌱 Connected to MongoDB");

        await User.deleteMany({});
        console.log("🧹 Existing users removed");

        // Hash passwords by using create (runs pre-save hook)
        for (const user of users) {
            await User.create(user);
        }
        console.log("✅ Users seeded successfully");
    } catch (err) {
        console.error("❌ Seeding users failed:", err);
    } finally {
        mongoose.connection.close();
    }
};

seedUsers();

// To run this script, do npm run seed:users
