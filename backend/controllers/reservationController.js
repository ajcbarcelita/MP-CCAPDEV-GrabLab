import Reservation from "../models/Reservation.js";
import LabSlot from "../models/LabSlot.js";
import mongoose from "mongoose";

export const createReservation = async (req, res) => {
    const { user_id, lab_slot, time_slots } = req.body;

    if (!user_id || !lab_slot || !Array.isArray(time_slots) || time_slots.length === 0) {
        return res.status(400).json({ message: "Missing required fields or invalid time_slots format" });
    }

    try {
        // Use 'user' field name as per schema instead of 'user_id'
        const reservation = await Reservation.create({
            user: user_id, // This matches the schema field name
            lab_slot,
            time_slots,
        });

        res.status(201).json(reservation);
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate("user", "email fname lname") // Populate user details
            .populate({
                path: "lab_slot",
                populate: {
                    path: "lab", // Populate the lab reference inside lab_slot
                    select: "name display_name building",
                },
            })
            .populate("time_slots") // Populate time_slots
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReservationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("Fetching reservations for user ID:", userId); // Log the userId being queried

        // Query directly by user_id field
        let reservations = await Reservation.find({ user_id: parseInt(userId) })
            .populate({
                path: "lab_slot",
                populate: {
                    path: "lab",
                    select: "name display_name building",
                },
            })
            .sort({ createdAt: -1 });

        // For each reservation, find the time slot details
        // Time slots might be embedded in the lab_slot document
        for (let i = 0; i < reservations.length; i++) {
            if (reservations[i].time_slots && reservations[i].time_slots.length > 0) {
                const labSlot = await LabSlot.findById(reservations[i].lab_slot._id);
                if (labSlot && labSlot.time_slots) {
                    // Match the time slot IDs from the reservation with the time slots in the lab slot
                    const timeSlotDetails = [];
                    for (const timeSlotId of reservations[i].time_slots) {
                        // Find matching time slot in the lab slot
                        const foundTimeSlot = labSlot.time_slots.find(slot =>
                            slot._id.toString() === timeSlotId.toString()
                        );

                        if (foundTimeSlot) {
                            timeSlotDetails.push({
                                _id: foundTimeSlot._id,
                                startTime: foundTimeSlot.startTime,
                                endTime: foundTimeSlot.endTime
                            });
                        }
                    }

                    // Replace the time_slots array with the detailed time slots
                    reservations[i] = reservations[i].toObject();
                    reservations[i].time_slots = timeSlotDetails;
                }
            }
        }

        // Find the user separately to ensure we have user details
        const User = mongoose.model('User');
        const user = await User.findOne({ user_id: parseInt(userId) });

        if (user) {
            // Attach user details to each reservation
            reservations = reservations.map(reservation => {
                // If reservation is already a plain object, don't convert it again
                const reservationObj = typeof reservation.toObject === 'function'
                    ? reservation.toObject()
                    : reservation;

                reservationObj.user = {
                    _id: user._id,
                    email: user.email,
                    fname: user.fname,
                    lname: user.lname
                };
                return reservationObj;
            });
        }

        console.log("Reservations fetched successfully:", reservations); // Log the fetched reservations
        res.json(reservations);
    } catch (error) {
        console.error("Error fetching reservations by user ID:", error); // Log the full error object
        res.status(500).json({ message: error.message });
    }
};

export const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findById(id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Instead of deleting, update the status to "Deleted"
        const updatedReservation = await Reservation.findByIdAndUpdate(
            id,
            { status: "Deleted" },
            { new: true }
        );

        res.json({
            message: "Reservation marked as deleted successfully",
            reservation: updatedReservation
        });
    } catch (error) {
        console.error("Error marking reservation as deleted:", error);
        res.status(500).json({ message: error.message });
    }
};

export const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reservation_date } = req.body;

        const updateData = {};
        if (status) {
            if (!["Active", "Cancelled", "Completed"].includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }
            updateData.status = status;
        }

        if (reservation_date) {
            updateData.reservation_date = reservation_date;
        }

        const reservation = await Reservation.findByIdAndUpdate(id, updateData, { new: true })
            .populate("user", "email fname lname")
            .populate({
                path: "lab_slot",
                populate: {
                    path: "lab",
                    select: "name display_name building",
                },
            });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// New endpoint to get reservations by lab
export const getReservationsByLab = async (req, res) => {
    try {
        const { labId } = req.params;

        // First, find all lab slots for this lab
        const labSlots = await LabSlot.find({ lab: labId });

        // Then find reservations that use any of these lab slots
        const labSlotIds = labSlots.map(slot => slot._id);

        const reservations = await Reservation.find({
            lab_slot: { $in: labSlotIds },
            status: "Active",
        })
            .populate("user", "email fname lname")
            .populate({
                path: "lab_slot",
                populate: {
                    path: "lab",
                    select: "name display_name building",
                },
            })
            .sort({ createdAt: -1 });

        res.json(reservations);
    } catch (error) {
        console.error("Error fetching reservations by lab:", error);
        res.status(500).json({ message: error.message });
    }
};
