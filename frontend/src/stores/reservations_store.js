import { defineStore } from 'pinia' // Import Pinia's defineStore function to create a state store
import axios from 'axios' // Import axios for HTTP requests to the backend API

// API endpoint for reservation-related operations
// This constant defines the base URL for all API calls in this store
// If the backend URL changes, only this constant needs to be updated
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
 *
 * STORE STRUCTURE:
 * - state: Holds the reservations array, loading status, and error message
 * - actions: Methods to interact with the backend API (CRUD operations)
 * - getters: Computed properties to filter and access reservation data
 *
 * HOW TO USE THIS STORE:
 * 1. Import it in your component:
 *    import { useReservationsStore } from '@/stores/reservations_store'
 * 2. Initialize it in your component's setup function:
 *    const reservationsStore = useReservationsStore()
 * 3. Access state: reservationsStore.reservations
 * 4. Call actions: reservationsStore.fetchReservations()
 * 5. Use getters: reservationsStore.activeReservations
 */
export const useReservationsStore = defineStore('reservations', {
	// MODEL: Application State
	// These properties hold the current state of reservations in the application
	// All components that use this store will have access to this data
	state: () => ({
		reservations: [], // Array to store all reservation objects
		loading: false,   // Boolean flag to track API call status for UI loading indicators
		error: null,      // Stores error messages from failed API calls
	}),

	// MODEL METHODS: Actions for API calls and state mutations
	// These methods encapsulate all logic for interacting with the backend API
	// Each method follows a consistent pattern: set loading state, try API call, handle response, catch errors
	actions: {
		/**
		 * Fetch all reservations from the API
		 * Maps response data to ensure consistent structure
		 *
		 * WORKFLOW:
		 * 1. Set loading flag to true to show loading indicators
		 * 2. Make GET request to fetch all reservations
		 * 3. Process and normalize the response data
		 * 4. Update the local state with the fetched reservations
		 * 5. Handle any errors by updating the error state
		 * 6. Set loading flag to false when done (success or failure)
		 *
		 * @returns {Promise<void>} No return value, but updates store state
		 */
		async fetchReservations() {
			this.loading = true // Set loading state to true to show loading UI
			try {
				// Make API call to get all reservations
				const response = await axios.get(`${API_URL}/reservations`)

				// Process and normalize the data structure
				this.reservations = response.data.map((reservation) => ({
					...reservation,
					time_slots: reservation.time_slots || [], // Ensure time_slots is always an array
				}))

				this.error = null // Clear any previous errors on success
			} catch (error) {
				// Handle errors by updating the error state and logging to console
				this.error = error.message
				console.error('Error fetching reservations:', error)
			} finally {
				// Always set loading back to false, regardless of success/failure
				this.loading = false
			}
		},

		/**
		 * Fetch reservations by user ID
		 * Retrieves only reservations associated with a specific user
		 *
		 * WORKFLOW:
		 * 1. Set loading flag to true
		 * 2. Make GET request to user-specific reservation endpoint
		 * 3. Process response data, ensuring consistent structure
		 * 4. Update the local state with user's reservations
		 * 5. Handle errors by updating the error state
		 * 6. Set loading flag to false when complete
		 *
		 * @param {string|number} userId - The ID of the user to fetch reservations for
		 * @returns {Promise<void} No return value, but updates store state
		 */
		async fetchReservationsByUserId(userId) {
			this.loading = true // Activate loading state
			try {
				// Make API call to get user-specific reservations
				const response = await axios.get(`${API_URL}/reservations/user/${userId}`)

				// Process and normalize the data structure with additional fields
				this.reservations = response.data.map((reservation) => ({
					...reservation,
					time_slots: reservation.time_slots || [], // Ensure time_slots exists
					lab: reservation.lab_slot?.lab || null,   // Include lab information if available
					user: reservation.user || null,           // Include user information if available
				}))

				this.error = null // Clear any previous errors
			} catch (error) {
				// Handle errors appropriately
				console.error('Error fetching user reservations:', error)
				this.error = error.message
			} finally {
				this.loading = false // Always reset loading state
			}
		},

		/**
		 * Fetch reservations by lab ID
		 * Retrieves all reservations for a specific lab room
		 *
		 * WORKFLOW:
		 * 1. Set loading flag to true
		 * 2. Make GET request to lab-specific reservation endpoint
		 * 3. Update store with lab reservations
		 * 4. Handle any errors
		 * 5. Reset loading state
		 *
		 * USE CASE:
		 * This method is typically used for lab administrators or when
		 * viewing availability of a specific lab room
		 *
		 * @param {string} labId - The ID of the lab to fetch reservations for
		 * @returns {Promise<void>} No return value, but updates store state
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
		 * Removes a reservation from both the backend and local state
		 *
		 * WORKFLOW:
		 * 1. Set loading flag
		 * 2. Send DELETE request to reservation endpoint
		 * 3. On success, filter out the deleted reservation from local state
		 * 4. Handle errors
		 * 5. Reset loading state
		 *
		 * IMPORTANT:
		 * - This action permanently deletes the reservation
		 * - If you need to keep reservation history, consider using status updates instead
		 *
		 * @param {string} reservationId - The ID of the reservation to delete
		 * @returns {Object} The deleted reservation data from the API response
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
		 * Adds a new reservation to both the backend and local state
		 *
		 * WORKFLOW:
		 * 1. Set loading flag
		 * 2. Send POST request with reservation data
		 * 3. On success, add new reservation to the beginning of the local array
		 * 4. Handle errors
		 * 5. Reset loading state
		 *
		 * EXPECTED DATA FORMAT:
		 * The reservationData object should typically include:
		 * - user_id: ID of the user making the reservation
		 * - lab_slot_id: ID of the lab slot being reserved
		 * - date: Date of the reservation
		 * - status: Initial status (usually 'Active')
		 * - Additional fields as required by your backend
		 *
		 * @param {Object} reservationData - The data for the new reservation
		 * @returns {Object} The created reservation data from the API response
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
		 * A specialized update method that only changes the reservation status
		 *
		 * WORKFLOW:
		 * 1. Set loading flag
		 * 2. Send PATCH request with only the status field
		 * 3. Update the corresponding reservation in local state
		 * 4. Handle errors
		 * 5. Reset loading state
		 *
		 * VALID STATUS VALUES:
		 * - 'Active': Reservation is current and valid
		 * - 'Cancelled': Reservation was cancelled by user or admin
		 * - 'Completed': Reservation period has passed successfully
		 *
		 * USE CASES:
		 * - User cancelling a reservation
		 * - Admin marking a reservation as completed
		 * - System automatically updating statuses based on time
		 *
		 * @param {string} reservationId - The ID of the reservation to update
		 * @param {string} status - The new status value
		 * @returns {Object} The updated reservation data from the API response
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
		 * General-purpose update method for modifying any reservation fields
		 *
		 * WORKFLOW:
		 * 1. Set loading flag
		 * 2. Send PATCH request with update data
		 * 3. Update the corresponding reservation in local state
		 * 4. Handle errors
		 * 5. Reset loading state
		 *
		 * POTENTIAL UPDATE FIELDS:
		 * - status: Reservation status ('Active', 'Cancelled', 'Completed')
		 * - date: Date of the reservation
		 * - lab_slot_id: Change the lab slot
		 * - notes: Additional information about the reservation
		 * - Any other fields supported by your backend
		 *
		 * IMPORTANT:
		 * Only provide the fields you want to update in the updateData object
		 * Fields not included will remain unchanged
		 *
		 * @param {string} reservationId - The ID of the reservation to update
		 * @param {Object} updateData - The data to update the reservation with
		 * @returns {Object} The updated reservation data from the API response
		 * @throws {Error} If update fails
		 */
		async updateReservation(reservationId, updateData) {
			this.loading = true // Set loading state to show UI indicators
			try {
				// Make PATCH request to update the reservation
				const response = await axios.patch(
					`${API_URL}/reservations/${reservationId}`,
					updateData, // Send only the data that needs to be updated
				)

				// Find and update the reservation in our local state
				const index = this.reservations.findIndex((res) => res._id === reservationId)
				if (index !== -1) {
					// Replace the entire reservation object with the updated version from the API
					this.reservations[index] = response.data
				}

				this.error = null // Clear any previous errors
				return response.data // Return the updated data for further processing if needed
			} catch (error) {
				// Log the error and update the error state
				console.error('Error updating reservation:', error)
				this.error = error.message
				throw error // Re-throw the error so calling components can handle it
			} finally {
				this.loading = false // Reset loading state regardless of outcome
			}
		},
	},

	// Computed state for Views
	// Getters provide derived state based on the reservation data
	// They help filter and organize data for display in components
	// Using getters centralizes data filtering logic in the store
	getters: {
		/**
		 * Get a reservation by ID
		 * Finds and returns a single reservation object by its unique ID
		 *
		 * USAGE:
		 * const reservation = reservationsStore.getReservationById('123abc')
		 *
		 * IMPLEMENTATION NOTES:
		 * - Uses a curried function (function returning a function)
		 * - First function receives the state automatically from Pinia
		 * - Second function accepts the ID parameter from the component
		 * - Returns undefined if no matching reservation is found
		 *
		 * @param {string} id - The ID of the reservation to get
		 * @returns {Object|undefined} The reservation or undefined if not found
		 */
		getReservationById: (state) => (id) => {
			// Uses Array.find() to locate the first reservation with a matching ID
			// Returns undefined if no matching reservation is found
			return state.reservations.find((res) => res._id === id)
		},

		/**
		 * Get all active reservations
		 * Filters the reservations array to include only those with 'Active' status
		 *
		 * USAGE:
		 * const activeReservations = reservationsStore.activeReservations
		 *
		 * USE CASES:
		 * - Displaying a user's current active reservations
		 * - Showing which lab slots are currently reserved
		 * - Dashboard statistics for active reservations
		 *
		 * @returns {Array} All reservations with 'Active' status
		 */
		activeReservations: (state) => {
			// Filter the reservations array to include only active reservations
			// This is efficient as it creates a new filtered array without modifying the original
			return state.reservations.filter((res) => res.status === 'Active')
		},

		/**
		 * Get all cancelled reservations
		 * Filters the reservations array to include only those with 'Cancelled' status
		 *
		 * USAGE:
		 * const cancelledReservations = reservationsStore.cancelledReservations
		 *
		 * USE CASES:
		 * - Displaying reservation history for users
		 * - Admin reports on cancellation rates
		 * - Analytics for understanding cancellation patterns
		 *
		 * @returns {Array} All reservations with 'Cancelled' status
		 */
		cancelledReservations: (state) => {
			// Filter the reservations array to include only cancelled reservations
			return state.reservations.filter((res) => res.status === 'Cancelled')
		},

		/**
		 * Get all completed reservations
		 * Filters the reservations array to include only those with 'Completed' status
		 *
		 * USAGE:
		 * const completedReservations = reservationsStore.completedReservations
		 *
		 * USE CASES:
		 * - Displaying reservation history for users
		 * - Admin reports on lab usage
		 * - Analytics for understanding usage patterns
		 * - Audit logs of past reservations
		 *
		 * @returns {Array} All reservations with 'Completed' status
		 */
		completedReservations: (state) => {
			// Filter the reservations array to include only completed reservations
			return state.reservations.filter((res) => res.status === 'Completed')
		},

		/**
		 * EXTENSION POINT: Additional getters can be added here
		 *
		 * EXAMPLES OF USEFUL GETTERS TO IMPLEMENT:
		 * - reservationsByDate: Group reservations by date
		 * - reservationsByLab: Group reservations by lab
		 * - upcomingReservations: Get future reservations
		 * - pastReservations: Get historical reservations
		 * - reservationCountByStatus: Count reservations by status
		 */
	},

	/**
	 * EXTENSION POINT: Pinia allows adding more configuration options
	 *
	 * POTENTIAL ADDITIONS:
	 * - persist: true - To enable automatic persistence to localStorage
	 * - hydrate: Custom logic for state restoration
	 * - debounce: Configure debouncing for specific actions
	 */
})
