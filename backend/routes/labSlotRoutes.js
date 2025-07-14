import express from "express";
import {
  getLabSlotsByLabAndDate,
  createLabSlotsBatch,
  updateLabSlot,
  getLabSlotsByLab,
} from "../controllers/labSlotController.js";

const router = express.Router();

// Get lab slots by lab ID and date
router.get("/lab/:labId/date/:date", getLabSlotsByLabAndDate);

// Get all lab slots by lab ID
router.get("/lab/:labId", getLabSlotsByLab);

// Create lab slots in batch
router.post("/batch", createLabSlotsBatch);

// Update a specific lab slot
router.patch("/:id", updateLabSlot);

export default router;
