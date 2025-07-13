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

    async fetchUserById(userId) {
      this.loading = true;
      try {
        console.log('Store: Fetching user with ID:', userId, 'Type:', typeof userId);
        const response = await axios.get(`${API_URL}/users/${userId}`);
        console.log('Store: API response:', response.data);

        // Check if user was found
        if (!response.data || Object.keys(response.data).length === 0) {
          console.error('Store: User not found');
          this.error = 'User not found';
          return null;
        }

        const user = response.data;
        console.log('Store: Processed user data:', user);

        // Store now expects and uses user_id exclusively
        const existingIndex = this.users.findIndex(u => u.user_id === userId);
        console.log('Store: Existing index:', existingIndex);

        if (existingIndex !== -1) {
          this.users[existingIndex] = user;
        } else {
          this.users.push(user);
        }

        this.error = null;
        return user;
      } catch (error) {
        console.error('Error fetching user by ID:', error);
        this.error = error.response?.data?.message || 'User not found';
        return null;
      } finally {
        this.loading = false;
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
          user_id: user.user_id,
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
});
