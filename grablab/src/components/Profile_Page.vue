<style>
@import '@/assets/profile_styles.css';
</style>

<script setup>
import users from '@/data/users.js'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'


// To access router and go to other panels
const router = useRouter()
const route = useRoute()

// User ID routed
const currentUser = ref('')
const profileUser = ref('')
const isEditing = ref(false)
const editForm = ref({
  first_name: '',
  last_name: '',
  description: ''
})

// Condition Checks
const isOwnProfile = computed(() => {
  // Check if exists, then compare user_id
  return currentUser.value && profileUser.value && 
         currentUser.value.user_id === profileUser.value.user_id
})

const showEditControls = computed(() => {
  return isOwnProfile.value && isEditing.value
})

const showEditButton = computed(() => {
  return isOwnProfile.value && !isEditing.value
})

const showSaveCancel = computed(() => {
  return isOwnProfile.value && isEditing.value
})

const showDeleteAccount = computed(() => {
  return isOwnProfile.value
})

// Readonly input when not editing
const inputReadonly = computed(() => {
  return !isOwnProfile.value || !isEditing.value
})

// NavBar Functions
function handleLogout() {
  sessionStorage.removeItem('user')
  router.push('/login')
}

function handleHome() {
  if (currentUser.value.role === 'Technician') {
    router.push('/technician-dashboard')
  } else if (currentUser.value.role === 'Student') {
    router.push('/student-landing')
  } else {
    router.push('/')
  }
}

// Functions to handle page operations
function handleEditForm() {
  if (profileUser.value) {
    editForm.value = {
      first_name: profileUser.value.first_name,
      last_name: profileUser.value.last_name,
      description: profileUser.value.description || ''
    }
  }
}

// If not own profile, then can't edit 
function handleEditProfile() {
  if (!isOwnProfile.value) return
  isEditing.value = true
}

function handleSaveChanges() {
  // If not own profile, then can't proceed
  if (!isOwnProfile.value) return

  // Update the profile user data
  profileUser.value.first_name = editForm.value.first_name
  profileUser.value.last_name = editForm.value.last_name
  profileUser.value.description = editForm.value.description

  // Update session storage if it's the current user
  if (currentUser.value.user_id === profileUser.value.user_id) {
    // Spread operator to create new object (with all properties)
    currentUser.value = { ...profileUser.value }
    sessionStorage.setItem('user', JSON.stringify(currentUser.value))
  }

  // Backend na dito

  // Reset editing state
  isEditing.value = false
  
  // Show success message 
  console.log('Profile updated successfully')
}

function handleCancelEdit() {
  isEditing.value = false
  resetEditForm()
}

function handleDeleteAccount() {
  if (!isOwnProfile.value) return
  
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    // backend stuff here to delete account
    console.log('Account deleted successfully')
    // Clear session and redirect to login
    sessionStorage.removeItem('user')
    router.push('/login')
  }
}

function handleChangePicture() {
  if (!isOwnProfile.value) return
  
  // Handle profile picture change
  // This would typically open a file picker
  console.log('Change picture functionality')
}

function handleView() {
  // Gets current logged in user from session storage
  const user = sessionStorage.getItem('user')
  if (user) 
    currentUser.value = JSON.parse(user)

  // Get profile user ID from route (if viewing another profile)
  const userId = route.params.userId || currentUser.value.user_id

  // Find the user in the users list
  profileUser.value = users.find(user => user.user_id === userId)
  
  if (!profileUser.value) {
    // Handle where user is not found
    // router.push('/404') -- once we make a 404 page
    console.error('User not found')
    return
  }

  // Initialize edit form with profile data
  handleEditForm()
}

onMounted(() => {
  handleView()
})
</script>

<!-- User Profile Panel -->
<template>
  <div class="bg-sage min-h-screen">
    <!-- Header -->
    <header class="bg-forest-dark text-cream">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <p class="text-3xl font-bold font-jersey">GrabLab</p>
        <nav class="flex space-x-4 font-karma">
          <button @click="handleHome" class="hover:bg-forest-medium px-3 py-2 rounded transition-colors">
            Home
          </button>
          <button @click="handleLogout" class="hover:bg-forest-medium px-3 py-2 rounded transition-colors">
            Log Out
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8 max-w-4xl" v-if="profileUser">
      <!-- Profile Header Section -->
      <div class="bg-forest-medium text-cream rounded-lg p-8 mb-8 text-center">
        <h2 class="text-3xl font-bold mb-3 font-jersey">
          {{ isOwnProfile ? 'USER PROFILE' : `${profileUser.first_name}'S PROFILE` }}
        </h2>
        <p class="text-lg font-karma">
          {{ isOwnProfile ? 'Manage your account information and view your reservations' : 'View user information and details' }}
        </p>
      </div>

      <!-- Content Div -->
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Profile Information Card -->
        <div class="md:col-span-2 bg-cream rounded-lg shadow-lg p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-forest-dark font-karma">Profile Information</h3>
            <button v-if="showEditButton" @click="handleEditProfile"
              class="bg-forest-medium text-cream px-4 py-2 rounded-lg hover:bg-forest-dark transition-colors font-karma">
              Edit Profile
            </button>
          </div>

          <!-- Profile Picture Section -->
          <div class="flex items-center mb-6">
            <div class="w-24 h-24 bg-sage rounded-full flex items-center justify-center mr-6 relative overflow-hidden">
              <img v-if="profileUser.profile_pic_path" :src="profileUser.profile_pic_path" class="w-full h-full object-cover">
                <!-- SVG Placeholder if no picture set yet -->
              <svg v-else class="w-16 h-16 text-forest-medium" fill="currentColor" viewBox="0 0 24 24">
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
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-karma" readonly>
              </div>
              <div>
                <label class="block text-forest-dark font-semibold mb-2 font-karma">Email</label>
                <input type="email" :value="profileUser.email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-karma" readonly>
              </div>
            </div>

            <!-- First Name and Last Name div -->
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-forest-dark font-semibold mb-2 font-karma">First Name</label>
                <!-- Read-only when it is not your profile and when not in editing mode -->
                <input type="text" 
                v-model="editForm.first_name" 
                :readonly="inputReadonly" 
                :class="[
                  'w-full px-3 py-2 border border-gray-300 rounded-lg font-karma',
                  inputReadonly ? 'bg-white' : 'bg-gray-50']">
              </div>
              <div>
                <label class="block text-forest-dark font-semibold mb-2 font-karma">Last Name</label>
                <input type="text" 
                v-model="editForm.last_name" 
                :readonly="inputReadonly" 
                :class="[
                  'w-full px-3 py-2 border border-gray-300 rounded-lg font-karma',
                  inputReadonly ? 'bg-white' : 'bg-gray-50']">
              </div>
            </div>

            <!-- Role div (only show for other users) -->
            <div v-if="!isOwnProfile">
              <label class="block text-forest-dark font-semibold mb-2 font-karma">Role</label>
              <input type="text" :value="profileUser.role"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-karma" readonly>
            </div>

            <!-- Description div -->
            <div>
              <label class="block text-forest-dark font-semibold mb-2 font-karma">Description</label>
              <textarea rows="4" 
              v-model="editForm.description" 
              :readonly="inputReadonly" 
              :class="[
                'w-full px-3 py-2 border border-gray-300 rounded-lg resize-none font-karma',
                inputReadonly ? 'bg-white' : 'bg-gray-50']" 
              :placeholder="isOwnProfile ? 'Tell us about yourself...' : ''"></textarea>
            </div>

            <!-- Save / Edit Buttons -->
            <div v-if="showSaveCancel" class="flex space-x-4">
              <button @click="handleSaveChanges"
                class="bg-forest-medium text-cream px-6 py-2 rounded-lg hover:bg-forest-dark transition-colors font-karma">
                Save Changes
              </button>
              <button @click="handleCancelEdit"
                class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors font-karma">
                Cancel Edit
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- Account Stats -->
          <div class="bg-cream rounded-lg shadow-lg p-6">
            <h3 class="text-xl font-bold text-forest-dark mb-4 font-karma">Account Stats</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-forest-medium font-karma">Total Reservations:</span>
                <span class="font-semibold text-forest-dark font-karma">2</span>
              </div>
              <div class="flex justify-between">
                <span class="text-forest-medium font-karma">Active Reservations:</span>
                <span class="font-semibold text-forest-dark font-karma">2</span>
              </div>
              <div class="flex justify-between">
                <span class="text-forest-medium font-karma">Member Since:</span>
                <span class="font-semibold text-forest-dark font-karma">June 2023</span>
              </div>
              <div class="flex justify-between">
                <span class="text-forest-medium font-karma">Status:</span>
                <span class="font-semibold text-forest-dark font-karma">{{ profileUser.status }}</span>
              </div>
            </div>
          </div>

          <!-- Magic Button (Delete Account) - Only show for own profile not for other Users -->
          <div v-if="showDeleteAccount" class="bg-pink-100 border-3 border-pink-200 rounded-lg p-6">
            <h3 class="text-xl font-bold text-pink-600 mb-4 font-karma">Magic Button</h3>
            <p class="text-pink-600 text-sm mb-4 font-karma">Permanently delete your account and all associated data.
              This action cannot be undone.</p>
            <button @click="handleDeleteAccount"
              class="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-karma">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <!-- Current Reservations Section - Only show for own profile -->
       <!-- Check -->
      <div v-if="isOwnProfile" class="bg-cream rounded-lg shadow-lg p-6 mt-8">
        <h3 class="text-2xl font-bold text-forest-dark mb-6 font-karma">Current Reservations</h3>

        <!-- Horizontal Slider & Flexbox Cards -->
        <div class="overflow-x-auto">
          <div class="flex gap-4 min-w-max pb-4">
            <!-- Reservation Cards (same as before) -->
            <div class="bg-sage rounded-lg p-4 min-w-[250px]">
              <div class="mb-3">
                <h4 class="font-bold text-forest-dark text-lg font-karma">AG402</h4>
              </div>
              <div class="text-forest-dark text-sm space-y-1 font-karma">
                <p><strong>Date:</strong> June 14, 2025</p>
                <p><strong>Time:</strong> 2:00 - 4:00 PM</p>
                <p><strong>Slot:</strong> 15</p>
              </div>
              <button
                class="mt-3 w-full bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600 transition-colors font-karma">
                Cancel
              </button>
            </div>

            <div class="bg-sage rounded-lg p-4 min-w-[250px]">
              <div class="mb-3">
                <h4 class="font-bold text-forest-dark text-lg font-karma">AG403</h4>
              </div>
              <div class="text-forest-dark text-sm space-y-1 font-karma">
                <p><strong>Date:</strong> June 16, 2025</p>
                <p><strong>Time:</strong> 1:00 - 3:00 PM</p>
                <p><strong>Slot:</strong> 12</p>
              </div>
              <button
                class="mt-3 w-full bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600 transition-colors font-karma">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>