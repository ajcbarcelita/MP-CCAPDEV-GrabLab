<template>
	<div id="app-bg">
		<!-- Navbar -->
		<div id="navbar">
			<span id="navbar-brand">GrabLab Admin</span>
			<div id="links" class="flex items-center">
				<router-link id="profile" to="/profile">Profile</router-link>
				<router-link id="manage-techs" to="/admin-manage-technicians" class="ml-4"
					>Manage Technicians</router-link
				>
				<a id="logout" href="#" @click.prevent="logout">Log Out</a>
			</div>
		</div>

		<div class="min-h-screen flex flex-col">
			<div class="flex-1">
				<!-- Hero Section -->
				<section id="hero-section">
					<h1 id="hero-title">
						Hi, Admin {{ currentUser?.fname }} {{ currentUser?.lname }}<br />
						Welcome to GrabLab!
					</h1>
					<p id="hero-description">
						As an admin, you can manage technician accounts and oversee lab operations.
					</p>
					<router-link to="/admin-manage-technicians">
						<a href="#" id="hero-cta" class="view-slots"> Go to Manage Technicians </a>
					</router-link>
				</section>

				<!-- Why Choose Section -->
				<section
					class="max-w-8xl mx-auto mt-5 text-[#12372A] text-center flex flex-col items-center"
				>
					<h2 class="text-6xl font-light mb-1 font-['Jomhuria'] text-[#12372A] py-2">
						Why Use GrabLab Admin?
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
						<!-- Card 1 -->
						<div
							class="bg-[#FBFADA] p-6 rounded-xl shadow text-center border-2 border-[#12372A]"
						>
							<div class="flex justify-center mb-3">
								<img
									src="/src/assets/multiuser.png"
									alt="Manage Technicians"
									class="w-48 h-36"
								/>
							</div>
							<h3 class="font-bold text-xl mb-2">Technician Management</h3>
							<p class="text-[#12372A]">
								Add, edit, or remove technician accounts with ease.
							</p>
						</div>
						<!-- Card 2 -->
						<div
							class="bg-[#FBFADA] p-6 rounded-xl shadow text-center border-2 border-[#12372A]"
						>
							<div class="flex justify-center mb-3">
								<img
									src="/src/assets/Calendar.png"
									alt="Lab Oversight"
									class="w-48 h-36"
								/>
							</div>
							<h3 class="font-bold text-xl mb-2">Lab Oversight</h3>
							<p class="text-[#12372A]">
								Monitor lab status and technician assignments.
							</p>
						</div>
						<!-- Card 3 -->
						<div
							class="bg-[#FBFADA] p-6 rounded-xl shadow text-center border-2 border-[#12372A]"
						>
							<div class="flex justify-center mb-3">
								<img
									src="/src/assets/User-check.png"
									alt="Secure Access"
									class="w-48 h-36"
								/>
							</div>
							<h3 class="font-bold text-xl mb-2">Secure Access</h3>
							<p class="text-[#12372A]">
								Only admins can access technician management features.
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
	name: 'AdminLanding',
	setup() {
		return {
			...useLandingPage(),
		}
	},
}
</script>

<style scoped>
@import '@/assets/landing_page.css';
</style>
