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
			<h1 id="hero-title">Hi, {{ currentUser.first_name }} {{ currentUser.last_name }} <br /> Welcome back to GrabLab!</h1>
			<p id="hero-description">
				Streamline your laboratory Reservations with our modern booking system. Available
				from 7am on wards with real-time availability tracking.
			</p>
			<router-link to="/view" class="view-slots">
      <a href="#" id="hero-cta" class="view-slots" >
				View Slots
			</a>
			</router-link>
		</section>

    <!-- Why Choose Section -->
    <section class="max-w-8xl mx-auto mt-5 text-[#12372A] ">
      <h2 class="text-6xl font-light mb-1 font-['Jomhuria'] text-[#12372A]">Why Choose GrabLab?</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <!-- Card 1 -->
        <div class="bg-[#FBFADA] p-6 rounded-xl shadow text-center">
          <div class="flex justify-center mb-3">
            <router-link to="/view">
            <img src="/src/assets/Calendar.png" alt="View Availability" class="w-48 h-36"/>
            </router-link>
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


		<!-- Footer -->
		<footer class="bg-[#12372A] text-[#FBFADA] text-center p-4 text-sm font-bold">
    <div class="flex justify-center gap-2">
      <p>&copy; 2025 GrabLab. All rights reserved.<br /></p>
    </div>
    </footer>
	</div>
</template>

<script>
import { ref } from 'vue';

export default {
	name: 'StudentMain',
	setup() {
		const currentUser = ref(JSON.parse(sessionStorage.getItem('user')));
		return { currentUser };
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

