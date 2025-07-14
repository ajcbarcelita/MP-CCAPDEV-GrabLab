import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useLabSlotsStore = defineStore('labSlots', {
	state: () => ({
		labSlots: [],
		loading: false,
		error: null,
	}),
	actions: {
		async fetchLabSlotsByLabAndDate(labId, date) {
			this.loading = true
			try {
				const response = await axios.get(`${API_URL}/labslots/lab/${labId}/date/${date}`)
				this.labSlots = response.data
				this.error = null
				return response.data
			} catch (error) {
				this.error = error.message
				console.error('Error fetching lab slots:', error)
				throw error
			} finally {
				this.loading = false
			}
		},
		async fetchLabSlotsByLab(labId) {
			this.loading = true
			try {
				const response = await axios.get(`${API_URL}/labslots/lab/${labId}`)
				this.labSlots = response.data
				this.error = null
				return response.data
			} catch (error) {
				this.error = error.message
				console.error('Error fetching lab slots by lab:', error)
				throw error
			} finally {
				this.loading = false
			}
		},
		async createLabSlotsBatch(slots) {
			this.loading = true
			try {
				const response = await axios.post(`${API_URL}/labslots/batch`, { slots })
				this.labSlots = response.data
				this.error = null
				return response.data
			} catch (error) {
				this.error = error.message
				console.error('Error creating lab slots batch:', error)
				throw error
			} finally {
				this.loading = false
			}
		},
		async updateLabSlot(slotId, updateData) {
			this.loading = true
			try {
				const response = await axios.patch(`${API_URL}/labslots/${slotId}`, updateData)
				// Update the slot in the store
				const index = this.labSlots.findIndex((slot) => slot._id === slotId)
				if (index !== -1) {
					this.labSlots[index] = response.data
				}
				this.error = null
				return response.data
			} catch (error) {
				this.error = error.message
				console.error('Error updating lab slot:', error)
				throw error
			} finally {
				this.loading = false
			}
		},
	},
	getters: {
		getLabSlotById: (state) => (id) => {
			return state.labSlots.find((slot) => slot._id === id)
		},
		getLabSlotsByDate: (state) => (date) => {
			return state.labSlots.filter(
				(slot) => new Date(slot.date).toDateString() === new Date(date).toDateString(),
			)
		},
		getLabSlotsBySeat: (state) => (seatNumber) => {
			return state.labSlots.filter((slot) => slot.seat_number === seatNumber)
		},
	},
})
