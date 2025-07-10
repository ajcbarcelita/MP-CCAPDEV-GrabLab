import Lab from '../models/Lab.js';
import mongoose from 'mongoose';

// Helper function to check database connection
const checkConnection = () => {
    if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection is not ready');
    }
};

export const getLabs = async (req, res) => {
    try {
        checkConnection();
        console.log('Fetching all labs...');
        
        const labs = await Lab.find({})
            .sort({ building: 1, name: 1 })
            .select('-__v')
            .lean(); // Use lean() for better performance with JSON data

        console.log(`Found ${labs.length} labs`);
        res.json(labs);
    } catch (error) {
        console.error('Error in getLabs:', error);
        res.status(error.message === 'Database connection is not ready' ? 503 : 500)
           .json({ message: error.message });
    }
};

export const getLabsByBuilding = async (req, res) => {
    try {
        checkConnection();
        const { building } = req.params;
        
        if (!building) {
            return res.status(400).json({ message: 'Building parameter is required' });
        }

        const labs = await Lab.find({ building })
            .sort({ name: 1 })
            .select('-__v')
            .lean();

        console.log(`Found ${labs.length} labs in ${building}`);
        res.json(labs);
    } catch (error) {
        console.error('Error in getLabsByBuilding:', error);
        res.status(error.message === 'Database connection is not ready' ? 503 : 500)
           .json({ message: error.message });
    }
};

export const getLabById = async (req, res) => {
    try {
        checkConnection();
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid lab ID format' });
        }

        const lab = await Lab.findById(id)
            .select('-__v')
            .lean();

        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        res.json(lab);
    } catch (error) {
        console.error('Error in getLabById:', error);
        res.status(error.message === 'Database connection is not ready' ? 503 : 500)
           .json({ message: error.message });
    }
};

export const getAvailableLabs = async (req, res) => {
    try {
        checkConnection();
        const labs = await Lab.find({ status: 'Active' })
            .sort({ building: 1, name: 1 })
            .select('-__v')
            .lean();

        console.log(`Found ${labs.length} active labs`);
        res.json(labs);
    } catch (error) {
        console.error('Error in getAvailableLabs:', error);
        res.status(error.message === 'Database connection is not ready' ? 503 : 500)
           .json({ message: error.message });
    }
};

export const getLabsByStatus = async (req, res) => {
    try {
        checkConnection();
        const { status } = req.params;
        
        if (!['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const labs = await Lab.find({ status })
            .sort({ building: 1, name: 1 })
            .select('-__v')
            .lean();

        console.log(`Found ${labs.length} labs with status ${status}`);
        res.json(labs);
    } catch (error) {
        console.error('Error in getLabsByStatus:', error);
        res.status(error.message === 'Database connection is not ready' ? 503 : 500)
           .json({ message: error.message });
    }
};

export const updateLabStatus = async (req, res) => {
    try {
        checkConnection();
        const { id } = req.params;
        const { status } = req.body;

        if (!['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid lab ID format' });
        }

        const lab = await Lab.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).select('-__v');

        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        console.log(`Updated lab ${lab.name} status to ${status}`);
        res.json(lab);
    } catch (error) {
        console.error('Error in updateLabStatus:', error);
        res.status(error.message === 'Database connection is not ready' ? 503 : 500)
           .json({ message: error.message });
    }
};
