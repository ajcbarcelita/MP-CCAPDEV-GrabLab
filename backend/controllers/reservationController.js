import Reservation from "../models/Reservation.js";
import mongoose from "mongoose";

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
        const { status } = req.body;

        if (!["Active", "Cancelled", "Completed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const reservation = await Reservation.findByIdAndUpdate(id, { status }, { new: true })
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
