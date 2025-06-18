<template>
	<div id="app-bg" class="flex flex-col min-h-screen">
		<!-- Navbar -->
		<div id="navbar">
			<span id="navbar-brand">GrabLab</span>
			<div id="links">
                <a id="home" href="#" @click.prevent="handleHome">Home</a>
				<router-link id="profile" to="/profile">Profile</router-link>
				<a id="logout" href="#" @click.prevent="handleLogout">Log Out</a>
			</div>
		</div>

		<!-- Search and Filter -->
		<div id="search-filter">
			<div id="Title">
				<div id="Lab" class="filter-row">
					<label for="lab-input" id="lab" class="search-label">Building: </label>
					<select id="lab-input" class="search-input" v-model="selectedBuilding">
						<option value="All">All</option>
						<option v-for="building in uniqueBuildings" :key="building" :value="building">{{ building }}</option>
					</select>
				</div>
				<!-- Conditional ID number input -->
				<div v-if="isTechnician" id="ID" class="filter-row">
					<label for="number" class="search-label">ID number: </label>
					<input type="number" id="number" class="search-input" placeholder="Enter ID number" v-model="userIdFilter"/>
				</div>
				<button id="search-btn" @click="applyFilter">Search</button>
			</div>
		</div>

		<!-- Lab Slots Section (displayed when no user ID is specified or user is not a technician) -->
		<section id="lab-slots" class="mb-16" v-if="!isTechnician || userIdFilter === ''">
			<div class="lab-slots-grid">
				<div class="lab-card" v-for="lab in labs" :key="lab.lab_id">
					<div class="lab-card-header">{{ lab.display_name }}</div>
					<div class="lab-info">
						<span id="buildingName" class="lab-info-label">Building: </span>
						<span class="lab-info-value">{{ lab.building }}<br /></span>
						<span class="lab-info-label">Capacity: </span>
						<span id="CapacityNum" class="lab-info-value">{{ lab.capacity }}<br /></span>
						<span id="operatingHours" class="lab-info-label">Operating Hours: </span>
						<span id="OperatingHours" class="lab-info-value">{{ lab.operating_hours.open }} - {{ lab.operating_hours.close }}<br /></span>
						<span id="labStatus" class="lab-info-label">Status: </span>
						<span id="LabStatus" class="lab-info-value">{{ lab.status }}<br /></span>
					</div>
					<div class="lab-card-actions">
						<button class="lab-btn" @click="navigateToReservation(lab.lab_id)">View</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Reservations Section (only displayed when user ID is specified and user is a technician) -->
		<section id="reservations" class="mb-16 mt-10" v-if="isTechnician && userIdFilter !== '' && filteredReservations.length > 0">
			<div class="reservations-grid">
				<div class="reservation-card" v-for="reservation in filteredReservations" :key="reservation.reservation_id">
					<div class="reservation-card-header">Reservation #{{ reservation.reservation_id }}</div>
					<div class="reservation-info">
						<div>
							<span class="reservation-info-label">User ID: </span>
							<span class="reservation-info-value">{{ reservation.user_id }}</span>
						</div>
						<div>
							<span class="reservation-info-label">Lab: </span>
							<span class="reservation-info-value">{{ getLabName(reservation.lab_id) }}</span>
						</div>
						<div>
							<span class="reservation-info-label">Date: </span>
							<span class="reservation-info-value">{{ reservation.reservation_date }}</span>
						</div>
						<div>
							<span class="reservation-info-label">Status: </span>
							<span class="reservation-info-value">{{ reservation.status }}</span>
						</div>
						<div>
							<span class="reservation-info-label">Created At: </span>
							<span class="reservation-info-value">{{ formatDateTime(reservation.created_at) }}</span>
						</div>
						<div class="slots-section">
							<span class="reservation-info-label">Slots: </span>
							<ul class="slots-list">
								<li v-for="slot in reservation.slots" :key="slot.slot_id">
									{{ getSlotDetails(slot.slot_id) }}
								</li>
							</ul>
						</div>
					</div>
					<div class="reservation-card-actions">
						<button class="reservation-btn view-btn" @click="viewReservation(reservation.lab_id, reservation.reservation_id)">View</button>
						<button v-if="reservation.status !== 'cancelled'" class="reservation-btn cancel-btn" @click="cancelReservation(reservation.reservation_id)">Cancel</button>
						<button class="reservation-btn delete-btn" @click="deleteReservation(reservation.reservation_id)">Delete</button>
					</div>
				</div>
			</div>
		</section>

		<!-- No Results Message -->
		<section v-if="isTechnician && userIdFilter !== '' && filteredReservations.length === 0" class="mb-16 text-center">
			<div class="no-results-message">No reservations found for User ID: {{ userIdFilter }}</div>
		</section>

		<!-- Footer -->
		<footer class="bg-[#12372A] text-[#FBFADA] text-center p-4 text-sm font-bold fixed bottom-0 w-full">
			<div class="flex justify-center gap-2">
				<p>&copy; 2025 GrabLab. All rights reserved.<br /></p>
			</div>
		</footer>
	</div>
</template>

<script>
import { useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import labs from '../data/labs.js';
import reservations from '../data/reservations.js';
import slots from '../data/slots.js';

export default {
	name: 'StudentMain',
	setup() {
		const router = useRouter()
		const currentUser = ref(JSON.parse(sessionStorage.getItem('user')))
		const isTechnician = currentUser.value?.role === 'Technician'
		const userIdFilter = ref('');
		const selectedBuilding = ref('All');
		const uniqueBuildings = [...new Set(labs.map(lab => lab.building))];
		const filteredLabs = ref([...labs]);
		const filteredReservations = ref([]);
		
		// Debug the format of user_id values in reservations for reference
		console.log('Reservations user_id types:', reservations.map(r => ({ 
			id: r.user_id, 
			type: typeof r.user_id 
		})));

		const handleLogout = () => {
			sessionStorage.removeItem('user')
			router.push('/login')
		}

		const handleHome = () => {
			if (currentUser.value.role === 'Technician') {
				router.push('/technician-landing')
			} else if (currentUser.value.role === 'Student') {
				router.push('/student-landing')
			} else {
				router.push('/')
			}
		}

		// Function to filter reservations by user ID and technician's building
		const filterReservationsByUserId = () => {
			// If no user ID, don't show any reservations, just show labs
			if (userIdFilter.value === '') {
				filteredReservations.value = [];
				return;
			}

			// Convert to Number explicitly and handle potential NaN cases
			const userId = Number(userIdFilter.value);
			console.log('Filtering for user ID:', userId, 'Type:', typeof userId);
			
			if (isNaN(userId)) {
				console.log('Invalid user ID (NaN)');
				filteredReservations.value = [];
				return;
			}
			
			// First filter by user ID - ensure the comparison is by value not by type+value
			let results = reservations.filter(res => {
				console.log('Comparing reservation user_id:', res.user_id, 'Type:', typeof res.user_id, 'With input:', userId);
				return res.user_id === userId;
			});
			console.log('Found reservations:', results);
			
			// Then, if a building is selected, filter by lab_id that matches labs in that building
			if (selectedBuilding.value !== 'All') {
				const labsInBuilding = labs.filter(lab => lab.building === selectedBuilding.value)
					.map(lab => lab.lab_id);
				console.log('Labs in building:', labsInBuilding);
				
				results = results.filter(res => labsInBuilding.includes(res.lab_id));
				console.log('After building filter:', results);
			}
			
			filteredReservations.value = results;
			console.log('Final filtered reservations:', filteredReservations.value);
		};

		// Apply filters for both labs and reservations
		const applyFilter = () => {
			console.log('Apply filter called with building:', selectedBuilding.value);
			
			// Filter labs by building
			filteredLabs.value = selectedBuilding.value === 'All'
				? labs
				: labs.filter(lab => lab.building === selectedBuilding.value);
			
			console.log('Filtered labs:', filteredLabs.value);
			
			// Filter reservations if technician - always run this to update reservation list
			// when building selection changes
			if (isTechnician) {
				filterReservationsByUserId();
			}
		};

		const navigateToReservation = (labId) => {
			router.push({ path: `/reservation/${labId}` });
		};

		// Function to view a specific reservation in the Reservation.vue component
		const viewReservation = (labId, reservationId) => {
			router.push({ 
				path: `/reservation/${labId}`, 
				query: { reservation_id: reservationId } 
			});
		};

		// Function to cancel a reservation (change status to "cancelled")
		const cancelReservation = (reservationId) => {
			if (confirm(`Are you sure you want to cancel reservation #${reservationId}?`)) {
				// Find the reservation in the array
				const reservation = reservations.find(res => res.reservation_id === reservationId);
				
				if (reservation) {
					// Update the status to "cancelled"
					reservation.status = "cancelled";
					console.log(`Cancelled reservation #${reservationId}`);
					
					// Update the filtered reservations to reflect the change
					filterReservationsByUserId();
					
					// Show a success message
					alert(`Reservation #${reservationId} has been cancelled.`);
				}
			}
		};
		
		// Function to delete a reservation
		const deleteReservation = (reservationId) => {
			if (confirm(`Are you sure you want to delete reservation #${reservationId}?`)) {
				// Find the index of the reservation in the array
				const index = reservations.findIndex(res => res.reservation_id === reservationId);
				
				if (index !== -1) {
					// Remove the reservation from the array
					reservations.splice(index, 1);
					console.log(`Deleted reservation #${reservationId}`);
					
					// Update the filtered reservations to reflect the change
					filterReservationsByUserId();
					
					// Show a success message
					alert(`Reservation #${reservationId} has been deleted.`);
				}
			}
		};

		// Add watchers to automatically apply filters when selections change
		watch(selectedBuilding, () => {
			console.log('Building selection changed:', selectedBuilding.value);
			applyFilter();
		});
		
		watch(userIdFilter, () => {
			console.log('User ID filter changed:', userIdFilter.value);
			applyFilter();
		});

		// Helper function to get lab name from lab_id
		const getLabName = (labId) => {
			const lab = labs.find(l => l.lab_id === labId);
			return lab ? lab.display_name : `Lab #${labId}`;
		};

		// Helper function to format date and time
		const formatDateTime = (dateTimeStr) => {
			const date = new Date(dateTimeStr);
			return date.toLocaleString();
		};

		// Helper function to get slot details
		const getSlotDetails = (slotId) => {
			const slot = slots.find(s => s.slot_id === slotId);
			if (!slot) return `Slot #${slotId}`;
			
			return `Seat ${slot.seat_num} - ${slot.start_time} to ${slot.end_time}`;
		};

		return { 
			handleLogout, 
			handleHome, 
			isTechnician, 
			labs: filteredLabs, 
			selectedBuilding, 
			uniqueBuildings, 
			applyFilter, 
			navigateToReservation,
			userIdFilter,
			filteredReservations,
			getLabName,
			formatDateTime,
			getSlotDetails,
			viewReservation,
			deleteReservation,
			cancelReservation
		};
	},
	methods: {
		scrollToSearchFilter() {
			const el = document.getElementById('search-filter')
			if (el) {
				el.scrollIntoView({ behavior: 'smooth' })
			}
		},
	},
}
</script>

<style scoped>
@import '../assets/landing_page.css';

/* Styles for reservations are now in the landing_page.css file */
</style>
