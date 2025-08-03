import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getLabSlotsByLabAndDate,
  createLabSlotsBatch,
  updateLabSlot,
  getLabSlotsByLab,
} from "../controllers/labSlotController.js";

const router = express.Router();

// All routes need authentication
router.use(authMiddleware.verifyToken);

// Routes accessible by Students and Technicians
router.get("/lab/:labId/date/:date", 
    authMiddleware.requireRole(['Student', 'Technician']),
    getLabSlotsByLabAndDate
);
router.get("/lab/:labId", 
    authMiddleware.requireRole(['Student', 'Technician']),
    getLabSlotsByLab
);

// Routes only for Technicians
router.post("/batch", 
    authMiddleware.requireRole(['Technician', 'Admin']),
    createLabSlotsBatch
);
router.patch("/:id", 
    authMiddleware.requireRole(['Technician', 'Admin']),
    updateLabSlot
);
export default router;
