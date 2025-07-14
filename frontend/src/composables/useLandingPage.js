import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users_store'

export function useLandingPage() {
	const usersStore = useUsersStore()
	const currentUser = computed(() => usersStore.currentUser)
	const searchQuery = ref('')
	const error = ref(null)
	const showErrorPopup = ref(false)
	const router = useRouter()

	// Initialize user session when component mounts
	onMounted(() => {
		usersStore.initUserSession()

		// Redirect to login if no user is found
		if (!usersStore.currentUser) {
			router.push('/')
		}
	})

	const closeErrorPopup = () => {
		showErrorPopup.value = false
		// Clear the search query when closing the error popup
		searchQuery.value = ''
	}

	const validateNumber = (event) => {
		// Prevent 'e', '+', '-', and '.' characters
		const invalidChars = ['e', '+', '-', '.']
		if (invalidChars.includes(event.key)) {
			event.preventDefault()
		}
	}

	const searchUser = async () => {
		try {
			// Clear any previous errors
			error.value = null

			// Type-safe approach to handle the input value
			const inputValue = searchQuery.value
			// If it's already a number, use it directly; otherwise, parse it
			const userId =
				typeof inputValue === 'number' ? inputValue : parseInt(String(inputValue), 10)

			console.log(
				'Parsed userId:',
				userId,
				'Original value:',
				searchQuery.value,
				'Type:',
				typeof searchQuery.value,
			)

			if (isNaN(userId) || userId <= 0) {
				error.value =
					userId <= 0 ? 'User ID must be greater than 0' : 'Invalid user ID format'
				showErrorPopup.value = true
				console.log('Invalid user ID format or value:', searchQuery.value)
				return
			}

			console.log('Navigating to profile page for user ID:', userId)

			// Check if user exists before navigating
			try {
				console.log('Fetching user with ID:', userId)
				const user = await usersStore.fetchUserById(userId)
				console.log('User fetch result:', user)

				if (!user) {
					error.value = 'User with ID ' + userId + ' was not found'
					showErrorPopup.value = true
					return
				}
				router.push(`/profile/${userId}`)
			} catch (err) {
				console.error('Error fetching user:', err)
				console.error('Error response:', err.response?.data)
				error.value = 'User with ID ' + userId + ' was not found'
				showErrorPopup.value = true
			}
		} catch (error) {
			console.error('Error navigating to profile:', error)
			error.value = 'An error occurred while navigating to the profile page'
			showErrorPopup.value = true
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
