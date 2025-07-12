import Reservation from "../models/Reservation.js";
import LabSlot from "../models/LabSlot.js";

export const createReservation = async (req, res) => {
    const { user_id, lab_id, date, slots } = req.body;

    if (!user_id || !lab_id || !date || !slots || !Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({ message: "Missing required fields or invalid slots format" });
    }

    try {
        const createdReservations = [];

        for (const slotData of slots) {
            const { seat, time } = slotData;

            // Find the LabSlot for the given lab, date, and seat
            const labSlot = await LabSlot.findOne({
                lab: lab_id,
                seat_number: seat,
                date: new Date(date),
            });

            if (!labSlot) {
                // If LabSlot doesn't exist, it means the seat is not configured for that date
                return res.status(404).json({ message: `LabSlot not found for seat ${seat} on ${date}` });
            }

            // Find the specific time slot within the LabSlot's time_slots array
            const timeSlotIndex = labSlot.time_slots.findIndex((ts) => ts.startTime === time && ts.reserved === null);

            if (timeSlotIndex === -1) {
                return res.status(400).json({ message: `Time slot ${time} for seat ${seat} is already reserved or invalid` });
            }

            // Create the reservation
            const newReservation = new Reservation({
                user: user_id,
                lab_slot: labSlot._id,
                time_slot: time,
                status: "Active", // Default status
            });

            const savedReservation = await newReservation.save();

            // Update the LabSlot to mark the time slot as reserved
            labSlot.time_slots[timeSlotIndex].reserved = savedReservation._id;
            await labSlot.save();

            createdReservations.push(savedReservation);
        }

        res.status(201).json(createdReservations);
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
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReservationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const reservations = await Reservation.find({ user: userId }) // Changed from user_id to user
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

        await Reservation.findByIdAndDelete(id);
        res.json({ message: "Reservation deleted successfully" });
    } catch (error) {
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
        const reservations = await Reservation.find({
            "lab_slot.lab": labId,
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
        res.status(500).json({ message: error.message });
    }
};
