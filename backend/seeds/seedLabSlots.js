import mongoose from "mongoose";
import dotenv from "dotenv";
import Lab from "../models/Lab.js";
import LabSlot from "../models/LabSlot.js";

dotenv.config();

// Function to generate 30-minute time slots between open and close times
// Assumes openTime and closeTime are in "HH:MM" format
function generateTimeSlots(openTime, closeTime) {
    const slots = [];
    let [startHour, startMinute] = openTime.split(":").map(Number); // convert to numbers
    let [endHour, endMinute] = closeTime.split(":").map(Number); // convert to numbers

    const pad = (n) => String(n).padStart(2, "0"); // pad single-digit numbers with leading zero

    // Loop to create 30-minute slots, stopping before the close time
    while (startHour < endHour || (startHour === endHour && startMinute < endMinute)) {
        const nextMinute = startMinute + 30;
        let endSlotHour = startHour;
        let endSlotMinute = nextMinute;

        if (nextMinute >= 60) {
            endSlotHour += 1;
            endSlotMinute -= 60;
        }

        slots.push({
            startTime: `${pad(startHour)}:${pad(startMinute)}`,
            endTime: `${pad(endSlotHour)}:${pad(endSlotMinute)}`,
            reserved: null,
        });

        startHour = endSlotHour;
        startMinute = endSlotMinute;
    }

    return slots;
}

async function seedLabSlots() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🌱 Connected to MongoDB");

        const labs = await Lab.find({});
        const today = new Date();
        const daysToGenerate = 120;
        const allSlots = [];

        for (const lab of labs) {
            const { _id: labId, capacity, operating_hours } = lab;

            for (let dayOffset = 0; dayOffset < daysToGenerate; dayOffset++) {
                const date = new Date(today);
                date.setDate(today.getDate() + dayOffset);
                date.setHours(0, 0, 0, 0); // normalize time

                const timeSlots = generateTimeSlots(operating_hours.open, operating_hours.close);

                for (let seat = 1; seat <= capacity; seat++) {
                    allSlots.push({
                        lab: labId,
                        seat_number: seat,
                        date: new Date(date),
                        time_slots: generateTimeSlots(operating_hours.open, operating_hours.close), // generate a fresh array for each seat
                    });
                }
            }
        }

        await LabSlot.deleteMany({});
        console.log("🧹 Existing LabSlots removed");

        await LabSlot.insertMany(allSlots);
        console.log(`✅ Seeded ${allSlots.length} LabSlots`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding LabSlots failed:", error);
        process.exit(1);
    }
}

seedLabSlots();
