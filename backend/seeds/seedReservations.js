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

        // Get all Student users only
        const users = await User.find({ role: "Student" });
        if (users.length === 0) throw new Error("No eligible users found.");

        await Reservation.deleteMany({});
        console.log("🧹 Existing reservations removed");

        // Get all LabSlots within 4 days, grouped by lab
        const labSlots = await LabSlot.find({
            date: { $gte: now, $lte: fourDaysLater },
        }).populate("lab");

        const labSlotGroups = {};
        for (const slot of labSlots) {
            if (!slot.lab) continue;
            const labId = slot.lab._id.toString();
            if (!labSlotGroups[labId]) labSlotGroups[labId] = [];
            labSlotGroups[labId].push(slot);
        }

        let totalReservations = 0;

        for (const [labId, slots] of Object.entries(labSlotGroups)) {
            for (const user of users) {
                let reservations = [];
                let usedSlots = new Set();

                // Try to make up to 5 reservations for this user in this lab
                for (const labSlot of slots) {
                    if (reservations.length >= 5) break;
                    const isToday = labSlot.date.toDateString() === now.toDateString();
                    const availableTimeSlot = labSlot.time_slots.find((ts) => {
                        if (ts.reserved) return false;
                        if (usedSlots.has(ts._id.toString())) return false;
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
                            user_id: user.user_id,
                            lab_id: labSlot.lab._id,
                            reservation_date: labSlot.date,
                            slots: [
                                {
                                    seat_number: labSlot.seat_number, // <-- FIXED: get from LabSlot, not time slot
                                    start_time: availableTimeSlot.startTime,
                                    end_time: availableTimeSlot.endTime,
                                },
                            ],
                            status: "Active",
                        });
                        usedSlots.add(availableTimeSlot._id.toString());
                    }
                }

                if (reservations.length === 0) {
                    console.log(`⚠️  No available reservations for user ${user.user_id} in lab ${slots[0].lab.display_name || labId}`);
                    continue;
                }

                // Insert reservations
                const inserted = await Reservation.insertMany(reservations);
                totalReservations += inserted.length;
                console.log(
                    `✅ Seeded ${inserted.length} reservations for user ${user.user_id} in lab ${slots[0].lab.display_name || labId}`
                );
            }
        }

        console.log(`🎉 Total reservations seeded: ${totalReservations}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding reservations failed:", error);
        process.exit(1);
    }
};

seedReservations();
