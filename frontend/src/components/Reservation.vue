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
						<label class="block text-sm font-medium text-gray-700 mb-2">Lab Selector</label>
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
						<ul class="text-sm text-gray-600 mb-3 max-h-24 overflow-y-auto border p-2 rounded">
							<li v-for="slot in selectedSlots" :key="slot.identifier">
								Seat {{ slot.seat }} at {{ slot.timeSlot.startTime }} - {{ slot.timeSlot.endTime }}
							</li>
						</ul>

						<div class="space-y-3">
							<label class="flex items-center gap-2">
								<input type="checkbox" v-model="reserveAnonymously" />
								<span class="text-sm">Reserve Anonymously</span>
							</label>

							<div v-if="currentUser.user_type === 'technician'">
								<label class="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
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

						<!-- Loading indicator -->
						<div v-if="isLoadingSchedule" class="text-center py-12">
							<div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
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
							<div class="flex justify-between items-center mt-6 p-2 bg-gray-100 rounded-lg">
								<button
									@click="prevPage"
									:disabled="currentPage === 1"
									class="flex items-center gap-1 px-4 py-2 grablab-primary text-white rounded-lg font-medium hover:bg-grablab-primary transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
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
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
									</svg>
								</button>
							</div>
						</div>
					</div>
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
import { useSlotsStore } from '@/stores/slots_store'

const usersStore = useUsersStore()
const labsStore = useLabsStore()
const reservationsStore = useReservationsStore()
const slotsStore = useSlotsStore()
const router = useRouter()
const route = useRoute()

// Core reactive state
const selectedLab = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedSlots = ref([])
const reserveAnonymously = ref(false)
const studentIdForReservation = ref('')
const showConfirmModal = ref(false)
const showSuccessModal = ref(false)
const showDetailsModal = ref(false)
const showReservationDetailsModal = ref(false)

// Lab slots data
const labSlots = ref([])
const isLoadingSchedule = ref(false)

// Modals data
const confirmData = reactive({
  lab_id: null,
  date: null,
  slots: [],
  anonymous: false,
  student_id: null,
  user: {}
})

const reservationDetails = reactive({
  reservation_id: null,
  lab_id: null,
  date: null,
  slots: [],
  user: {}
})

// User data
const currentUser = ref(null)

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
watch(selectedLab, (newLabId) => {
  if (newLabId) {
    loadLabSchedule()
  }
}, { immediate: false })

watch(selectedDate, (newDate) => {
  if (selectedLab.value && newDate) {
    loadLabSchedule()
  }
})

// Component initialization
onMounted(async () => {
  try {
    // Initialize user
    currentUser.value = usersStore.currentUser || JSON.parse(sessionStorage.getItem('user') || '{}')
    
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
    if (labId) {
      const lab = allLabs.value.find(l => l._id === labId)
      if (lab) {
        selectedLab.value = labId
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
    
    // Fetch lab slots for the selected lab and date
    const response = await fetch(`http://localhost:3000/api/labslots/lab/${selectedLab.value}/date/${selectedDate.value}`)
    if (response.ok) {
      const data = await response.json()
      labSlots.value = data
    } else {
      // If no slots exist for this date, create them
      await createLabSlotsForDate(selectedLab.value, selectedDate.value)
    }
    
    // Load reservations for the selected lab and date
    if (currentUser.value?.user_id) {
      await reservationsStore.fetchReservationsByUserId(currentUser.value.user_id)
    }
    
    // Clear current selection
    clearSelection()
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
    const lab = allLabs.value.find(l => l._id === labId)
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
        time_slots: timeSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          reserved: null
        }))
      })
    }
    
    // Send to backend to create slots
    const response = await fetch('http://localhost:3000/api/labslots/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slots: slotsToCreate })
    })
    
    if (response.ok) {
      const data = await response.json()
      labSlots.value = data
    }
    
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
    const next = current + 1
    slots.push({
      startTime: formatTime(current),
      endTime: formatTime(next)
    })
    current = next
  }
  
  return slots
}

// Helper functions for time handling
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours + (minutes / 60)
}

const formatTime = (timeDecimal) => {
  const hours = Math.floor(timeDecimal)
  const minutes = Math.round((timeDecimal - hours) * 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Lab information getters
const getLabName = (labId) => {
  if (!labId) return 'No Lab Selected'
  const lab = allLabs.value.find(l => l._id === labId)
  return lab ? lab.display_name : 'Unknown Lab'
}

const getLabOperatingHours = (labId) => {
  if (!labId) return 'N/A'
  const lab = allLabs.value.find(l => l._id === labId)
  if (!lab || !lab.operating_hours) return 'N/A'
  return `${lab.operating_hours.open} - ${lab.operating_hours.close}`
}

// Seats and pagination
const getSeatsForLab = (labId) => {
  if (!labId) return []
  const lab = allLabs.value.find(l => l._id === labId)
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
  const lab = allLabs.value.find(l => l._id === selectedLab.value)
  if (!lab) return 1
  return Math.ceil(lab.capacity / seatsPerPage)
})

// Time slots management
const getTimeSlotsByFilter = (timeSlots) => {
  if (timeFilter.value === 'Morning') {
    return timeSlots.filter(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0])
      return startHour >= 7 && startHour < 12
    })
  } else if (timeFilter.value === 'Afternoon') {
    return timeSlots.filter(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0])
      return startHour >= 12 && startHour < 18
    })
  } else if (timeFilter.value === 'Evening') {
    return timeSlots.filter(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0])
      return startHour >= 18 && startHour <= 19
    })
  }
  return timeSlots
}

const filteredTimeSlots = computed(() => {
  if (!selectedLab.value || labSlots.value.length === 0) return []
  
  const lab = allLabs.value.find(l => l._id === selectedLab.value)
  if (!lab) return []
  
  const timeSlots = generateTimeSlots(lab.operating_hours)
  return getTimeSlotsByFilter(timeSlots)
})

// Slot occupation checking
const isSlotOccupied = (seatNumber, timeSlot) => {
  if (!selectedLab.value || !selectedDate.value) return false
  
  const seatSlot = labSlots.value.find(slot => 
    slot.seat_number === seatNumber && 
    slot.lab === selectedLab.value &&
    new Date(slot.date).toDateString() === new Date(selectedDate.value).toDateString()
  )
  
  if (!seatSlot) return false
  
  const timeSlotData = seatSlot.time_slots.find(ts => 
    ts.startTime === timeSlot.startTime && ts.endTime === timeSlot.endTime
  )
  
  return timeSlotData?.reserved !== null
}

// Slot interaction functions
const toggleSlotSelection = (seat, timeSlot) => {
  if (isSlotOccupied(seat, timeSlot)) return
  
  const slotIdentifier = `${seat}-${timeSlot.startTime}`
  const index = selectedSlots.value.findIndex(s => s.identifier === slotIdentifier)
  
  if (index === -1) {
    selectedSlots.value.push({ 
      seat, 
      timeSlot, 
      identifier: slotIdentifier,
      time: timeSlot.startTime 
    })
  } else {
    selectedSlots.value.splice(index, 1)
  }
}

const handleSlotClick = (seat, timeSlot) => {
  if (isSlotOccupied(seat, timeSlot)) {
    showReservationDetails(seat, timeSlot)
  } else {
    toggleSlotSelection(seat, timeSlot)
  }
}

const getSlotClass = (seat, timeSlot) => {
  const slotIdentifier = `${seat}-${timeSlot.startTime}`
  const isSelected = selectedSlots.value.some(s => s.identifier === slotIdentifier)
  const isOccupied = isSlotOccupied(seat, timeSlot)
  
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
  const isSelected = selectedSlots.value.some(s => s.identifier === slotIdentifier)
  
  if (isOccupied) {
    return 'Occupied'
  } else if (isSelected) {
    return 'Selected'
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
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goBack = () => {
  selectedLab.value = ''
  selectedSlots.value = []
  router.push('/view')
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
  // Filter selected slots based on new time filter
  selectedSlots.value = selectedSlots.value.filter(slot => {
    const startHour = parseInt(slot.timeSlot.startTime.split(':')[0])
    if (filter === 'Morning' && startHour >= 7 && startHour < 12) return true
    if (filter === 'Afternoon' && startHour >= 12 && startHour < 18) return true
    if (filter === 'Evening' && startHour >= 18 && startHour <= 19) return true
    return false
  })
}

// Reservation functions
const reserveSlot = () => {
  if (selectedSlots.value.length === 0 || !selectedLab.value) {
    alert('Please select at least one slot')
    return
  }
  
  Object.assign(confirmData, {
    lab_id: selectedLab.value,
    date: selectedDate.value,
    slots: selectedSlots.value.map(slot => ({
      seat: slot.seat,
      timeSlot: slot.timeSlot,
      time: slot.time
    })),
    anonymous: reserveAnonymously.value,
    student_id: currentUser.value?.user_type === 'technician' 
      ? studentIdForReservation.value 
      : currentUser.value?.user_id
  })
  
  showConfirmModal.value = true
}

const confirmReservation = async () => {
  try {
    const payload = {
      user_id: confirmData.student_id,
      lab_id: confirmData.lab_id,
      reservation_date: confirmData.date,
      slots: confirmData.slots.map(slot => ({
        seat_number: slot.seat,
        start_time: slot.timeSlot.startTime,
        end_time: slot.timeSlot.endTime
      })),
      anonymous: confirmData.anonymous
    }
    
    const response = await fetch('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    
    if (response.ok) {
      await reservationsStore.fetchReservationsByUserId(currentUser.value?.user_id || '')
      await loadLabSchedule() // Refresh the schedule
      
      closeConfirmModal()
      clearSelection()
      showSuccessModal.value = true
    } else {
      const error = await response.json()
      alert(`Failed to create reservation: ${error.message}`)
    }
    
  } catch (error) {
    console.error('Error creating reservation:', error)
    alert('Failed to create reservation. Please try again.')
  }
}

// Modal functions
const closeConfirmModal = () => {
  showConfirmModal.value = false
  Object.keys(confirmData).forEach(key => {
    if (typeof confirmData[key] === 'object' && confirmData[key] !== null) {
      if (Array.isArray(confirmData[key])) {
        confirmData[key] = []
      } else {
        confirmData[key] = {}
      }
    } else {
      confirmData[key] = null
    }
  })
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const showReservationDetails = (seat, timeSlot) => {
  const seatSlot = labSlots.value.find(slot => 
    slot.seat_number === seat && 
    slot.lab === selectedLab.value &&
    new Date(slot.date).toDateString() === new Date(selectedDate.value).toDateString()
  )
  
  if (!seatSlot) return
  
  const timeSlotData = seatSlot.time_slots.find(ts => 
    ts.startTime === timeSlot.startTime && ts.endTime === timeSlot.endTime
  )
  
  if (timeSlotData?.reserved) {
    const reservation = reservationsStore.reservations.find(r => r._id === timeSlotData.reserved)
    if (reservation) {
      Object.assign(reservationDetails, {
        reservation_id: reservation._id,
        lab_id: selectedLab.value,
        date: selectedDate.value,
        slots: [{ seat, timeSlot }],
        user: {
          user_id: reservation.user_id,
          name: reservation.user?.name || `User ${reservation.user_id}`,
          email: reservation.user?.email || `user${reservation.user_id}@dlsu.edu.ph`
        }
      })
      showReservationDetailsModal.value = true
    }
  }
}

const closeReservationDetailsModal = () => {
  showReservationDetailsModal.value = false
}

const removeReservation = async (reservationId) => {
  if (confirm('Are you sure you want to cancel this reservation?')) {
    try {
      await reservationsStore.deleteReservation(reservationId)
      await reservationsStore.fetchReservationsByUserId(currentUser.value?.user_id || '')
      await loadLabSchedule() // Refresh the schedule
      closeReservationDetailsModal()
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      alert('Failed to cancel reservation. Please try again.')
    }
  }
}

</script>