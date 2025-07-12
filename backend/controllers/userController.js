
import User from '../models/User.js';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
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

export { registerUser, loginUser, searchUser };
