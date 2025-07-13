<style scoped>
@import '@/assets/landing_page.css';
</style>

<template>
	<div id="app-bg" class="flex flex-col min-h-screen">
		<!-- Navbar -->
		<div id="navbar">
			<span id="navbar-brand">GrabLab</span>
			<div id="links">
				<router-link id="home" :to="isTechnician ? '/technician-landing' : '/student-landing'">Home</router-link>
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
					<select
						id="lab-input"
						class="search-input"
						v-model="selectedBuilding"
					>
						<option value="All">All</option>
						<option
							v-for="building in buildings"
							:key="building"
							:value="building"
						>
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
		<div v-if="isLoading" class=" text-center loading-message">
			Loading...
		</div>

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
							>{{ lab.operating_hours?.open || 'N/A' }} - {{ lab.operating_hours?.close || 'N/A' }}<br
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
				<p class="text-center error-message">No reservations found for user ID: {{ userIdFilter }}</p>
				<p class="text-center error-message">Try checking the ID number or viewing all reservations.</p>
			</div>

      <!-- Reservations Grid -->
			<div v-else class="reservations-grid">
				<div
					class="reservation-card"
					v-for="reservation in filteredReservations"
					:key="reservation._id"
				>
					<div class="reservation-card-header">
						Reservation #{{ reservation._id }}
					</div>
					<div class="reservation-info">
						<div>
							<span class="reservation-info-label">User ID: </span>
							<span class="reservation-info-value">{{ reservation.user?.email || 'Unknown User' }}</span>
						</div>
						<div>
							<span class="reservation-info-label">Lab: </span>
							<span class="reservation-info-value">{{
								reservation.lab_slot?.lab?.display_name || 'Unknown Lab'
							}}</span>
						</div>
						<div>
							<span class="reservation-info-label">Date: </span>
							<span class="reservation-info-value">{{
								formatDateTime(reservation.createdAt)
							}}</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
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
				await Promise.all([ // Fetch all labs
					labsStore.fetchAllLabs(),
					isTechnician.value ? reservationsStore.fetchReservations() : Promise.resolve() // Fetch reservations only if technician
				])
			} catch {
				error.value = 'Failed to load data. Please try again later.'
			} finally {
				isLoading.value = false
			}
		})

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
			if (isTechnician.value && newValue) {
				isLoading.value = true
				error.value = null
				try {
					await reservationsStore.fetchReservationsByUserId(newValue)
				} catch {
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
			return reservationsStore.reservations
		})

		const formatDateTime = (dateTime) => {
			return new Date(dateTime).toLocaleString()
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
			isLoading,
			error
		}
	},
}
</script>

