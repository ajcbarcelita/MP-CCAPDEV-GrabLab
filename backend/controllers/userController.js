
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
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

const upload = multer({ storage: storage });

const registerUser = async (req, res) => {
    const { email, password, fname, lname, mname, role } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // NOTE: In a real-world application (and in your Phase 3), you MUST hash the password before saving it.
        // For Phase 2, we are storing it as plaintext as per the specifications.
        const user = await User.create({
            email,
            password,
            fname,
            lname,
            mname,
            role,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
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
                _id: user._id,
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

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the user
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete all reservations associated with the user
        await Reservation.deleteMany({ user: user._id });

        // Delete the user
        await User.findByIdAndDelete(id);

        res.json({ message: 'User and associated reservations deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fname, lname, description } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.fname = fname || user.fname;
        user.lname = lname || user.lname;
        user.description = description || user.description;

        if (req.file) {
            user.profile_pic_path = `/uploads/profile_pictures/${req.file.filename}`;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            fname: updatedUser.fname,
            lname: updatedUser.lname,
            email: updatedUser.email,
            role: updatedUser.role,
            description: updatedUser.description,
            profile_pic_path: updatedUser.profile_pic_path,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/*
@desc    Search for users by name or email
@route   GET /api/users/search
*/
const searchUser = async (req, res) => {
    const { searchTerm } = req.query; // Get the search term from query parameters
    try {
        const users = await User.find({
            $or: [
                { fname: new RegExp(searchTerm, 'i') }, // Case-insensitive search for first name
                { lname: new RegExp(searchTerm, 'i') }, // Case-insensitive search for last name
                { email: new RegExp(searchTerm, 'i') }  // Case-insensitive search for email
            ]
        });

        res.json(users); // Return the found users
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export { registerUser, loginUser, searchUser, deleteUser, updateUser };
