import express from 'express';
import { registerUser, loginUser, searchUser } from '../controllers/userController.js';

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route for searching users
router.get('/search', searchUser);

export default router;
