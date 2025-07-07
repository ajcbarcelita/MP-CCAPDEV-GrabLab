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

		<!-- Main Content Container (Schedule View) -->
		<div class="container mx-auto px-4 py-6 max-w-7xl">
			<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<!-- Left Panel - Controls -->
				<div class="lg:col-span-1 space-y-4">
					<!-- Back Button - More prominent -->
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
							<option v-for="lab in allLabs" :key="lab.lab_id" :value="lab.lab_id">
								{{ lab.display_name }}
							</option>
						</select>
					</div>

					<!-- Date Selector (One Week) -->
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
							<li v-for="slot in selectedSlots" :key="`${slot.seat}-${slot.time}`">
								Seat {{ slot.seat }} at {{ slot.time }}
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
								Reserve Slot
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
						</h2>

						<div v-if="!selectedLab" class="text-center py-12 text-gray-500">
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
										v-for="time in filteredTimeSlots"
										:key="time"
										class="font-medium text-center py-2 text-sm"
									>
										{{ time }}
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
										v-for="time in filteredTimeSlots"
										:key="`${seat}-${time}`"
										@click="handleSlotClick(seat, time)"
										:class="getSlotClass(seat, time)"
										class="seat-button rounded text-xs font-medium transition-all hover:scale-105"
									>
										{{ getSlotText(seat, time) }}
									</button>
								</div>
							</div>

							<!-- Pagination Controls -->
							<div
								class="flex justify-between items-center mt-6 p-2 bg-gray-100 rounded-lg"
							>
								<button
									@click="prevPage"
									class="flex items-center gap-1 px-4 py-2 grablab-primary text-white rounded-lg font-medium hover:bg-grablab-primary transition-colors duration-200 shadow-md"
								>
									<svg
										class="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
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
								<span class="text-base font-semibold text-gray-800"
									>Page {{ currentPage }} of {{ totalPages }}</span
								>
								<button
									@click="nextPage"
									class="flex items-center gap-1 px-4 py-2 grablab-primary text-white rounded-lg font-medium hover:bg-grablab-primary transition-colors duration-200 shadow-md"
								>
									Next
									<svg
										class="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
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

		<div
			v-if="showDetailsModal"
			class="fixed inset-0 modal-overlay flex items-center justify-center z-50"
		>
			<div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
				<h2 class="font-jersey text-2xl text-grablab-primary mb-6 text-center">
					Reservation Details
				</h2>

				<div class="space-y-3 mb-6 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-600">Lab:</span>
						<span class="font-medium">{{ getLabName(confirmData.lab_id) }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Date:</span>
						<span class="font-medium">{{ formatDate(confirmData.date) }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Reserved By:</span>
						<span class="font-medium">{{ confirmData.user.name }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Email:</span>
						<span class="font-medium">{{ confirmData.user.email }}</span>
					</div>
					<div class="space-y-1 mt-2 border-t pt-2 max-h-48 overflow-y-auto">
						<div
							class="flex justify-between"
							v-for="slot in confirmData.slots"
							:key="`${slot.seat}-${slot.time}`"
						>
							<span class="text-gray-600">Seat {{ slot.seat }}:</span>
							<span class="font-medium">{{ slot.time }}</span>
						</div>
					</div>
				</div>

				<div class="flex gap-3">
					<router-link
						:to="`/profile/${confirmData.user.user_id}`"
						class="flex-1 grablab-primary text-white py-3 rounded font-medium hover:opacity-90 text-center"
					>
						View Profile
					</router-link>
					<button
						@click="closeConfirmModal"
						class="flex-1 bg-gray-400 text-white py-3 rounded font-medium hover:bg-gray-500"
					>
						Close
					</button>
				</div>
			</div>
		</div>

		<div
			v-if="showReservationDetailsModal"
			class="fixed inset-0 modal-overlay flex items-center justify-center z-50"
		>
			<div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
				<h2 class="font-jersey text-2xl text-grablab-primary mb-6 text-center">
					Reservation Details
				</h2>

				<div class="space-y-3 mb-6 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-600">Reserved By:</span>
						<span class="font-medium">{{ reservationDetails.user.name }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Email:</span>
						<span class="font-medium">{{ reservationDetails.user.email }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Lab:</span>
						<span class="font-medium">{{ getLabName(reservationDetails.lab_id) }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Date:</span>
						<span class="font-medium">{{ formatDate(reservationDetails.date) }}</span>
					</div>
				</div>

				<div class="flex gap-3">
					<router-link
						:to="`/profile/${reservationDetails.user.user_id}`"
						class="flex-1 grablab-primary text-white py-3 rounded font-medium hover:opacity-90 text-center"
					>
						View Profile
					</router-link>
					<button
						@click="closeReservationDetailsModal"
						class="flex-1 bg-gray-400 text-white py-3 rounded font-medium hover:bg-gray-500"
					>
						Close
					</button>
				</div>
			</div>
		</div>

		<!-- Confirmation Modal -->
		<div
			v-if="showConfirmModal"
			class="fixed inset-0 modal-overlay flex items-center justify-center z-50"
		>
			<div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
				<h2 class="font-jersey text-2xl text-grablab-primary mb-6 text-center">
					Confirm Reservation
				</h2>

				<div class="space-y-3 mb-6 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-600">Lab:</span>
						<span class="font-medium">{{ getLabName(confirmData.lab_id) }}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Date:</span>
						<span class="font-medium">{{ formatDate(confirmData.date) }}</span>
					</div>
					<div class="space-y-1 mt-2 border-t pt-2 max-h-48 overflow-y-auto">
						<div
							class="flex justify-between"
							v-for="slot in confirmData.slots"
							:key="`${slot.seat}-${slot.time}`"
						>
							<span class="text-gray-600">Seat {{ slot.seat }}:</span>
							<span class="font-medium">{{ slot.time }}</span>
						</div>
					</div>
				</div>

				<div
					v-if="!reserveAnonymously"
					class="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded"
				>
					<p class="text-sm text-yellow-800">
						Are you sure you want to post this without anonymity?
					</p>
				</div>

				<div class="flex gap-3">
					<button
						@click="confirmReservation"
						class="flex-1 grablab-primary text-white py-3 rounded font-medium hover:opacity-90"
					>
						Confirm
					</button>
					<button
						@click="closeConfirmModal"
						class="flex-1 bg-gray-400 text-white py-3 rounded font-medium hover:bg-gray-500"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>

		<!-- Success Modal -->
		<div
			v-if="showSuccessModal"
			class="fixed inset-0 modal-overlay flex items-center justify-center z-50"
		>
			<div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl text-center">
				<div class="text-green-500 text-6xl mb-4">✓</div>
				<h2 class="font-jersey text-2xl text-grablab-primary mb-4">
					Reservation Confirmed!
				</h2>
				<p class="text-gray-600 mb-6">Your seat has been successfully reserved.</p>
				<button
					@click="closeSuccessModal"
					class="grablab-primary text-white py-3 px-6 rounded font-medium hover:opacity-90"
				>
					Close
				</button>
			</div>
		</div>

		<!-- Footer -->
		<footer class="bg-[#12372A] text-[#FBFADA] text-center p-4 text-sm font-bold mt-auto">
			<div class="flex justify-center gap-2">
				<p>&copy; 2025 GrabLab. All rights reserved.<br /></p>
			</div>
		</footer>
	</div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import allLabsData from '@/data/labs.js'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

export default {
	name: 'StudentMain',
	setup() {
		// Hardcoded data for Phase 1 visual representation
		const currentUser = reactive(JSON.parse(sessionStorage.getItem('user')))

		// Updated labs dataset
		const allLabs = ref(allLabsData) // Use the imported labs dataset
		const selectedLab = ref('')
		const selectedDate = ref(new Date().toISOString().split('T')[0])

		const loadLabSchedule = () => {
			if (!selectedLab.value) {
				alert('Please select a lab.')
				return
			}

			const lab = allLabs.value.find((l) => l.lab_id === parseInt(selectedLab.value))

			if (!lab) {
				alert('Selected lab not found.')
				return
			}

			const selectedDay = new Date(selectedDate.value).getDay()

			if (selectedDay === 0) {
				alert('Reservations are not allowed on Sundays.')
				selectedDate.value = minDate.value // Reset to the minimum date
				return
			}

			// Clear previous selections

			clearSelection()
			currentPage.value = 1 // Reset pagination

			// Scroll to the schedule section
			const el = document.querySelector('.container.mx-auto.px-4.py-6.max-w-7xl')
			if (el) {
				el.scrollIntoView({ behavior: 'smooth' })
			}
		}

		const filteredLabs = ref([...allLabs.value])
		const router = useRouter()

		const hardcodedReservations = ref([
			{
				reservation_id: 1,
				user_id: 4,
				lab_id: 1,
				reservation_date: '2025-06-18',
				status: 'confirmed',
				created_at: '2025-06-17T08:00:00',
				slots: [
					{ slot_id: 1 }, // seat 1, time slot 1
					{ slot_id: 2 }, // seat 1, time slot 2
				],
			},
			{
				reservation_id: 2,
				user_id: 4,
				lab_id: 1,
				reservation_date: '2025-06-19',
				status: 'confirmed',
				created_at: '2025-06-17T09:15:00',
				slots: [
					{ slot_id: 67 }, // seat 4, time slot 1
					{ slot_id: 68 }, // seat 4, time slot 2
				],
			},
			{
				reservation_id: 3,
				user_id: 2,
				lab_id: 1,
				reservation_date: '2025-06-18',
				status: 'confirmed',
				created_at: '2025-06-17T10:00:00',
				slots: [
					{ slot_id: 133 }, // seat 7, time slot 1
					{ slot_id: 134 }, // seat 7, time slot 2
				],
			},
			{
				reservation_id: 4,
				user_id: 2,
				lab_id: 1,
				reservation_date: '2025-06-19',
				status: 'confirmed',
				created_at: '2025-06-17T11:00:00',
				slots: [
					{ slot_id: 200 }, // seat 10, time slot 2
					{ slot_id: 201 }, // seat 10, time slot 3
				],
			},
			{
				reservation_id: 5,
				user_id: 5,
				lab_id: 1,
				reservation_date: '2025-06-20',
				status: 'pending',
				created_at: '2025-06-17T12:00:00',
				slots: [
					{ slot_id: 275 }, // seat 13, time slot 1 (but we only have 7 seats, so this won't show)
					{ slot_id: 276 }, // seat 13, time slot 2
				],
			},
		])

		const selectedBuilding = ref('All')
		const selectedSlots = ref([])
		const reserveAnonymously = ref(false)
		const studentIdForReservation = ref('')

		// Modals
		const showConfirmModal = ref(false)
		const showSuccessModal = ref(false)
		const confirmData = reactive({})

		// Pagination for seats
		const seatsPerPage = 7
		const currentPage = ref(1)

		// Time Slot Filtering

		const timeFilter = ref('Morning') // 'Morning', 'Afternoon', 'Evening'

		const minDate = computed(() => {
			const today = new Date()
			return today.toISOString().split('T')[0]
		})

		const maxDate = computed(() => {
			const future = new Date()
			future.setDate(new Date().getDate() + 6)
			return future.toISOString().split('T')[0]
		})

		// Helper function to calculate slot_id from seat and time slot index
		const calculateSlotId = (seatNumber, timeSlotIndex) => {
			return (seatNumber - 1) * 22 + timeSlotIndex
		}

		// Helper function to get seat and time slot from slot_id
		const getSlotDetails = (slotId) => {
			const seatNumber = Math.floor((slotId - 1) / 22) + 1
			const timeSlotIndex = ((slotId - 1) % 22) + 1
			return { seatNumber, timeSlotIndex }
		}

		// Generate time slots based on lab operating hours
		const getTimeSlots = (labId) => {
			const lab = allLabs.value.find((l) => l.lab_id === labId)
			if (!lab) return []

			const slots = []
			const [openHour, openMin] = lab.operating_hours.open.split(':').map(Number)
			const [closeHour, closeMin] = lab.operating_hours.close.split(':').map(Number)

			const startTime = new Date()
			startTime.setHours(openHour, openMin, 0, 0)

			const endTime = new Date()
			endTime.setHours(closeHour, closeMin, 0, 0)

			let currentTime = new Date(startTime)
			while (currentTime < endTime) {
				const hours = currentTime.getHours().toString().padStart(2, '0')
				const minutes = currentTime.getMinutes().toString().padStart(2, '0')
				slots.push(`${hours}:${minutes}`)
				currentTime.setMinutes(currentTime.getMinutes() + 30)
			}
			return slots
		}

		// All possible time slots (will be filtered based on selected lab)
		const allTimeSlots = computed(() => {
			if (!selectedLab.value) return []
			return getTimeSlots(parseInt(selectedLab.value))
		})

		// Filtered time slots based on timeFilter
		const filteredTimeSlots = computed(() => {
			if (timeFilter.value === 'All') {
				return allTimeSlots.value
			} else if (timeFilter.value === 'Morning') {
				return allTimeSlots.value.filter((slot) => {
					const [hours] = slot.split(':').map(Number)
					return hours >= 7 && hours < 12
				})
			} else if (timeFilter.value === 'Afternoon') {
				return allTimeSlots.value.filter((slot) => {
					const [hours] = slot.split(':').map(Number)
					return hours >= 12 && hours < 18
				})
			} else if (timeFilter.value === 'Evening') {
				return allTimeSlots.value.filter((slot) => {
					const [hours] = slot.split(':').map(Number)
					return hours >= 18 && hours <= 19
				})
			}
			return allTimeSlots.value
		})

		const scrollToSearchFilter = () => {
			const el = document.getElementById('search-filter')
			if (el) {
				el.scrollIntoView({ behavior: 'smooth' })
			}
		}

		const filterLabs = () => {
			if (selectedBuilding.value === 'All') {
				filteredLabs.value = [...allLabs.value]
			} else {
				filteredLabs.value = allLabs.value.filter(
					(lab) => lab.building === selectedBuilding.value,
				)
			}
		}

		const viewSchedule = (labId) => {
			selectedLab.value = labId
			currentPage.value = 1
			selectedSlots.value = []
			const el = document.querySelector('.container.mx-auto.px-4.py-6.max-w-7xl')
			if (el) {
				el.scrollIntoView({ behavior: 'smooth' })
			}
		}

		const goBack = () => {
			selectedLab.value = ''
			selectedSlots.value = []
			router.push('/view')
		}

		const getLabName = (labId) => {
			const lab = allLabs.value.find((l) => l.lab_id === labId)
			return lab ? lab.display_name : 'Unknown Lab'
		}

		const getLabOperatingHours = (labId) => {
			const lab = allLabs.value.find((l) => l.lab_id === labId)
			if (!lab) return 'N/A'
			return `${lab.operating_hours.open} - ${lab.operating_hours.close}`
		}

		const getSeatsForLab = (labId) => {
			const lab = allLabs.value.find((l) => l.lab_id === labId)
			return lab ? Array.from({ length: lab.capacity }, (_, i) => i + 1) : []
		}

		// Computed property for seats on the current page
		const currentSeatsPage = computed(() => {
			const allSeats = getSeatsForLab(selectedLab.value)
			const start = (currentPage.value - 1) * seatsPerPage
			const end = start + seatsPerPage
			return allSeats.slice(start, end)
		})

		const totalPages = computed(() => {
			const lab = allLabs.value.find((l) => l.lab_id === selectedLab.value)
			if (!lab) return 1
			return Math.ceil(lab.capacity / seatsPerPage)
		})

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

		const setTimeFilter = (filter) => {
			timeFilter.value = filter
			selectedSlots.value = selectedSlots.value.filter((slot) => {
				const [hours] = slot.time.split(':').map(Number)
				if (filter === 'Morning' && hours >= 7 && hours < 12) return true
				if (filter === 'Afternoon' && hours >= 12 && hours < 18) return true
				if (filter === 'Evening' && hours >= 18 && hours <= 19) return true
				return false
			})
		}

		const toggleSlotSelection = (seat, time) => {
			if (isSlotOccupied(parseInt(selectedLab.value), seat, selectedDate.value, time)) return

			const index = selectedSlots.value.findIndex((s) => s.seat === seat && s.time === time)

			if (index === -1) {
				selectedSlots.value.push({ seat, time })
			} else {
				selectedSlots.value.splice(index, 1)
			}
		}

		const clearSelection = () => {
			selectedSlots.value = []
			reserveAnonymously.value = false
			studentIdForReservation.value = ''
		}

		const getSlotClass = (seat, time) => {
			const isSelected = selectedSlots.value.some((s) => s.seat === seat && s.time === time)
			const isOccupied = isSlotOccupied(
				parseInt(selectedLab.value),
				seat,
				selectedDate.value,
				time,
			)

			if (isOccupied) {
				return 'bg-gray-400 text-white'
			} else if (isSelected) {
				return 'bg-green-500 text-white border-2 border-green-600'
			} else {
				return 'bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer'
			}
		}

		const getSlotText = (seat, time) => {
			const isOccupied = isSlotOccupied(
				parseInt(selectedLab.value),
				seat,
				selectedDate.value,
				time,
			)
			const isSelected = selectedSlots.value.some((s) => s.seat === seat && s.time === time)

			if (isOccupied) {
				return 'Occupied'
			} else if (isSelected) {
				return 'Selected'
			} else {
				return 'Available'
			}
		}

		const isSlotDisabled = (seat, time) => {
			return isSlotOccupied(parseInt(selectedLab.value), seat, selectedDate.value, time)
		}

		const isSlotOccupied = (labId, seatNumber, date, time) => {
			// Find the time slot index for the given time
			const timeSlots = getTimeSlots(labId)
			const timeSlotIndex = timeSlots.indexOf(time) + 1 // +1 because slot calculation is 1-based

			if (timeSlotIndex === 0) return false // Time not found

			// Calculate the expected slot_id
			const expectedSlotId = calculateSlotId(seatNumber, timeSlotIndex)

			// Check if any reservation has this slot_id for the given lab and date
			return hardcodedReservations.value.some(
				(reservation) =>
					reservation.lab_id === labId &&
					reservation.reservation_date === date &&
					reservation.status === 'confirmed' &&
					reservation.slots.some((slot) => slot.slot_id === expectedSlotId),
			)
		}

		const getTotalFreeSeats = () => {
			return 0
		}
		const getOccupiedSeats = () => {
			return 0
		}
		const getMaintenanceSeats = () => {
			return 0
		}

		const reserveSlot = () => {
			if (selectedSlots.value.length === 0 || !selectedLab.value) return

			Object.assign(confirmData, {
				lab_id: parseInt(selectedLab.value),
				date: selectedDate.value,
				slots: [...selectedSlots.value],
				anonymous: reserveAnonymously.value,
				student_id:
					currentUser.user_type === 'technician'
						? studentIdForReservation.value
						: currentUser.user_id,
			})
			showConfirmModal.value = true
		}

		const showReservationDetails = (seat, time) => {
			const labId = parseInt(selectedLab.value)
			const date = selectedDate.value

			// Find the time slot index for the given time
			const timeSlots = getTimeSlots(labId)
			const timeSlotIndex = timeSlots.indexOf(time) + 1 // +1 because slot calculation is 1-based

			if (timeSlotIndex === 0) return // Time not found

			// Calculate the expected slot_id
			const expectedSlotId = calculateSlotId(seat, timeSlotIndex)

			// Find the reservation
			const reservation = hardcodedReservations.value.find(
				(reservation) =>
					reservation.lab_id === labId &&
					reservation.reservation_date === date &&
					reservation.slots.some((slot) => slot.slot_id === expectedSlotId),
			)

			if (reservation) {
				// Check if the reservation belongs to the current user
				if (reservation.user_id === currentUser.user_id) {
					// Use current user's actual data
					reservationDetails.user = {
						user_id: currentUser.user_id,
						name: currentUser.name,
						email: currentUser.email,
					}
				} else {
					const user = {
						user_id: reservation.user_id,
						name: `User ${reservation.user_id}`,
						email: `user${reservation.user_id}@dlsu.edu.ph`,
					}
					reservationDetails.user = user
				}

				// Populate modal data
				reservationDetails.lab_id = labId
				reservationDetails.date = date
				reservationDetails.slots = reservation.slots

				// Show modal
				showReservationDetailsModal.value = true
			} else {
				alert('No reservation details found.')
			}
		}

		const showReservationDetailsModal = ref(false)
		const reservationDetails = reactive({
			lab_id: null,
			date: null,
			slots: [],
			user: {},
		})

		const closeReservationDetailsModal = () => {
			showReservationDetailsModal.value = false
		}

		const confirmReservation = () => {
			// Create slot_ids for the reservation
			const timeSlots = getTimeSlots(parseInt(confirmData.lab_id))
			const reservationSlots = confirmData.slots.map((slot) => {
				const timeSlotIndex = timeSlots.indexOf(slot.time) + 1
				const slotId = calculateSlotId(slot.seat, timeSlotIndex)
				return { slot_id: slotId }
			})

			// Add new reservation
			hardcodedReservations.value.push({
				reservation_id: hardcodedReservations.value.length + 1,
				user_id: confirmData.student_id,
				lab_id: confirmData.lab_id,
				reservation_date: confirmData.date,
				status: 'confirmed',
				created_at: new Date().toISOString(),
				slots: reservationSlots,
			})

			closeConfirmModal()
			clearSelection()
			showSuccessModal.value = true
		}

		const showDetailsModal = ref(false)
		const handleSlotClick = (seat, time) => {
			if (isSlotOccupied(parseInt(selectedLab.value), seat, selectedDate.value, time)) {
				showReservationDetails(seat, time)
			} else {
				toggleSlotSelection(seat, time)
			}
		}

		const closeConfirmModal = () => {
			showConfirmModal.value = false
			Object.keys(confirmData).forEach((key) => delete confirmData[key])
		}

		const closeSuccessModal = () => {
			showSuccessModal.value = false
		}

		const formatDate = (dateStr) => {
			return new Date(dateStr).toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			})
		}

		const route = useRoute()

		onMounted(() => {
			const labId = parseInt(route.params.labId) // Get labId from route parameters

			if (!labId) {
				alert('Invalid lab ID!')
				router.push('/view') // Redirect back to the view page if labId is invalid
				return
			}

			const lab = allLabs.value.find((l) => l.lab_id === labId) // Find the lab by labId

			if (!lab) {
				alert('Lab not found!')
				router.push('/view') // Redirect back to the view page if lab is not found
				return
			}

			selectedLab.value = lab.lab_id // Set the selected lab
			loadLabSchedule() // Load the schedule for the selected lab
			filterLabs() // Initialize filtered labs
		})
		return {
			currentUser,
			allLabs,
			filteredLabs,
			selectedBuilding,
			selectedLab,
			selectedDate,
			selectedSlots,
			reserveAnonymously,
			studentIdForReservation,
			showConfirmModal,
			showSuccessModal,
			confirmData,
			minDate,
			maxDate,
			allTimeSlots, // Expose all time slots
			filteredTimeSlots, // Expose filtered time slots
			timeFilter, // Expose time filter
			scrollToSearchFilter,
			filterLabs,
			viewSchedule,
			goBack,
			getLabName,
			getSeatsForLab,
			currentSeatsPage,
			currentPage,
			totalPages,
			nextPage,
			prevPage,
			setTimeFilter, // Expose setTimeFilter
			toggleSlotSelection,
			clearSelection,
			getSlotClass,
			getSlotText,
			isSlotDisabled,
			getTotalFreeSeats,
			getOccupiedSeats,
			getMaintenanceSeats,
			loadLabSchedule,
			reserveSlot,
			confirmReservation,
			closeConfirmModal,
			closeSuccessModal,
			formatDate,
			getLabOperatingHours,
			showReservationDetails,
			getSlotClass,
			getSlotText,
			isSlotOccupied,
			calculateSlotId,
			getSlotDetails,
			isSlotDisabled,
			handleSlotClick,
			showDetailsModal,
			reservationDetails,
			showReservationDetailsModal,
			closeReservationDetailsModal,
		}
	},
}
</script>
