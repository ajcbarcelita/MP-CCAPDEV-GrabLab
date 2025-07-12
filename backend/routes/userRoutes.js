import express from 'express';
import { 
    registerUser, 
    loginUser, 
    searchUser, 
    deleteUser, 
    updateUser, 
    upload,
    getAllUsers,
    getUserById,
    createUser,
    updateUserProfilePicture
} from '../controllers/userController.js';

const router = express.Router();

// Route for user registration 
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route for searching users 
router.get('/search', searchUser);

// Route for getting all users 
router.get('/', getAllUsers);

// Route for creating a new user (for frontend store addUser method)
router.post('/', createUser);

// Route for getting user by ID (for frontend store fetchUserById method)
router.get('/:userId', getUserById);

// Route for updating user profile (for frontend store updateUserProfile method)
router.put('/:userId', updateUser);

// Route for updating user profile picture (for frontend store updateUserProfilePicture method)
router.post('/:userId/profile-picture', upload.single('profilePicture'), updateUserProfilePicture);

// Route for deleting a user (for frontend store deleteUserAccount method)
router.delete('/:userId', deleteUser);

// Legacy route for updating user (keep for backward compatibility)
router.patch('/:id', upload.single('profile_pic'), updateUser);

// Legacy route for deleting user (keep for backward compatibility)
router.delete('/:id', deleteUser);

export default router;