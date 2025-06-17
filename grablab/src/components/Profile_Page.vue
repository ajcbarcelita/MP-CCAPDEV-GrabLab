<style>
@import '@/assets/profile_styles.css';
</style>

<script setup>
import { handleHome } from '@/scripts/profile_script.js'
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

        <!-- Sidebar -->
        <div class="align-middle space-y-12">
          <!-- Magic Button (Delete Account) - Only show for own profile not for other Users -->
          <div v-if="showDeleteAccount" class="bg-pink-100 border-3 border-pink-200 rounded-lg p-6 text-center">
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
      <div v-if="isOwnProfile" class="bg-cream rounded-lg shadow-lg p-6 mt-8">
        <h3 class="text-2xl font-bold text-forest-dark mb-6 font-karma">Current Reservations</h3>

        <!-- Horizontal Slider & Flexbox Cards -->
        <div class="overflow-x-auto">
          <div v-if="userReservations.length > 0" class="flex gap-4 min-w-max pb-4">
            <!-- Dynamic Reservation Cards -->
            <div v-for="reservation in userReservations" 
                 :key="reservation.reservation_id"
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
                <p><strong>Date:</strong> {{ formatReservationDate(reservation.reservation_date) }}</p>
                <p><strong>Time:</strong> {{ getTimeRangeForSlots(reservation.slots) }}</p>
                <p><strong>Seats:</strong> {{ reservation.slots.map(slot => getSeatFromSlotId(slot.slot_id)).join(', ') }}</p>
                <p><strong>Status:</strong> 
                  <span :class="reservation.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'">
                    {{ reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1) }}
                  </span>
                </p>
              </div>
              <button @click="cancelReservation(reservation.reservation_id)"
                class="mt-3 w-full bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600 transition-colors font-karma">
                Cancel Reservation
              </button>
            </div>
          </div>
          
          <!-- No reservations message -->
          <div v-else class="text-center py-8">
            <p class="text-forest-medium font-karma">No current reservations found.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>