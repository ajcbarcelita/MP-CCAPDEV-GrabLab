<template>
	<div class="login-container">
		<div class="login-form">
			<h2 class="login-title">Login</h2>
			<p class="login-subtitle">Welcome back.</p>
			<p class="login-signup">
				New to GrabLab?
				<router-link to="/signup">Sign Up.</router-link>
			</p>

			<form>
				<div>
					<label>DLSU E-mail</label>
					<input type="email" class="login-input" placeholder="name@dlsu.edu.ph" />
				</div>

				<div>
					<label>Password</label>
					<input type="password" class="login-input" placeholder="••••••••" />
				</div>

				<div class="login-checkbox">
					<input type="checkbox" id="remember" class="mr-2" />
					<label for="remember">Remember Me</label>
				</div>

				<button type="submit" class="login-button">
					Login <span class="text-lg">→</span>
				</button>
			</form>
		</div>

		<div class="branding-section">
			<h1 class="branding-title">GrabLab</h1>
			<p class="branding-tagline">Reserve Lab Rooms<br />Effortlessly</p>
		</div>
	</div>
</template>

<script setup></script>

<style>
@import '@/assets/login_styles.css';
</style>
