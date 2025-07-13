import mongoose from "mongoose";
import dotenv from "dotenv";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import LabSlot from "../models/LabSlot.js";
import Lab from "../models/Lab.js";

dotenv.config();

const seedReservations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🌱 Connected to MongoDB");

        // Get current date and 4 days from now
        const now = new Date();
        const fourDaysLater = new Date();
        fourDaysLater.setDate(now.getDate() + 4);

        // Get all non-technician users
        const users = await User.find({ role: { $ne: "Technician" } });
        if (users.length === 0) throw new Error("No eligible users found.");

        await Reservation.deleteMany({});
        console.log("🧹 Existing reservations removed");

        // Get all LabSlots within 4 days
        const labSlots = await LabSlot.find({
            date: { $gte: now, $lte: fourDaysLater },
        }).populate("lab");

        // Group LabSlots by lab._id
        const labSlotGroups = {};
        for (const slot of labSlots) {
            if (!slot.lab) continue; // skip if lab is missing
            const labId = slot.lab._id.toString();
            if (!labSlotGroups[labId]) labSlotGroups[labId] = [];
            labSlotGroups[labId].push(slot);
        }

        let totalReservations = 0;

        for (const [labId, slots] of Object.entries(labSlotGroups)) {
            let reservations = [];
            let userIdx = 0;

            // Try to make up to 3 reservations for this lab
            for (const labSlot of slots) {
                if (reservations.length >= 3) break;
                const isToday = labSlot.date.toDateString() === now.toDateString();
                const availableTimeSlot = labSlot.time_slots.find((ts) => {
                    if (ts.reserved) return false;
                    if (isToday) {
                        const [endHour, endMinute] = ts.endTime.split(":").map(Number);
                        const slotEnd = new Date(labSlot.date);
                        slotEnd.setHours(endHour, endMinute, 0, 0);
                        return slotEnd > now;
                    }
                    return true;
                });
                if (availableTimeSlot) {
                    reservations.push({
                        user_id: users[userIdx % users.length].user_id,
                        lab_slot: labSlot._id,
                        time_slots: [availableTimeSlot._id],
                        status: "Active",
                    });
                    userIdx++;
                }
            }

            if (reservations.length === 0) {
                console.log(`⚠️  No available reservations for lab ${slots[0].lab.display_name || labId}`);
                continue;
            }

            // Insert reservations and update LabSlot time_slots
            const inserted = await Reservation.insertMany(reservations);

            for (let i = 0; i < inserted.length; i++) {
                const reservation = inserted[i];
                const labSlotId = reservation.lab_slot;
                const reservedTimeSlotIds = reservation.time_slots;
                await LabSlot.updateOne(
                    { _id: labSlotId, "time_slots._id": { $in: reservedTimeSlotIds } },
                    { $set: { "time_slots.$[elem].reserved": reservation._id } },
                    { arrayFilters: [{ "elem._id": { $in: reservedTimeSlotIds } }] }
                );
            }

            totalReservations += inserted.length;
            console.log(`✅ Seeded ${inserted.length} reservations for lab ${slots[0].lab.display_name || labId}`);
        }

        console.log(`🎉 Total reservations seeded: ${totalReservations}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding reservations failed:", error);
        process.exit(1);
    }
};

seedReservations();
