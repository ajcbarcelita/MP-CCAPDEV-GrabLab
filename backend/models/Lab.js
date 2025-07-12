/*
    Contains the Schema of the Mongo Database and the data type of each field

    This file is used on the Following Files:
        - ../controllers/labController.js (for database operations in controller functions)
        - ../routes/labRoutes.js (indirectly through the controller for route handling)
        - frontend/src/stores/labs_store.js (indirectly via API calls to the backend)
        - frontend/src/components/View.vue (indirectly via the labs store)
*/
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
