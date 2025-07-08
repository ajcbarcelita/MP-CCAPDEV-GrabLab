import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/, "Please enter a valid DLSU email address."],
        },
        password: {
            // note that in Phase 3, to be changed to hashed password
            type: String,
            required: true,
            trim: true,
            minlength: 8,
        },
        fname: {
            type: String,
            required: true,
            trim: true,
        },
        lname: {
            type: String,
            required: true,
            trim: true,
        },
        mname: {
            type: String,
            required: false,
            trim: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["Student", "Technician", "Admin"],
            default: "Student",
        },
        status: {
            type: String,
            required: true,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
        profile_pic_path: {
            type: String,
            required: false,
            default: "/uploads/profile_pictures/default_profile_picture.jpeg", // Default profile picture path
            trim: true,
        },
        description: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500, // Optional: Limit the description length
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema); // Export the User model
// This allows us to use the User model in other parts of the application for CRUD operations.
