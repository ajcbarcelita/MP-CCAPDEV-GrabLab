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
import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useLabsStore = defineStore('labs', {
    state: () => ({
        labs: [], //stores the list of labs fetched from the API
        buildings: [], //stores the list of unique buildings fetched from the API
        loading: false, //indicates whether data is being fetched (default: false means not fetching)
        error: null, //stores any error message if fetching fails
        selectedLab: null //stores the details of a specific lab fetched by ID
    }),
    actions: {
      /*
      Fetch all labs from the API
        - This action retrieves all labs and updates the state.
        - It sets the loading state while fetching data and handles errors.
        - If successful, it updates the `labs` state with the fetched data.
        - If an error occurs, it sets the `error` state and clears the `labs` state.
        - This action can be used to display all labs in the application.
      */
        async fetchAllLabs() {
            this.loading = true //The loading is set to true means that the data is being fetched
            try {
                const response = await axios.get(`${API_URL}/labs`) //This waits for the API response
                this.labs = response.data //this intializes the labs state with the fetched data
                this.error = null // Clear any previous error
            } catch (error) {
                this.error = error.message || 'Failed to fetch labs' //Error handling
                this.labs = [] //The object is cleared if an error occurs
            } finally {
                this.loading = false //The loading is set to false means that the data has been fetched
            }
        },
        /*
        Fetch labs by building from the API
          - This action retrieves labs filtered by a specific building.
          - It sets the loading state while fetching data and handles errors.
          - If successful, it updates the `labs` state with the fetched data.
          - If an error occurs, it sets the `error` state and clears the `labs` state.
          - This action can be used to display labs in a specific building.
        */
        async fetchLabsByBuilding(building) {
            this.loading = true //The loading is set to true means that the data is being fetched
            try {
                const response = await axios.get(`${API_URL}/labs/building/${building}`) // Fetch labs by building
                this.labs = response.data //this intializes the labs state with the fetched data
                this.error = null // Clear any previous error
            } catch (error) {
                this.error = error.message || 'Failed to fetch labs by building' //Error handling
                this.labs = [] //The object is cleared if an error occurs
            } finally {
                this.loading = false //The loading is set to false means that the data has been fetched
            }
        },
        /*
        Fetch all unique buildings from the API
          - This action retrieves a list of unique buildings from the labs.
          - It sets the loading state while fetching data and handles errors.
          - If successful, it updates the `buildings` state with the fetched data.
          - If an error occurs, it sets the `error` state and clears the `buildings` state.
          - This action can be used to display a list of unique buildings in the application.
          - For Filter Options
        */
        async fetchAllUniqueBuildings() {
            this.loading = true //The loading is set to true means that the data is being fetched
            try {
                const response = await axios.get(`${API_URL}/labs/buildings`) // Fetch unique buildings and waits for the API response
                this.buildings = response.data //stores the unique buildings in the state
                this.error = null // Clear any previous error
            } catch (error) {
                this.error = error.message || 'Failed to fetch unique buildings' //Error handling
                this.buildings = [] //The object is cleared if an error occurs
            } finally {
                this.loading = false //The loading is set to false means that the data has been fetched
            }
        },
        /*
        Fetch a specific lab by ID number from the API
          - This action retrieves a lab by a student ID number.
          - It sets the loading state while fetching data and handles errors.
          - If successful, it updates the `selectedLab` state with the fetched data.
          - If an error occurs, it sets the `error` state and clears the `selectedLab` state.
          - This action can be used to display details of a specific lab.
        */
        async fetchLabByIDNumber(id) {
            this.loading = true // The loading is set to true means that the data is being fetched
            try {
                const response = await axios.get(`${API_URL}/labs/${id}`) // Fetch lab by ID number
                this.selectedLab = response.data //
                this.error = null
            } catch (error) {
                this.error = error.message || 'Failed to fetch lab by ID'
                this.selectedLab = null
            } finally {
                this.loading = false
            }
        }
    },
    // Getters to filter and retrieve labs based on various criteria
    getters: {
        getLabsByBuilding: (state) => (building) => {
            return state.labs.filter(lab => lab.building === building)
        },
        // Get all unique buildings from the labs
        getAllUniqueBuildings: (state) => {
            return [...new Set(state.labs.map(lab => lab.building))]
        },
        getLabByIDNumber: (state) => (id) => {
            return state.labs.find(lab => lab.id === id) || null
        }
    }
})
