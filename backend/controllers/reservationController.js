import Reservation from "../models/Reservation.js";
import { logError } from "../utils/logErrors.js";
import Lab from "../models/Lab.js";
import mongoose from "mongoose";
import reservationService from "../services/reservationService.js";
import {
  populateUserInfo,
  populateUserInfoForMultiple,
  validateTechnicianReservation,
  validateTimeSlotsNotInPast,
} from "../utils/reservationUtils.js";

/**
 * Create a new reservation with session-based concurrency control.
 * This prevents race conditions where multiple users could book the same slot.
 *
 * OLD PROBLEM:
 * - User A checks for conflicts → sees none
 * - User B checks for conflicts → sees none (because A hasn't saved yet)
 * - User A creates reservation
 * - User B creates reservation → DOUBLE BOOKING!
 *
 * NEW SOLUTION:
 * - User A starts session → checks conflicts → creates reservation (all atomic)
 * - User B starts session → checks conflicts → sees A's reservation → fails
 *
 * @route POST /api/reservations
 * @access Private
 */
export const createReservation = async (req, res) => {
  const { user_id, lab_id, reservation_date, slots, anonymous, technician_id } =
    req.body;

  // Validate required fields
  if (
    !user_id ||
    !lab_id ||
    !reservation_date ||
    !Array.isArray(slots) ||
    slots.length === 0
  ) {
    await logError({
      error: new Error("Missing required fields or invalid slots format"),
      req,
      route: "createReservation",
    });
    return res
      .status(400)
      .json({ message: "Missing required fields or invalid slots format" });
  }

  try {
    // Check if the user exists
    const User = mongoose.model("User");
    const user = await User.findOne({ user_id: parseInt(user_id) });
    if (!user) {
      await logError({
        error: new Error("User not found"),
        req,
        route: "createReservation",
      });
      return res.status(404).json({ message: "User not found" });
    }

    // If technician_id is provided, enforce technician rules
    if (technician_id) {
      const validation = await validateTechnicianReservation(
        user_id,
        technician_id,
        req
      );
      if (!validation.success) {
        await logError({
          error: new Error(validation.message),
          req,
          route: "createReservation",
        });
        return res.status(403).json({ message: validation.message });
      }
    }
    // Check if the lab exists
    const lab = await Lab.findById(lab_id);
    if (!lab) {
      await logError({
        error: new Error("Lab not found"),
        req,
        route: "createReservation",
      });
      return res.status(404).json({ message: "Lab not found" });
    }

    // Validate time slots are not in the past
    const timeValidation = validateTimeSlotsNotInPast(slots, reservation_date);
    if (!timeValidation.success) {
      await logError({
        error: new Error(timeValidation.message),
        req,
        route: "createReservation",
      });
      return res.status(400).json({ message: timeValidation.message });
    }

    // This prevents race conditions by making the conflict check and creation atomic
    const reservation = await reservationService.createReservationWithSession(
      {
        user_id,
        lab_id,
        reservation_date,
        slots,
        anonymous,
      },
      req
    );

    // Populate lab and user information
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("lab_id", "name display_name building")
      .lean();

    // Use utility function to populate user information
    const finalReservation = await populateUserInfo(populatedReservation, user);

    res.status(201).json(finalReservation);
  } catch (error) {
    await logError({ error, req, route: "createReservation" });

    // Handle specific session-based errors
    if (error.message.includes("already reserved")) {
      return res.status(409).json({ message: error.message });
    }

    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};

/**
 * @desc    Get all reservations
 * @route   GET /api/reservations
 * @access  Public/Private
 * @returns Array of all reservations (each populated with lab and user info)
 */
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate("lab_id", "name display_name building")
      .sort({ createdAt: -1 });

    // Use utility function to populate user details
    const populatedReservations = await populateUserInfoForMultiple(
      reservations
    );

    res.json(populatedReservations);
  } catch (error) {
    await logError({ error, req, route: "getReservations" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};

/**
 * @desc    Get all reservations
 * @route   GET /api/reservations
 * @access  Public/Private
 * @returns Array of all reservations (each populated with lab and user info)
 */
export const getReservationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Query by user_id field with the new schema
    const reservations = await Reservation.find({ user_id: parseInt(userId) })
      .populate("lab_id", "name display_name building")
      .sort({ createdAt: -1 });

    // Use utility function to populate user details
    const populatedReservations = await populateUserInfoForMultiple(
      reservations
    );

    res.json(populatedReservations);
  } catch (error) {
    await logError({ error, req, route: "getReservationsByUserId" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};

/**
 * @desc    Get all reservations
 * @route   GET /api/reservations
 * @access  Public/Private
 * @returns Array of all reservations (each populated with lab and user info)
 */
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // This ensures atomic deletion and prevents race conditions
    const deletedReservation =
      await reservationService.deleteReservationWithSession(id, req);

    if (!deletedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json({ message: "Reservation deleted successfully" });
  } catch (error) {
    await logError({ error, req, route: "deleteReservation" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};

/**
 * Update an existing reservation with session-based concurrency control.
 * This prevents race conditions when updating reservations.
 * @route PUT /api/reservations/:id
 * @access Private
 */
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id,
      lab_id,
      reservation_date,
      slots,
      anonymous,
      status,
      technician_id,
    } = req.body;

    // Find the existing reservation
    const existingReservation = await Reservation.findById(id);
    if (!existingReservation) {
      await logError({
        error: new Error("Reservation not found"),
        req,
        route: "updateReservation",
      });
      return res.status(404).json({ message: "Reservation not found" });
    }

    // If technician_id is provided, enforce technician rules
    if (technician_id && user_id) {
      const validation = await validateTechnicianReservation(
        user_id,
        technician_id,
        req
      );
      if (!validation.success) {
        await logError({
          error: new Error(validation.message),
          req,
          route: "updateReservation",
        });
        return res.status(403).json({ message: validation.message });
      }
    }
    // Validate time slots are not in the past (if updating slots)
    if (slots && slots.length > 0) {
      const timeValidation = validateTimeSlotsNotInPast(
        slots,
        reservation_date || existingReservation.reservation_date
      );
      if (!timeValidation.success) {
        await logError({
          error: new Error(timeValidation.message),
          req,
          route: "updateReservation",
        });
        return res.status(400).json({ message: timeValidation.message });
      }
    }

    // Build update data object
    const updateData = {};

    if (user_id !== undefined) {
      updateData.user_id = parseInt(user_id);
    }

    if (lab_id !== undefined) {
      updateData.lab_id = lab_id;
    }

    if (reservation_date !== undefined) {
      updateData.reservation_date = new Date(reservation_date);
    }

    if (slots !== undefined) {
      if (!Array.isArray(slots) || slots.length === 0) {
        await logError({
          error: new Error("Invalid slots format"),
          req,
          route: "updateReservation",
        });
        return res
          .status(400)
          .json({ message: "Slots must be a non-empty array" });
      }
      updateData.slots = slots;
    }

    if (anonymous !== undefined) {
      updateData.anonymous = anonymous;
    }

    if (status !== undefined) {
      if (!["Active", "Cancelled", "Completed"].includes(status)) {
        await logError({
          error: new Error("Invalid status value"),
          req,
          route: "updateReservation",
        });
        return res.status(400).json({ message: "Invalid status value" });
      }
      updateData.status = status;
    }

    // This prevents race conditions by making conflict checking and updating atomic
    const updatedReservation =
      await reservationService.updateReservationWithSession(
        id,
        updateData,
        req
      );

    // Populate lab and user information
    const populatedReservation = await Reservation.findById(
      updatedReservation._id
    )
      .populate("lab_id", "name display_name building")
      .lean();

    // Use utility function to populate user information
    const finalReservation = await populateUserInfo(populatedReservation);

    res.json(finalReservation);
  } catch (error) {
    await logError({ error, req, route: "updateReservation" });

    // Handle specific session-based errors
    if (error.message.includes("already reserved")) {
      return res.status(409).json({ message: error.message });
    }

    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};

/**
 * @desc    Get reservations by lab ID
 * @route   GET /api/reservations/lab/:labId
 * @access  Public/Private
 * @param   req.params.labId - Lab ID
 * @returns Array of reservations for the lab (populated with user info)
 */
export const getReservationsByLab = async (req, res) => {
  try {
    const { labId } = req.params;

    const reservations = await Reservation.find({
      lab_id: labId,
      status: "Active",
    })
      .populate("lab_id", "name display_name building")
      .sort({ createdAt: -1 });

    // Use utility function to populate user details
    const populatedReservations = await populateUserInfoForMultiple(
      reservations
    );

    res.json(populatedReservations);
  } catch (error) {
    await logError({ error, req, route: "getReservationsByLab" });
    res
      .status(error.message === "Database connection is not ready" ? 503 : 500)
      .json({ message: error.message });
  }
};
