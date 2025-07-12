import { defineStore } from 'pinia'
import initialUsers from '@/data/users.js'
import axios from 'axios';

export const useUsersStore = defineStore('users', {
	state: () => ({
		users: [...initialUsers],
	}),
	actions: {
		addUser(user) {
			this.users.push(user)
		},
	},
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
        const response = await axios.get('/api/users/search', {
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
