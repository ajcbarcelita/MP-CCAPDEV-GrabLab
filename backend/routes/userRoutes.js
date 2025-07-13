import express from "express";
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

// Public routes
router.post("/login", loginUser);

// User CRUD operations
router
    .route("/")
    .get(getAllUsers) // GET /api/users
    .post(registerUser); // POST /api/users

router
    .route("/:userId")
    .get(getUserById) // GET /api/users/:userId
    .put(updateUser) // PUT /api/users/:userId
    .delete(deleteUser); // DELETE /api/users/:userId

// Profile picture upload
router.post("/:userId/profile-picture", upload.single("profilePicture"), updateUserProfilePicture);

export default router;
