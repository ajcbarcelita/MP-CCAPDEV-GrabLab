import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        lab_slot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LabSlot",
            required: true,
        },
        time_slot: {
            type: String, // format: "HH:MM"
            required: true,
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"],
        },
        status: {
            type: String,
            enum: ["Active", "Cancelled", "Completed"],
            default: "Active",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
