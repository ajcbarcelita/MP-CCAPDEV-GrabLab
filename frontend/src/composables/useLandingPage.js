import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users_store'
import { useValidation } from '@/composables/useValidation'

export function useLandingPage() {
	const usersStore = useUsersStore()
	const currentUser = computed(() => usersStore.currentUser)
	const searchQuery = ref('')
	const router = useRouter()

	// Use the validation composable
	const {
		error,
		showErrorPopup,
		clearError,
		setError,
		validateNumericValue,
		validateNumberKeypress
	} = useValidation()

	// Initialize user session when component mounts
	onMounted(() => {
		usersStore.initUserSession()

		// Redirect to login if no user is found
		if (!usersStore.currentUser) {
			router.push('/')
		}
	})

	const closeErrorPopup = () => {
		clearError()
		// Clear the search query when closing the error popup
		searchQuery.value = ''
	}

	// We can now use the validateNumberKeypress from our composable
	const validateNumber = validateNumberKeypress

	const searchUser = async () => {
		try {
			// Clear any previous errors
			clearError()

			// Use the validation function from our composable
			const isValid = validateNumericValue(searchQuery.value, { min: 0 })
			if (!isValid) {
				return
			}

			// If we got here, the input is valid
			const userId = parseInt(String(searchQuery.value), 10)

			console.log(
				'Parsed userId:',
				userId,
				'Original value:',
				searchQuery.value,
				'Type:',
				typeof searchQuery.value,
			)

			console.log('Navigating to profile page for user ID:', userId)

			// Check if user exists before navigating
			try {
				console.log('Fetching user with ID:', userId)
				const user = await usersStore.fetchUserById(userId)
				console.log('User fetch result:', user)

				if (!user) {
					setError('User with ID ' + userId + ' was not found')
					return
				}
				router.push(`/profile/${userId}`)
			} catch (err) {
				console.error('Error fetching user:', err)
				console.error('Error response:', err.response?.data)
				setError('User with ID ' + userId + ' was not found')
			}
		} catch (error) {
			console.error('Error navigating to profile:', error)
			setError('An error occurred while navigating to the profile page')
		}
	}

	const logout = () => {
		usersStore.clearUserSession() // Clear user session in the store
		// Navigate to login page
		router.push('/')
	}

	return {
		currentUser,
		searchQuery,
		error,
		showErrorPopup,
		closeErrorPopup,
		validateNumber,
		searchUser,
		logout,
	}
}
