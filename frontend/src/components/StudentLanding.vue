<style scoped>
@import '@/assets/landing_page.css';
</style>

<template>
	<div id="app-bg">
		<!-- Error Popup -->
		<div v-if="showErrorPopup" class="fixed inset-0 flex items-center justify-center z-50">
			<div class="bg-white rounded-md p-6 w-96 mx-4 border-1 border-black">
				<div class="justify-between items-center mb-3 flex">
					<h3 class="text-xl font-bold text-red-600">Error</h3>
				</div>
				<p class="text-gray-700 mb-4">{{ error }}</p>
				<div class="flex justify-end">
					<button
						@click="closeErrorPopup"
						class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
					>
						Close
					</button>
				</div>
			</div>
			<div class="fixed inset-0" @click="closeErrorPopup"></div>
		</div>

		<!-- Navbar -->
		<div id="navbar">
			<span id="navbar-brand">GrabLab</span>
			<div id="links" class="flex items-center">
				<div class="flex items-center mr-4 mb-1">
					<input
						v-model="searchQuery"
						type="number"
						placeholder="Enter User ID"
						class="p-1 border border-[#adbc9f] bg-transparent text-[#FBFADA] rounded-md w-50 text-sm"
						@keyup.enter="searchUser"
						@keypress="validateNumber"
					/>
				</div>
				<router-link id="profile" to="/profile">Profile</router-link>
				<a id="logout" href="#" @click.prevent="logout">Log Out</a>
			</div>
		</div>

		<div class="min-h-screen flex flex-col">
			<div class="flex-1">
				<!-- Hero Section -->
				<section id="hero-section">
					<!--
            {{ currentUser?.fname}} - current user's first name
            {{ currentUser?.lname}} - current user's last name

          -->
					<h1 id="hero-title">
						Hi, {{ currentUser?.fname }} {{ currentUser?.lname }} <br />
						Welcome back to GrabLab!
					</h1>
					<p id="hero-description">
						Streamline your laboratory Reservations with our modern booking system.
						Available from 7am onwards with real-time availability tracking.
					</p>
					<router-link to="/view" class="view-slots">
						<a href="#" id="hero-cta" class="view-slots"> View Slots </a>
					</router-link>
				</section>

				<!-- Why Choose Section -->
				<section
					class="max-w-8xl mx-auto mt-5 text-[#12372A] text-center flex flex-col items-center"
				>
					<h2 class="text-6xl font-light mb-1 font-['Jomhuria'] text-[#12372A] py-2">
						Why Choose GrabLab?
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
						<!-- Card 1 -->
						<div class="bg-[#FBFADA] p-6 rounded-xl shadow border-2 border-[#12372A]">
							<div class="flex justify-center mb-3">
								<router-link to="/view">
									<img
										src="/src/assets/Calendar.png"
										alt="View Availability"
										class="w-48 h-36"
									/>
								</router-link>
							</div>
							<h3 class="font-bold text-xl mb-2">View Availability</h3>
							<p class="text-[#12372A]">
								View lab room availability with a single click
							</p>
						</div>
						<!-- Card 2 -->
						<div class="bg-[#FBFADA] p-6 rounded-xl shadow border-2 border-[#12372A]">
							<div class="flex justify-center mb-3">
								<router-link to="/profile">
									<img
										src="/src/assets/User-check.png"
										alt="View Current Availability"
										class="w-48 h-36"
									/>
								</router-link>
							</div>
							<h3 class="font-bold text-xl mb-2">View current reservations</h3>
							<p class="text-[#12372A]">
								See your current lab room reservations at a glance
							</p>
						</div>
						<!-- Card 3 -->
						<div class="bg-[#FBFADA] p-6 rounded-xl shadow border-2 border-[#12372A]">
							<div class="flex justify-center mb-3">
								<img
									src="/src/assets/multiuser.png"
									alt="Multi-user Support"
									class="w-48 h-36"
								/>
							</div>
							<h3 class="font-bold text-xl mb-2">Multi-user Support</h3>
							<p class="text-[#12372A]">
								Student and Technician roles with appropriate permissions
							</p>
						</div>
					</div>
				</section>
			</div>
		</div>

		<!-- Footer -->
		<footer class="bg-[#12372A] text-[#FBFADA] text-center p-4 text-sm font-bold">
			<div class="flex justify-center gap-2">
				<p>&copy; 2025 GrabLab. All rights reserved.<br /></p>
			</div>
		</footer>
	</div>
</template>

<script>
import { useLandingPage } from '@/composables/useLandingPage'

export default {
	name: 'StudentLanding',
	// Using the useLandingPage composable to manage state and methods
	setup() {
		return {
			...useLandingPage(),
		}
	},
}
</script>
