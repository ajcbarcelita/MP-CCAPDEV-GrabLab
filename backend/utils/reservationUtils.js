import mongoose from "mongoose";

/**
 * Utility functions for reservation operations
 * Centralizes common logic to reduce code duplication
 */

/**
 * Populate user information for a reservation
 * Handles both anonymous and regular users
 *
 * @param {Object} reservation - The reservation object
 * @param {Object} user - The user object (optional, will be fetched if not provided)
 * @returns {Object} Reservation with populated user information
 */
export const populateUserInfo = async (reservation, user = null) => {
  const reservationObj = reservation.toObject
    ? reservation.toObject()
    : { ...reservation };

  if (reservation.anonymous) {
    reservationObj.user = {
      user_id: "Anonymous",
      email: "Anonymous",
      fname: "Anonymous",
      lname: "User",
    };
  } else {
    if (!user) {
      const User = mongoose.model("User");
      user = await User.findOne({ user_id: reservation.user_id });
    }

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
};

/**
 * Populate user information for multiple reservations
 *
 * @param {Array} reservations - Array of reservation objects
 * @returns {Array} Array of reservations with populated user information
 */
export const populateUserInfoForMultiple = async (reservations) => {
  const User = mongoose.model("User");

  // Get all unique user IDs to fetch them in one query
  const userIds = [
    ...new Set(
      reservations
        .filter((reservation) => !reservation.anonymous)
        .map((reservation) => reservation.user_id)
    ),
  ];

  // Fetch all users in one query
  const users = await User.find({ user_id: { $in: userIds } });
  const userMap = new Map(users.map((user) => [user.user_id, user]));

  // Populate each reservation
  return Promise.all(
    reservations.map(async (reservation) => {
      const user = reservation.anonymous
        ? null
        : userMap.get(reservation.user_id);
      return populateUserInfo(reservation, user);
    })
  );
};

/**
 * Validate technician reservation rules
 *
 * @param {number} user_id - The user ID being reserved for
 * @param {number} technician_id - The technician ID making the reservation
 * @param {Object} req - Express request object for logging
 * @returns {Object} Validation result with success boolean and error message
 */
export const validateTechnicianReservation = async (
  user_id,
  technician_id,
  req
) => {
  const User = mongoose.model("User");

  const technician = await User.findOne({ user_id: parseInt(technician_id) });
  const student = await User.findOne({ user_id: parseInt(user_id) });

  // Check if the technician exists and has the correct role
  if (!technician || technician.role !== "Technician") {
    return { success: false, message: "Invalid technician ID." };
  }

  // Ensure technicians cannot reserve for themselves
  if (parseInt(user_id) === parseInt(technician_id)) {
    return {
      success: false,
      message:
        "Technicians cannot reserve for themselves. Please enter a student ID.",
    };
  }

  // Ensure technicians can only reserve for students
  if (!student || student.role !== "Student") {
    return {
      success: false,
      message: "Technicians can only reserve for students.",
    };
  }

  return { success: true };
};

/**
 * Check if time slots are in the past (for today's reservations)
 *
 * @param {Array} slots - Array of slot objects with end_time
 * @param {Date} reservationDate - The reservation date
 * @returns {Object} Validation result with success boolean and error message
 */
export const validateTimeSlotsNotInPast = (slots, reservationDate) => {
  const today = new Date();
  const resDate = new Date(reservationDate);
  const isToday = today.toDateString() === resDate.toDateString();

  if (isToday) {
    const nowMinutes = today.getHours() * 60 + today.getMinutes();

    for (const slot of slots) {
      const [endHour, endMinute] = slot.end_time.split(":").map(Number);
      const slotEndMinutes = endHour * 60 + endMinute;

      if (slotEndMinutes <= nowMinutes) {
        return {
          success: false,
          message: `Cannot book slot ending before current time: ${slot.start_time}-${slot.end_time}`,
        };
      }
    }
  }

  return { success: true };
};

export const normalizeDateForComparison = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
