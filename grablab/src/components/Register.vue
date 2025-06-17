<script setup></script>

<template>
	<div class="register-container">
		<!-- Left Branding Section -->
		<div class="branding-section">
			<h1 class="branding-title">GrabLab</h1>
			<p class="branding-tagline">Reserve Lab Rooms<br />Effortlessly</p>
		</div>

		<!-- Right Register Form Section -->
		<div class="register-form">
			<h2 class="form-title">Register</h2>
			<p class="form-subtitle">We’re glad you’re here.</p>
			<p class="form-login-text">
				Have an account?
				<router-link to="/login" class="form-link">Log In.</router-link>
			</p>

			<form class="form-fields">
				<div>
					<label class="form-label">DLSU E-mail</label>
					<input type="email" class="form-input" placeholder="name@dlsu.edu.ph" />
				</div>
				<div>
					<label class="form-label">Password</label>
					<input type="password" class="form-input" placeholder="••••••••" />
				</div>
				<div>
					<label class="form-label">Confirm Password</label>
					<input type="password" class="form-input" placeholder="••••••••" />
				</div>

				<button type="submit" class="form-button">Register <span>→</span></button>
			</form>
		</div>
	</div>
</template>

<style scoped>
@import '@/assets/register_styles.css';
</style>
