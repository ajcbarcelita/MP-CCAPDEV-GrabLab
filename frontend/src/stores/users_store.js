import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    currentUser: null,
    profileUser: null,
    loading: false,
    error: null
  }),
  actions: {
    // Fetch all users
    async fetchUsers() {
      this.loading = true
      try {
        const response = await axios.get(`${API_URL}/users`)
        this.users = response.data
        this.error = null
      } catch (error) {
        this.error = error.message
        console.error('Error fetching users:', error)
      } finally {
        this.loading = false
      }
    },

    // Fetch user by ID
    async fetchUserById(userId) {
      this.loading = true
      try {
        const response = await axios.get(`${API_URL}/users/${userId}`)
        const user = response.data

        // Update or add user to users array
        const existingIndex = this.users.findIndex(u => u.user_id === userId)
        if (existingIndex !== -1) {
          this.users[existingIndex] = user
        } else {
          this.users.push(user)
        }

        this.error = null
        return user
      } catch (error) {
        this.error = error.message
        console.error('Error fetching user:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loginUser(credentials) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_URL}/users/login`, {
          email: credentials.email,
          password: credentials.password
        });

        const user = response.data;

        // Set current user
        this.currentUser = {
          user_id: user._id,
          first_name: user.fname,
          last_name: user.lname,
          email: user.email,
          role: user.role
        };

        // Store in session/local storage
        if (credentials.rememberMe) {
          localStorage.setItem('user', JSON.stringify(this.currentUser));
        } else {
          sessionStorage.setItem('user', JSON.stringify(this.currentUser));
        }

        return this.currentUser;
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Add user (for registration)
    async addUser(userData) {
      this.loading = true
      try {
        const response = await axios.post(`${API_URL}/users`, userData)
        const newUser = response.data
        this.users.push(newUser)
        this.error = null
        return newUser
      } catch (error) {
        this.error = error.message
        console.error('Error adding user:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update user profile
    async updateUserProfile(userId, updateData) {
      this.loading = true
      try {
        const response = await axios.put(`${API_URL}/users/${userId}`, updateData)
        const updatedUser = response.data

        // Update user in users array
        const index = this.users.findIndex(u => u.user_id === userId)
        if (index !== -1) {
          this.users[index] = updatedUser
        }

        // Update currentUser if it's the same user
        if (this.currentUser && this.currentUser.user_id === userId) {
          this.currentUser = updatedUser
          // Update session storage
          sessionStorage.setItem('user', JSON.stringify(updatedUser))
        }

        this.error = null
        return updatedUser
      } catch (error) {
        this.error = error.message
        console.error('Error updating user profile:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update user profile picture
    async updateUserProfilePicture(userId, file) {
      this.loading = true
      try {
        const formData = new FormData()
        formData.append('profilePicture', file)

        const response = await axios.post(`${API_URL}/users/${userId}/profile-picture`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        const updatedUser = response.data

        // Update user in users array
        const index = this.users.findIndex(u => u.user_id === userId)
        if (index !== -1) {
          this.users[index] = updatedUser
        }

        // Update currentUser if it's the same user
        if (this.currentUser && this.currentUser.user_id === userId) {
          this.currentUser = updatedUser
          // Update session storage
          sessionStorage.setItem('user', JSON.stringify(updatedUser))
        }

        this.error = null
        return updatedUser
      } catch (error) {
        this.error = error.message
        console.error('Error updating profile picture:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete user account
    async deleteUserAccount(userId) {
      this.loading = true
      try {
        await axios.delete(`${API_URL}/users/${userId}`)

        // Remove user from users array
        this.users = this.users.filter(u => u.user_id !== userId)

        // Clear current user if it's the same user
        if (this.currentUser && this.currentUser.user_id === userId) {
          this.clearUserSession()
        }

        this.error = null
      } catch (error) {
        this.error = error.message
        console.error('Error deleting user account:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Set current user (for login)
    setCurrentUser(user) {
      this.currentUser = user
      sessionStorage.setItem('user', JSON.stringify(user))
    },

    // Clear user session (for logout)
    clearUserSession() {
      this.currentUser = null
      this.profileUser = null
      sessionStorage.removeItem('user')
    },

    // Initialize user session from storage
    initUserSession() {
      const user = sessionStorage.getItem('user')
      if (user) {
        this.currentUser = JSON.parse(user)
      }
    }
  },
  getters: {
    // Get user by ID from store
    getUserById: (state) => (userId) => {
      return state.users.find(user => user.user_id === userId)
    },

    // Check if viewing own profile
    isOwnProfile: (state) => {
      return state.currentUser && state.profileUser &&
        state.currentUser.user_id === state.profileUser.user_id
    },

    // Get users by role
    getUsersByRole: (state) => (role) => {
      return state.users.filter(user => user.role === role)
    },

    // Get active users
    activeUsers: (state) => {
      return state.users.filter(user => user.status === 'active')
    }
  }
})

/*
  This stores the Searched User
  - It allows the application to manage the search term for users.
  - The state contains a single property `searchTerm` to hold the current search input.
  - The action `setSearchTerm` updates the `searchTerm` state.
  - This store can be used in components to filter or search users based on the input.
  - It can be used in conjunction with the backend API to fetch users based on the search term.
*/
export const storeSearchUser = defineStore('searchUser', {
  state: () => ({
    searchTerm: '', // Holds the current search input from the user
    searchResults: [], // Stores the list of users returned from the backend search
    loading: false, // Indicates whether the search request is in progress
    error: null, // Stores any error messages encountered during the search
  }),
  actions: {
    /**
     * Updates the search term in the store.
     * @param {string} term - The search term entered by the user.
     */
    setSearchTerm(term) {
      this.searchTerm = term;
    },

    /**
     * Fetches search results from the backend API based on the current search term.
     * - Validates that the search term is not empty before making the request.
     * - Sets the `loading` state to true while the request is in progress.
     * - Updates `searchResults` with the response data or sets an error message if the request fails.
     */
    async fetchSearchResults() {
      if (!this.searchTerm.trim()) {
        this.error = 'Search term cannot be empty.'; // Validation for empty search term
        return;
      }

      this.loading = true; // Indicate that the search is in progress
      this.error = null; // Clear any previous errors

      try {
        // Make a GET request to the backend API with the search term as a query parameter
        const response = await axios.get(`${API_URL}/users/search`, {
          params: { searchTerm: this.searchTerm },
        });
        this.searchResults = response.data; // Update the search results with the response data
      } catch (error) {
        // Handle errors and set an appropriate error message
        this.error = 'Failed to fetch search results. Please try again.';
        console.error('Error fetching search results:', error);
      } finally {
        this.loading = false; // Reset the loading state after the request completes
      }
    },

    /**
     * Clears the search results, search term, and any error messages.
     * - Useful for resetting the search state in the application.
     */
    clearSearchResults() {
      this.searchResults = []; // Clear the search results
      this.searchTerm = ''; // Reset the search term
      this.error = null; // Clear any error messages
    },
  },
});