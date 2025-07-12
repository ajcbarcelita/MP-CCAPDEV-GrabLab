import express from 'express';
import {
    getReservations,
    getReservationsByUserId,
    getReservationsByLab,
    deleteReservation,
    updateReservation,
    createReservation
} from '../controllers/reservationController.js';

const router = express.Router();

// Get all reservations
router.get('/', getReservations);

// Create a new reservation
router.post('/', createReservation);

// Get reservations by user ID
router.get('/user/:userId', getReservationsByUserId);

// Get reservations by lab ID
router.get('/lab/:labId', getReservationsByLab);

// Update a reservation
router.patch('/:id', updateReservation);

// Delete a reservation
router.delete('/:id', deleteReservation);

export default router;
