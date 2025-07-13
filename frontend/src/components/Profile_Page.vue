<style>
@import '@/assets/profile_styles.css';
</style>

<!-- User Profile Panel -->
<template>
	<div class="bg-sage min-h-screen">
		<!-- Header -->
		<div id="navbar">
			<span id="navbar-brand">GrabLab</span>
			<nav class="flex space-x-4 font-karma">
				<button @click="handleHome" id="home">Home</button>
				<button @click="handleLogout" id="logout">Log Out</button>
			</nav>
		</div>

		<!-- Background container with proper layering -->
		<div class="relative flex min-h-screen flex-col justify-center overflow-hidden">
			<!-- Background image layer -->
			<div
				class="absolute inset-0 bg-[url(@/assets/lab.png)] bg-center bg-cover blur-lg [mask-image:linear-gradient(180deg,green,rgba(0,255,0,0))] z-0">
			</div>

			<!-- Main Content Layer - positioned above background -->
			<div class="relative z-10 container mx-auto px-4 py-8 max-w-4xl" v-if="profileUser">
				<!-- Profile Header Section -->
				<div class="bg-forest-medium text-cream rounded-lg p-8 mb-8 text-center">
					<h2 class="text-3xl font-bold mb-3 font-jersey">
						{{
							isOwnProfile
								? 'USER PROFILE'
								: `${profileUser.first_name}'s Profile Page`
						}}
					</h2>
					<p class="text-lg font-karma">
						{{
							isOwnProfile
								? 'Manage your account information and view your reservations'
								: 'View user information and details'
						}}
					</p>
				</div>

				<!-- Content Div -->
				<!-- Conditional grid or flex layout based on own profile -->
				<div :class="isOwnProfile ? 'grid md:grid-cols-3 gap-8' : 'flex justify-center'">
					<!-- Profile Information Card -->
					<div :class="isOwnProfile
						? 'md:col-span-2 bg-cream rounded-lg shadow-lg p-6'
						: 'bg-cream rounded-lg shadow-lg p-6 w-full max-w-5xl'
						">
						<div class="flex justify-between items-center mb-6">
							<h3 class="text-2xl font-bold text-forest-dark font-karma">
								Profile Information
							</h3>
							<button v-if="showEditButton" @click="handleEditProfile"
								class="bg-forest-medium text-cream px-4 py-2 rounded-lg hover:bg-forest-dark transition-colors font-karma">
								Edit Profile
							</button>
						</div>

						<!-- Profile Picture Section -->
						<div class="flex items-center mb-6">
							<div
								class="w-24 h-24 bg-sage rounded-full flex items-center justify-center mr-6 relative overflow-hidden">
								<img v-if="profileUser.profile_pic_path"
									:src="getProfilePicUrl(profileUser.profile_pic_path)"
									class="w-full h-full object-cover" />
								<!-- SVG Placeholder if no picture set yet -->
								<svg v-else class="w-16 h-16 text-forest-medium" fill="currentColor"
									viewBox="0 0 24 24">
									<path
										d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
								</svg>
							</div>

							<!-- Name & Change pic handler -->
							<div>
								<h4 class="text-xl font-semibold text-forest-dark mb-2 font-karma">
									{{ profileUser.first_name }} {{ profileUser.last_name }}
								</h4>
								<!-- If its your profile, then you can change it -->
								<button v-if="isOwnProfile" @click="handleChangePicture"
									class="text-forest-medium hover:text-forest-dark transition-colors text-sm font-karma">
									Change Picture
								</button>
							</div>
						</div>

						<!-- Profile Form -->
						<div class="space-y-4">
							<div class="grid md:grid-cols-2 gap-4">
								<!-- User Role and Email div -->
								<div>
									<label class="block text-forest-dark font-semibold mb-2 font-karma">User ID</label>
									<input type="text" :value="profileUser.user_id"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-karma"
										readonly />
								</div>
								<div>
									<label class="block text-forest-dark font-semibold mb-2 font-karma">Email</label>
									<input type="email" :value="profileUser.email"
										class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-karma"
										readonly />
								</div>
							</div>

							<!-- First Name and Last Name div -->
							<div class="grid md:grid-cols-2 gap-4">
								<div>
									<label class="block text-forest-dark font-semibold mb-2 font-karma">First
										Name</label>
									<!-- Read-only when it is not your profile and when not in editing mode -->
									<input type="text" v-model="editForm.first_name" :readonly="inputReadonly" :class="[
										'w-full px-3 py-2 border border-gray-300 rounded-lg font-karma',
										inputReadonly ? 'bg-white' : 'bg-gray-50',
									]" />
								</div>
								<div>
									<label class="block text-forest-dark font-semibold mb-2 font-karma">Last
										Name</label>
									<input type="text" v-model="editForm.last_name" :readonly="inputReadonly" :class="[
										'w-full px-3 py-2 border border-gray-300 rounded-lg font-karma',
										inputReadonly ? 'bg-white' : 'bg-gray-50',
									]" />
								</div>
							</div>

							<!-- Role div (only show for other users) -->
							<div v-if="!isOwnProfile">
								<label class="block text-forest-dark font-semibold mb-2 font-karma">Role</label>
								<input type="text" :value="profileUser.role"
									class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-karma"
									readonly />
							</div>

							<!-- Description div -->
							<div>
								<label class="block text-forest-dark font-semibold mb-2 font-karma">Description</label>
								<textarea rows="4" v-model="editForm.description" :readonly="inputReadonly" :class="[
									'w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-karma',
									inputReadonly ? 'bg-white' : 'bg-gray-50',
								]" :placeholder="isOwnProfile ? 'Tell us about yourself...' : ''"></textarea>
							</div>

							<!-- Save / Edit Buttons -->
							<div v-if="showSaveCancel" class="flex space-x-4">
								<button @click="handleSaveChanges"
									class="bg-forest-medium text-cream px-6 py-2.5 rounded-lg hover:bg-forest-dark transition-colors font-karma">
									Save Changes
								</button>
								<button @click="handleCancelEdit"
									class="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-karma">
									Cancel Edit
								</button>
							</div>
						</div>
					</div>

					<!-- Sidebar - Only show for own profile -->
					<div v-if="isOwnProfile" class="align-middle space-y-12">
						<!-- Magic Button (Delete Account) - Only show for own profile not for other Users -->
						<div v-if="showDeleteAccount"
							class="bg-pink-100 border-3 border-pink-200 rounded-lg p-6 text-center">
							<h3 class="text-xl font-bold text-pink-600 mb-4 font-karma">
								Magic Button
							</h3>
							<p class="text-pink-600 text-sm mb-4 font-karma">
								Permanently delete your account and all associated data. This action
								cannot be undone.
							</p>
							<button @click="handleDeleteAccount"
								class="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-karma">
								Delete Account
							</button>
						</div>
					</div>
				</div>

				<!-- Current Reservations Section - Only show for own profile -->
				<div v-if="showReservations" class="bg-cream rounded-lg shadow-lg p-6 mt-8">
					<h3 class="text-2xl font-bold text-forest-dark mb-6 font-karma">
						Current Reservations
					</h3>

					<!-- Horizontal Slider & Flexbox Cards -->
					<div class="overflow-x-auto">
						<div v-if="userReservations.length > 0" class="flex gap-4 min-w-max pb-4">
							<!-- Dynamic Reservation Cards -->
							<div v-for="reservation in userReservations" :key="reservation.reservation_id"
								class="bg-sage rounded-lg p-4 min-w-[280px]">
								<div class="mb-3">
									<h4 class="font-bold text-forest-dark text-lg font-karma">
										{{ getLabName(reservation.lab_id) }}
									</h4>
									<span class="text-xs text-forest-medium font-karma">
										Reservation #{{ reservation.reservation_id }}
									</span>
								</div>
								<div class="text-forest-dark text-sm space-y-1 font-karma">
									<p>
										<strong>Date:</strong>
										{{ formatReservationDate(reservation.reservation_date) }}
									</p>
									<p>
										<strong>Time:</strong>
										{{ getTimeRangeForSlots(reservation.slots) }}
									</p>
									<p>
										<strong>Seats:</strong>
										{{
											reservation.slots
												.map((slot) => getSeatFromSlotId(slot.slot_id))
												.join(',')
										}}
									</p>
									<p>
										<strong>Status:</strong>
										<!-- Display Status -->
										<span :class="reservation.status === 'confirmed'
											? 'text-green-600'
											: 'text-yellow-600'
											">
											{{
												' ' +
												reservation.status.charAt(0).toUpperCase() +
												reservation.status.slice(1)
											}}
										</span>
									</p>
								</div>
								<div class="flex space-x-2 mt-3">
									<button @click="editReservation(reservation.reservation_id)"
										class="w-full bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 transition-colors font-karma">
										Edit
									</button>
									<button @click="cancelReservation(reservation.reservation_id)"
										class="w-full bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600 transition-colors font-karma">
										Cancel Reservation
									</button>
								</div>
							</div>
						</div>

						<!-- No reservations message -->
						<div v-else class="text-center py-8">
							<p class="text-forest-medium font-karma">
								No current reservations found.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Edit Reservation Modal -->
		<div v-if="showEditModal" class="fixed inset-0 modal-overlay flex items-center justify-center z-50">
			<div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
				<h2 class="font-jersey text-2xl text-grablab-primary mb-6 text-center">
					Edit Reservation
				</h2>

				<div v-if="editingReservation" class="space-y-4">
					<div>
						<label class="block text-forest-dark font-semibold mb-2 font-karma">Date</label>
						<input type="date" v-model="editingReservation.reservation_date"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg font-karma" />
					</div>
					<div>
						<label class="block text-forest-dark font-semibold mb-2 font-karma">Time</label>
						<p class="text-sm text-gray-600">Time editing is not yet available.</p>
					</div>
					<div>
						<label class="block text-forest-dark font-semibold mb-2 font-karma">Seats</label>
						<p class="text-sm text-gray-600">Seat editing is not yet available.</p>
					</div>
				</div>

				<div class="flex gap-3 mt-6">
					<button @click="saveReservation"
						class="flex-1 grablab-primary text-white py-3 rounded font-medium hover:opacity-90">
						Save Changes
					</button>
					<button @click="closeEditModal"
						class="flex-1 bg-gray-400 text-white py-3 rounded font-medium hover:bg-gray-500">
						Cancel
					</button>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<footer class="bg-forest-dark text-cream text-center p-4 font-bold">
			<div class="flex justify-center gap-2">
				<p>&copy; 2025 GrabLab. All rights reserved.<br /></p>
			</div>
		</footer>
	</div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users_store'
import { useLabsStore } from '@/stores/labs_store'
import { useReservationsStore } from '@/stores/reservations_store'

// Stores
const usersStore = useUsersStore()
const reservationsStore = useReservationsStore()
const labsStore = useLabsStore()

// To access router and go to other panels
const router = useRouter()
const route = useRoute()

// Reactive variables
const isEditing = ref(false)
const editForm = ref({
	first_name: '',
	last_name: '',
	description: '',
})

// User state from store
const currentUser = ref(null)
const profileUser = ref(null)

// Computed properties
const isOwnProfile = computed(() => {
	return currentUser.value && profileUser.value &&
		currentUser.value.user_id === profileUser.value.user_id
})

// Condition Checks
const showEditButton = computed(() => {
	return isOwnProfile.value && !isEditing.value
})
const showSaveCancel = computed(() => {
	return isOwnProfile.value && isEditing.value
})
const showDeleteAccount = computed(() => {
	return isOwnProfile.value
})
//Check if student and own profile to show reservations
const showReservations = computed(() => {
	return isOwnProfile.value && currentUser.value && currentUser.value.role === 'Student'
})
const inputReadonly = computed(() => {
	return !isOwnProfile.value || !isEditing.value
})

// Updated to use store data 
const userReservations = computed(() => {
	if (!currentUser.value) return []

	// Filter reservations from store for the current user
	return reservationsStore.reservations
		.filter((r) => r.user_id === currentUser.value.user_id && r.status === 'confirmed')
		.sort((a, b) => new Date(a.reservation_date) - new Date(b.reservation_date))
})

// Get lab name from labs data
const getLabName = (labId) => {
	const lab = labsStore.getLabById(labId)
	return lab ? lab.name : 'Unknown Lab'
}


// Navbar and profile actions
const handleLogout = () => {
	// Clear user session from store
	usersStore.clearUserSession()
	// Clear local state
	currentUser.value = null
	profileUser.value = null
	router.push('/login')
}

function handleHome() {
	if (currentUser.value?.role === 'Technician') {
		router.push('/technician-landing')
	} else if (currentUser.value?.role === 'Student') {
		router.push('/student-landing')
	} else {
		router.push('/')
	}
}

const showEditModal = ref(false)
const editingReservation = ref(null)

function editReservation(reservationId) {
	const reservation = userReservations.value.find((r) => r.reservation_id === reservationId)
	if (reservation) {
		editingReservation.value = { ...reservation }
		showEditModal.value = true
	}
}

async function saveReservation() {
	if (editingReservation.value) {
		try {
			// Use reservations store method for updating
			await reservationsStore.updateReservation(
				editingReservation.value.reservation_id,
				{ reservation_date: editingReservation.value.reservation_date }
			)

			console.log('Reservation updated successfully')
			closeEditModal()
		} catch (error) {
			console.error('Error updating reservation:', error)
			alert('Failed to update reservation. Please try again.')
		}
	}
}

function closeEditModal() {
	showEditModal.value = false
	editingReservation.value = null
}

// Functions to handle page operations
function handleEditForm() {
	if (profileUser.value) {
		editForm.value = {
			first_name: profileUser.value.first_name,
			last_name: profileUser.value.last_name,
			description: profileUser.value.description || '',
		}
	}
}

// If not own profile, then can't edit
function handleEditProfile() {
	if (!isOwnProfile.value) return
	isEditing.value = true
}

async function handleSaveChanges() {
	if (!isOwnProfile.value) return;

	try {
		// Prepare the data 
		const updateData = {
			fname: editForm.value.first_name,
			lname: editForm.value.last_name,
			description: editForm.value.description || ''
		};

		await usersStore.updateUserProfile(currentUser.value.user_id, updateData);

		// Update local data
		profileUser.value = {
			...profileUser.value,
			...updateData
		};

		isEditing.value = false;
	} catch (error) {
		console.error('Update error:', error);
		alert(error.message || 'Failed to update profile');
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
	if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
		try {
			await usersStore.deleteUserAccount(currentUser.value.user_id)
			console.log('Account deleted successfully')

			// Clear user session and redirect to login
			usersStore.clearUserSession()
			currentUser.value = null
			profileUser.value = null
			router.push('/login')
		} catch (error) {
			console.error('Error deleting account:', error)
			alert('Failed to delete account. Please try again.')
		}
	}
}

// Profile Picture Handling
const getProfilePicUrl = (profilePicPath) => {
  if (!profilePicPath) return null;
  
  // Local path
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3000${profilePicPath}`;
  }

  return profilePicPath;
};

async function handleChangePicture(event) {
	if (!isOwnProfile.value) return

	const file = event.target.files[0]
	if (!file) return

	try {
		await usersStore.updateUserProfilePicture(currentUser.value.user_id, file)
		console.log('Profile picture updated successfully')
	} catch (error) {
		console.error('Error updating profile picture:', error)
		alert('Failed to update profile picture. Please try again.')
	}
}

async function cancelReservation(reservationId) {
	if (!isOwnProfile.value) return
	if (confirm('Are you sure you want to cancel this reservation?')) {
		try {
			// Use reservations store method for canceling
			await reservationsStore.updateReservationStatus(reservationId, 'Cancelled')
			console.log(`Reservation ${reservationId} cancelled successfully`)
		} catch (error) {
			console.error('Error cancelling reservation:', error)
			alert('Failed to cancel reservation. Please try again.')
		}
	}
}

async function handleView() {
	try {
		// 1. Check authentication
		const user = sessionStorage.getItem('user');
		if (!user) {
			router.push('/login');
			return;
		}
		currentUser.value = JSON.parse(user);

		// 2. Determine which profile to view
		const userId = route.params.userId || currentUser.value.user_id;

		// 3. Fetch user data with proper error handling
		const userData = await usersStore.fetchUserById(userId);

		if (!userData) {
			throw new Error('User not found');
		}

		profileUser.value = userData;

		// 4. Fetch reservations if viewing own profile
		if (userId === currentUser.value.user_id && currentUser.value.role === 'Student') {
			await reservationsStore.fetchReservationsByUserId(userId);
		}

		// 5. Initialize edit form
		handleEditForm();

	} catch (error) {
		console.error('Profile load error:', error);

		// Redirect based on role
		const fallbackRoute = currentUser.value?.role === 'Technician'
			? '/technician-landing'
			: currentUser.value?.role === 'Student'
				? '/student-landing'
				: '/login';

		router.push(fallbackRoute);
	}
}

// Once DOM is loaded/mounted, handle the view
onMounted(() => {
	handleView()
})
</script>