import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
    getReservations,
    getReservationsByUserId,
    getReservationsByLab,
    deleteReservation,
    updateReservation,
    createReservation
} from '../controllers/reservationController.js';

const router = express.Router();

// All routes need Student or Technician role
router.use(authMiddleware.verifyToken);

// Student & Tech only routes
router.use(authMiddleware.requireRole(['Student', 'Technician']));

router.get('/', getReservations);
router.post('/', createReservation);
router.get('/user/:userId', getReservationsByUserId);
router.get('/lab/:labId', getReservationsByLab);
router.patch('/:id', updateReservation);
router.delete('/:id', deleteReservation);

export default router;
