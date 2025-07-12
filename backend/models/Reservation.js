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
        time_slots: [
            {
                type: mongoose.Schema.Types.ObjectId,
                required: true, // references the _id of a time slot subdocument in LabSlot
            },
        ],
        status: {
            type: String,
            enum: ["Active", "Cancelled", "Completed"],
            default: "Active",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
