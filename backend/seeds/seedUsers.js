import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import rawUsers from "../../frontend/src/data/users.js";

const users = rawUsers.map((user) => ({
  email: user.email,
  password: user.password,
  fname: user.first_name, // edits here
  lname: user.last_name, //
  role: user.role,
  status: user.status,
  profile_pic_path: user.profile_pic_path,
  description: user.description,
}));

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🌱 Connected to MongoDB");

    await User.deleteMany({});
    console.log("🧹 Existing users removed");

    await User.insertMany(users);
    console.log("✅ Users seeded successfully");
  } catch (err) {
    console.error("❌ Seeding users failed:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();

// To run this script, do npm run seed:users
