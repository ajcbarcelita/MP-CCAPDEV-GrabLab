import LabSlot from "../models/LabSlot.js";
import Lab from "../models/Lab.js";
import mongoose from "mongoose";

// Helper function to check database connection
const checkConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database connection is not ready");
  }
};

// Get lab slots by lab ID and date (robust date handling)
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
      // Not an error, just means no slots exist yet for this day
      return res
        .status(404)
        .json({ message: "No lab slots found for this lab and date" });
    }

    res.json(labSlots);
  } catch (error) {
    console.error("Error fetching lab slots by lab and date:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all lab slots by lab ID
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
    console.error("Error in getLabSlotsByLab:", error);
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};

// Create lab slots in batch (robust duplicate handling)
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
    console.error("Error creating batch lab slots:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update a specific lab slot
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
    console.error("Error in updateLabSlot:", error);
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};
