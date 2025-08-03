<style scoped>
@import '@/assets/reservations.css';
</style>

<template>
	<div id="reservation-page">
		<!-- Navbar -->
		<div id="navbar">
			<span id="navbar-brand">GrabLab</span>
			<div id="links">
				<router-link id="profile" to="/profile">Profile</router-link>
				<router-link id="logout" to="/login">Log Out</router-link>
			</div>
		</div>

		<!-- Main Content Container -->
		<div class="container mx-auto px-4 py-6 max-w-7xl">
			<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<!-- Left Panel - Controls -->
				<ReservationControls
					:selected-lab="selectedLab"
					:selected-date="selectedDate"
					:selected-slots="selectedSlots"
					:reserve-anonymously="reserveAnonymously"
					:student-id-for-reservation="studentIdForReservation"
					:all-labs="allLabs"
					:min-date="minDate"
					:max-date="maxDate"
					:show-student-id-input="showStudentIdInput"
					:is-editing="isEditing"
					@go-back="goBack"
					@update:selected-lab="selectedLab = $event"
					@update:selected-date="selectedDate = $event"
					@update:reserve-anonymously="reserveAnonymously = $event"
					@update:student-id-for-reservation="studentIdForReservation = $event"
					@reserve-slot="reserveSlot"
					@clear-selection="clearSelection"
				/>

				<!-- Right Panel - Schedule Grid -->
				<ReservationCalendar
					:selected-lab="selectedLab"
					:all-labs="allLabs"
					:is-loading-schedule="isLoadingSchedule"
					:filtered-time-slots="filteredTimeSlots"
					:current-seats-page="currentSeatsPage"
					:current-page="currentPage"
					:total-pages="totalPages"
					:time-filter="timeFilter"
					:is-editing="isEditing"
					:selected-slots="selectedSlots"
					:is-slot-occupied="isSlotOccupied"
					:get-slot-class="getSlotClass"
					:get-slot-text="getSlotText"
					@set-time-filter="setTimeFilter"
					@handle-slot-click="handleSlotClick"
					@prev-page="prevPage"
					@next-page="nextPage"
				/>
			</div>
		</div>

		<!-- Modals -->
		<ReservationModals
			:show-reservation-details-modal="showReservationDetailsModal"
			:show-cancel-confirmation-modal="showCancelConfirmationModal"
			:reservation-details="reservationDetails"
			:all-labs="allLabs"
			:can-cancel-reservation="canCancelReservation"
			@close-reservation-details-modal="closeReservationDetailsModal"
			@close-cancel-confirmation-modal="closeCancelConfirmationModal"
			@remove-reservation="removeReservation"
			@confirm-cancel-reservation="confirmCancelReservation"
		/>
	</div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users_store'
import { useLabsStore } from '@/stores/labs_store'
import { useReservationsStore } from '@/stores/reservations_store'
import { useLabSlotsStore } from '@/stores/labSlots_store'
import ReservationControls from './ReservationControls.vue'
import ReservationCalendar from './ReservationCalendar.vue'
import ReservationModals from './ReservationModals.vue'

// Store imports
const usersStore = useUsersStore()
const labsStore = useLabsStore()
const reservationsStore = useReservationsStore()
const labSlotsStore = useLabSlotsStore()
const router = useRouter()
const route = useRoute()

// Core reactive state
const selectedLab = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedSlots = ref([])
const reserveAnonymously = ref(false)
const studentIdForReservation = ref('')
const showReservationDetailsModal = ref(false)
const showCancelConfirmationModal = ref(false)

// Add a variable to store the original reservation state
const originalReservationState = ref(null)

// Lab slots data
const labSlots = ref([])
const isLoadingSchedule = ref(false)

// Reservation details for viewing existing reservations
const reservationDetails = reactive({
	reservation_id: null,
	lab_id: null,
	date: null,
	slots: [],
	user: {},
})

// User data
const currentUser = computed(() => usersStore.currentUser)

// Pagination and filtering
const seatsPerPage = 7
const currentPage = ref(1)
const timeFilter = ref('Morning')

// Lab data
const allLabs = ref([])
const isLoadingLabs = ref(false)

// Date constraints
const minDate = computed(() => {
	const today = new Date()
	return today.toISOString().split('T')[0]
})

const maxDate = computed(() => {
	const future = new Date()
	future.setDate(new Date().getDate() + 6)
	return future.toISOString().split('T')[0]
})

// Add a computed property to determine if student ID input should be shown
const showStudentIdInput = computed(() => {
	return currentUser.value?.user_type === 'technician' && !route.params.reservationId
})

// Computed properties for editing state
const isEditing = computed(() => !!route.params.reservationId)

// Watchers
watch(
	selectedLab,
	(newLabId) => {
		if (newLabId) {
			loadLabSchedule()
		}
	},
	{ immediate: false },
)

watch(selectedDate, (newDate) => {
	if (selectedLab.value && newDate) {
		loadLabSchedule()
	}
})

// Component initialization
onMounted(async () => {
	try {
		// check if logged in
		if (!currentUser.value) {
			router.push('/login')
			return
		}

		// Initialize user
		currentUser.value =
			usersStore.currentUser || JSON.parse(sessionStorage.getItem('user') || '{}')

		// Map user_type for compatibility with old logic
		if (currentUser.value && currentUser.value.role) {
			currentUser.value.user_type =
				currentUser.value.role.toLowerCase() === 'technician'
					? 'technician'
					: currentUser.value.role.toLowerCase() === 'student'
						? 'student'
						: currentUser.value.role.toLowerCase()
		}

		// Load all labs
		isLoadingLabs.value = true
		await labsStore.fetchAllLabs()
		allLabs.value = labsStore.labs

		// Load user reservations if user exists
		if (currentUser.value?.user_id) {
			await reservationsStore.fetchReservationsByUserId(currentUser.value.user_id)
		}

		// Check if lab ID is provided in route params
		const labId = route.params.labId
		const reservationId = route.params.reservationId

		if (labId) {
			const lab = allLabs.value.find((l) => l._id === labId)

			if (lab) {
				selectedLab.value = labId

				// If reservation ID is provided, load the reservation for editing
				if (reservationId) {
					await loadReservationForEditing(reservationId)
				}
			}
		}
	} catch (error) {
		console.error('Error during component initialization:', error)
	} finally {
		isLoadingLabs.value = false
	}
})

// Lab schedule loading
const loadLabSchedule = async () => {
	if (!selectedLab.value || !selectedDate.value) {
		console.warn('No lab selected or date selected')
		return
	}

	try {
		isLoadingSchedule.value = true

		// Check if selected date is Sunday
		const selectedDay = new Date(selectedDate.value).getDay()
		if (selectedDay === 0) {
			alert('Reservations are not allowed on Sundays.')
			selectedDate.value = minDate.value
			return
		}

		// Fetch lab slots for the selected lab and date using the store
		try {
			const data = await labSlotsStore.fetchLabSlotsByLabAndDate(
				selectedLab.value,
				selectedDate.value,
			)
			labSlots.value = data
		} catch (error) {
			// If no slots exist for this date, create them
			await createLabSlotsForDate(selectedLab.value, selectedDate.value)
		}

		// Load ALL reservations for the selected lab (not just the user's)
		await reservationsStore.fetchReservationsByLab(selectedLab.value)

		// Clear current selection only if not editing
		const reservationId = route.params.reservationId
		if (!reservationId) {
			clearSelection()
		}
		currentPage.value = 1

		// Scroll to schedule
		scrollToSchedule()
	} catch (error) {
		console.error('Error loading lab schedule:', error)
	} finally {
		isLoadingSchedule.value = false
	}
}

// Create lab slots for a specific date
const createLabSlotsForDate = async (labId, date) => {
	try {
		const lab = allLabs.value.find((l) => l._id === labId)
		if (!lab) return

		// Generate time slots based on lab operating hours
		const timeSlots = generateTimeSlots(lab.operating_hours)

		// Create lab slots for each seat
		const slotsToCreate = []
		for (let seat = 1; seat <= lab.capacity; seat++) {
			slotsToCreate.push({
				lab: labId,
				seat_number: seat,
				date: date,
				time_slots: timeSlots.map((slot) => ({
					startTime: slot.startTime,
					endTime: slot.endTime,
					reserved: null,
				})),
			})
		}

		// Send to backend to create slots using the store
		const data = await labSlotsStore.createLabSlotsBatch(slotsToCreate)
		labSlots.value = data
	} catch (error) {
		console.error('Error creating lab slots:', error)
	}
}

// Generate time slots based on operating hours
const generateTimeSlots = (operatingHours) => {
	const slots = []
	const start = parseTime(operatingHours.open)
	const end = parseTime(operatingHours.close)

	let current = start
	while (current < end) {
		const next = current + 0.5 // 30-minute increments
		slots.push({
			startTime: formatTime(current),
			endTime: formatTime(next),
		})
		current = next
	}

	return slots
}

// Helper functions for time handling
const parseTime = (timeStr) => {
	const [hours, minutes] = timeStr.split(':').map(Number)
	return hours + minutes / 60
}

const formatTime = (timeDecimal) => {
	const hours = Math.floor(timeDecimal)
	const minutes = Math.round((timeDecimal - hours) * 60)
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Lab information getters
const getLabName = (labId) => {
	if (!labId) return 'No Lab Selected'
	const lab = allLabs.value.find((l) => l._id === labId)
	return lab ? lab.display_name : 'Unknown Lab'
}

const getLabOperatingHours = (labId) => {
	if (!labId) return 'N/A'
	const lab = allLabs.value.find((l) => l._id === labId)
	if (!lab || !lab.operating_hours) return 'N/A'
	return `${lab.operating_hours.open} - ${lab.operating_hours.close}`
}

// Seats and pagination
const getSeatsForLab = (labId) => {
	if (!labId) return []
	const lab = allLabs.value.find((l) => l._id === labId)
	return lab ? Array.from({ length: lab.capacity }, (_, i) => i + 1) : []
}

const currentSeatsPage = computed(() => {
	if (!selectedLab.value) return []
	const allSeats = getSeatsForLab(selectedLab.value)
	const start = (currentPage.value - 1) * seatsPerPage
	const end = start + seatsPerPage
	return allSeats.slice(start, end)
})

const totalPages = computed(() => {
	if (!selectedLab.value) return 1
	const lab = allLabs.value.find((l) => l._id === selectedLab.value)
	if (!lab) return 1
	return Math.ceil(lab.capacity / seatsPerPage)
})

// Time slots management
const getTimeSlotsByFilter = (timeSlots) => {
	if (timeFilter.value === 'Morning') {
		return timeSlots.filter((slot) => {
			const [h, m] = slot.startTime.split(':').map(Number)
			const minutes = h * 60 + m
			return minutes >= 420 && minutes < 720 // 7:00 (420) to 12:00 (720)
		})
	} else if (timeFilter.value === 'Afternoon') {
		return timeSlots.filter((slot) => {
			const [h, m] = slot.startTime.split(':').map(Number)
			const minutes = h * 60 + m
			return minutes >= 720 && minutes < 1080 // 12:00 (720) to 18:00 (1080)
		})
	} else if (timeFilter.value === 'Evening') {
		return timeSlots.filter((slot) => {
			const [h, m] = slot.startTime.split(':').map(Number)
			const minutes = h * 60 + m
			return minutes >= 1080 && minutes < 1140 // 18:00 (1080) to 19:00 (1140)
		})
	}
	return timeSlots
}

const filteredTimeSlots = computed(() => {
	if (!selectedLab.value || labSlots.value.length === 0) return []

	const lab = allLabs.value.find((l) => l._id === selectedLab.value)
	if (!lab) return []

	const timeSlots = generateTimeSlots(lab.operating_hours)
	return getTimeSlotsByFilter(timeSlots)
})

// Slot occupation checking
const isSlotOccupied = (seatNumber, timeSlot) => {
	if (!selectedLab.value || !selectedDate.value) return false

	// Check if there's an active reservation for this seat and time slot (for the lab)
	const hasReservation = reservationsStore.reservations.some((reservation) => {
		// Handle both string ID and populated object cases
		let reservationLabId = reservation.lab_id
		if (typeof reservation.lab_id === 'object' && reservation.lab_id !== null) {
			reservationLabId = reservation.lab_id._id || reservation.lab_id
		}

		if (reservationLabId !== selectedLab.value || reservation.status !== 'Active') {
			return false
		}

		const reservationDate = new Date(reservation.reservation_date).toDateString()
		const selectedDateStr = new Date(selectedDate.value).toDateString()

		if (reservationDate !== selectedDateStr) {
			return false
		}

		// If we're editing a reservation, don't count slots from the current reservation as occupied
		const reservationId = route.params.reservationId
		if (reservationId && reservation._id === reservationId) {
			return false
		}

		return reservation.slots.some(
			(slot) =>
				slot.seat_number === seatNumber &&
				slot.start_time === timeSlot.startTime &&
				slot.end_time === timeSlot.endTime,
		)
	})

	return hasReservation
}

// Slot interaction functions
const toggleSlotSelection = (seat, timeSlot) => {
	const reservationId = route.params.reservationId
	const isEditing = !!reservationId

	// Check if this slot is part of the current reservation being edited
	const isCurrentReservationSlot =
		isEditing &&
		selectedSlots.value.some(
			(slot) =>
				slot.seat === seat &&
				slot.timeSlot.startTime === timeSlot.startTime &&
				slot.timeSlot.endTime === timeSlot.endTime,
		)

	const slotIdentifier = `${seat}-${timeSlot.startTime}`
	const index = selectedSlots.value.findIndex((s) => s.identifier === slotIdentifier)
	const isCurrentlySelected = index !== -1

	// If slot is occupied and not currently selected, don't allow selection
	if (isSlotOccupied(seat, timeSlot) && !isCurrentlySelected && !isCurrentReservationSlot) {
		return
	}

	// Allow deselection of any slot (including occupied ones) to prevent stunlock
	if (isCurrentlySelected) {
		selectedSlots.value.splice(index, 1)
	} else {
		selectedSlots.value.push({
			seat,
			timeSlot,
			identifier: slotIdentifier,
			time: timeSlot.startTime,
		})
	}
}

const handleSlotClick = (seat, timeSlot) => {
	const reservationId = route.params.reservationId
	const isEditing = !!reservationId

	// Check if this slot is part of the current reservation being edited
	const isCurrentReservationSlot =
		isEditing &&
		selectedSlots.value.some(
			(slot) =>
				slot.seat === seat &&
				slot.timeSlot.startTime === timeSlot.startTime &&
				slot.timeSlot.endTime === timeSlot.endTime,
		)

	if (isSlotOccupied(seat, timeSlot) && !isCurrentReservationSlot) {
		showReservationDetails(seat, timeSlot)
	} else {
		toggleSlotSelection(seat, timeSlot)
	}
}

const getSlotClass = (seat, timeSlot) => {
	const slotIdentifier = `${seat}-${timeSlot.startTime}`
	const isSelected = selectedSlots.value.some((s) => s.identifier === slotIdentifier)
	const isOccupied = isSlotOccupied(seat, timeSlot)
	const reservationId = route.params.reservationId
	const isEditing = !!reservationId

	if (isOccupied) {
		return 'bg-gray-400 text-white cursor-pointer'
	} else if (isSelected) {
		return 'bg-green-500 text-white border-2 border-green-600'
	} else {
		return 'bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer'
	}
}

const getSlotText = (seat, timeSlot) => {
	const isOccupied = isSlotOccupied(seat, timeSlot)
	const slotIdentifier = `${seat}-${timeSlot.startTime}`
	const isSelected = selectedSlots.value.some((s) => s.identifier === slotIdentifier)
	const reservationId = route.params.reservationId
	const isEditing = !!reservationId

	if (isOccupied) {
		return 'Occupied'
	} else if (isSelected) {
		return isEditing ? 'Current' : 'Selected'
	} else {
		return 'Available'
	}
}

// Helper functions
const clearSelection = () => {
	if (route.params.reservationId && originalReservationState.value) {
		selectedDate.value = originalReservationState.value.selectedDate
		selectedSlots.value = JSON.parse(
			JSON.stringify(originalReservationState.value.selectedSlots),
		)
		studentIdForReservation.value = originalReservationState.value.studentIdForReservation
		reserveAnonymously.value = originalReservationState.value.reserveAnonymously
	} else {
		selectedSlots.value = []
		reserveAnonymously.value = false
		studentIdForReservation.value = ''
	}
}

const scrollToSchedule = () => {
	const el = document.querySelector('.lg\\:col-span-3')
	if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const formatDate = (dateStr) => {
	if (!dateStr) return 'Invalid Date'
	const date = new Date(dateStr)
	if (isNaN(date)) return 'Invalid Date'
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

const formatDateTime = (dateStr) => {
	if (!dateStr) return 'Invalid Date'
	const date = new Date(dateStr)
	if (isNaN(date)) return 'Invalid Date'
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	})
}

const goBack = () => {
	selectedLab.value = ''
	selectedSlots.value = []
	router.push('/view')
}

// Load existing reservation for editing
const loadReservationForEditing = async (reservationId) => {
	try {
		// Find the reservation in the store or fetch it
		let reservation = reservationsStore.reservations.find((r) => r._id === reservationId)

		if (!reservation) {
			// If not in store, fetch all reservations to find it
			await reservationsStore.fetchReservations()
			reservation = reservationsStore.reservations.find((r) => r._id === reservationId)
		}

		if (reservation) {
			// Set the date to the reservation date
			selectedDate.value = new Date(reservation.reservation_date).toISOString().split('T')[0]

			// Wait for lab schedule to load
			await loadLabSchedule()

			// Pre-select the existing slots
			if (reservation.slots && reservation.slots.length > 0) {
				selectedSlots.value = reservation.slots.map((slot) => ({
					seat: slot.seat_number,
					timeSlot: {
						startTime: slot.start_time,
						endTime: slot.end_time,
					},
					identifier: `${slot.seat_number}-${slot.start_time}`,
					time: slot.start_time,
				}))
			}
			// If technician, set studentIdForReservation to reservation.user_id
			if (currentUser.value?.user_type === 'technician') {
				studentIdForReservation.value = reservation.user_id
			}
			// Set reserveAnonymously.value to true if the reservation is anonymous
			reserveAnonymously.value = !!reservation.anonymous
			// Store the original state for cancel
			originalReservationState.value = {
				selectedDate: selectedDate.value,
				selectedSlots: JSON.parse(JSON.stringify(selectedSlots.value)),
				studentIdForReservation: studentIdForReservation.value,
				reserveAnonymously: reserveAnonymously.value,
			}
		} else {
			console.error('Reservation not found:', reservationId)
		}
	} catch (error) {
		console.error('Error loading reservation for editing:', error)
	}
}

// Pagination
const nextPage = () => {
	if (currentPage.value < totalPages.value) {
		currentPage.value++
	} else {
		currentPage.value = 1
	}
}

const prevPage = () => {
	if (currentPage.value > 1) {
		currentPage.value--
	} else {
		currentPage.value = totalPages.value
	}
}

// Time filter
const setTimeFilter = (filter) => {
	timeFilter.value = filter
	// Keep selected slots when switching filters - they'll be filtered out of view but preserved
}

// Reservation functions
const reserveSlot = async () => {
	if (selectedSlots.value.length === 0 || !selectedLab.value) {
		alert('Please select at least one slot')
		return
	}

	const reservationId = route.params.reservationId
	const isEditing = !!reservationId

	try {
		// Added validation for double reservations here
		// Firstly, fetch all reservations for the selected lab
		await reservationsStore.fetchReservationsByLab(selectedLab.value)
		const latestReservations = reservationsStore.reservations.filter(
			(reservation) =>
				new Date(reservation.reservation_date).toDateString() ===
				new Date(selectedDate.value).toDateString(),
		)
		// Then check for conflicts
		const hasConflict = selectedSlots.value.some((selectedSlot) =>
			latestReservations.some((reservation) => {
				// Skip the current reservation being edited
				if (isEditing && reservation._id === reservationId) {
					return false
				}
				return reservation.slots.some(
					(slot) =>
						slot.seat_number === selectedSlot.seat &&
						slot.start_time === selectedSlot.timeSlot.startTime &&
						slot.end_time === selectedSlot.timeSlot.endTime,
				)
			}),
		)

		if (hasConflict) {
			// Clear any slots that are now occupied to prevent stunlock
			selectedSlots.value = selectedSlots.value.filter((slot) => {
				return !isSlotOccupied(slot.seat, slot.timeSlot)
			})

			alert(
				'One or more of the selected slots have already been reserved. The unavailable slots have been removed from your selection.',
			)
			return
		}

		// Changes end here
		let user_id
		if (isEditing) {
			if (currentUser.value?.user_type === 'technician') {
				if (!studentIdForReservation.value) {
					alert('Technicians must enter a student ID to reserve for a student.')
					return
				}
				if (studentIdForReservation.value == currentUser.value?.user_id) {
					alert('Technicians cannot reserve for themselves. Please enter a student ID.')
					return
				}
				user_id = studentIdForReservation.value
			}
			// Otherwise, don't include user_id in the update (preserve original)
		} else {
			if (currentUser.value?.user_type === 'technician') {
				if (!studentIdForReservation.value) {
					alert('Technicians must enter a student ID to reserve for a student.')
					return
				}
				if (studentIdForReservation.value == currentUser.value?.user_id) {
					alert('Technicians cannot reserve for themselves. Please enter a student ID.')
					return
				}
				user_id = studentIdForReservation.value
			} else {
				user_id = currentUser.value?.user_id
			}
		}

		const payload = {
			...(user_id !== undefined && { user_id }),
			lab_id: selectedLab.value,
			reservation_date: selectedDate.value,
			slots: selectedSlots.value.map((slot) => ({
				seat_number: slot.seat,
				start_time: slot.timeSlot.startTime,
				end_time: slot.timeSlot.endTime,
			})),
			anonymous: reserveAnonymously.value,
			...(currentUser.value?.user_type === 'technician' && {
				technician_id: currentUser.value?.user_id,
			}),
		}

		if (isEditing) {
			await reservationsStore.updateReservation(reservationId, payload)
			alert('Reservation updated successfully!')
			router.push('/view')
		} else {
			await reservationsStore.createReservation(payload)
			alert('Reservation created successfully!')
			await reservationsStore.fetchReservationsByUserId(currentUser.value?.user_id || '')
			await loadLabSchedule()
			clearSelection()
		}
	} catch (error) {
		if (error.response?.status === 409) {
			// Refresh all reservation data to get the latest state
			await reservationsStore.fetchReservationsByLab(selectedLab.value)
			await loadLabSchedule()

			// Clear any slots that are now occupied to prevent stunlock
			selectedSlots.value = selectedSlots.value.filter((slot) => {
				return !isSlotOccupied(slot.seat, slot.timeSlot)
			})

			alert(
				'One or more slots are already taken. The unavailable slots have been removed from your selection.',
			)
			return
		}
		console.error('Error in reserveSlot:', error)
		let message = 'Failed to create reservation. Please try again.'
		if (error.response && error.response.data && error.response.data.message) {
			message = error.response.data.message
		}
		await reservationsStore.fetchReservationsByUserId(currentUser.value?.user_id || '')
		await loadLabSchedule()
		alert(message)
	}
}

const showReservationDetails = (seat, timeSlot) => {
	// Find the reservation for this seat and time slot
	const reservation = reservationsStore.reservations.find((reservation) => {
		// Handle both string and object lab_id
		const reservationLabId =
			typeof reservation.lab_id === 'object' ? reservation.lab_id._id : reservation.lab_id
		if (reservationLabId !== selectedLab.value || reservation.status !== 'Active') {
			return false
		}

		const reservationDate = new Date(reservation.reservation_date).toDateString()
		const selectedDateStr = new Date(selectedDate.value).toDateString()

		if (reservationDate !== selectedDateStr) {
			return false
		}

		return reservation.slots.some(
			(slot) =>
				slot.seat_number === seat &&
				slot.start_time === timeSlot.startTime &&
				slot.end_time === timeSlot.endTime,
		)
	})

	if (reservation) {
		Object.assign(reservationDetails, {
			reservation_id: reservation._id,
			lab_id: selectedLab.value,
			date: selectedDate.value,
			slots: reservation.slots.map((slot) => ({
				seat: slot.seat_number,
				timeSlot: { startTime: slot.start_time, endTime: slot.end_time },
			})),
			user: reservation.anonymous
				? {
						user_id: 'Anonymous',
						name: 'Anonymous User',
						email: 'Anonymous',
						isAnonymous: true,
					}
				: {
						user_id: reservation.user_id,
						name: reservation.user?.name || `User ${reservation.user_id}`,
						email: reservation.user?.email || `user${reservation.user_id}@dlsu.edu.ph`,
						isAnonymous: false,
					},
		})
		showReservationDetailsModal.value = true
	}
}

const closeReservationDetailsModal = () => {
	showReservationDetailsModal.value = false
}

const canCancelReservation = (reservationId) => {
	// Check if the current user can cancel this reservation
	const reservation = reservationsStore.reservations.find((r) => r._id === reservationId)
	if (!reservation) return false

	// Users can cancel their own reservations (including anonymous ones)
	if (reservation.user_id === currentUser.value?.user_id) return true

	// Technicians can cancel any reservation
	if (currentUser.value?.user_type === 'technician') return true

	return false
}

const removeReservation = async (reservationId) => {
	// Show custom confirmation modal instead of browser confirm
	showCancelConfirmationModal.value = true
}

const confirmCancelReservation = async () => {
	try {
		await reservationsStore.deleteReservation(reservationDetails.reservation_id)
		// Refresh all reservations for the lab to update the matrix
		await reservationsStore.fetchReservationsByLab(selectedLab.value)
		await loadLabSchedule() // Refresh the schedule
		closeReservationDetailsModal()
		closeCancelConfirmationModal()
	} catch (error) {
		console.error('Error cancelling reservation:', error)
		alert('Failed to cancel reservation. Please try again.')
	}
}

const closeCancelConfirmationModal = () => {
	showCancelConfirmationModal.value = false
}
</script>

<style scoped>
@import '@/assets/reservations.css';
</style>
