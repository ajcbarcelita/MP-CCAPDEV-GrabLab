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
				<h1 id="search-title">Search</h1>
				<div id="Lab" class="filter-row">
					<label for="lab-input" id="lab" class="search-label">Building: </label>
					<select id="lab-input" class="search-input" v-model="selectedBuilding">
						<option value="All">All</option>
						<option v-for="building in uniqueBuildings" :key="building" :value="building">{{ building }}</option>
					</select>
		  <!-- Conditional ID number input -->
		  <div v-if="isTechnician" id="ID" class="filter-row">
			<label for="number" class="search-label">ID number: </label>
			<input type="text" id="number" class="search-input" placeholder="Enter ID number"/>
		  </div>
		  <button id="search-btn" @click="applyFilter">Search</button>
				</div>
			</div>
		</div>

		<!-- Lab Slots Section -->
		<section id="lab-slots">
			<div class="lab-slots-grid">
				<div class="lab-card" v-for="lab in labs" :key="lab.lab_id">
					<div class="lab-card-header">{{ lab.name }}</div>
					<div class="lab-info">
						<span id="buildinglabel" class="lab-info-label">Building: </span>
            <span id="buildingName" class="lab-info-value">{{ lab.building }}<br /></span>
            <span id="capacityLabel" class="lab-info-label">Capacity: </span>
            <span id="CapacityNum" class="lab-info-value">{{ lab.capacity }}<br /></span>
            <span id="operatingHoursLabel" class="lab-info-label">Operating Hours: </span>
            <span id="operatingHours" class="lab-info-value">{{ lab.operating_hours.open }} - {{ lab.operating_hours.close }}<br /></span>
            <span id="labStatusLabel" class="lab-info-label">Status: </span>
            <span id="labStatusValue" class="lab-info-value">{{ lab.status }}<br /></span>

					</div>
					<div class="lab-card-actions">
						<button class="lab-btn">View</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer class="bg-[#12372A] text-[#FBFADA] text-center p-4 text-sm font-bold mt-auto">
    <div class="flex justify-center gap-2">
      <p>&copy; 2025 GrabLab. All rights reserved.<br /></p>
    </div>
    </footer>
	</div>
</template>

<script>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import labs from '../data/labs.js';

export default {
	name: 'LabView',
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

		const selectedBuilding = ref('All');
		const uniqueBuildings = [...new Set(labs.map(lab => lab.building))];
		const filteredLabs = ref(labs);

		const applyFilter = () => {
			filteredLabs.value = selectedBuilding.value === 'All'
				? labs
				: labs.filter(lab => lab.building === selectedBuilding.value);
		};

		return { handleLogout, handleHome, isTechnician, labs: filteredLabs, selectedBuilding, uniqueBuildings, applyFilter };
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
