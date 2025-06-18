<template>
	<div id="app-bg">
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
				<h1 id="search-title">Search</h1>
				<div id="Lab" class="filter-row">
					<label for="lab-input" id="lab" class="search-label">Building: </label>
					<select id="lab-input" class="search-input">
						<option value="All">All</option>
						<option value="Gokonwei Bldg.">John Gokongwei Sr. Hall</option>
						<option value="Andrew Bldg.">Br. Andrew Gonzalez Hall</option>
			<option value="LS Bldg.">St. La Salle Hall</option>
					</select>
		  <!-- Conditional ID number input -->
		  <div v-if="isTechnician" id="ID" class="filter-row">
			<label for="number" class="search-label">ID number: </label>
			<input type="text" id="number" class="search-input" placeholder="Enter ID number"/>
		  </div>
		  <button id="search-btn">Search</button>
				</div>
			</div>
		</div>

		<!-- Lab Slots Section -->
		<section id="lab-slots">
			<div class="lab-slots-grid">
				<div class="lab-card" v-for="n in 6" :key="n">
					<div class="lab-card-header">G402</div>
					<div class="lab-info">
						<span id="buildingName" class="lab-info-label">Building: </span>
            <span class="lab-info-value">John Gokongwei Sr. Hall <br /></span>
            <span id="CapacityNum" class="lab-info-label">Capacity: </span>
            <span class="lab-info-value">35<br /></span>
            <span id="operatingHours" class="lab-info-label">Operating Hours: </span>
            <span class="lab-info-value">7:00 AM - 10:00 PM<br /></span>
            <span id="labStatus" class="lab-info-label">Status: </span>
            <span class="lab-info-value">Available<br /></span>

					</div>
					<div class="lab-card-actions">
						<button class="lab-btn">View</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer class="bg-[#12372A] text-[#FBFADA] text-center p-4 text-sm font-bold">
    <div class="flex justify-center gap-2">
      <p>&copy; 2025 GrabLab. All rights reserved.<br /></p>
    </div>
    </footer>
	</div>
</template>

<script>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

export default {
	name: 'View',
	setup() {
		const router = useRouter()
		const currentUser = ref(JSON.parse(sessionStorage.getItem('user')))
		const isTechnician = currentUser.value?.role === 'Technician'

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

		return { handleLogout, handleHome, isTechnician }
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
</style>
