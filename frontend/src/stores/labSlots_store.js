import { defineStore } from 'pinia' // Importing Pinia for state management
import axios from 'axios' // Importing Axios for making HTTP requests

const API_URL = 'http://localhost:3000/api' // Base URL for the backend API

export const useLabSlotsStore = defineStore('labSlots', {
	// State: Defines the reactive state for the store
	state: () => ({
		labSlots: [], // Array to store lab slot data fetched from the API
		loading: false, // Boolean flag to indicate loading state for API calls
		error: null, // Stores error messages from failed API calls
	}),

	// Actions: Methods to modify the state or perform asynchronous operations
	actions: {
		// Fetches lab slots for a specific lab and date from the API
		// @param {string|number} labId - The ID of the lab
		// @param {string} date - The date to filter lab slots by
		// @returns {Promise<Array>} - Resolves with the fetched lab slots
		async fetchLabSlotsByLabAndDate(labId, date) {
			this.loading = true // Set loading state to true
			try {
				const response = await axios.get(`${API_URL}/labslots/lab/${labId}/date/${date}`) // API call
				this.labSlots = response.data // Update state with fetched data
				this.error = null // Clear any previous errors
				return response.data // Return the fetched data
			} catch (error) {
				this.error = error.message // Store error message in state
				console.error('Error fetching lab slots:', error) // Log error to console
				throw error // Re-throw error for further handling
			} finally {
				this.loading = false // Reset loading state
			}
		},

		// Fetches all lab slots for a specific lab from the API
		// @param {string|number} labId - The ID of the lab
		// @returns {Promise<Array>} - Resolves with the fetched lab slots
		async fetchLabSlotsByLab(labId) {
			this.loading = true // Set loading state to true
			try {
				const response = await axios.get(`${API_URL}/labslots/lab/${labId}`) // API call
				this.labSlots = response.data // Update state with fetched data
				this.error = null // Clear any previous errors
				return response.data // Return the fetched data
			} catch (error) {
				this.error = error.message // Store error message in state
				console.error('Error fetching lab slots by lab:', error) // Log error to console
				throw error // Re-throw error for further handling
			} finally {
				this.loading = false // Reset loading state
			}
		},

		// Creates a batch of lab slots by sending data to the API
		// @param {Array} slots - Array of slot objects to create
		// @returns {Promise<Array>} - Resolves with the created lab slots
		async createLabSlotsBatch(slots) {
			this.loading = true // Set loading state to true
			try {
				const response = await axios.post(`${API_URL}/labslots/batch`, { slots }) // API call
				this.labSlots = response.data // Update state with created data
				this.error = null // Clear any previous errors
				return response.data // Return the created data
			} catch (error) {
				this.error = error.message // Store error message in state
				console.error('Error creating lab slots batch:', error) // Log error to console
				throw error // Re-throw error for further handling
			} finally {
				this.loading = false // Reset loading state
			}
		},

		// Updates a specific lab slot by its ID
		// @param {string|number} slotId - The ID of the slot to update
		// @param {Object} updateData - The data to update the slot with
		// @returns {Promise<Object>} - Resolves with the updated slot data
		async updateLabSlot(slotId, updateData) {
			this.loading = true // Set loading state to true
			try {
				const response = await axios.patch(`${API_URL}/labslots/${slotId}`, updateData) // API call
				// Update the slot in the local state
				const index = this.labSlots.findIndex((slot) => slot._id === slotId) // Find slot index
				if (index !== -1) {
					this.labSlots[index] = response.data // Update slot in state
				}
				this.error = null // Clear any previous errors
				return response.data // Return the updated data
			} catch (error) {
				this.error = error.message // Store error message in state
				console.error('Error updating lab slot:', error) // Log error to console
				throw error // Re-throw error for further handling
			} finally {
				this.loading = false // Reset loading state
			}
		},
	},

	// Getters: Computed properties to filter and retrieve specific data
	getters: {
		// Retrieves a specific lab slot by its ID
		// @param {string|number} id - The ID of the lab slot
		// @returns {Object|null} - The lab slot object or null if not found
		getLabSlotById: (state) => (id) => {
			return state.labSlots.find((slot) => slot._id === id) // Find slot by ID
		},

		// Retrieves lab slots for a specific date
		// @param {string} date - The date to filter lab slots by
		// @returns {Array} - An array of lab slots for the specified date
		getLabSlotsByDate: (state) => (date) => {
			return state.labSlots.filter(
				(slot) => new Date(slot.date).toDateString() === new Date(date).toDateString(),
			) // Filter slots by date
		},

		// Retrieves lab slots for a specific seat number
		// @param {string|number} seatNumber - The seat number to filter lab slots by
		// @returns {Array} - An array of lab slots for the specified seat number
		getLabSlotsBySeat: (state) => (seatNumber) => {
			return state.labSlots.filter((slot) => slot.seat_number === seatNumber) // Filter slots by seat number
		},
	},
})
