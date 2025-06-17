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
			<h1 id="hero-title">Hi, {name}! <br /> Welcome back to GrabLab!</h1>
			<p id="hero-description">
				Streamline your laboratory Reservations with our modern booking system. Available
				from 7am on wards with real-time availability tracking.
			</p>
			<a href="#" id="hero-cta" class="view-slots" @click.prevent="scrollToSearchFilter">
				<img src="/src/assets/search.png" alt="search" class="hero-arrow" />
				View Slots
			</a>
		</section>

    <!-- Why Choose Section -->
    <section class="max-w-8xl mx-auto mt-5 text-[#12372A] ">
      <h2 class="text-6xl font-light mb-1 font-['Jomhuria'] text-[#12372A]">Why Chose GrabLab?</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1 -->
        <div class="bg-[#FBFADA] p-6 rounded-xl shadow text-center">
          <div class="flex justify-center mb-3">
            <img src="/src/assets/Calendar.png" alt="View Availability" class="w-48 h-36" @click.prevent="scrollToSearchFilter"/>
          </div>
          <h3 class="font-bold text-xl mb-2">View Availability</h3>
          <p class="text-[#12372A]">View lab room availability with a single click</p>
        </div>
        <!-- Card 2 -->
        <div class="bg-[#FBFADA] p-6 rounded-xl shadow text-center">
          <div class="flex justify-center mb-3">
            <router-link to="/profile">
              <img src="/src/assets/User-check.png" alt="View Current Availability" class="w-48 h-36" />
            </router-link>
          </div>
          <h3 class="font-bold text-xl mb-2">View current reservations</h3>
          <p class="text-[#12372A]">See your current lab room reservations at a glance</p>
        </div>
        <!-- Card 3 -->
        <div class="bg-[#FBFADA] p-6 rounded-xl shadow text-center">
          <div class="flex justify-center mb-3">
            <img src="/src/assets/multiuser.png" alt="Multi-user Support" class="w-48 h-36" />
          </div>
          <h3 class="font-bold text-xl mb-2">Multi-user Support</h3>
          <p class="text-[#12372A]">Student and Technician roles with appropriate permissions</p>
        </div>
      </div>
    </section>
		<!-- Search and Filter -->
		<div id="search-filter">
			<div id="Title">
				<h1 id="search-title">Search</h1>
				<div id="Lab" class="filter-row">
					<label for="lab-input" id="lab">Building: </label>
					<select id="lab-input">
						<option value="All">All</option>
						<option value="Gokonwei Bldg.">John Gokongwei Sr. Hall</option>
						<option value="Andrew Bldg.">Br. Andrew Gonzalez Hall</option>
            <option value="LS Bldg.">St. La Salle Hall</option>
					</select>

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
		<footer id="footer">
    <div class="footer-content">
      <p>&copy; 2025 GrabLab. All rights reserved.</p>
      <p>Contact us: <a href="mailto:support@grablab.com">support@grablab.com</a></p>
      <p>Follow us on:
        <a href="https://twitter.com/grablab" target="_blank">Twitter</a> |
        <a href="https://facebook.com/grablab" target="_blank">Facebook</a>
      </p>
    </div>
  </footer>
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

#footer {
    background-color: #12372A;
    color: #FBFADA;
    text-align: center;
    padding: 1rem;
    font-size: 0.9rem;
  }

  .footer-content a {
    color: #FBFADA;
    text-decoration: none;
    margin: 0 0.5rem;
  }

  .footer-content a:hover {
    text-decoration: underline;
  }
</style>
