import mongoose from "mongoose";
import dotenv from "dotenv";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import LabSlot from "../models/LabSlot.js";

dotenv.config();

const seedReservations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🌱 Connected to MongoDB");

        // Get current date and 4 days from now
        const now = new Date();
        const fourDaysLater = new Date();
        fourDaysLater.setDate(now.getDate() + 4);

        // Find lab slots within the next 4 days
        const labSlots = await LabSlot.find({
            date: { $gte: now, $lte: fourDaysLater },
        }).limit(2);

        const users = await User.find().limit(2);

        if (users.length < 2 || labSlots.length < 2) {
            throw new Error("Not enough users or lab slots (within 4 days) to seed reservations.");
        }

        // Pick time slot subdocuments from each lab slot
        const timeSlot1 = labSlots[0].time_slots[0]?._id;
        const timeSlot2 = labSlots[0].time_slots[1]?._id;
        const timeSlot3 = labSlots[1].time_slots[0]?._id;

        const reservations = [
            {
                user: users[0]._id,
                lab_slot: labSlots[0]._id,
                time_slots: [timeSlot1],
                status: "Active",
            },
            {
                user: users[1]._id,
                lab_slot: labSlots[0]._id,
                time_slots: [timeSlot2],
                status: "Active",
            },
            {
                user: users[0]._id,
                lab_slot: labSlots[1]._id,
                time_slots: [timeSlot3],
                status: "Active",
            },
        ];

        await Reservation.deleteMany({});
        console.log("🧹 Existing reservations removed");

        await Reservation.insertMany(reservations);
        console.log(`✅ Seeded ${reservations.length} reservations`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding reservations failed:", error);
        process.exit(1);
    }
};

seedReservations();
