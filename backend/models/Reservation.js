import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      required: true,
    },
    lab_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
    },
    reservation_date: {
      type: Date,
      required: true,
    },
    slots: [
      {
        seat_number: {
          type: Number,
          required: true,
        },
        start_time: {
          type: String,
          required: true,
        },
        end_time: {
          type: String,
          required: true,
        },
      },
    ],
    anonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Cancelled", "Completed", "Deleted"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
