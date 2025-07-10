import express from 'express';
import {
    getLabs,
    getLabsByBuilding,
    getLabById,
    getAvailableLabs,
    getLabsByStatus,
    updateLabStatus
} from '../controllers/labController.js';

const router = express.Router();

// Get all labs
router.get('/', getLabs);

// Get only available (active) labs
router.get('/available', getAvailableLabs);

// Get labs by building
router.get('/building/:building', getLabsByBuilding);

// Get labs by status
router.get('/status/:status', getLabsByStatus);

// Get specific lab by ID
router.get('/:id', getLabById);

// Update lab status
router.patch('/:id/status', updateLabStatus);

export default router;
