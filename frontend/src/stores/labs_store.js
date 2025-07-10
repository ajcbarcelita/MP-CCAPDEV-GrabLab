import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useLabsStore = defineStore('labs', {
    state: () => ({
        labs: [],
        buildings: [],
        loading: false,
        error: null,
        selectedLab: null
    }),
    actions: {
        async fetchAllLabs() {
            this.loading = true
            try {
                console.log('Fetching all labs from:', `${API_URL}/labs`);
                const response = await axios.get(`${API_URL}/labs`)
                console.log('Response from server:', response.data);
                this.labs = response.data
                this.error = null
            } catch (error) {
                console.error('Error in fetchAllLabs:', error);
                this.error = error.message || 'Failed to fetch labs'
                this.labs = []
            } finally {
                this.loading = false
            }
        },

        async fetchAvailableLabs() {
            this.loading = true
            try {
                const response = await axios.get(`${API_URL}/labs/available`)
                this.labs = response.data
                this.error = null
            } catch (error) {
                this.error = error.message
                console.error('Error fetching available labs:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchLabsByBuilding(building) {
            this.loading = true
            try {
                const response = await axios.get(`${API_URL}/labs/building/${encodeURIComponent(building)}`)
                this.labs = response.data
                this.error = null
            } catch (error) {
                this.error = error.message
                console.error('Error fetching labs by building:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchLabsByStatus(status) {
            this.loading = true
            try {
                const response = await axios.get(`${API_URL}/labs/status/${status}`)
                this.labs = response.data
                this.error = null
            } catch (error) {
                this.error = error.message
                console.error('Error fetching labs by status:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchLabById(id) {
            this.loading = true
            try {
                const response = await axios.get(`${API_URL}/labs/${id}`)
                this.selectedLab = response.data
                this.error = null
            } catch (error) {
                this.error = error.message
                console.error('Error fetching lab:', error)
            } finally {
                this.loading = false
            }
        },

        async updateLabStatus(labId, status) {
            this.loading = true
            try {
                const response = await axios.patch(`${API_URL}/labs/${labId}/status`, { status })
                const index = this.labs.findIndex(lab => lab._id === labId)
                if (index !== -1) {
                    this.labs[index] = response.data
                }
                if (this.selectedLab?._id === labId) {
                    this.selectedLab = response.data
                }
                this.error = null
            } catch (error) {
                this.error = error.message
                console.error('Error updating lab status:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchBuildings() {
            this.loading = true
            try {
                // Get all unique buildings from the database
                const response = await axios.get(`${API_URL}/labs`)
                const uniqueBuildings = [...new Set(response.data.map(lab => lab.building))]
                this.buildings = uniqueBuildings.sort()
                this.error = null
            } catch (error) {
                console.error('Error fetching buildings:', error)
                this.error = error.message || 'Failed to fetch buildings'
                this.buildings = []
            } finally {
                this.loading = false
            }
        }
    },
    getters: {
        getLabById: (state) => (id) => {
            return state.labs.find(lab => lab._id === id)
        },
        activeLabs: (state) => {
            return state.labs.filter(lab => lab.status === 'Active')
        },
        inactiveLabs: (state) => {
            return state.labs.filter(lab => lab.status === 'Inactive')
        },
        labsByBuilding: (state) => (building) => {
            return state.labs.filter(lab => lab.building === building)
        },
        uniqueBuildings: (state) => {
            return [...new Set(state.labs.map(lab => lab.building))]
        }
    }
})
