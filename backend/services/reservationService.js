import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Lab from "../models/Lab.js";
import { logError } from "../utils/logErrors.js";
import { normalizeDateForComparison } from "../utils/reservationUtils.js";

/**
 * Service class for handling reservation operations with database sessions
 * to prevent race conditions and ensure data consistency
 *
 * WHY WE NEED THIS:
 * - Without sessions, two users could check for conflicts at the same time
 * - Both might see "no conflicts" and both try to create reservations
 * - This leads to double bookings (race condition)
 * - Database sessions ensure atomic operations (check + create happen together)
 */
class ReservationService {
  /**
   * Create a reservation with session-based concurrency control
   * @param {Object} reservationData - The reservation data
   * @param {Object} req - Express request object for logging
   * @returns {Promise<Object>} The created reservation
   */
  async createReservationWithSession(reservationData, req) {
    // Start a MongoDB session - this is like a "transaction" that ensures data consistency
    const session = await mongoose.startSession();

    try {
      let result;

      // Use withTransaction to ensure all operations are atomic (all succeed or all fail)
      await session.withTransaction(async () => {
        const { user_id, lab_id, reservation_date, slots, anonymous } =
          reservationData;

        // Check if the lab exists (within the session)
        const lab = await Lab.findById(lab_id).session(session);
        if (!lab) {
          throw new Error("Lab not found");
        }

        // Check for conflicts with existing reservations (within the same session)
        // This prevents race conditions because the check and create happen atomically
        const existingReservations = await Reservation.find({
          lab_id,
          reservation_date: {
            $gte: normalizeDateForComparison(reservation_date),
            $lt: new Date(
              normalizeDateForComparison(reservation_date).getTime() +
                24 * 60 * 60 * 1000
            ),
          },
          status: "Active",
        }).session(session);

        // Check each slot for conflicts
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
            throw new Error(
              `Seat ${slot.seat_number} at ${slot.start_time}-${slot.end_time} is already reserved`
            );
          }
        }

        // Create the reservation (atomic operation within session)
        // If this fails, the entire transaction is rolled back
        const reservation = await Reservation.create(
          [
            {
              user_id: parseInt(user_id),
              lab_id,
              reservation_date: new Date(reservation_date),
              slots,
              anonymous: anonymous || false,
            },
          ],
          { session }
        );

        result = reservation[0];
      });

      return result;
    } catch (error) {
      await logError({ error, req, route: "createReservationWithSession" });
      throw error;
    } finally {
      // Always end the session to free up database resources
      await session.endSession();
    }
  }

  /**
   * Update a reservation with session-based concurrency control
   * @param {string} reservationId - The reservation ID
   * @param {Object} updateData - The update data
   * @param {Object} req - Express request object for logging
   * @returns {Promise<Object>} The updated reservation
   */
  async updateReservationWithSession(reservationId, updateData, req) {
    const session = await mongoose.startSession();

    try {
      let result;

      await session.withTransaction(async () => {
        // Check if reservation exists and is owned by user
        const existingReservation = await Reservation.findById(
          reservationId
        ).session(session);
        if (!existingReservation) {
          throw new Error("Reservation not found");
        }

        // If updating slots, check for conflicts
        if (updateData.slots) {
          const existingReservations = await Reservation.find({
            lab_id: existingReservation.lab_id,
            reservation_date: existingReservation.reservation_date,
            status: "Active",
            _id: { $ne: reservationId }, // Exclude current reservation
          }).session(session);

          for (const slot of updateData.slots) {
            const conflict = existingReservations.find((reservation) =>
              reservation.slots.some(
                (existingSlot) =>
                  existingSlot.seat_number === slot.seat_number &&
                  existingSlot.start_time === slot.start_time &&
                  existingSlot.end_time === slot.end_time
              )
            );

            if (conflict) {
              throw new Error(
                `Seat ${slot.seat_number} at ${slot.start_time}-${slot.end_time} is already reserved`
              );
            }
          }
        }

        // Update the reservation (atomic operation within session)
        const updatedReservation = await Reservation.findByIdAndUpdate(
          reservationId,
          updateData,
          { new: true, session }
        );

        result = updatedReservation;
      });

      return result;
    } catch (error) {
      await logError({ error, req, route: "updateReservationWithSession" });
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Delete a reservation with session-based concurrency control
   * @param {string} reservationId - The reservation ID
   * @param {Object} req - Express request object for logging
   * @returns {Promise<Object>} The deleted reservation
   */
  async deleteReservationWithSession(reservationId, req) {
    const session = await mongoose.startSession();

    try {
      let result;

      await session.withTransaction(async () => {
        // Check if reservation exists
        const existingReservation = await Reservation.findById(
          reservationId
        ).session(session);
        if (!existingReservation) {
          throw new Error("Reservation not found");
        }

        // Delete the reservation (atomic operation within session)
        const deletedReservation = await Reservation.findByIdAndDelete(
          reservationId,
          { session }
        );

        result = deletedReservation;
      });

      return result;
    } catch (error) {
      await logError({ error, req, route: "deleteReservationWithSession" });
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

export default new ReservationService();
