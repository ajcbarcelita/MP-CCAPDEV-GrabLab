import { defineStore } from 'pinia' // Importing Pinia for state management
import axios from 'axios' // Importing Axios for making HTTP requests

const API_URL = 'http://localhost:3000/api' // Base URL for the backend API

export const useUsersStore = defineStore('users', {
	// State: Defines the reactive state for the store
	state: () => ({
		users: [], // Array to store user data fetched from the API
		currentUser: null, // Object to store the currently logged-in user
		profileUser: null, // Object to store the user profile being viewed
		loading: false, // Boolean flag to indicate loading state for API calls
		error: null, // Stores error messages from failed API calls
	}),

	// Actions: Methods to modify the state or perform asynchronous operations
	actions: {
		// Fetches all users from the API
		// @returns {Promise<void>} - Updates the users state with the fetched data
		async fetchUsers() {
			this.loading = true // Set loading state to true
			try {
				const response = await axios.get(`${API_URL}/users`) // API call to fetch all users
				this.users = response.data // Update state with fetched data
				this.error = null // Clear any previous errors
			} catch (error) {
				this.error = error.message // Store error message in state
				console.error('Error fetching users:', error) // Log error to console
			} finally {
				this.loading = false // Reset loading state
			}
		},

		// Fetches a specific user by their ID from the API
		// @param {string|number} userId - The ID of the user to fetch
		// @returns {Promise<Object|null>} - Resolves with the fetched user data or null if not found
		async fetchUserById(userId) {
			this.loading = true // Set loading state to true
			try {
				console.log('Store: Fetching user with ID:', userId, 'Type:', typeof userId) // Debug log
				const response = await axios.get(`${API_URL}/users/${userId}`) // API call to fetch user by ID
				console.log('Store: API response:', response.data) // Debug log

				// Check if user was found
				if (!response.data || Object.keys(response.data).length === 0) {
					this.error = 'User not found' // Set error message
					return null // Return null if user not found
				}

				const user = response.data // Extract user data from response
				console.log('Store: Processed user data:', user) // Debug log

				// Update local users array
				const existingIndex = this.users.findIndex((u) => u.user_id === userId) // Find user index
				if (existingIndex !== -1) {
					this.users[existingIndex] = user // Update existing user
				} else {
					this.users.push(user) // Add new user
				}

				this.error = null // Clear any previous errors
				return user // Return the fetched user
			} catch (error) {
				console.error('Error fetching user by ID:', error) // Log error to console
				this.error = error.response?.data?.message || 'User not found' // Set error message
				return null // Return null if an error occurs
			} finally {
				this.loading = false // Reset loading state
			}
		},

		// Logs in a user with the provided credentials
		// @param {Object} credentials - The login credentials (email, password, rememberMe)
		// @returns {Promise<Object>} - Resolves with the logged-in user data
		async loginUser(credentials) {
			this.loading = true
			try {
				const response = await axios.post(`${API_URL}/users/login`, credentials)
				const { token, ...user } = response.data
				this.setCurrentUser(user, credentials.rememberMe, token)
				return user
			} catch (error) {
				this.error = error.response?.data?.message || 'Login failed'
				throw error
			} finally {
				this.loading = false
			}
		},

		// Updates a user's profile with the provided data
		// @param {string|number} userId - The ID of the user to update
		// @param {Object} updateData - The data to update the user's profile with
		// @returns {Promise<Object>} - Resolves with the updated user data
		async updateUserProfile(userId, updateData) {
			this.loading = true // Set loading state to true
			try {
				// Prepare payload with allowed fields
				const payload = {
					fname: updateData.fname,
					lname: updateData.lname,
					description: updateData.description || '',
				}

				const response = await axios.put(`${API_URL}/users/${userId}`, payload) // API call to update user profile
				const updatedUser = response.data // Extract updated user data from response

				// Update local users array
				const index = this.users.findIndex((u) => u.user_id === userId) // Find user index
				if (index !== -1) {
					this.users[index] = { ...this.users[index], ...updatedUser } // Update user in state
				}

				// Update currentUser if it's the same user
				if (this.currentUser?.user_id === userId) {
					this.currentUser = { ...this.currentUser, ...updatedUser } // Update currentUser state
					if (localStorage.getItem('user')) {
						localStorage.setItem('user', JSON.stringify(this.currentUser)) // Update local storage
					} else {
						sessionStorage.setItem('user', JSON.stringify(this.currentUser)) // Update session storage
					}
				}

				return updatedUser // Return the updated user
			} catch (error) {
				console.error('Update error:', error.response?.data || error.message) // Log error to console
				throw new Error(error.response?.data?.message || 'Failed to update profile') // Throw error
			} finally {
				this.loading = false // Reset loading state
			}
		},

		// Update user profile picture
		async updateUserProfilePicture(userId, file) {
			this.loading = true
			try {
				// Prepare form data for file upload
				const formData = new FormData()
				formData.append('profilePicture', file)

				// Send POST request to backend API to upload the profile picture
				const response = await axios.post(
					`${API_URL}/users/${userId}/profile-picture`,
					formData,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
						},
					},
				)

				const updatedUser = response.data

				// Update local users array
				const index = this.users.findIndex((u) => u.user_id === userId)
				if (index !== -1) {
					this.users[index] = { ...this.users[index], ...updatedUser }
				}

				// If the current user is the one being updated, update currentUser
				if (this.currentUser?.user_id === userId) {
					this.currentUser = { ...this.currentUser, ...updatedUser }
					if (localStorage.getItem('user')) {
						localStorage.setItem('user', JSON.stringify(this.currentUser))
					} else {
						sessionStorage.setItem('user', JSON.stringify(this.currentUser))
					}
				}

				this.error = null

				// Return the updated user object (to present dynamically in the UI)
				return updatedUser
			} catch (error) {
				this.error = error.response?.data?.message || error.message
				console.error('Error updating profile picture:', error)
				throw error
			} finally {
				this.loading = false
			}
		},

		// Delete user account
		async deleteUserAccount(userId) {
			console.log('Deleting user with ID:', userId)
			this.loading = true
			try {
				const response = await axios.delete(`${API_URL}/users/${userId}`)

				// Find the index of the user in the local array by user_id
				const index = this.users.findIndex((u) => u.user_id === userId)
				if (index !== -1) {
					this.users[index] = {
						// Merge existing data with the inactive status
						...this.users[index], // Keep all existing user data
						status: 'Inactive',
						...response.data.user, // Update with response data if provided
					}
				}

				// Clear current user if it's the same user
				if (this.currentUser && this.currentUser.user_id === userId) {
					this.clearUserSession()
				}

				this.error = null
				return response.data // Return the updated user data
			} catch (error) {
				this.error = error.message
				console.error('Error deleting user account:', error)
				throw error
			} finally {
				this.loading = false
			}
		},

		// Set current user (for login)
		// rememberMe is optional, defaults to false
		// token is optional, defaults to null
		setCurrentUser(user, rememberMe = false, token = null) {
			this.currentUser = user
			if (token) {
				// Always set axios header first
				axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
				
				// Then store based on rememberMe
				if (rememberMe) {
					localStorage.setItem('token', token)
					localStorage.setItem('user', JSON.stringify(user))
					// Clean up session storage
					sessionStorage.removeItem('token')
					sessionStorage.removeItem('user')
				} else {
					sessionStorage.setItem('token', token)
					sessionStorage.setItem('user', JSON.stringify(user))
					// Clean up local storage
					localStorage.removeItem('token')
					localStorage.removeItem('user')
				}
			}
		},

		// Clear user session (for logout)
		clearUserSession() {
			this.currentUser = null
			this.profileUser = null
			sessionStorage.removeItem('user')
			localStorage.removeItem('user')
			sessionStorage.removeItem('token')
			localStorage.removeItem('token')
			delete axios.defaults.headers.common['Authorization']
		},

		initUserSession() {
			// First check session storage
			let user = sessionStorage.getItem('user')
			let token = sessionStorage.getItem('token')
			
			// If not in session storage, check local storage
			if (!user || !token) {
				user = localStorage.getItem('user')
				token = localStorage.getItem('token')
			}

			if (user && token) {
				try {
					this.currentUser = JSON.parse(user)
					axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
				} catch (error) {
					console.error('Error parsing user data:', error)
					this.clearUserSession()
				}
			} else {
				this.clearUserSession()
			}
		},

		// Add a new technician
		async addTechnician(techData) {
			this.loading = true
			try {
				const response = await axios.post(`${API_URL}/users`, techData)
				this.users.push(response.data)
				this.error = null
				return response.data
			} catch (error) {
				this.error = error.response?.data?.message || error.message
				console.error('Error adding technician:', error)
				throw error
			} finally {
				this.loading = false
			}
		},

		// Update a technician (by user_id)
		// Update a technician (by user_id, not _id)
		async updateTechnician(userId, updateData) {  // ← Change parameter name
			this.loading = true
			try {
				const response = await axios.put(`${API_URL}/users/${userId}`, updateData)
				const updatedTech = response.data
				const index = this.users.findIndex((u) => u.user_id === userId)  // ← Change from u._id to u.user_id
				if (index !== -1) {
					this.users[index] = { ...this.users[index], ...updatedTech }
				}
				this.error = null
				return updatedTech
			} catch (error) {
				this.error = error.response?.data?.message || error.message
				console.error('Error updating technician:', error)
				throw error
			} finally {
				this.loading = false
			}
		},

		// Soft delete (deactivate) technician
		async deactivateTechnician(id) {
			return await this.updateTechnician(id, { status: 'Inactive' })
		},

		// Reactivate technician
		async activateTechnician(id) {
			return await this.updateTechnician(id, { status: 'Active' })
		},
	},
	getters: {
		// Get user by ID from store
		getUserById: (state) => (userId) => {
			return state.users.find((user) => user.user_id === userId)
		},

		// Check if viewing own profile
		isOwnProfile: (state) => {
			return (
				state.currentUser &&
				state.profileUser &&
				state.currentUser.user_id === state.profileUser.user_id
			)
		},

		// Get users by role
		getUsersByRole: (state) => (role) => {
			return state.users.filter((user) => user.role === role)
		},

		// Get active users
		activeUsers: (state) => {
			return state.users.filter((user) => user.status === 'active')
		},
	},
})
