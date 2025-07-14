import { defineStore } from 'pinia'
import axios from 'axios'

// API endpoint for reservation-related operations
const API_URL = 'http://localhost:3000/api'

/**
 * Reservations Store
 *
 * This store serves as the Model part of MVC in the frontend:
 * - State: Represents the application data (reservations)
 * - Actions: Handle data manipulation and API calls
 * - Getters: Provide computed state for the Views
 *
 * The controllers are implicitly defined in the backend API routes and
 * the components (Views) consume this store to display data.
 */
export const useReservationsStore = defineStore('reservations', {
	// Model: Application State
	state: () => ({
		reservations: [],
		loading: false,
		error: null,
	}),

	// Model Methods: Actions for API calls and state mutations
	actions: {
		/**
		 * Fetch all reservations from the API
		 * Maps response data to ensure consistent structure
		 */
		async fetchReservations() {
			this.loading = true
			try {
				const response = await axios.get(`${API_URL}/reservations`)
				this.reservations = response.data.map((reservation) => ({
					...reservation,
					time_slots: reservation.time_slots || [], // Ensure time_slots is always an array
				}))
				this.error = null
			} catch (error) {
				this.error = error.message
				console.error('Error fetching reservations:', error)
			} finally {
				this.loading = false
			}
		},

		/**
		 * Fetch reservations by user ID
		 * @param {string|number} userId - The ID of the user to fetch reservations for
		 */
		async fetchReservationsByUserId(userId) {
			this.loading = true
			try {
				const response = await axios.get(`${API_URL}/reservations/user/${userId}`)

				this.reservations = response.data.map((reservation) => ({
					...reservation,
					time_slots: reservation.time_slots || [],
					lab: reservation.lab_slot?.lab || null, // Include lab information if available
					user: reservation.user || null, // Include user information if available
				}))

				this.error = null
			} catch (error) {
				console.error('Error fetching user reservations:', error)
				this.error = error.message
			} finally {
				this.loading = false
			}
		},

		/**
		 * Fetch reservations by lab ID
		 * @param {string} labId - The ID of the lab to fetch reservations for
		 */
		async fetchReservationsByLab(labId) {
			this.loading = true
			try {
				const response = await axios.get(`${API_URL}/reservations/lab/${labId}`)
				this.reservations = response.data
				this.error = null
			} catch (error) {
				this.error = error.message
				console.error('Error fetching lab reservations:', error)
			} finally {
				this.loading = false
			}
		},

		/**
		 * Delete a reservation
		 * @param {string} reservationId - The ID of the reservation to delete
		 * @returns {Object} The deleted reservation data
		 * @throws {Error} If deletion fails
		 */
		async deleteReservation(reservationId) {
			this.loading = true
			try {
				const response = await axios.delete(`${API_URL}/reservations/${reservationId}`)
				// Remove the reservation from the array
				this.reservations = this.reservations.filter((res) => res._id !== reservationId)
				this.error = null // Clear any previous errors
				return response.data // Return the deleted reservation data
			} catch (error) {
				this.error = error.message
				console.error('Error deleting reservation:', error)
				throw error
			} finally {
				this.loading = false
			}
		},

		/**
		 * Create a new reservation
		 * @param {Object} reservationData - The data for the new reservation
		 * @returns {Object} The created reservation data
		 * @throws {Error} If creation fails
		 */
		async createReservation(reservationData) {
			this.loading = true
			try {
				const response = await axios.post(`${API_URL}/reservations`, reservationData)
				// Add the new reservation to the store
				this.reservations.unshift(response.data)
				this.error = null
				return response.data
			} catch (error) {
				this.error = error.message
				console.error('Error creating reservation:', error)
				throw error
			} finally {
				this.loading = false
			}
		},

		/**
		 * Update only the status of a reservation
		 * @param {string} reservationId - The ID of the reservation to update
		 * @param {string} status - The new status value
		 * @returns {Object} The updated reservation data
		 * @throws {Error} If update fails
		 */
		async updateReservationStatus(reservationId, status) {
			this.loading = true
			try {
				const response = await axios.patch(`${API_URL}/reservations/${reservationId}`, {
					status,
				})
				const index = this.reservations.findIndex((res) => res._id === reservationId)
				if (index !== -1) {
					this.reservations[index] = response.data
				}
				this.error = null
				return response.data
			} catch (error) {
				this.error = error.message
				console.error('Error updating reservation status:', error)
				throw error
			} finally {
				this.loading = false
			}
		},

		/**
		 * Update a reservation with any provided data
		 * @param {string} reservationId - The ID of the reservation to update
		 * @param {Object} updateData - The data to update the reservation with
		 * @returns {Object} The updated reservation data
		 * @throws {Error} If update fails
		 */
		async updateReservation(reservationId, updateData) {
			this.loading = true
			try {
				const response = await axios.patch(
					`${API_URL}/reservations/${reservationId}`,
					updateData,
				)

				const index = this.reservations.findIndex((res) => res._id === reservationId)
				if (index !== -1) {
					this.reservations[index] = response.data
				}

				this.error = null
				return response.data
			} catch (error) {
				console.error('Error updating reservation:', error)
				this.error = error.message
				throw error
			} finally {
				this.loading = false
			}
		},
	},

	// Computed state for Views
	getters: {
		/**
		 * Get a reservation by ID
		 * @param {string} id - The ID of the reservation to get
		 * @returns {Object|undefined} The reservation or undefined if not found
		 */
		getReservationById: (state) => (id) => {
			return state.reservations.find((res) => res._id === id)
		},

		/**
		 * Get all active reservations
		 * @returns {Array} All reservations with 'Active' status
		 */
		activeReservations: (state) => {
			return state.reservations.filter((res) => res.status === 'Active')
		},

		/**
		 * Get all cancelled reservations
		 * @returns {Array} All reservations with 'Cancelled' status
		 */
		cancelledReservations: (state) => {
			return state.reservations.filter((res) => res.status === 'Cancelled')
		},

		/**
		 * Get all completed reservations
		 * @returns {Array} All reservations with 'Completed' status
		 */
		completedReservations: (state) => {
			return state.reservations.filter((res) => res.status === 'Completed')
		},
	},
})
