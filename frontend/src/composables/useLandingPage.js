import { computed, ref, onMounted } from 'vue' // Importing Vue's reactive and lifecycle functions
import { useRouter } from 'vue-router' // Importing Vue Router for navigation
import { useUsersStore } from '@/stores/users_store' // Importing the users store for state management
import { useValidation } from '@/composables/useValidation' // Importing the validation composable for input validation

export function useLandingPage() {
	const usersStore = useUsersStore() // Accessing the users store
	const currentUser = computed(() => usersStore.currentUser) // Reactive reference to the current user
	const searchQuery = ref('') // Reactive reference for the search input
	const router = useRouter() // Accessing the router instance for navigation

	// Destructuring methods and properties from the validation composable
	const {
		error, // Reactive reference for error messages
		showErrorPopup, // Boolean to control the visibility of the error popup
		clearError, // Function to clear the current error
		setError, // Function to set a new error message
		validateNumericValue, // Function to validate numeric input values
		validateNumberKeypress, // Function to validate keypress events for numeric input
	} = useValidation()

	// Lifecycle hook: Initializes the user session when the component mounts
	onMounted(() => {
		usersStore.initUserSession() // Initialize the user session from storage

		// Redirect to the login page if no user is found
		if (!usersStore.currentUser) {
			router.push('/') // Navigate to the login page
		}
	})

	// Function to close the error popup and clear the search query
	const closeErrorPopup = () => {
		clearError() // Clear the current error
		searchQuery.value = '' // Reset the search query
	}

	// Alias for the validateNumberKeypress function from the validation composable
	const validateNumber = validateNumberKeypress

	// Function to search for a user by their ID
	const searchUser = async () => {
		try {
			clearError() // Clear any previous errors

			// Validate the search query using the validation composable
			const isValid = validateNumericValue(searchQuery.value, { min: 0 })
			if (!isValid) {
				return // Exit if the input is invalid
			}

			// Parse the search query into a numeric user ID
			const userId = parseInt(String(searchQuery.value), 10)

			console.log(
				'Parsed userId:',
				userId,
				'Original value:',
				searchQuery.value,
				'Type:',
				typeof searchQuery.value,
			) // Debug log

			console.log('Navigating to profile page for user ID:', userId) // Debug log

			// Check if the user exists before navigating
			try {
				console.log('Fetching user with ID:', userId) // Debug log
				const user = await usersStore.fetchUserById(userId) // Fetch user by ID
				console.log('User fetch result:', user) // Debug log

				if (!user) {
					setError('User with ID ' + userId + ' was not found') // Set error message
					return // Exit if the user is not found
				}
				router.push(`/profile/${userId}`) // Navigate to the user's profile page
			} catch (err) {
				console.error('Error fetching user:', err) // Log error to console
				console.error('Error response:', err.response?.data) // Log error response
				setError('User with ID ' + userId + ' was not found') // Set error message
			}
		} catch (error) {
			console.error('Error navigating to profile:', error) // Log error to console
			setError('An error occurred while navigating to the profile page') // Set error message
		}
	}

	// Function to log out the current user
	const logout = () => {
		usersStore.clearUserSession() // Clear the user session in the store
		router.push('/') // Navigate to the login page
	}

	// Return the reactive references and functions for use in the component
	return {
		currentUser, // Reactive reference to the current user
		searchQuery, // Reactive reference for the search input
		error, // Reactive reference for error messages
		showErrorPopup, // Boolean to control the visibility of the error popup
		closeErrorPopup, // Function to close the error popup
		validateNumber, // Alias for the validateNumberKeypress function
		searchUser, // Function to search for a user by their ID
		logout, // Function to log out the current user
	}
}
