import User from '../models/User.js';
import Reservation from '../models/Reservation.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/profile_pictures'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { email, password, fname, lname, mname = '', role = 'Student', status = 'Active' } = req.body;

    console.log('Registering user with email:', email);
    
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
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
            profile_pic_path: '',
            description: ''
        });

        res.status(201).json({
            user_id: user.user_id,  
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });

        if (user && (password === user.password)) { // Plaintext password comparison for Phase 2
            res.json({
                user_id: user.user_id,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public (or add auth middleware later)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password') // Exclude password field
            .sort({ createdAt: -1 });
        
        // Transform data to match frontend expectations
        const transformedUsers = users.map(user => ({
            user_id: user.user_id,
            first_name: user.fname,
            last_name: user.lname,
            email: user.email,
            role: user.role,
            description: user.description || '',
            profile_pic_path: user.profile_pic_path || null,
            status: user.status || 'active',
            created_at: user.createdAt,
            updated_at: user.updatedAt
        }));

        res.json(transformedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:userId
// @access  Public (or add auth middleware later)
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Backend received userId:', userId, 'Type:', typeof userId);
        
        // Convert userId to number for consistent comparison
        const numericUserId = parseInt(userId, 10);
        console.log('Converted to numeric userId:', numericUserId);
        
        const user = await User.findOne({ user_id: numericUserId }).select('-password').lean();
        console.log('User found in DB:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Transform data to match frontend expectations
        const transformedUser = {
            user_id: user.user_id,
            first_name: user.fname,
            last_name: user.lname,
            email: user.email,
            role: user.role,
            description: user.description || '',
            profile_pic_path: user.profile_pic_path || null,
            status: user.status || 'active',
            created_at: user.createdAt,
            updated_at: user.updatedAt
        };

        res.json(transformedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params; // Match the route parameter name
        
        // Find the user by user_id field
        const user = await User.findOne({ user_id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Delete all reservations associated with the user
        await Reservation.deleteMany({ user: userId });
        
        // Delete the user using the MongoDB _id
        await User.findByIdAndDelete(user._id);
        
        res.json({ message: 'User and associated reservations deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:userId
// @access  Private
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fname, lname, description } = req.body;

        const user = await User.findOne({ user_id: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (fname !== undefined) user.fname = fname;
        if (lname !== undefined) user.lname = lname;
        if (description !== undefined) user.description = description;

        const updatedUser = await user.save();

        // Transform data to match frontend expectations
        const transformedUser = {
            user_id: updatedUser.user_id,
            fname: updatedUser.fname,
            lname: updatedUser.lname,
            email: updatedUser.email,
            role: updatedUser.role,
            description: updatedUser.description || '',
            profile_pic_path: updatedUser.profile_pic_path || null,
            status: updatedUser.status || 'active',
            created_at: updatedUser.createdAt,
            updated_at: updatedUser.updatedAt
        };

        res.json(transformedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile picture
// @route   POST /api/users/:userId/profile-picture
// @access  Private
const updateUserProfilePicture = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
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
            description: updatedUser.description || '',
            profile_pic_path: updatedUser.profile_pic_path || null,
            status: updatedUser.status || 'active',
            created_at: updatedUser.createdAt,
            updated_at: updatedUser.updatedAt
        };

        res.json(transformedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export { 
    loginUser, 
    deleteUser, 
    updateUser, 
    upload,
    getAllUsers,
    getUserById,
    registerUser,
    updateUserProfilePicture
};