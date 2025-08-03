import User from "../models/User.js";
import { logError } from "../utils/logErrors.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwtPkg from "jsonwebtoken";

const jwt = jwtPkg;
const { TokenExpiredError } = jwtPkg;

// Handle import.meta.url being undefined in Jest test environment
let __filename, __dirname;
try {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
} catch (error) {
    // Fallback for test environment where import.meta.url is undefined
    __filename = '';
    __dirname = process.cwd();
}

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

        const numericUserId = parseInt(userId, 10);

        const user = await User.findOne({ user_id: numericUserId });

        if (!user) {
            await logError({ error: new Error("User not found"), req, route: "updateUserProfilePicture" });
            return res.status(404).json({ message: "User not found" });
        }

        if (!req.file) {
            await logError({ error: new Error("No file uploaded"), req, route: "updateUserProfilePicture" });
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
        await logError({ error, req, route: "updateUserProfilePicture" });
        res
            .status(error.message === "Database connection is not ready" ? 503 : 500)
            .json({ message: error.message });
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
    const { email, password, fname, lname, mname = "", role = "Student", status = "Active", profile_pic_path = "", description = "" } = req.body;

    // Ensure default profile picture path if missing or empty
    const finalProfilePicPath =
        !profile_pic_path || profile_pic_path.trim() === ""
            ? "/uploads/profile_pictures/default_profile_picture.jpeg"
            : profile_pic_path;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            await logError({ error: new Error("User already exists"), req, route: "registerUser" });
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
        await logError({ error, req, route: "registerUser" });
        res
            .status(error.message === "Database connection is not ready" ? 503 : 500)
            .json({ message: error.message });
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
    try {
        const user = await User.findOne({ email });

        // If user not found
        if (!user) {
            await logError({ error: new Error("Invalid email or password"), req, route: "loginUser" });
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // If user is inactive
        if (user.status === "Inactive") {
            await logError({ error: new Error("User account is inactive"), req, route: "loginUser" });
            return res.status(403).json({ message: "Your account is inactive. Contact the administrator for help." });
        }

        // If password is incorrect
        if (!(await user.comparePassword(password))) {
            await logError({ error: new Error("Invalid email or password"), req, route: "loginUser" });
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // Create JWT token
        const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: rememberMe ? "21d" : "1d",
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
    } catch (error) {
        // Log the error and handle token expiration
        await logError({ error, req, route: "loginUser" });
        if (error instanceof TokenExpiredError) {
            await logError({ error: new Error("Token expired"), req, route: "loginUser" });
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }
        res
            .status(error.message === "Database connection is not ready" ? 503 : 500)
            .json({ message: error.message });
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
        await logError({ error, req, route: "getAllUsers" });
        res
            .status(error.message === "Database connection is not ready" ? 503 : 500)
            .json({ message: error.message });
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

        // Convert userId to number for consistent comparison
        const numericUserId = parseInt(userId, 10);

        const user = await User.findOne({ user_id: numericUserId }).select("-password").lean();

        if (!user) {
            await logError({ error: new Error("User not found"), req, route: "getUserById" });
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
        await logError({ error, req, route: "getUserById" });
        res
            .status(error.message === "Database connection is not ready" ? 503 : 500)
            .json({ message: error.message });
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
            await logError({ error: new Error("User not found"), req, route: "deleteUser" });
            return res.status(404).json({ message: "User not found" });
        }

        // Instead of deleting, update the status to "Inactive"
        const updatedUser = await User.findOneAndUpdate({ user_id: userId }, { status: "Inactive" }, { new: true });

        res.json({ message: "User marked as inactive successfully", user: updatedUser });
    } catch (error) {
        await logError({ error, req, route: "deleteUser" });
        res
            .status(error.message === "Database connection is not ready" ? 503 : 500)
            .json({ message: error.message });
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
            await logError({ error: new Error("User not found"), req, route: "updateUser" });
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
        await logError({ error, req, route: "updateUser" });
        res
            .status(error.message === "Database connection is not ready" ? 503 : 500)
            .json({ message: error.message });
    }
};

export { loginUser, deleteUser, updateUser, upload, getAllUsers, getUserById, registerUser, updateUserProfilePicture };
