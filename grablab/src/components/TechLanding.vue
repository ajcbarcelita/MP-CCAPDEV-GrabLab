<style scoped>
@import '../assets/landing_page.css';
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

		<div class="min-h-screen flex flex-col">
			<div class="flex-1">
				<!-- Hero Section -->
				<section id="hero-section">
					<h1 id="hero-title">
						Hi, Technician {{ currentUser.first_name }} {{ currentUser.last_name }}
						<br />Welcome back to GrabLab!
					</h1>
					<p id="hero-description">
						Streamline your laboratory Reservations with our modern booking system.
						Available from 7am on wards with real-time availability tracking.
					</p>
					<router-link to="/view">
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
						<div
							class="bg-[#FBFADA] p-6 rounded-xl shadow text-center border-2 border-[#12372A]"
						>
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
						<div
							class="bg-[#FBFADA] p-6 rounded-xl shadow text-center border-2 border-[#12372A]"
						>
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
						<div
							class="bg-[#FBFADA] p-6 rounded-xl shadow text-center border-2 border-[#12372A]"
						>
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

				<!-- Search User Section -->
				<section class="max-w-4xl mx-auto mt-10 mb-16 text-[#12372A]">
					<h2 class="text-2xl font-bold mb-4 text-center">Search User by ID</h2>
					<div class="flex justify-center items-center gap-4">
						<input
							v-model="searchUserId"
							type="text"
							placeholder="Enter User ID"
							class="p-2 border border-[#12372A] rounded-md w-1/2"
						/>
						<router-link
							:to="`/profile/${searchUserId}`"
							class="bg-[#12372A] text-[#FBFADA] px-4 py-2 rounded hover:bg-[#0f2d23]"
						>
							View Profile
						</router-link>
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
export default {
	data() {
		return {
			currentUser: JSON.parse(sessionStorage.getItem('user')) || {},
			searchUserId: '',
		}
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
