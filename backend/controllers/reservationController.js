import Reservation from "../models/Reservation.js";
import Lab from "../models/Lab.js";
import mongoose from "mongoose";


/**
 * @desc    Update user profile (name, description)
 * @route   PUT /api/users/:userId
 * @access  Private
 * @param   req.params.userId - User ID
 * @param   req.body.fname, lname, description
 * @returns Updated user object (transformed)
 */
export const createReservation = async (req, res) => {
  const { user_id, lab_id, reservation_date, slots, anonymous } = req.body;

  if (
    !user_id ||
    !lab_id ||
    !reservation_date ||
    !Array.isArray(slots) ||
    slots.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields or invalid slots format" });
  }

  try {
    // Check if the user exists
    const User = mongoose.model("User");
    const user = await User.findOne({ user_id: parseInt(user_id) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the lab exists
    const lab = await Lab.findById(lab_id);
    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    // Check for conflicts with existing reservations
    const existingReservations = await Reservation.find({
      lab_id,
      reservation_date: new Date(reservation_date),
      status: "Active",
    });

    for (const slot of slots) {
      const conflict = existingReservations.find((reservation) =>
        reservation.slots.some(
          (existingSlot) =>
            existingSlot.seat_number === slot.seat_number &&
            existingSlot.start_time === slot.start_time &&
            existingSlot.end_time === slot.end_time
        )
      );

      if (conflict) {
        return res.status(409).json({
          message: `Seat ${slot.seat_number} at ${slot.start_time}-${slot.end_time} is already reserved`,
        });
      }
    }

    // Create the reservation
    const reservation = await Reservation.create({
      user_id: parseInt(user_id),
      lab_id,
      reservation_date: new Date(reservation_date),
      slots,
      anonymous: anonymous || false,
    });

    // Populate lab and user information
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("lab_id", "name display_name building")
      .lean();

    // Add user information only if not anonymous
    if (!anonymous) {
      populatedReservation.user = {
        user_id: user.user_id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
      };
    } else {
      populatedReservation.user = {
        user_id: "Anonymous",
        email: "Anonymous",
        fname: "Anonymous",
        lname: "User",
      };
    }

    res.status(201).json(populatedReservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: error.message });
  }
};


/**
 * @desc    Get all reservations
 * @route   GET /api/reservations
 * @access  Public/Private
 * @returns Array of all reservations (each populated with lab and user info)
 */
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate("lab_id", "name display_name building")
      .sort({ createdAt: -1 });

    // Populate user details for each reservation
    const User = mongoose.model("User");
    const populatedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        const reservationObj = reservation.toObject();

        // Handle anonymous reservations
        if (reservation.anonymous) {
          reservationObj.user = {
            user_id: "Anonymous",
            email: "Anonymous",
            fname: "Anonymous",
            lname: "User",
          };
        } else {
          const user = await User.findOne({ user_id: reservation.user_id });
          if (user) {
            reservationObj.user = {
              _id: user._id,
              user_id: user.user_id,
              email: user.email,
              fname: user.fname,
              lname: user.lname,
            };
          }
        }
        return reservationObj;
      })
    );

    res.json(populatedReservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * @desc    Get all reservations
 * @route   GET /api/reservations
 * @access  Public/Private
 * @returns Array of all reservations (each populated with lab and user info)
 */
export const getReservationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching reservations for user ID:", userId);

    // Query by user_id field with the new schema
    let reservations = await Reservation.find({ user_id: parseInt(userId) })
      .populate("lab_id", "name display_name building")
      .sort({ createdAt: -1 });

    // Find the user separately to ensure we have user details
    const User = mongoose.model("User");
    const user = await User.findOne({ user_id: parseInt(userId) });

    if (user) {
      // Attach user details to each reservation
      reservations = reservations.map((reservation) => {
        const reservationObj = reservation.toObject();
        reservationObj.user = {
          _id: user._id,
          user_id: user.user_id,
          email: user.email,
          fname: user.fname,
          lname: user.lname,
        };
        return reservationObj;
      });
    }

    console.log("Reservations fetched successfully:", reservations);
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations by user ID:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all reservations
 * @route   GET /api/reservations
 * @access  Public/Private
 * @returns Array of all reservations (each populated with lab and user info)
 */
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Perform a hard delete instead of just updating the status
    await Reservation.findByIdAndDelete(id);

    res.json({
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update a reservation (slots, status, etc.)
 * @route   PATCH /api/reservations/:id
 * @access  Public/Private
 * @param   req.params.id - Reservation ID
 * @param   req.body - Fields to update (user_id, lab_id, reservation_date, slots, anonymous, status)
 * @returns Updated reservation object (populated with lab and user info)
 */
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, lab_id, reservation_date, slots, anonymous, status } =
      req.body;

    // Find the existing reservation
    const existingReservation = await Reservation.findById(id);
    if (!existingReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Build update data object
    const updateData = {};

    if (user_id !== undefined) {
      updateData.user_id = parseInt(user_id);
    }

    if (lab_id !== undefined) {
      updateData.lab_id = lab_id;
    }

    if (reservation_date !== undefined) {
      updateData.reservation_date = new Date(reservation_date);
    }

    if (slots !== undefined) {
      if (!Array.isArray(slots) || slots.length === 0) {
        return res
          .status(400)
          .json({ message: "Slots must be a non-empty array" });
      }
      updateData.slots = slots;
    }

    if (anonymous !== undefined) {
      updateData.anonymous = anonymous;
    }

    if (status !== undefined) {
      if (!["Active", "Cancelled", "Completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      updateData.status = status;
    }

    // If we're updating slots, check for conflicts with other reservations
    if (slots && slots.length > 0) {
      const conflictDate =
        reservation_date || existingReservation.reservation_date;
      const conflictLabId = lab_id || existingReservation.lab_id;

      const existingReservations = await Reservation.find({
        lab_id: conflictLabId,
        reservation_date: new Date(conflictDate),
        status: "Active",
        _id: { $ne: id }, // Exclude the current reservation being updated
      });

      for (const slot of slots) {
        const conflict = existingReservations.find((reservation) =>
          reservation.slots.some(
            (existingSlot) =>
              existingSlot.seat_number === slot.seat_number &&
              existingSlot.start_time === slot.start_time &&
              existingSlot.end_time === slot.end_time
          )
        );

        if (conflict) {
          return res.status(409).json({
            message: `Seat ${slot.seat_number} at ${slot.start_time}-${slot.end_time} is already reserved`,
          });
        }
      }
    }

    // Update the reservation
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    ).populate("lab_id", "name display_name building");

    // Populate user information
    const User = mongoose.model("User");
    const populatedReservation = updatedReservation.toObject();

    if (updatedReservation.anonymous) {
      populatedReservation.user = {
        user_id: "Anonymous",
        email: "Anonymous",
        fname: "Anonymous",
        lname: "User",
      };
    } else {
      const user = await User.findOne({ user_id: updatedReservation.user_id });
      if (user) {
        populatedReservation.user = {
          _id: user._id,
          user_id: user.user_id,
          email: user.email,
          fname: user.fname,
          lname: user.lname,
        };
      }
    }

    res.json(populatedReservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get reservations by lab ID
 * @route   GET /api/reservations/lab/:labId
 * @access  Public/Private
 * @param   req.params.labId - Lab ID
 * @returns Array of reservations for the lab (populated with user info)
 */
export const getReservationsByLab = async (req, res) => {
  try {
    const { labId } = req.params;

    const reservations = await Reservation.find({
      lab_id: labId,
      status: "Active",
    })
      .populate("lab_id", "name display_name building")
      .sort({ createdAt: -1 });

    // Populate user details for each reservation
    const User = mongoose.model("User");
    const populatedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        const reservationObj = reservation.toObject();

        // Handle anonymous reservations
        if (reservation.anonymous) {
          reservationObj.user = {
            user_id: "Anonymous",
            email: "Anonymous",
            fname: "Anonymous",
            lname: "User",
          };
        } else {
          const user = await User.findOne({ user_id: reservation.user_id });
          if (user) {
            reservationObj.user = {
              _id: user._id,
              user_id: user.user_id,
              email: user.email,
              fname: user.fname,
              lname: user.lname,
            };
          }
        }
        return reservationObj;
      })
    );

    res.json(populatedReservations);
  } catch (error) {
    console.error("Error fetching reservations by lab:", error);
    res.status(500).json({ message: error.message });
  }
};
