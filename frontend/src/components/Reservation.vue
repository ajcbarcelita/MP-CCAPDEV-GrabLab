<style scoped>
@import '@/assets/reservations.css';
</style>

<!-- Template section for the updated reservation component -->
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

		<!-- Main Content Container (Schedule View) -->
		<div class="container mx-auto px-4 py-6 max-w-7xl">
			<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<!-- Left Panel - Controls -->
				<div class="lg:col-span-1 space-y-4">
					<!-- Back Button -->
					<button
						@click="goBack"
						class="w-full grablab-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg transition-colors duration-200"
					>
						← Go Back to Labs
					</button>

					<!-- Lab Selector -->
					<div class="bg-white rounded-lg shadow-sm p-4">
						<label class="block text-sm font-medium text-gray-700 mb-2"
							>Lab Selector</label
						>
						<select
							v-model="selectedLab"
							@change="loadLabSchedule"
							class="w-full p-3 border border-gray-300 rounded-lg"
						>
							<option value="">Select Lab</option>
							<option v-for="lab in allLabs" :key="lab._id" :value="lab._id">
								{{ lab.display_name }}
							</option>
						</select>
					</div>

					<!-- Date Selector -->
					<div class="bg-white rounded-lg shadow-sm p-4">
						<label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
						<input
							type="date"
							v-model="selectedDate"
							:min="minDate"
							:max="maxDate"
							@change="loadLabSchedule"
							class="w-full p-3 border border-gray-300 rounded-lg"
						/>
					</div>

					<!-- Quick Reserve Panel -->
					<div class="bg-white rounded-lg shadow-sm p-4" v-if="selectedSlots.length > 0">
						<h3 class="font-medium text-gray-800 mb-3">Reserve Selected Slots</h3>
						<p class="text-sm text-gray-600 mb-2">
							Lab: {{ getLabName(selectedLab) }}, Date: {{ formatDate(selectedDate) }}
						</p>
						<ul
							class="text-sm text-gray-600 mb-3 max-h-24 overflow-y-auto border p-2 rounded"
						>
							<li v-for="slot in selectedSlots" :key="slot.identifier">
								Seat {{ slot.seat }} at {{ slot.timeSlot.startTime }} -
								{{ slot.timeSlot.endTime }}
							</li>
						</ul>

						<div class="space-y-3">
							<label class="flex items-center gap-2">
								<input type="checkbox" v-model="reserveAnonymously" />
								<span class="text-sm">Reserve Anonymously</span>
							</label>

							<div v-if="currentUser.user_type === 'technician'">
								<label class="block text-sm font-medium text-gray-700 mb-1"
									>ID Number</label
								>
								<input
									type="text"
									v-model="studentIdForReservation"
									placeholder="Student ID"
									class="w-full p-2 border rounded"
								/>
								<p class="text-xs text-gray-500 mt-1">For technicians</p>
							</div>

							<button
								@click="reserveSlot"
								class="w-full grablab-primary text-white py-3 rounded-lg font-medium hover:opacity-90"
							>
								{{
									route.params.reservationId
										? 'Update Reservation'
										: 'Reserve Slot'
								}}
							</button>
							<button
								@click="clearSelection"
								class="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>

				<!-- Right Panel - Schedule Grid -->
				<div class="lg:col-span-3">
					<div class="bg-white rounded-lg shadow-sm p-6">
						<h2 class="font-jersey text-xl text-grablab-primary mb-4">
							{{ selectedLab ? getLabName(selectedLab) : 'Select a Lab' }} Schedule
							{{ route.params.reservationId ? ' (Editing)' : '' }}
						</h2>

						<!-- Loading indicator -->
						<div v-if="isLoadingSchedule" class="text-center py-12">
							<div
								class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"
							></div>
							<p class="text-gray-500 mt-4">Loading schedule...</p>
						</div>

						<div v-else-if="!selectedLab" class="text-center py-12 text-gray-500">
							Please select a lab to view the schedule
						</div>

						<div v-else>
							<!-- Operating Hours Info -->
							<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
								<p class="text-sm text-blue-800">
									Operating Hours: {{ getLabOperatingHours(selectedLab) }}
								</p>
							</div>

							<!-- Time Slot Filter -->
							<div class="flex justify-center gap-4 mb-4 flex-wrap">
								<button
									@click="setTimeFilter('Morning')"
									:class="{
										'grablab-secondary text-white': timeFilter === 'Morning',
										'bg-gray-200 text-gray-700': timeFilter !== 'Morning',
									}"
									class="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors duration-200"
								>
									Morning (7 AM - 12 PM)
								</button>
								<button
									@click="setTimeFilter('Afternoon')"
									:class="{
										'grablab-secondary text-white': timeFilter === 'Afternoon',
										'bg-gray-200 text-gray-700': timeFilter !== 'Afternoon',
									}"
									class="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors duration-200"
								>
									Afternoon (12 PM - 6 PM)
								</button>
								<button
									@click="setTimeFilter('Evening')"
									:class="{
										'grablab-secondary text-white': timeFilter === 'Evening',
										'bg-gray-200 text-gray-700': timeFilter !== 'Evening',
									}"
									class="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors duration-200"
								>
									Evening (6 PM - 7 PM)
								</button>
							</div>

							<div class="overflow-x-auto custom-scrollbar">
								<!-- Time Header -->
								<div class="schedule-grid mb-2 min-w-max">
									<div class="font-medium text-center py-2"></div>
									<div
										v-for="timeSlot in filteredTimeSlots"
										:key="`${timeSlot.startTime}-${timeSlot.endTime}`"
										class="font-medium text-center py-2 text-sm"
									>
										{{ timeSlot.startTime }} - {{ timeSlot.endTime }}
									</div>
								</div>

								<!-- Seat Rows -->
								<div
									class="schedule-grid min-w-max"
									v-for="seat in currentSeatsPage"
									:key="seat"
								>
									<div class="font-medium text-center py-3 bg-gray-50 rounded">
										Seat {{ seat }}
									</div>
									<button
										v-for="timeSlot in filteredTimeSlots"
										:key="`${seat}-${timeSlot.startTime}`"
										@click="handleSlotClick(seat, timeSlot)"
										:class="getSlotClass(seat, timeSlot)"
										class="seat-button rounded text-xs font-medium transition-all hover:scale-105"
									>
										{{ getSlotText(seat, timeSlot) }}
									</button>
								</div>
							</div>

							<!-- Pagination Controls -->
							<div
								class="flex justify-between items-center mt-6 p-2 bg-gray-100 rounded-lg"
							>
								<button
									@click="prevPage"
									:disabled="currentPage === 1"
									class="flex items-center gap-1 px-4 py-2 grablab-primary text-white rounded-lg font-medium hover:bg-grablab-primary transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<svg
										class="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 19l-7-7 7-7"
										></path>
									</svg>
									Previous
								</button>

								<div class="flex items-center gap-2">
									<span class="text-sm text-gray-600">
										Page {{ currentPage }} of {{ totalPages }}
									</span>
									<span class="text-sm text-gray-500">
										({{ currentSeatsPage.length }} seats)
									</span>
								</div>

								<button
									@click="nextPage"
									:disabled="currentPage === totalPages"
									class="flex items-center gap-1 px-4 py-2 grablab-primary text-white rounded-lg font-medium hover:bg-grablab-primary transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Next
									<svg
										class="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										></path>
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Reservation Details Modal -->
		<div
			v-if="showReservationDetailsModal"
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
			@click="closeReservationDetailsModal"
		>
			<div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" @click.stop>
				<div class="flex justify-between items-center mb-4">
					<h3 class="text-lg font-semibold text-gray-900">Reservation Details</h3>
					<button
						@click="closeReservationDetailsModal"
						class="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</button>
				</div>

				<div class="space-y-4">
					<!-- Lab and Date Info -->
					<div class="bg-gray-50 p-3 rounded-lg">
						<p class="text-sm text-gray-600">
							<strong>Lab:</strong> {{ getLabName(reservationDetails.lab_id) }}
						</p>
						<p class="text-sm text-gray-600">
							<strong>Reservation Date:</strong>
							{{
								formatDateTime(
									reservationDetails.reservation_date || reservationDetails.date,
								)
							}}
						</p>
					</div>

					<!-- Reserved Slots -->
					<div>
						<h4 class="font-medium text-gray-900 mb-2">Reserved Slots:</h4>
						<div class="max-h-48 overflow-y-auto border rounded-lg">
							<div class="divide-y">
								<div
									v-for="(slot, index) in reservationDetails.slots"
									:key="`${slot.seat}-${slot.timeSlot.startTime}`"
									class="bg-blue-50 p-3 border-blue-200 hover:bg-blue-100 transition-colors"
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-3">
											<span class="text-sm font-medium text-blue-600"
												>#{{ index + 1 }}</span
											>
											<div>
												<p class="text-sm font-medium text-gray-900">
													Seat {{ slot.seat }}
												</p>
												<p class="text-sm text-gray-600">
													{{ slot.timeSlot.startTime }} -
													{{ slot.timeSlot.endTime }}
												</p>
											</div>
										</div>
										<div class="w-3 h-3 bg-blue-400 rounded-full"></div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- User Information -->
					<div v-if="reservationDetails.user">
						<h4 class="font-medium text-gray-900 mb-2">Reserved by:</h4>
						<div class="bg-gray-50 p-3 rounded-lg">
							<div v-if="reservationDetails.user.isAnonymous" class="text-center">
								<p class="text-sm text-gray-600 italic">
									<strong>Anonymous Reservation</strong>
								</p>
								<p class="text-xs text-gray-500 mt-1">
									This reservation was made anonymously
								</p>
							</div>
							<div v-else>
								<p class="text-sm">
									<strong>Name:</strong> {{ reservationDetails.user.name }}
								</p>
								<p class="text-sm">
									<strong>Email:</strong> {{ reservationDetails.user.email }}
								</p>
								<p class="text-sm">
									<strong>ID:</strong> {{ reservationDetails.user.user_id }}
								</p>
							</div>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex gap-3 pt-4 border-t">
						<button
							v-if="canCancelReservation(reservationDetails.reservation_id)"
							@click="removeReservation(reservationDetails.reservation_id)"
							class="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
						>
							Cancel Reservation
						</button>
						<button
							@click="closeReservationDetailsModal"
							class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Cancel Confirmation Modal -->
		<div
			v-if="showCancelConfirmationModal"
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
			@click="closeCancelConfirmationModal"
		>
			<div
				class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col"
				@click.stop
			>
				<!-- Header -->
				<div class="flex justify-between items-center p-6 border-b">
					<h3 class="text-lg font-semibold text-gray-900">Confirm Cancellation</h3>
					<button
						@click="closeCancelConfirmationModal"
						class="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</button>
				</div>

				<!-- Content -->
				<div class="flex-1 overflow-y-auto p-6">
					<div class="space-y-4">
						<!-- Warning Message -->
						<div class="bg-red-50 border border-red-200 rounded-lg p-4">
							<div class="flex items-center">
								<svg
									class="w-5 h-5 text-red-400 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
									></path>
								</svg>
								<p class="text-red-800 font-medium">
									Are you sure you want to cancel this reservation?
								</p>
							</div>
							<p class="text-red-700 text-sm mt-2">This action cannot be undone.</p>
						</div>

						<!-- Reservation Info -->
						<div class="bg-gray-50 p-4 rounded-lg">
							<p class="text-sm text-gray-600">
								<strong>Lab:</strong> {{ getLabName(reservationDetails.lab_id) }}
							</p>
							<p class="text-sm text-gray-600">
								<strong>Date:</strong> {{ formatDate(reservationDetails.date) }}
							</p>
							<p class="text-sm text-gray-600">
								<strong>Total Slots:</strong>
								{{ reservationDetails.slots?.length || 0 }}
							</p>
						</div>

						<!-- Slots to be Cancelled -->
						<div>
							<h4 class="font-medium text-gray-900 mb-3">
								The following slots will be cancelled:
							</h4>
							<div class="max-h-64 overflow-y-auto border rounded-lg">
								<div class="divide-y">
									<div
										v-for="(slot, index) in reservationDetails.slots"
										:key="`${slot.seat}-${slot.timeSlot.startTime}`"
										class="p-3 hover:bg-gray-50 transition-colors"
									>
										<div class="flex items-center justify-between">
											<div class="flex items-center space-x-3">
												<span class="text-sm font-medium text-gray-500"
													>#{{ index + 1 }}</span
												>
												<div>
													<p class="text-sm font-medium text-gray-900">
														Seat {{ slot.seat }}
													</p>
													<p class="text-xs text-gray-500">
														{{ slot.timeSlot.startTime }} -
														{{ slot.timeSlot.endTime }}
													</p>
												</div>
											</div>
											<div class="w-3 h-3 bg-red-400 rounded-full"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="flex gap-3 p-6 border-t bg-gray-50">
					<button
						@click="closeCancelConfirmationModal"
						class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
					>
						Keep Reservation
					</button>
					<button
						@click="confirmCancelReservation"
						class="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
					>
						Cancel Reservation
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users_store'
import { useLabsStore } from '@/stores/labs_store'
import { useReservationsStore } from '@/stores/reservations_store'
import { useLabSlotsStore } from '@/stores/labSlots_store'

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

	// Allow deselection of current reservation slots even if they appear occupied
	if (isSlotOccupied(seat, timeSlot) && !isCurrentReservationSlot) return

	const slotIdentifier = `${seat}-${timeSlot.startTime}`
	const index = selectedSlots.value.findIndex((s) => s.identifier === slotIdentifier)

	if (index === -1) {
		selectedSlots.value.push({
			seat,
			timeSlot,
			identifier: slotIdentifier,
			time: timeSlot.startTime,
		})
	} else {
		selectedSlots.value.splice(index, 1)
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
	selectedSlots.value = []
	reserveAnonymously.value = false
	studentIdForReservation.value = ''
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
		// When editing, preserve the original user_id unless it's being explicitly changed
		let user_id
		if (isEditing) {
			// For editing, only change user_id if technician is explicitly setting it
			if (currentUser.value?.user_type === 'technician' && studentIdForReservation.value) {
				user_id = studentIdForReservation.value
			}
			// Otherwise, don't include user_id in the update (preserve original)
		} else {
			// For new reservations, use the current user's ID
			user_id =
				currentUser.value?.user_type === 'technician'
					? studentIdForReservation.value
					: currentUser.value?.user_id
		}

		const payload = {
			...(user_id !== undefined && { user_id }), // Only include user_id if it's defined
			lab_id: selectedLab.value,
			reservation_date: selectedDate.value,
			slots: selectedSlots.value.map((slot) => ({
				seat_number: slot.seat,
				start_time: slot.timeSlot.startTime,
				end_time: slot.timeSlot.endTime,
			})),
			anonymous: reserveAnonymously.value,
		}

		if (isEditing) {
			// Update existing reservation
			await reservationsStore.updateReservation(reservationId, payload)
			alert('Reservation updated successfully!')

			// After successful update, navigate back to view page
			router.push('/view')
		} else {
			// Create new reservation
			await reservationsStore.createReservation(payload)
			alert('Reservation created successfully!')

			await reservationsStore.fetchReservationsByUserId(currentUser.value?.user_id || '')
			await loadLabSchedule() // Refresh the schedule
			clearSelection()
		}
	} catch (error) {
		console.error('Error in reserveSlot:', error)
		// Show backend error message if available
		let message = 'Failed to create reservation. Please try again.'
		if (error.response && error.response.data && error.response.data.message) {
			message = error.response.data.message
		}
		// Refresh reservations and matrix
		await reservationsStore.fetchReservationsByUserId(currentUser.value?.user_id || '')
		await loadLabSchedule()
		// Deselect any slots that are now occupied
		selectedSlots.value = selectedSlots.value.filter((slot) => {
			return !isSlotOccupied(slot.seat, slot.timeSlot)
		})
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
