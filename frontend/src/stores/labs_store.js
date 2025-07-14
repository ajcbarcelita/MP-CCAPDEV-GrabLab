/*
  * Labs Store
  * This store manages the state and actions related to labs in the application.
  * It provides methods to fetch labs, buildings, and specific lab details from an API.
  * The store uses Pinia for state management and Axios for API requests.
  * This file is used in the following files:
  * - frontend/src/components/View.vue (for displaying labs and buildings)
  * - backend/routes/labRoutes.js (indirectly via API calls to the backend)
  * - backend/controllers/labController.js (indirectly via API calls to the backend)
*/
import { defineStore } from 'pinia' // Importing Pinia for state management
import axios from 'axios' // Importing Axios for making HTTP requests

const API_URL = 'http://localhost:3000/api' // Base URL for the backend API

export const useLabsStore = defineStore('labs', {
    // State: Defines the reactive state for the store
    state: () => ({
        labs: [], // Stores the list of labs fetched from the API
        buildings: [], // Stores the list of unique buildings fetched from the API
        loading: false, // Indicates whether data is being fetched (default: false means not fetching)
        error: null, // Stores any error message if fetching fails
        selectedLab: null // Stores the details of a specific lab fetched by ID
    }),

    // Actions: Methods to modify the state or perform asynchronous operations
    actions: {
        // Fetches all labs from the API
        // @returns {Promise<void>} - Updates the labs state with the fetched data
        async fetchAllLabs() {
            this.loading = true // Set loading state to true
            try {
                const response = await axios.get(`${API_URL}/labs`) // API call to fetch all labs
                this.labs = response.data // Update state with fetched data
                this.error = null // Clear any previous errors
            } catch (error) {
                this.error = error.message || 'Failed to fetch labs' // Store error message in state
                this.labs = [] // Clear labs state if an error occurs
            } finally {
                this.loading = false // Reset loading state
            }
        },

        // Fetches labs filtered by a specific building from the API
        // @param {string} building - The building to filter labs by
        // @returns {Promise<void>} - Updates the labs state with the fetched data
        async fetchLabsByBuilding(building) {
            this.loading = true // Set loading state to true
            try {
                const response = await axios.get(`${API_URL}/labs/building/${building}`) // API call to fetch labs by building
                this.labs = response.data // Update state with fetched data
                this.error = null // Clear any previous errors
            } catch (error) {
                this.error = error.message || 'Failed to fetch labs by building' // Store error message in state
                this.labs = [] // Clear labs state if an error occurs
            } finally {
                this.loading = false // Reset loading state
            }
        },

        // Fetches a list of unique buildings from the API
        // @returns {Promise<void>} - Updates the buildings state with the fetched data
        async fetchAllUniqueBuildings() {
            this.loading = true // Set loading state to true
            try {
                const response = await axios.get(`${API_URL}/labs/buildings`) // API call to fetch unique buildings
                this.buildings = response.data // Update state with fetched data
                this.error = null // Clear any previous errors
            } catch (error) {
                this.error = error.message || 'Failed to fetch unique buildings' // Store error message in state
                this.buildings = [] // Clear buildings state if an error occurs
            } finally {
                this.loading = false // Reset loading state
            }
        },

        // Fetches a specific lab by its ID number from the API
        // @param {string|number} id - The ID of the lab to fetch
        // @returns {Promise<void>} - Updates the selectedLab state with the fetched data
        async fetchLabByIDNumber(id) {
            this.loading = true // Set loading state to true
            try {
                const response = await axios.get(`${API_URL}/labs/${id}`) // API call to fetch lab by ID
                this.selectedLab = response.data // Update state with fetched data
                this.error = null // Clear any previous errors
            } catch (error) {
                this.error = error.message || 'Failed to fetch lab by ID' // Store error message in state
                this.selectedLab = null // Clear selectedLab state if an error occurs
            } finally {
                this.loading = false // Reset loading state
            }
        }
    },

    // Getters: Computed properties to filter and retrieve specific data
    getters: {
        // Retrieves labs filtered by a specific building
        // @param {string} building - The building to filter labs by
        // @returns {Array} - An array of labs in the specified building
        getLabsByBuilding: (state) => (building) => {
            return state.labs.filter(lab => lab.building === building) // Filter labs by building
        },

        // Retrieves all unique buildings from the labs
        // @returns {Array} - An array of unique building names
        getAllUniqueBuildings: (state) => {
            return [...new Set(state.labs.map(lab => lab.building))] // Extract unique buildings
        },

        // Retrieves a specific lab by its ID number
        // @param {string|number} id - The ID of the lab to retrieve
        // @returns {Object|null} - The lab object or null if not found
        getLabByIDNumber: (state) => (id) => {
            return state.labs.find(lab => lab.id === id) || null // Find lab by ID
        }
    }
})
