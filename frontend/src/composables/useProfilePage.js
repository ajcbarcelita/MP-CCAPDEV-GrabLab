import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users_store'
import { useLabsStore } from '@/stores/labs_store'
import { useReservationsStore } from '@/stores/reservations_store'

export function useProfile() {
	// Stores
	const usersStore = useUsersStore()
	const reservationsStore = useReservationsStore()
	const labsStore = useLabsStore()

	// Router & Route
	const router = useRouter()
	const route = useRoute()

	// State
	const selectedBuilding = ref('All')
	const isEditing = ref(false)
	const isLoading = ref(true)
	const editForm = ref({
		first_name: '',
		last_name: '',
		description: '',
	})
	const currentUser = ref(null)
	const profileUser = ref(null)

	// Computed
	const isOwnProfile = computed(
		() =>
			currentUser.value &&
			profileUser.value &&
			currentUser.value.user_id === profileUser.value.user_id,
	)
	const showEditButton = computed(() => isOwnProfile.value && !isEditing.value)
	const showSaveCancel = computed(() => isOwnProfile.value && isEditing.value)
	const showDeleteAccount = computed(() => isOwnProfile.value)
	const showReservations = computed(
		() => isOwnProfile.value && currentUser.value && currentUser.value.role === 'Student',
	)
	const inputReadonly = computed(() => !isOwnProfile.value || !isEditing.value)
	const userReservations = computed(() => {
		if (!currentUser.value) return []
		return reservationsStore.reservations
			.filter((r) => r.user_id === currentUser.value.user_id && r.status === 'Active')
			.sort((a, b) => new Date(a.reservation_date) - new Date(b.reservation_date))
	})
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
	})

	// Utility
	const getLabName = (labId) => {
		// Handle both string and object lab_id
		const id = typeof labId === 'object' ? labId._id : labId
		const lab = labsStore.labs.find((lab) => lab._id === id)
		return lab ? lab.display_name || lab.name : 'Unknown Lab'
	}
	const getProfilePicUrl = (profilePicPath) => {
		if (!profilePicPath) return null
		if (process.env.NODE_ENV === 'development') {
			return `http://localhost:3000${profilePicPath}`
		}
		return profilePicPath
	}
	const formatDateTime = (dateTime) => {
		return new Date(dateTime).toLocaleString()
	}
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
	}

	// Actions
	const handleLogout = () => {
		usersStore.clearUserSession()
		currentUser.value = null
		profileUser.value = null
		router.push('/login')
	}
	const handleHome = () => {
		if (currentUser.value?.role === 'Technician') {
			router.push('/technician-landing')
		} else if (currentUser.value?.role === 'Student') {
			router.push('/student-landing')
		} else {
			router.push('/')
		}
	}
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
	}

	function handleEditForm() {
		if (profileUser.value) {
			editForm.value = {
				first_name: profileUser.value.first_name,
				last_name: profileUser.value.last_name,
				description: profileUser.value.description || '',
			}
		}
	}
	function handleEditProfile() {
		if (!isOwnProfile.value) return
		isEditing.value = true
	}
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
	}
	function handleCancelEdit() {
		isEditing.value = false
		resetEditForm()
	}
	function resetEditForm() {
		handleEditForm()
	}
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
	}
	async function deleteAllUserReservations(userId) {
		// Filter reservations belonging to the user
		const userReservations = reservationsStore.reservations.filter(
			(res) => res.user && res.user.user_id === userId,
		)
		// Iterate and update status to 'Deleted'
		for (const reservation of userReservations) {
			await reservationsStore.deleteReservation(reservation._id)
		}
	}
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
	}
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
	}
	async function handleView() {
		try {
			const user = sessionStorage.getItem('user')
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
	}

	onMounted(() => {
		handleView()
	})

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
