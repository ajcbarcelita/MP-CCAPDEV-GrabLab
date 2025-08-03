import LabSlot from "../models/LabSlot.js";
import { logError } from "../utils/logError.js";
import mongoose from "mongoose";

// Helper function to check database connection
const checkConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database connection is not ready");
  }
};

/**
 * @desc    Get reservations by lab ID
 * @route   GET /api/reservations/lab/:labId
 * @access  Public/Private
 * @param   req.params.labId - Lab ID
 * @returns Array of reservations for the lab (populated with user info)
 */
export const getLabSlotsByLabAndDate = async (req, res) => {
  try {
    checkConnection();
    const { labId, date } = req.params;

    // Validate the date format
    const queryDate = new Date(date);
    if (isNaN(queryDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Set the time to the beginning and end of the day (UTC)
    const startOfDay = new Date(queryDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const labSlots = await LabSlot.find({
      lab: labId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (!labSlots || labSlots.length === 0) {
      return res
        .status(404)
        .json({ message: "No lab slots found for this lab and date" });
    }

    res.json(labSlots);
  } catch (error) {
    await logError({ error, req, route: "getLabSlotsByLabAndDate" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};

/**
 * @desc    Get all lab slots by lab ID
 * @route   GET /api/labslots/lab/:labId
 * @access  Public/Private
 * @param   req.params.labId - Lab ID
 * @returns Array of all lab slot objects for the specified lab
 */
export const getLabSlotsByLab = async (req, res) => {
  try {
    checkConnection();
    const { labId } = req.params;

    if (!labId) {
      return res.status(400).json({ message: "Lab ID is required" });
    }

    const labSlots = await LabSlot.find({ lab: labId })
      .populate("lab", "name display_name building operating_hours capacity")
      .sort({ date: 1, seat_number: 1 });

    res.json(labSlots);
  } catch (error) {
    await logError({ error, req, route: "getLabSlotsByLab" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};

/**
 * @desc    Create lab slots in batch (multiple slots at once)
 * @route   POST /api/labslots/batch
 * @access  Public/Private
 * @param   req.body.slots - Array of lab slot objects to create
 * @returns Array of created lab slot objects (or existing slots if duplicates)
 */
export const createLabSlotsBatch = async (req, res) => {
  try {
    checkConnection();
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty slots array provided" });
    }

    try {
      const createdSlots = await LabSlot.insertMany(slots, { ordered: false });
      res.status(201).json(createdSlots);
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error: fetch and return existing slots for this lab and date
        const existingSlots = await LabSlot.find({
          lab: slots[0].lab,
          date: slots[0].date,
        });
        return res.status(200).json(existingSlots);
      }
      throw error;
    }
  } catch (error) {
    await logError({ error, req, route: "createLabSlotsBatch" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};

/**
 * @desc    Create lab slots in batch (multiple slots at once)
 * @route   POST /api/labslots/batch
 * @access  Public/Private
 * @param   req.body.slots - Array of lab slot objects to create
 * @returns Array of created lab slot objects (or existing slots if duplicates)
 */
export const updateLabSlot = async (req, res) => {
  try {
    checkConnection();
    const { id } = req.params;
    const updateData = req.body;

    const updatedSlot = await LabSlot.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("lab", "name display_name building operating_hours capacity");

    if (!updatedSlot) {
      return res.status(404).json({ message: "Lab slot not found" });
    }

    res.json(updatedSlot);
  } catch (error) {
    await logError({ error, req, route: "updateLabSlot" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};
