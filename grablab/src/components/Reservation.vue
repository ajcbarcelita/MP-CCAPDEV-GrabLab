<style>
@import '@/assets/reservations.css';
</style>

<template>
  <div id="app-bg">
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
          <button @click="goBack"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg transition-colors duration-200">
            ← Go Back to Labs
          </button>

          <!-- Lab Selector -->
          <div class="bg-white rounded-lg shadow-sm p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Lab Selector</label>
            <select v-model="selectedLab" @change="loadLabSchedule"
              class="w-full p-3 border border-gray-300 rounded-lg">
              <option value="">Select Lab</option>
              <option v-for="lab in allLabs" :key="lab.lab_id" :value="lab.lab_id">
                {{ lab.name }} ({{ lab.building }})
              </option>
            </select>
          </div>

          <!-- Date Selector (One Week) -->
          <div class="bg-white rounded-lg shadow-sm p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input type="date" v-model="selectedDate" :min="minDate" :max="maxDate" @change="loadLabSchedule"
              class="w-full p-3 border border-gray-300 rounded-lg">
          </div>

          <!-- Quick Reserve Panel -->
          <div class="bg-white rounded-lg shadow-sm p-4" v-if="selectedSlots.length > 0">
            <h3 class="font-medium text-gray-800 mb-3">
              Reserve Selected Slots
            </h3>
            <p class="text-sm text-gray-600 mb-2">
              Lab: {{ getLabName(selectedLab) }}, Date: {{ formatDate(selectedDate) }}
            </p>
            <ul class="text-sm text-gray-600 mb-3 max-h-24 overflow-y-auto border p-2 rounded">
              <li v-for="slot in selectedSlots" :key="`${slot.seat}-${slot.time}`">
                Seat {{ slot.seat }} at {{ slot.time }}
              </li>
            </ul>

            <div class="space-y-3">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="reserveAnonymously">
                <span class="text-sm">Reserve Anonymously</span>
              </label>

              <div v-if="currentUser.user_type === 'technician'">
                <label class="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input type="text" v-model="studentIdForReservation" placeholder="Student ID"
                  class="w-full p-2 border rounded">
                <p class="text-xs text-gray-500 mt-1">For technicians</p>
              </div>

              <button @click="reserveSlot"
                class="w-full grablab-primary text-white py-3 rounded-lg font-medium hover:opacity-90">
                Reserve Slot
              </button>
              <button @click="clearSelection" class="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500">
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
              <!-- Time Slot Filter -->
              <div class="flex justify-center gap-4 mb-4 flex-wrap">
                <button @click="setTimeFilter('Morning')"
                  :class="{ 'bg-grablab-primary text-white': timeFilter === 'Morning', 'bg-gray-200 text-gray-700': timeFilter !== 'Morning' }"
                  class="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors duration-200">
                  Morning (7 AM - 12 PM)
                </button>
                <button @click="setTimeFilter('Afternoon')"
                  :class="{ 'bg-grablab-primary text-white': timeFilter === 'Afternoon', 'bg-gray-200 text-gray-700': timeFilter !== 'Afternoon' }"
                  class="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors duration-200">
                  Afternoon (12 PM - 6 PM)
                </button>
                <button @click="setTimeFilter('Evening')"
                  :class="{ 'bg-grablab-primary text-white': timeFilter === 'Evening', 'bg-gray-200 text-gray-700': timeFilter !== 'Evening' }"
                  class="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors duration-200">
                  Evening (6 PM - 10 PM)
                </button>
              </div>

              <div class="overflow-x-auto custom-scrollbar">
                <!-- Time Header -->
                <div class="schedule-grid mb-2 min-w-max">
                  <div class="font-medium text-center py-2"></div>
                  <div v-for="time in filteredTimeSlots" :key="time" class="font-medium text-center py-2 text-sm">
                    {{ time }}
                  </div>
                </div>

                <!-- Seat Rows -->
                <div class="schedule-grid min-w-max" v-for="seat in currentSeatsPage" :key="seat">
                  <div class="font-medium text-center py-3 bg-gray-50 rounded">
                    Seat {{ seat }}
                  </div>
                  <button v-for="time in filteredTimeSlots" :key="`${seat}-${time}`"
                    @click="toggleSlotSelection(seat, time)" :class="getSlotClass(seat, time)"
                    class="seat-button rounded text-xs font-medium transition-all hover:scale-105">
                    {{ getSlotText(seat, time) }}
                  </button>
                </div>
              </div>

              <!-- Pagination Controls -->
              <div class="flex justify-between items-center mt-6 p-2 bg-gray-100 rounded-lg">
                <button @click="prevPage"
                  class="flex items-center gap-1 px-4 py-2 bg-grablab-secondary text-white rounded-lg font-medium hover:bg-grablab-primary transition-colors duration-200 shadow-md">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Previous
                </button>
                <span class="text-base font-semibold text-gray-800">Page {{ currentPage }} of {{ totalPages }}</span>
                <button @click="nextPage"
                  class="flex items-center gap-1 px-4 py-2 bg-grablab-secondary text-white rounded-lg font-medium hover:bg-grablab-primary transition-colors duration-200 shadow-md">
                  Next
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 modal-overlay flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 class="font-jersey text-2xl text-grablab-primary mb-6 text-center">Confirm Reservation</h2>

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
            <div class="flex justify-between" v-for="slot in confirmData.slots" :key="`${slot.seat}-${slot.time}`">
              <span class="text-gray-600">Seat {{ slot.seat }}:</span>
              <span class="font-medium">{{ slot.time }}</span>
            </div>
          </div>
        </div>

        <div v-if="!reserveAnonymously" class="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p class="text-sm text-yellow-800">
            Are you sure you want to post this without anonymity?
          </p>
        </div>

        <div class="flex gap-3">
          <button @click="confirmReservation"
            class="flex-1 grablab-primary text-white py-3 rounded font-medium hover:opacity-90">
            Confirm
          </button>
          <button @click="closeConfirmModal"
            class="flex-1 bg-gray-400 text-white py-3 rounded font-medium hover:bg-gray-500">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 modal-overlay flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl text-center">
        <div class="text-green-500 text-6xl mb-4">✓</div>
        <h2 class="font-jersey text-2xl text-grablab-primary mb-4">Reservation Confirmed!</h2>
        <p class="text-gray-600 mb-6">Your seat has been successfully reserved.</p>
        <button @click="closeSuccessModal"
          class="grablab-primary text-white py-3 px-6 rounded font-medium hover:opacity-90">
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
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'StudentMain',
  setup() {
    const router = useRouter();
    // Hardcoded data for Phase 1 visual representation
    const currentUser = reactive({
      user_id: 1,
      name: 'John Doe',
      email: 'john.doe@dlsu.edu.ph',
      user_type: 'student'
    });

    const allLabs = ref([
      { lab_id: 1, name: 'G402', building: 'Gokongwei', capacity: 35, status: 'Available' },
      { lab_id: 2, name: 'G403', building: 'Gokongwei', capacity: 30, status: 'Available' },
      { lab_id: 3, name: 'V201', building: 'Velasco', capacity: 25, status: 'Available' },
      { lab_id: 4, name: 'A305', building: 'Andrew', capacity: 40, status: 'Available' },
      { lab_id: 5, name: 'LS101', building: 'LS', capacity: 20, status: 'Available' },
      { lab_id: 6, name: 'G501', building: 'Gokongwei', capacity: 32, status: 'Available' }
    ]);

    const filteredLabs = ref([...allLabs.value]); // For the 'Lab Slots' section

    // Hardcoded reservations to mimic occupied slots
    const hardcodedReservations = ref([
      // For Lab G402 (ID 1), Current Date
      { lab_id: 1, seat_number: 1, date: '2024-06-18', time: '09:00', status: 'Occupied' },
      { lab_id: 1, seat_number: 1, date: '2024-06-18', time: '09:30', status: 'Occupied' },
      { lab_id: 1, seat_number: 2, date: '2024-06-18', time: '10:00', status: 'Occupied' },
      { lab_id: 1, seat_number: 3, date: '2024-06-18', time: '14:00', status: 'Occupied' },
      { lab_id: 1, seat_number: 3, date: '2024-06-18', time: '14:30', status: 'Occupied' },
      { lab_id: 1, seat_number: 4, date: '2024-06-18', time: '11:00', status: 'Occupied' },
    ]);

    const selectedBuilding = ref('All');
    const selectedLab = ref('');
    const selectedDate = ref(new Date().toISOString().split('T')[0]); // Default to current date
    const selectedSlots = ref([]); // Array for multiple selected slots
    const reserveAnonymously = ref(false);
    const studentIdForReservation = ref('');

    // Modals
    const showConfirmModal = ref(false);
    const showSuccessModal = ref(false);
    const confirmData = reactive({});

    // Pagination for seats
    const seatsPerPage = 7;
    const currentPage = ref(1);

    // Time Slot Filtering
    const timeFilter = ref('Morning'); // 'Morning', 'Afternoon', 'Evening'

    const minDate = computed(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });

    const maxDate = computed(() => {
      const future = new Date();
      future.setDate(new Date().getDate() + 6); // One week (current day + 6 more days)
      return future.toISOString().split('T')[0];
    });

    // All possible time slots from 7 AM to 10 PM in 30-minute intervals
    const allTimeSlots = computed(() => {
      const slots = [];
      const startTime = new Date();
      startTime.setHours(7, 0, 0, 0); // 7:00 AM

      const endTime = new Date();
      endTime.setHours(22, 0, 0, 0); // 10:00 PM

      let currentTime = startTime;
      while (currentTime <= endTime) {
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        slots.push(`${hours}:${minutes}`);
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
      return slots;
    });

    // Filtered time slots based on timeFilter
    const filteredTimeSlots = computed(() => {
      if (timeFilter.value === 'All') {
        return allTimeSlots.value;
      } else if (timeFilter.value === 'Morning') {
        return allTimeSlots.value.filter(slot => {
          const [hours] = slot.split(':').map(Number);
          return hours >= 7 && hours < 12; // 7 AM to 11:59 AM
        });
      } else if (timeFilter.value === 'Afternoon') {
        return allTimeSlots.value.filter(slot => {
          const [hours] = slot.split(':').map(Number);
          return hours >= 12 && hours < 18; // 12 PM to 5:59 PM
        });
      } else if (timeFilter.value === 'Evening') {
        return allTimeSlots.value.filter(slot => {
          const [hours] = slot.split(':').map(Number);
          return hours >= 18 && hours <= 22; // 6 PM to 10:00 PM
        });
      }
      return allTimeSlots.value; // Fallback
    });


    const scrollToSearchFilter = () => {
      const el = document.getElementById('search-filter');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const filterLabs = () => {
      if (selectedBuilding.value === 'All') {
        filteredLabs.value = [...allLabs.value];
      } else {
        filteredLabs.value = allLabs.value.filter(lab => lab.building === selectedBuilding.value);
      }
    };

    const viewSchedule = (labId) => {
      selectedLab.value = labId;
      currentPage.value = 1; // Reset to first page when changing lab
      selectedSlots.value = []; // Clear selected slots when changing lab
      // Scroll to the schedule section
      const el = document.querySelector('.container.mx-auto.px-4.py-6.max-w-7xl');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const goBack = () => {
      selectedLab.value = ''; // Reset selected lab to hide schedule view
      selectedSlots.value = []; // Clear any selected slots
      router.push('/view');
    };

    const getLabName = (labId) => {
      const lab = allLabs.value.find(l => l.lab_id === labId);
      return lab ? lab.name : 'Unknown Lab';
    };

    const getSeatsForLab = (labId) => {
      const lab = allLabs.value.find(l => l.lab_id === labId);
      return lab ? Array.from({ length: lab.capacity }, (_, i) => i + 1) : [];
    };

    // Computed property for seats on the current page
    const currentSeatsPage = computed(() => {
      const allSeats = getSeatsForLab(selectedLab.value);
      const start = (currentPage.value - 1) * seatsPerPage;
      const end = start + seatsPerPage;
      return allSeats.slice(start, end);
    });

    const totalPages = computed(() => {
      const lab = allLabs.value.find(l => l.lab_id === selectedLab.value);
      if (!lab) return 1;
      return Math.ceil(lab.capacity / seatsPerPage);
    });

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      } else {
        currentPage.value = 1; // Loop to first page
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      } else {
        currentPage.value = totalPages.value; // Loop to last page
      }
    };

    const setTimeFilter = (filter) => {
      timeFilter.value = filter;
      // Optionally, clear selected slots if they are no longer visible in the new filter
      selectedSlots.value = selectedSlots.value.filter(slot => {
        // Re-check if the slot is still within the new filter's time range
        const [hours] = slot.time.split(':').map(Number);
        if (filter === 'Morning' && hours >= 7 && hours < 12) return true;
        if (filter === 'Afternoon' && hours >= 12 && hours < 18) return true;
        if (filter === 'Evening' && hours >= 18 && hours <= 22) return true;
        return false;
      });
    };

    const toggleSlotSelection = (seat, time) => {
      if (isSlotOccupied(parseInt(selectedLab.value), seat, selectedDate.value, time)) return; // Disable if occupied

      const index = selectedSlots.value.findIndex(
        s => s.seat === seat && s.time === time
      );

      if (index === -1) {
        selectedSlots.value.push({ seat, time });
      } else {
        selectedSlots.value.splice(index, 1);
      }
    };

    const clearSelection = () => {
      selectedSlots.value = [];
      reserveAnonymously.value = false;
      studentIdForReservation.value = '';
    };

    const getSlotClass = (seat, time) => {
      const isSelected = selectedSlots.value.some(s => s.seat === seat && s.time === time);
      const isOccupied = isSlotOccupied(parseInt(selectedLab.value), seat, selectedDate.value, time);

      if (isOccupied) {
        return 'bg-gray-400 text-white cursor-not-allowed';
      } else if (isSelected) {
        return 'bg-green-500 text-white border-2 border-green-600';
      } else {
        return 'bg-white border border-gray-300 hover:bg-gray-50 cursor-pointer';
      }
    };

    const getSlotText = (seat, time) => {
      const isOccupied = isSlotOccupied(parseInt(selectedLab.value), seat, selectedDate.value, time);
      const isSelected = selectedSlots.value.some(s => s.seat === seat && s.time === time);

      if (isOccupied) {
        return 'Occupied';
      } else if (isSelected) {
        return 'Selected';
      } else {
        return 'Available';
      }
    };

    // isSlotDisabled logic simplified as maintenance is removed
    const isSlotDisabled = (seat, time) => {
      return isSlotOccupied(parseInt(selectedLab.value), seat, selectedDate.value, time);
    };

    const isSlotOccupied = (lab_id, seat_number, date, time) => {
      return hardcodedReservations.value.some(r =>
        r.lab_id === lab_id &&
        r.seat_number === seat_number &&
        r.date === date &&
        r.time === time &&
        r.status === 'Occupied'
      );
    };

    // Lab statistics and maintenance logic removed as per request - return 0 or empty values
    const getTotalFreeSeats = () => { return 0; };
    const getOccupiedSeats = () => { return 0; };
    const getMaintenanceSeats = () => { return 0; };


    const loadLabSchedule = () => {
    const selectedDay = new Date(selectedDate.value).getDay();
    if (selectedDay === 0) {
      alert("Reservations are not allowed on Sundays.");
      selectedDate.value = minDate.value; // Reset to the minimum date
      return;
    }
    clearSelection();
    currentPage.value = 1; // Reset pagination when lab or date changes
    };

    const reserveSlot = () => {
      if (selectedSlots.value.length === 0 || !selectedLab.value) return;

      Object.assign(confirmData, {
        lab_id: parseInt(selectedLab.value),
        date: selectedDate.value,
        slots: [...selectedSlots.value], // Copy selected slots
        anonymous: reserveAnonymously.value,
        student_id: currentUser.user_type === 'technician' ? studentIdForReservation.value : currentUser.user_id
      });
      showConfirmModal.value = true;
    };

    const confirmReservation = () => {
      // For Phase 1, just simulate reservation by adding to hardcoded list
      confirmData.slots.forEach(slot => {
        hardcodedReservations.value.push({
          reservation_id: hardcodedReservations.value.length + 1, // Simple ID
          user_id: confirmData.student_id,
          lab_id: confirmData.lab_id,
          seat_number: slot.seat,
          date: confirmData.date,
          time: slot.time,
          status: 'Occupied',
          anonymous: confirmData.anonymous
        });
      });
      closeConfirmModal();
      clearSelection();
      showSuccessModal.value = true;
    };
    

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
      Object.keys(confirmData).forEach(key => delete confirmData[key]);
    };

    const closeSuccessModal = () => {
      showSuccessModal.value = false;
    };

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    onMounted(() => {
      if (allLabs.value.length > 0) {
        selectedLab.value = allLabs.value[0].lab_id;
      }
      filterLabs(); // Initialize filtered labs
    });

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
      formatDate
    };
  }
};
</script>
