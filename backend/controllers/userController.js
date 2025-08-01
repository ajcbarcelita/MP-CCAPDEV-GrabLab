import User from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwtPkg from "jsonwebtoken";

const jwt = jwtPkg;
const { TokenExpiredError } = jwtPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "../uploads/profile_pictures");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/profile_pictures"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});

/**
 * @desc    Update user profile picture
 * @route   POST /api/users/:userId/profile-picture
 * @access  Private
 * @param   req.params.userId - User ID
 * @param   req.file - Uploaded image file
 * @returns Updated user object (transformed for frontend)
 */
const updateUserProfilePicture = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log("Controller: Updating profile picture for user:", userId);

        const numericUserId = parseInt(userId, 10);

        if (isNaN(numericUserId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findOne({ user_id: numericUserId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Delete old profile picture if it exists
        if (user.profile_pic_path) {
            const oldPicPath = path.join(__dirname, "..", user.profile_pic_path);
            if (fs.existsSync(oldPicPath)) {
                fs.unlinkSync(oldPicPath);
            }
        }

        // Update profile picture path
        user.profile_pic_path = `/uploads/profile_pictures/${req.file.filename}`;
        const updatedUser = await user.save();

        // Transform data to match frontend expectations
        const transformedUser = {
            user_id: updatedUser.user_id,
            first_name: updatedUser.fname,
            last_name: updatedUser.lname,
            email: updatedUser.email,
            role: updatedUser.role,
            description: updatedUser.description || "",
            profile_pic_path: updatedUser.profile_pic_path,
            status: updatedUser.status || "active",
            created_at: updatedUser.createdAt,
            updated_at: updatedUser.updatfedAt,
        };

        res.json(transformedUser);
    } catch (error) {
        console.error("Profile picture update error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Update user profile picture
 * @route   POST /api/users/:userId/profile-picture
 * @access  Private
 * @param   req.params.userId - User ID
 * @param   req.file - Uploaded image file
 * @returns Updated user object (transformed for frontend)
 */
const registerUser = async (req, res) => {
    const { email, password, fname, lname, mname = "", role = "Student", status = "Active", profile_pic_path = "", description = ""} = req.body;

    console.log("Registering user with email:", email);

    // Ensure default profile picture path if missing or empty
    const finalProfilePicPath =
        !profile_pic_path || profile_pic_path.trim() === ""
            ? "/uploads/profile_pictures/default_profile_picture.jpeg"
            : profile_pic_path;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Get the next available user_id
        const lastUser = await User.findOne().sort({ user_id: -1 });
        const nextUserId = lastUser ? lastUser.user_id + 1 : 1;

        const user = await User.create({
            user_id: nextUserId,
            email,
            password,
            fname,
            lname,
            mname,
            role,
            status,
            profile_pic_path: finalProfilePicPath,
            description: "",
        });

        res.status(201).json({
            user_id: user.user_id,
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            role: user.role,
            profile_pic_path: user.profile_pic_path,
            status: user.status,
            description: user.description,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/users/login
 * @access  Public
 * @param   req.body.email, password, rememberMe
 * @returns User object and JWT token (sets cookie)
 */
const loginUser = async (req, res) => {
    const { email, password, rememberMe } = req.body;
    console.log("Login attempt for email:", email);

    try {
        const user = await User.findOne({ email });

        // If user not found, return 401 Unauthorized
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // If user is inactive, return 403 Forbidden
        if (user.status === "Inactive") {
            return res.status(403).json({ message: "Your account is inactive. Contact the administrator for help." });
        }

        // If password is incorrect, return 401 Unauthorized
        if (!(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Create JWT token
        const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: rememberMe ? "21d" : "1d",
        });

        // Set token as a httpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: rememberMe ? 1000 * 60 * 24 * 21 : 1000 * 60 * 60 * 24, // 21 days or 1 day
            sameSite: "Strict", // Prevent CSRF attacks
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        });

        // Transform user data to match frontend expectations
        res.json({
            user_id: user.user_id,
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            role: user.role,
            token,
        });
    } catch (err) {
        // Log the error for debugging
        console.error("Login error:", err);
        if (err instanceof TokenExpiredError) {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Public (or add auth middleware later)
 * @returns Array of all users (transformed, no password)
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select("-password") // Exclude password field
            .sort({ createdAt: -1 });

        // Transform data to match frontend expectations
        const transformedUsers = users.map((user) => ({
            user_id: user.user_id,
            first_name: user.fname,
            last_name: user.lname,
            mname: user.mname || '',
            email: user.email,
            role: user.role,
            description: user.description || "",
            profile_pic_path: user.profile_pic_path || null,
            status: user.status || "active",
            created_at: user.createdAt,
            updated_at: user.updatedAt,
        }));

        res.json(transformedUsers);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:userId
 * @access  Public (or add auth middleware later)
 * @param   req.params.userId - User ID
 * @returns User object (transformed, no password)
 */
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("Backend received userId:", userId, "Type:", typeof userId);

        // Convert userId to number for consistent comparison
        const numericUserId = parseInt(userId, 10);
        console.log("Converted to numeric userId:", numericUserId);

        const user = await User.findOne({ user_id: numericUserId }).select("-password").lean();
        console.log("User found in DB:", user ? "Yes" : "No");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Transform data to match frontend expectations
        const transformedUser = {
            user_id: user.user_id,
            first_name: user.fname,
            last_name: user.lname,
            mname: user.mname || '',
            email: user.email,
            role: user.role,
            description: user.description || "",
            profile_pic_path: user.profile_pic_path || null,
            status: user.status || "active",
            created_at: user.createdAt,
            updated_at: user.updatedAt,
        };

        res.json(transformedUser);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * @desc    Soft delete user (set status to 'Inactive')
 * @route   DELETE /api/users/:userId
 * @access  Private
 * @param   req.params.userId - User ID
 * @returns Success message and updated user object
 */
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ user_id: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Instead of deleting, update the status to "Inactive"
        const updatedUser = await User.findOneAndUpdate({ user_id: userId }, { status: "Inactive" }, { new: true });

        res.json({
            message: "User marked as inactive successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error marking user as inactive:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update user profile (name, description)
 * @route   PUT /api/users/:userId
 * @access  Private
 * @param   req.params.userId - User ID
 * @param   req.body.fname, lname, description
 * @returns Updated user object (transformed)
 */
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fname, lname, mname, description, status } = req.body;

        const user = await User.findOne({ user_id: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields if provided
        if (fname !== undefined) user.fname = fname;
        if (lname !== undefined) user.lname = lname;
        if (mname !== undefined) user.mname = mname;
        if (description !== undefined) user.description = description;
        if (status !== undefined) user.status = status;

        const updatedUser = await user.save();

        // Transform data to match frontend expectations
        const transformedUser = {
            user_id: updatedUser.user_id,
            first_name: updatedUser.fname,
            last_name: updatedUser.lname,
            mname: updatedUser.mname || '',
            email: updatedUser.email,
            role: updatedUser.role,
            description: updatedUser.description || "",
            profile_pic_path: updatedUser.profile_pic_path || null,
            status: updatedUser.status || "active",
            created_at: updatedUser.createdAt,
            updated_at: updatedUser.updatedAt,
        };

        res.json(transformedUser);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export { loginUser, deleteUser, updateUser, upload, getAllUsers, getUserById, registerUser, updateUserProfilePicture };
