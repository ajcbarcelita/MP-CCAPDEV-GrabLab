<template>
	<div id="app-bg">
		<!-- Navbar -->
		<div id="navbar">
			<span id="navbar-brand">GrabLab</span>
			<div id="links">
				<router-link id="profile" to="/profile">Profile</router-link>
				<router-link id="logout" to="/">Log Out</router-link>
			</div>
		</div>

		<!-- Hero Section -->
		<section id="hero-section">
			<h1 id="hero-title">Reserve Lab Rooms<br />Effortlessly</h1>
			<p id="hero-description">
				Streamline your laboratory Reservations with our modern booking system. Available
				from 7am on wards with real-time availability tracking.
			</p>
			<a href="#" id="hero-cta" class="view-slots" @click.prevent="scrollToSearchFilter">
				<img src="/src/assets/search.png" alt="search" class="hero-arrow" />
				View Slots
			</a>
		</section>

		<!-- Reservation Summary Section -->
		<section id="reservation-summary">
			<div class="summary-grid">
				<div class="summary-item">
					<div class="summary-value">0</div>
					<div class="summary-label">Total Slots</div>
				</div>
				<div class="summary-item">
					<div class="summary-value">0</div>
					<div class="summary-label">Available Now</div>
				</div>
				<div class="summary-item">
					<div class="summary-value">0</div>
					<div class="summary-label">My Reservations</div>
				</div>
				<div class="summary-item">
					<div class="summary-value">0</div>
					<div class="summary-label">Active Users</div>
				</div>
			</div>
		</section>
		<!-- Search and Filter -->
		<div id="search-filter">
			<div id="Title">
				<h1 id="search-title">Search and Filter</h1>
			</div>
			<div id="filter-row" class="filter-row">
				<div id="date-time">
					<label for="date-input" id="date">Date: </label>
					<input type="date" id="date-input" />
					<label for="time-input" id="time">Time: </label>
					<input type="time" id="time-input" />
				</div>
				<div id="Lab" class="filter-row">
					<label for="lab-input" id="lab">Laboratory:</label>
					<select id="lab-input">
						<option value="All">All</option>
						<option value="Gokonwei Bldg.">Gokonwei Bldg.</option>
						<option value="Andrew Bldg.">Andrew Bldg.</option>
					</select>
				</div>
				<div id="search-button">
					<button id="search-btn">Search</button>
				</div>
			</div>
		</div>
		<!-- Lab Slots Section -->
		<section id="lab-slots">
			<div class="lab-slots-grid">
				<div class="lab-card" v-for="n in 6" :key="n">
					<div class="lab-card-header">G402</div>
					<div class="lab-card-body">
						<div class="lab-status available">
							<span class="dot available"></span> Available: 22
						</div>
						<div class="lab-status occupied">
							<span class="dot occupied"></span> Occupied: 11
						</div>
						<div class="lab-status maintenance">
							<span class="dot maintenance"></span> Maintenance: 2
						</div>
					</div>
					<div class="lab-card-actions">
						<button class="lab-btn">View</button>
						<button class="lab-btn">Reserve</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Footer -->
		<footer id="footer">Basta Footer Toh</footer>
	</div>
</template>

<script>
export default {
	name: 'StudentMain',
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
@import '../assets/student_main.css';
</style>
