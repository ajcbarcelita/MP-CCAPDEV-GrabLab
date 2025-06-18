<template>
	<div class="min-h-screen flex flex-col bg-gray-100 font-sans">
		<!-- Navbar -->
		<div class="bg-[#12372A] text-white flex justify-between items-center py-3 px-6">
			<span class="font-['Jersey_25'] text-3xl text-[#ADBC9F]">GrabLab</span>
			<router-link
				to="/login"
				class="font-['Jomhuria'] text-3xl text-[#ADBC9F] hover:underline transition"
				>Login/Register</router-link
			>
		</div>

		<!-- Hero Section -->
		<section class="bg-[#436850] text-[#FBFADA] text-center py-16 px-4">
			<h1 class="font-['Karma'] text-5xl font-light mb-4">
				Reserve Lab Rooms<br />Effortlessly
			</h1>
			<p class="font-['Karma'] max-w-3xl mx-auto mb-8 text-xl font-light">
				Streamline your laboratory Reservations with our modern booking system. Available
				from 7am on wards with real-time availability tracking.
			</p>
			<a
				href="#"
				class="inline-block bg-[#FBFADA] text-[#436850] font-['Jomhuria'] text-2xl py-3 px-4 rounded-md shadow hover:bg-[#e6f2d8] transition no-underline"
			>
				Browse Lab Rooms
				<img
					src="/src/assets/right_arrow.png"
					alt="arrow"
					class="inline align-middle w-5 h-4 ml-2 mr-2 pb-1 rounded filter contrast-150 brightness-80 drop-shadow"
				/>
			</a>
		</section>

		<!-- Why Choose Section -->
		<section class="max-w-7xl mx-auto mt-5 text-[#12372A]">
			<h2 class="text-6xl font-light mb-1 font-['Jomhuria'] text-[#12372A]">
				Why Choose GrabLab?
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<!-- Card 1 -->
				<div class="bg-[#FBFADA] p-6 rounded-xl shadow text-center">
					<div class="flex justify-center mb-3">
						<img src="/src/assets/Calendar.png" alt="Early Booking" class="w-48 h-36" />
					</div>
					<h3 class="font-bold text-xl mb-2">Early Booking</h3>
					<p class="text-[#12372A]">
						Reserve lab rooms with our intuitive calendar interface
					</p>
				</div>
				<!-- Card 2 -->
				<div class="bg-[#FBFADA] p-6 rounded-xl shadow text-center">
					<div class="flex justify-center mb-3">
						<img
							src="/src/assets/Clock.png"
							alt="Real-time Availability"
							class="w-48 h-36"
						/>
					</div>
					<h3 class="font-bold text-xl mb-2">Real-time Availability</h3>
					<p class="text-[#12372A]">See Available Slots from 7 AM onwards instantly</p>
				</div>
				<!-- Card 3 -->
				<div class="bg-[#FBFADA] p-6 rounded-xl shadow text-center">
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

		<!-- Latest Reviews -->
		<section class="max-w-7xl mt-16 mx-auto text-[#12372A] text-left">
			<h2 class="text-6xl font-light mb-1 font-['Jomhuria'] text-[#12372A]">
				Latest Reviews
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<!-- Review Card 1 -->
				<div class="bg-white p-5 rounded-xl shadow border border-gray-300">
					<div class="flex justify-between items-center mt-6 mb-2">
						<div class="font-semibold text-lg text-[#374151]">Aaron</div>
						<div class="text-base text-[#bdbdbd]">13/06/2025</div>
					</div>
					<h3 class="font-bold text-xl mb-1">Lab Booking Made Simple</h3>
					<p class="mb-3 text-[#374151]">
						GrabLab takes the hassle out of reserving lab space. It's fast, reliable,
						and super easy to use.
					</p>
				</div>
				<!-- Review Card 2 -->
				<div class="bg-white p-5 rounded-xl shadow border border-gray-300">
					<div class="flex justify-between items-center mt-6 mb-2">
						<div class="font-semibold text-lg text-[#374151]">Josh</div>
						<div class="text-base text-[#bdbdbd]">14/06/2025</div>
					</div>
					<h3 class="font-bold text-xl mb-1">Finally, No More Double Bookings</h3>
					<p class="mb-3 text-[#374151]">
						I love how I can see real-time availability and avoid schedule conflicts.
						GrabLab is a lifesaver during thesis season!
					</p>
				</div>
				<!-- Review Card 3 -->
				<div class="bg-white p-5 rounded-xl shadow border border-gray-300">
					<div class="flex justify-between items-center mt-6 mb-2">
						<div class="font-semibold text-lg text-[#374151]">John</div>
						<div class="text-base text-[#bdbdbd]">15/06/2025</div>
					</div>
					<h3 class="font-bold text-xl mb-1">Good UX</h3>
					<p class="mb-3 text-[#374151]">
						The user experience is top-notch. Everything is intuitive and easy to find.
					</p>
				</div>
			</div>
		</section>

    <!-- Footer -->
    <footer class="bg-[#12372A] text-[#FBFADA] text-center p-4 mt-10  font-bold">
      <div class="flex justify-center gap-2">
      <p>&copy; 2025 GrabLab. All rights reserved.<br /></p>
    </div>
    </footer>
  </div>
</template>

<script>
export default {
	name: 'LandingPage',
}
</script>
