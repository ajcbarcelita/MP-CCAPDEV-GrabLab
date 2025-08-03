import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users_store'
import { useLabsStore } from '@/stores/labs_store'
import { useReservationsStore } from '@/stores/reservations_store'

export function useProfile() {
	// Stores
	// Importing Pinia stores for managing users, reservations, and labs data
	const usersStore = useUsersStore()
	const reservationsStore = useReservationsStore()
	const labsStore = useLabsStore()

	// Router & Route
	// Vue Router instances for navigation and accessing route parameters
	const router = useRouter()
	const route = useRoute()

	// State
	// Reactive references for managing UI state and form data
	const selectedBuilding = ref('All') // Currently selected building filter
	const isEditing = ref(false) // Tracks if the profile is in edit mode
	const isLoading = ref(true) // Tracks loading state
	const editForm = ref({
		first_name: '',
		last_name: '',
		description: '',
	}) // Form data for editing profile
	const currentUser = ref(null) // Currently logged-in user
	const profileUser = ref(null) // User whose profile is being viewed

	// Computed
	// Derived state based on reactive references
	const isOwnProfile = computed(
		() =>
			currentUser.value &&
			profileUser.value &&
			currentUser.value.user_id === profileUser.value.user_id,
	) // Checks if the profile belongs to the logged-in user
	const showEditButton = computed(() => isOwnProfile.value && !isEditing.value) // Show edit button if user owns the profile and is not editing
	const showSaveCancel = computed(() => isOwnProfile.value && isEditing.value) // Show save/cancel buttons if user owns the profile and is editing
	const showDeleteAccount = computed(() => isOwnProfile.value) // Show delete account button if user owns the profile
	const showReservations = computed(() => isOwnProfile.value && currentUser.value && currentUser.value.role === 'Student',) // Show reservations if user is a student and owns the profile
	const inputReadonly = computed(() => !isOwnProfile.value || !isEditing.value) // Make input fields readonly if not editing or not the owner
	const userReservations = computed(() => {
		if (!currentUser.value) return []
		return reservationsStore.reservations
			.filter((r) => r.user_id === currentUser.value.user_id && r.status === 'Active')
			.sort((a, b) => new Date(a.reservation_date) - new Date(b.reservation_date))
	}) // Active reservations of the logged-in user

	const filteredReservations = computed(() => {
		const activeReservations = reservationsStore.reservations.filter(
			(res) => res.status !== 'Deleted',
		)
		if (selectedBuilding.value === 'All') {
			return activeReservations
		} else {
			return activeReservations.filter(
				(reservation) => reservation.lab_slot?.lab?.building === selectedBuilding.value,
			)
		}
	}) // Reservations filtered by building

	// Helper functions for formatting and retrieving data
	const getLabName = (labId) => {
		// Handle both string and object lab_id
		const id = typeof labId === 'object' ? labId._id : labId
		const lab = labsStore.labs.find((lab) => lab._id === id)
		return lab ? lab.display_name || lab.name : 'Unknown Lab'
	} // Get lab name by ID

	const getProfilePicUrl = (profilePicPath) => {
		if (!profilePicPath) return null
		// Assuming profilePicPath is a relative path
		if (process.env.NODE_ENV === 'development') {
			return `http://localhost:3000${profilePicPath}`
		}
		return profilePicPath
	} // Get full URL for profile picture

	const formatDateTime = (dateTime) => {
		return new Date(dateTime).toLocaleDateString()
	} // Format date and time to a readable string

	const formatTimeSlot = (slot) => {
		if (slot && slot.startTime && slot.endTime) {
			const formatTime = (timeStr) => {
				const [hours, minutes] = timeStr.split(':').map(Number)
				const period = hours >= 12 ? 'PM' : 'AM'
				const hour12 = hours % 12 || 12
				return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
			}
			return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
		} else if (slot && slot.start_time && slot.end_time) {
			const formatTime = (timeStr) => {
				const [hours, minutes] = timeStr.split(':').map(Number)
				const period = hours >= 12 ? 'PM' : 'AM'
				const hour12 = hours % 12 || 12
				return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
			}
			return `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
		} else {
			return 'Time slot details not available'
		}
	} // Format time slot details

	// Functions for handling user interactions and API calls
	const handleLogout = () => {
		usersStore.clearUserSession()
		currentUser.value = null
		profileUser.value = null
		router.push('/login')
	} // Log out the user and redirect to login page

	const handleHome = () => {
		if (currentUser.value?.role === 'Technician') {
			router.push('/technician-landing')
		} else if (currentUser.value?.role === 'Student') {
			router.push('/student-landing')
		} else if (currentUser.value?.role === 'Admin') {
			router.push('/admin-landing')
		} else {
			router.push('/')
		}
	} // Navigate to the appropriate home page based on user role

	function editReservation(reservationId) {
		// Find the reservation in the store
		const reservation = reservationsStore.reservations.find((r) => r._id === reservationId)
		if (reservation) {
			// Get the lab ID (handle both string and object cases)
			const labId =
				typeof reservation.lab_id === 'object' ? reservation.lab_id._id : reservation.lab_id
			// Navigate to the reservation page with both lab ID and reservation ID for editing
			router.push(`/reservation/${labId}/${reservationId}`)
		}
	} // Edit a specific reservation

	function handleEditForm() {
		if (profileUser.value) {
			editForm.value = {
				first_name: profileUser.value.first_name,
				last_name: profileUser.value.last_name,
				description: profileUser.value.description || '',
			}
		}
	} // Populate the edit form with profile data

	function handleEditProfile() {
		if (!isOwnProfile.value) return
		isEditing.value = true
	} // Enable edit mode for the profile

	async function handleSaveChanges() {
		if (!isOwnProfile.value) return
		try {
			const updateData = {
				fname: editForm.value.first_name,
				lname: editForm.value.last_name,
				description: editForm.value.description || '',
			}
			await usersStore.updateUserProfile(currentUser.value.user_id, updateData)
			profileUser.value = {
				...profileUser.value,
				...updateData,
			}
			isEditing.value = false
		} catch (error) {
			alert(error.message || 'Failed to update profile')
		}
	} // Save changes to the profile

	function handleCancelEdit() {
		isEditing.value = false
		resetEditForm()
	} // Cancel edit mode and reset the form

	function resetEditForm() {
		handleEditForm()
	} // Reset the edit form to its initial state

	async function handleDeleteAccount() {
		if (!isOwnProfile.value) return
		if (
			confirm('Are you sure you want to delete your account? This action cannot be undone.')
		) {
			try {
				await usersStore.deleteUserAccount(currentUser.value.user_id)
				// Set all reservation statuses to Deleted
				await deleteAllUserReservations(currentUser.value.user_id)
				usersStore.clearUserSession()
				currentUser.value = null
				profileUser.value = null
				router.push('/login')
			} catch (error) {
				alert('Failed to delete account. Please try again.')
			}
		}
	} // Delete the user account and associated reservations

	async function deleteAllUserReservations(userId) {
		// Filter reservations belonging to the user
		const userReservations = reservationsStore.reservations.filter(
			(res) => res.user && res.user.user_id === userId,
		)
		// Iterate and update status to 'Deleted'
		for (const reservation of userReservations) {
			await reservationsStore.deleteReservation(reservation._id)
		}
	} // Delete all reservations for a specific user

	async function handleChangePicture(event) {
		if (!isOwnProfile.value) return
		const file = event.target.files[0]
		if (!file) return
		try {
			const updatedUser = await usersStore.updateUserProfilePicture(
				currentUser.value.user_id,
				file,
			)
			profileUser.value = { ...profileUser.value, ...updatedUser }
		} catch (error) {
			alert('Failed to update profile picture. Please try again.')
		}
	} // Change the profile picture

	// Handle reserving view
	async function cancelReservation(reservationId) {
		if (!isOwnProfile.value) return
		if (confirm('Are you sure you want to cancel this reservation?')) {
			try {
				await reservationsStore.updateReservationStatus(reservationId, 'Cancelled')
				// Update local state to reflect cancellation
				const index = reservationsStore.reservations.findIndex(
					(r) => r._id === reservationId,
				)
				if (index !== -1) {
					reservationsStore.reservations[index].status = 'Cancelled'
				}
			} catch (error) {
				alert('Failed to cancel reservation. Please try again.')
			}
		}
	} // Cancel a specific reservation
	
	async function handleView() {
		try {
			let user = sessionStorage.getItem('user') // Get user from sessionStorage
			if (!user) {
				// if not found, check localStorage
				user = localStorage.getItem('user')
			}

			// If still not found, redirect to login
			if (!user) {
				router.push('/login')
				return
			}
			currentUser.value = JSON.parse(user)
			const userId = route.params.userId || currentUser.value.user_id
			const userData = await usersStore.fetchUserById(userId)
			if (!userData) throw new Error('User not found')
			profileUser.value = userData
			if (userId === currentUser.value.user_id && currentUser.value.role === 'Student') {
				await reservationsStore.fetchReservationsByUserId(userId)
			}
			handleEditForm()
		} catch (error) {
			const fallbackRoute =
				currentUser.value?.role === 'Technician'
					? '/technician-landing'
					: currentUser.value?.role === 'Student'
						? '/student-landing'
						: '/login'
			router.push(fallbackRoute)
		} finally {
			isLoading.value = false
		}
	} // Fetch and display the profile view

	onMounted(() => {
		handleView()
	}) // Lifecycle hook to initialize the component

	// Return all state, computed, and actions needed in your component
	return {
		selectedBuilding,
		isEditing,
		isLoading,
		editForm,
		currentUser,
		profileUser,
		isOwnProfile,
		showEditButton,
		showSaveCancel,
		showDeleteAccount,
		showReservations,
		inputReadonly,
		userReservations,
		filteredReservations,
		getLabName,
		getProfilePicUrl,
		formatDateTime,
		formatTimeSlot,
		handleLogout,
		handleHome,
		editReservation,
		handleEditForm,
		handleEditProfile,
		handleSaveChanges,
		handleCancelEdit,
		resetEditForm,
		handleDeleteAccount,
		deleteAllUserReservations,
		handleChangePicture,
		cancelReservation,
		handleView,
	}
}
