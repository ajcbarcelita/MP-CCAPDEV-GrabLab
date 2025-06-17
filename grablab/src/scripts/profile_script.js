import users from '@/data/users.js'
import reservations from '@/data/reservations.js'
import labs from '@/data/labs.js'
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

// Check if exists, then compare user_id
const isOwnProfile = computed(() => { return currentUser.value && profileUser.value && currentUser.value.user_id === profileUser.value.user_id })
const showEditButton = computed(() => { return isOwnProfile.value && !isEditing.value })
const showSaveCancel = computed(() => { return isOwnProfile.value && isEditing.value })
const showDeleteAccount = computed(() => { return isOwnProfile.value })

// Readonly input when not editing
const inputReadonly = computed(() => { return !isOwnProfile.value || !isEditing.value })


// Reservation properties
const userReservations = computed(() => {
  if (!currentUser.value) return []
  
  return reservations
    .filter(reservation => 
      reservation.user_id === currentUser.value.user_id &&
      reservation.status === 'confirmed'
    )
    .sort((a, b) => new Date(a.reservation_date) - new Date(b.reservation_date))
})

const getSeatFromSlotId = (slotId) => {
  return Math.floor((slotId - 1) / 22) + 1
}

const getTimeSlotFromSlotId = (slotId) => {
  return ((slotId - 1) % 22) + 1
}

const getLabName = (labId) => {
  const lab = labs.find(l => l.lab_id === labId)
  return lab ? lab.name : `Lab ${labId}`
}

const formatReservationDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getTimeRangeForSlots = (slots) => {
  if (!slots || slots.length === 0) return 'N/A'
  
  const timeSlots = slots.map(slot => getTimeSlotFromSlotId(slot.slot_id))
  const minSlot = Math.min(...timeSlots)
  const maxSlot = Math.max(...timeSlots)
  
  const startTime = getTimeSlotDisplay(minSlot)
  const endTime = getTimeSlotDisplay(maxSlot + 1) // +1 because we want the end time
  
  return `${startTime.split(' - ')[0]} - ${endTime.split(' - ')[0]}`
}

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
  
  // Handle profile picture in when backend is implemented
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


// Reservations related functions
function getTimeSlotDisplay(timeSlot) {
  // Convert time slot number to actual time display
  // Assuming slots start at 8:00 AM and each slot is 30 minutes
  const startHour = 8
  const startMinutes = (timeSlot - 1) * 30
  const totalMinutes = startHour * 60 + startMinutes
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const endTotalMinutes = totalMinutes + 30
  const endHours = Math.floor(endTotalMinutes / 60)
  const endMinutes = endTotalMinutes % 60
  
  const formatTime = (h, m) => {
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`
  }
  
  return `${formatTime(hours, minutes)} - ${formatTime(endHours, endMinutes)}`
}


onMounted(() => {
  handleView()
})
