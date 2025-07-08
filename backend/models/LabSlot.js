import mongoose, { mongo } from "mongoose";

const timeSlotSchema = new mongoose.Schema({
    startTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format, should be (HH:MM)"],
    },
    endTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format, should be (HH:MM)"],
    },
    reserved: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
        default: null, // Allows for unreserved slots
    },
});

const labSlotSchema = new mongoose.Schema(
    {
        lab: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lab",
            required: true,
        },
        seat_number: {
            type: Number,
            required: true,
            min: [1, "Seat number must be at least 1"],
        },
        date: {
            type: Date,
            required: true,
        },
        time_slots: {
            type: [timeSlotSchema],
            required: true,
        },
    },
    { timestamps: true }
);

// Ensure that the combination of lab, seat_number, and date is unique
labSlotSchema.index({ lab: 1, seat_number: 1, date: 1 }, { unique: true });

export default mongoose.model("LabSlot", labSlotSchema);
