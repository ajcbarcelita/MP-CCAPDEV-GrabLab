<style scoped>
@import '@/assets/landing_page.css';
</style>

<template>
	<div id="app-bg" class="flex flex-col min-h-screen">
		<!-- Navbar -->
		<div id="navbar">
			<span id="navbar-brand">GrabLab</span>
			<div id="links">
				<router-link
					id="home"
					:to="isTechnician ? '/technician-landing' : '/student-landing'"
					>Home</router-link
				>
				<router-link id="profile" to="/profile">Profile</router-link>
				<router-link id="logout" to="/" @click="handleLogout">Log Out</router-link>
			</div>
		</div>

		<!-- Error Message -->
		<div v-if="error" class="text-center">
			{{ error }}
		</div>

		<!-- Search and Filter -->
		<div id="search-filter">
			<div id="Title">
				<div id="Lab" class="filter-row">
					<label for="lab-input" id="lab" class="search-label">Building: </label>
					<select id="lab-input" class="search-input" v-model="selectedBuilding">
						<option value="All">All</option>
						<option v-for="building in buildings" :key="building" :value="building">
							{{ building }}
						</option>
					</select>
				</div>
				<!-- Conditional ID number input -->
				<div v-if="isTechnician" id="ID" class="filter-row">
					<label for="number" class="search-label">ID number: </label>
					<input
						type="number"
						id="number"
						class="search-input"
						placeholder="Enter User ID number"
						v-model="userIdFilter"
					/>
				</div>
			</div>
		</div>

		<!-- Loading State -->
		<div v-if="isLoading" class="text-center loading-message">Loading...</div>

		<!-- Lab Slots Section -->
		<section id="lab-slots" class="mb-16" v-else-if="!isTechnician || userIdFilter === ''">
			<!-- No Labs Message -->
			<div v-if="!isLoading && labs.length === 0" class="no-data-message">
				<p v-if="selectedBuilding === 'All'">No labs are available at the moment.</p>
				<p v-else>No labs found in {{ selectedBuilding }}.</p>
			</div>
			<!-- Labs Grid -->
			<!-- Display labs in a grid -->
			<div v-else class="lab-slots-grid">
				<div class="lab-card" v-for="lab in labs" :key="lab._id">
					<div class="lab-card-header">{{ lab.display_name }}</div>
					<div class="lab-info">
						<span id="buildingName" class="lab-info-label">Building: </span>
						<span class="lab-info-value">{{ lab.building }}<br /></span>
						<span class="lab-info-label">Capacity: </span>
						<span id="CapacityNum" class="lab-info-value"
							>{{ lab.capacity }}<br
						/></span>
						<span id="operatingHours" class="lab-info-label">Operating Hours: </span>
						<span id="OperatingHours" class="lab-info-value"
							>{{ lab.operating_hours?.open || 'N/A' }} -
							{{ lab.operating_hours?.close || 'N/A' }}<br
						/></span>
						<span id="labStatus" class="lab-info-label">Status: </span>
						<span id="LabStatus" class="lab-info-value">{{ lab.status }}<br /></span>
					</div>
					<div class="lab-card-actions">
						<button class="lab-btn" @click="navigateToReservation(lab._id)">
							View
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Reservations Section -->
		<section
			id="reservations"
			class="mb-16 mt-10"
			v-else-if="isTechnician && userIdFilter !== ''"
		>
			<!-- No Reservations Message -->
			<div v-if="!isLoading && filteredReservations.length === 0" class="no-data-message">
				<p class="text-center error-message">
					No reservations found for user ID: {{ userIdFilter }}
				</p>
				<p class="text-center error-message">
					Try checking the ID number or viewing all reservations.
				</p>
			</div>

			<!-- Reservations Grid -->
			<div
				v-else
				class="reservations-grid flex flex-col items-center max-w-60 mx-w-4xl mx-auto"
			>
				<div
					class="reservation-card align-middle reservation-card-scrollable"
					v-for="reservation in filteredReservations"
					:key="reservation._id"
				>
					<div class="reservation-card-header">Reservation #{{ reservation._id }}</div>
					<div class="reservation-info">
						<div>
							<span class="reservation-info-label">User Name: </span>
							<span class="reservation-info-value"
								>{{ reservation.user?.fname || 'Unknown' }}
								{{ reservation.user?.lname || '' }}</span
							>
						</div>
						<div>
							<span class="reservation-info-label">User Email: </span>
							<span class="reservation-info-value">{{
								reservation.user?.email || 'Unknown Email'
							}}</span>
						</div>
						<div>
							<span class="reservation-info-label">Lab: </span>
							<span class="reservation-info-value">{{
								reservation.lab_id?.display_name ||
								reservation.lab_id?.name ||
								'Unknown Lab'
							}}</span>
						</div>
						<div>
							<span class="reservation-info-label">Time Slots: </span>
							<span class="reservation-info-value">
								<div v-if="reservation.slots && reservation.slots.length > 0">
									<div
										v-for="(slot, index) in reservation.slots"
										:key="index"
										class="text-center"
									>
										Seat {{ slot.seat_number }}: {{ slot.start_time }} -
										{{ slot.end_time }}
									</div>
								</div>
								<div v-else>No time slots available</div>
							</span>
						</div>
						<div>
							<span class="reservation-info-label">Status: </span>
							<span class="reservation-info-value">{{ reservation.status }}</span>
						</div>
						<div>
							<span class="reservation-info-label">Created Date: </span>
							<span class="reservation-info-value">{{
								formatDateTime(reservation.createdAt)
							}}</span>
						</div>
						<div>
							<span class="reservation-info-label">Updated Date: </span>
							<span class="reservation-info-value">{{
								formatDateTime(reservation.updatedAt)
							}}</span>
						</div>
						<div>
							<span class="reservation-info-label">Reservation Date: </span>
							<span class="reservation-info-value">{{
								formatDateTime(reservation.reservation_date)
							}}</span>
						</div>
					</div>
					<div class="reservation-card-actions flex justify-center items-center gap-4">
						<button
							class="edit-btn btn-primary bg-blue-500 text-white px-4 py-2"
							@click="editReservation(reservation._id)"
						>
							Edit
						</button>
						<button
							class="delete-btn btn-danger bg-red-500 px-4 py-2"
							@click="deleteReservation(reservation._id)"
						>
							Delete
						</button>
					</div>
				</div>
			</div>
		</section>
	</div>
	<!-- Footer -->
	<footer class="bg-[#12372A] text-[#FBFADA] text-center p-4 font-bold">
		<div class="flex justify-center gap-2">
			<p>&copy; 2025 GrabLab. All rights reserved.<br /></p>
		</div>
	</footer>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLabsStore } from '@/stores/labs_store'
import { useReservationsStore } from '@/stores/reservations_store'
import { useUsersStore } from '@/stores/users_store'

export default {
	name: 'ViewScript',
	setup() {
		const router = useRouter()
		const labsStore = useLabsStore()
		const reservationsStore = useReservationsStore()

		const selectedBuilding = ref('All')
		const userIdFilter = ref('')

		// Extract unique buildings from labs data using store getter
		const buildings = computed(() => {
			return labsStore.getAllUniqueBuildings
		})

		// Check if user is technician based on session storage
		const isTechnician = computed(() => {
			const user = JSON.parse(sessionStorage.getItem('user') || '{}')
			return user?.role === 'Technician'
		})
		// Reactive state for loading and error handling
		const isLoading = ref(false)
		const error = ref(null)

		// Fetch initial data
		// This works by checking if the user is logged in and then fetching labs and reservations
		onMounted(async () => {
			// Check if user is logged in
			const user = JSON.parse(sessionStorage.getItem('user') || '{}')
			if (!user.role) {
				router.push('/')
				return
			}

			isLoading.value = true
			error.value = null
			try {
				await Promise.all([
					// Fetch all labs
					labsStore.fetchAllLabs(),
					isTechnician.value ? reservationsStore.fetchReservations() : Promise.resolve(), // Fetch reservations only if technician
				])
			} catch {
				error.value = 'Failed to load data. Please try again later.'
			} finally {
				isLoading.value = false
			}
		})

		// Watch for route changes to refresh data when returning from editing
		watch(
			() => router.currentRoute.value.path,
			async (newPath) => {
				if (newPath === '/view' && isTechnician.value && userIdFilter.value) {
					isLoading.value = true
					error.value = null
					try {
						await reservationsStore.fetchReservationsByUserId(userIdFilter.value)
					} catch (err) {
						console.error('Error refreshing reservations:', err)
						error.value = 'Failed to refresh reservations. Please try again later.'
					} finally {
						isLoading.value = false
					}
				}
			},
		)

		// Watch for building selection changes - only fetch all labs when needed
		// Watch makes it reactive to changes in selectedBuilding
		watch(selectedBuilding, async (newValue) => {
			if (newValue === 'All') {
				isLoading.value = true
				error.value = null
				try {
					await labsStore.fetchAllLabs()
				} catch {
					error.value = 'Failed to load labs. Please try again later.'
				} finally {
					isLoading.value = false
				}
			}
		})

		// Watch for user ID filter changes
		watch(userIdFilter, async (newValue) => {
			console.log('User ID filter changed:', newValue) // Debugging log
			if (isTechnician.value && newValue) {
				isLoading.value = true
				error.value = null
				try {
					await reservationsStore.fetchReservationsByUserId(newValue)
				} catch (err) {
					console.error('Error fetching reservations by user ID:', err)
					error.value = 'Failed to load reservations. Please try again later.'
				} finally {
					isLoading.value = false
				}
			}
		})

		//Get the Labs using Getters on Lab Store
		// Used for displaying labs based on selected building
		// This is reactive to changes in selectedBuilding
		const labs = computed(() => {
			if (selectedBuilding.value === 'All') {
				return labsStore.labs
			} else {
				return labsStore.getLabsByBuilding(selectedBuilding.value)
			}
		})

		const filteredReservations = computed(() => {
			// First, filter out any reservations with "Deleted" status
			const activeReservations = reservationsStore.reservations.filter(
				(res) => res.status !== 'Deleted',
			)

			// Then apply building filter if needed
			if (selectedBuilding.value === 'All') {
				return activeReservations
			} else {
				// Filter reservations by the selected building
				return activeReservations.filter((reservation) => {
					const building = reservation.lab_id?.building
					console.log(
						'Reservation lab building:',
						building,
						'Selected building:',
						selectedBuilding.value,
					)
					return building === selectedBuilding.value
				})
			}
		})

		const formatDateTime = (dateTime) => {
			return new Date(dateTime).toLocaleString()
		}

		// Function to format time slots
		const formatTimeSlot = (slot) => {
			// Check if slot has startTime and endTime properties
			if (slot && slot.startTime && slot.endTime) {
				// Format time in 12-hour format with AM/PM
				const formatTime = (timeStr) => {
					const [hours, minutes] = timeStr.split(':').map(Number)
					const period = hours >= 12 ? 'PM' : 'AM'
					const hour12 = hours % 12 || 12 // Convert 0 to 12 for 12 AM
					return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
				}

				return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
			}
			// Check if it has start_time and end_time (alternate naming)
			else if (slot && slot.start_time && slot.end_time) {
				// Format time in 12-hour format with AM/PM
				const formatTime = (timeStr) => {
					const [hours, minutes] = timeStr.split(':').map(Number)
					const period = hours >= 12 ? 'PM' : 'AM'
					const hour12 = hours % 12 || 12 // Convert 0 to 12 for 12 AM
					return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
				}

				return `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
			}
			// Just display the ID if that's all we have
			else if (typeof slot === 'string' || (slot && slot._id)) {
				return `Time Slot #${typeof slot === 'string' ? slot.substring(slot.length - 6) : slot._id.toString().substring(slot._id.toString().length - 6)}`
			} else {
				return 'Time slot details not available'
			}
		}

		// Navigation handlers
		const handleLogout = () => {
			useUsersStore.clearUserSession()
			router.push('/')
		}

		const navigateToReservation = (labId) => {
			router.push(`/reservation/${labId}`)
			console.log(`Navigating to reservation for lab ID: ${labId}`)
		}

		// Handle editing a reservation
		const editReservation = async (reservationId) => {
			// Navigate to reservation page with both lab ID and reservation ID
			const reservation = reservationsStore.reservations.find((r) => r._id === reservationId)
			if (reservation) {
				const labId =
					typeof reservation.lab_id === 'object'
						? reservation.lab_id._id
						: reservation.lab_id
				router.push(`/reservation/${labId}/${reservationId}`)
			}
		}

		// Handle deleting a reservation
		const deleteReservation = async (reservationId) => {
			if (confirm('Are you sure you want to delete this reservation?')) {
				isLoading.value = true
				error.value = null
				try {
					// Use the store's deleteReservation action
					await reservationsStore.deleteReservation(reservationId)
					console.log(`Reservation ${reservationId} marked as deleted successfully`)
				} catch (err) {
					console.error('Error deleting reservation:', err)
					error.value = 'Failed to delete reservation. Please try again later.'
				} finally {
					isLoading.value = false
				}
			}
		}

		return {
			handleLogout,
			isTechnician,
			labs,
			selectedBuilding,
			buildings,
			navigateToReservation,
			userIdFilter,
			filteredReservations,
			formatDateTime,
			formatTimeSlot,
			isLoading,
			error,
			editReservation,
			deleteReservation,
		}
	},
}
</script>
