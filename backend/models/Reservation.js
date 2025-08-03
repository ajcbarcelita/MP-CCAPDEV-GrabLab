/**
 * Reservation Model
 * Represents a reservation for a lab seat and time slot.
 * Each reservation is linked to a user, a lab, a date, and one or more slots (seat + time).
 * - user_id: The user who made the reservation
 * - lab_id: The lab being reserved
 * - reservation_date: The date of the reservation
 * - slots: Array of seat/time slot objects
 * - anonymous: If true, user info is hidden
 * - status: Reservation status (Active, Cancelled, Completed)
 *
 * See backend/controllers/reservationController.js for how reservations are created and validated.
 */
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      required: true,
    },
    lab_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
    },
    reservation_date: {
      type: Date,
      required: true,
    },
    slots: [
      {
        seat_number: {
          type: Number,
          required: true,
        },
        start_time: {
          type: String,
          required: true,
        },
        end_time: {
          type: String,
          required: true,
        },
      },
    ],
    anonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Cancelled", "Completed"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// 🚀 NEW: Add database indexes for better performance
// These indexes speed up the conflict checking queries used in session-based operations

// Compound index for efficient conflict checking
// This is the most important index - it speeds up queries that check for existing reservations
reservationSchema.index({ 
  lab_id: 1, 
  reservation_date: 1, 
  status: 1 
});

// Index for user queries (getting reservations by user)
reservationSchema.index({ user_id: 1 });

// Index for date-based queries
reservationSchema.index({ reservation_date: 1 });

export default mongoose.model("Reservation", reservationSchema);
