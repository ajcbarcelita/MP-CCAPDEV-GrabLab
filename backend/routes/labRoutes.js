/* * Lab Routes
 * This module defines the routes for lab-related API endpoints.
 * It includes routes to get all labs, labs by building, specific lab by ID,
 * available labs, labs by status, and to update lab status.
 * 
 * This file is used on the following file/s:
 *  - ../controllers/labController.js (for handling the logic of each route)
 *  - frontend/src/stores/labs_store.js (indirectly via API calls to these routes)
 *  - frontend/src/components/View.vue (indirectly via the labs store)
 */
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
    getLabs,
    getLabsByBuilding,
    getLabByIDNumber
} from '../controllers/labController.js';

const router = express.Router();

router.use(authMiddleware.verifyToken); // Apply authentication middleware to all lab routes

// Get all labs
router.get('/', getLabs);
// Get labs by building
router.get('/building/:building', getLabsByBuilding);
// Get lab by ID Number
router.get('/:id', getLabByIDNumber);

export default router;
