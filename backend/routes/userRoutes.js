import express from "express";
import { authMiddleware } from '../middleware/auth.js';
import {
    loginUser,
    deleteUser,
    updateUser,
    upload,
    getAllUsers,
    getUserById,
    registerUser,
    updateUserProfilePicture,
} from "../controllers/userController.js";

const router = express.Router();

// Guest-only routes (no auth needed)
router.post("/login", loginUser);
router.post("/register", registerUser);

// Shared routes (all authenticated users)
router.route("/:userId")
    .get(authMiddleware.verifyToken, getUserById)
    .put(authMiddleware.verifyToken, updateUser)
    .delete(authMiddleware.verifyToken, deleteUser);

router.post(
    "/:userId/profile-picture",
    authMiddleware.verifyToken,
    upload.single("profilePicture"),
    updateUserProfilePicture
);

// Admin-only routes
router.get("/", 
    authMiddleware.verifyToken, 
    authMiddleware.requireRole(['Admin']), 
    getAllUsers
);

export default router;
