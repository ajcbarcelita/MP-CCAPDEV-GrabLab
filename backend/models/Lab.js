import mongoose from "mongoose";

const labSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        building: {
            type: String,
            required: true,
            trim: true,
        },
        display_name: {
            type: String,
            required: true,
            trim: true,
        },
        operating_hours: {
            open: {
                type: String,
                required: true,
                match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid open time format, should be (HH:MM)"],
            },
            close: {
                type: String,
                required: true,
                match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid close time format, should be (HH:MM)"],
            },
        },
        capacity: {
            type: Number,
            required: true,
            min: [1, "Capacity must be at least 1"],
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Lab", labSchema);
