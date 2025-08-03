import mongoose from "mongoose";

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

export const populateUserInfoForMultiple = async (reservations) => {
  const User = mongoose.model("User");

  const userIds = [
    ...new Set(
      reservations
        .filter((reservation) => !reservation.anonymous)
        .map((reservation) => reservation.user_id)
    ),
  ];

  const users = await User.find({ user_id: { $in: userIds } });
  const userMap = new Map(users.map((user) => [user.user_id, user]));

  return Promise.all(
    reservations.map(async (reservation) => {
      const user = reservation.anonymous
        ? null
        : userMap.get(reservation.user_id);
      return populateUserInfo(reservation, user);
    })
  );
};

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
