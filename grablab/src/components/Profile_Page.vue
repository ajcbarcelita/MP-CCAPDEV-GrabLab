<template>
  <div class="bg-sage min-h-screen">
    <!-- Header -->
    <header class="bg-forest-dark text-cream">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <p class="text-3xl font-bold font-jersey">GrabLab</p>
        <nav class="flex space-x-4 font-karma">
          <button class="hover:bg-forest-medium px-3 py-2 rounded transition-colors">
            Home
          </button>
          <button class="hover:bg-forest-medium px-3 py-2 rounded transition-colors">
            Log Out
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Profile Header Section -->
      <div class="bg-forest-medium text-cream rounded-lg p-8 mb-8 text-center">
        <h2 class="text-3xl font-bold mb-3 font-jersey">USER PROFILE</h2>
        <p class="text-lg font-karma">Manage your account information and view your reservations</p>
      </div>

      <!-- Content Div -->
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Profile Information Card -->
        <div class="md:col-span-2 bg-cream rounded-lg shadow-lg p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-forest-dark font-karma">Profile Information</h3>
            <button
              class="bg-forest-medium text-cream px-4 py-2 rounded-lg hover:bg-forest-dark transition-colors font-karma">
              Edit Profile
            </button>
          </div>

          <!-- Profile Picture Section -->
          <div class="flex items-center mb-6">
            <div class="w-24 h-24 bg-sage rounded-full flex items-center justify-center mr-6 relative overflow-hidden">
              <svg class="w-16 h-16 text-forest-medium" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <h4 class="text-xl font-semibold text-forest-dark mb-2 font-karma">Josh Cariaga</h4>
              <button class="text-forest-medium hover:text-forest-dark transition-colors text-sm font-karma">
                Change Picture
              </button>
            </div>
          </div>

          <!-- Profile Form -->
          <div class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <!-- Student ID and Email div -->
              <div>
                <label class="block text-forest-dark font-semibold mb-2 font-karma">Student ID</label>
                <input type="text" value="12306592"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-karma" readonly>
              </div>
              <div>
                <label class="block text-forest-dark font-semibold mb-2 font-karma">Email</label>
                <input type="email" value="josh_cariaga@dlsu.edu.ph"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-karma" readonly>
              </div>
            </div>

            <!-- First Name and Last Name div -->
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-forest-dark font-semibold mb-2 font-karma">First Name</label>
                <input type="text" value="Josh"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-karma" readonly>
              </div>
              <div>
                <label class="block text-forest-dark font-semibold mb-2 font-karma">Last Name</label>
                <input type="text" value="Cariaga"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-karma" readonly>
              </div>
            </div>

            <!-- Description div -->
            <div>
              <label class="block text-forest-dark font-semibold mb-2 font-karma">Description</label>
              <textarea rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white resize-none font-karma" readonly
                placeholder="Tell us about yourself..."></textarea>
            </div>

            <!-- Save / Edit -->
            <!-- To be changed when implementing Javascript -->
            <div class="flex space-x-4">
              <button
                class="bg-forest-medium text-cream px-6 py-2 rounded-lg hover:bg-forest-dark transition-colors font-karma">
                Save Changes
              </button>
              <button
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
                <span class="font-semibold text-forest-dark font-karma">15</span>
              </div>
              <div class="flex justify-between">
                <span class="text-forest-medium font-karma">Active Reservations:</span>
                <span class="font-semibold text-forest-dark font-karma">2</span>
              </div>
              <div class="flex justify-between">
                <span class="text-forest-medium font-karma">Member Since:</span>
                <span class="font-semibold text-forest-dark font-karma">June 2023</span>
              </div>
            </div>
          </div>

          <!-- Magic Button (Delete Account) -->
          <div class="bg-pink-100 border border-pink-200 rounded-lg p-6">
            <h3 class="text-xl font-bold text-pink-600 mb-4 font-karma">Magic Button</h3>
            <p class="text-pink-600 text-sm mb-4 font-karma">Permanently delete your account and all associated data.
              This action cannot be undone.</p>
            <button
              class="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-karma">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <!-- Current Reservations Section -->
      <div class="bg-cream rounded-lg shadow-lg p-6 mt-8">
        <h3 class="text-2xl font-bold text-forest-dark mb-6 font-karma">Current Reservations</h3>

        <!-- Horizontal Slider & Flexbox Cards -->
        <div class="overflow-x-auto">
          <div class="flex gap-4 min-w-max pb-4">
            
            <!-- Reservation Card 1 -->
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

            <!-- Reservation Card 2 -->
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

            <!-- Placeholder -->
            <div class="bg-sage rounded-lg p-4 min-w-[250px]">
              <div class="mb-3">
                <h4 class="font-bold text-forest-dark text-lg font-karma">AG604</h4>
              </div>
              <div class="text-forest-dark text-sm space-y-1 font-karma">
                <p><strong>Date:</strong> June 17, 2025</p>
                <p><strong>Time:</strong> 1:00 - 3:00 PM</p>
                <p><strong>Slot:</strong> 19</p>
              </div>
              <button
                class="mt-3 w-full bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600 transition-colors font-karma">
                Cancel
              </button>
            </div>

            <!-- Placeholder -->
            <div class="bg-sage rounded-lg p-4 min-w-[250px]">
              <div class="mb-3">
                <h4 class="font-bold text-forest-dark text-lg font-karma">AG123</h4>
              </div>
              <div class="text-forest-dark text-sm space-y-1 font-karma">
                <p><strong>Date:</strong> June 18, 2025</p>
                <p><strong>Time:</strong> 1:00 - 3:00 PM</p>
                <p><strong>Slot:</strong> 13</p>
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

<style>
@import url('https://fonts.googleapis.com/css2?family=Jersey+25&family=Karma:wght@300;400;500;600;700&display=swap');

.font-jersey {
  font-family: 'Jersey 25', sans-serif;
}

.font-karma {
  font-family: 'Karma', serif;
}

.bg-forest-dark {
  background-color: #12372A;
}

.bg-forest-medium {
  background-color: #436850;
}

.bg-sage {
  background-color: #ADBC9F;
}

.bg-cream {
  background-color: #FBFADA;
}

.text-forest-dark {
  color: #12372A;
}

.text-forest-medium {
  color: #436850;
}

.text-cream {
  color: #FBFADA;
}

.border-forest-medium {
  border-color: #436850;
}

.hover\:bg-forest-medium:hover {
  background-color: #436850;
}

.hover\:bg-forest-dark:hover {
  background-color: #12372A;
}

.hover\:text-forest-dark:hover {
  color: #12372A;
}
</style>