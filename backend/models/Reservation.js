import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
    {
        user_id: {
            type: Number,
            required: true,
        },
        user_id: {
            type: Number,
            required: false, // Making it optional since we have the user ObjectId
        },
        lab_slot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LabSlot",
            required: true,
        },
        time_slots: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TimeSlot", // Ensure this references the correct subdocument
                required: true,
            },
        ],
        status: {
            type: String,
            enum: ["Active", "Cancelled", "Completed", "Deleted"],
            default: "Active",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
