import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route for searching users
router.get('/search', searchUser);

// Route for deleting a user
router.delete('/:id', deleteUser);

// Route for updating a user
router.patch('/:id', upload.single('profile_pic'), updateUser);

export default router;
