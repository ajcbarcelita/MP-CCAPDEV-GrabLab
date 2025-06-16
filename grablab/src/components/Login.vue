<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import users from '@/data/users.js'

// This login mechanism will only serve to demonstrate how landing pages can differ depending if logged in or not.
// This will be changed in the future to use a proper authentication system.

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

function handleLogin() {
	const user = users.find((u) => u.email === email.value && u.password === password.value)
	if (user) {
		// Store user info (simple, not secure)
		sessionStorage.setItem('user', JSON.stringify(user))
		error.value = ''
		// Redirect based on role
		if (user.role === 'Technician') {
			// router.push('/technician-dashboard')
		} else if (user.role === 'Student') {
			router.push('/student-landing')
		} else {
			router.push('/')
		}
	} else {
		error.value = 'Invalid email or password'
	}
}
</script>

<template>
	<div class="login-container">
		<div class="login-form">
			<h2 class="login-title">Login</h2>
			<p class="login-subtitle">Welcome back.</p>
			<p class="login-signup">
				New to GrabLab?
				<router-link to="/signup">Sign Up.</router-link>
			</p>

			<div v-if="error" class="error-message">
				{{ error }}
			</div>

			<form @submit.prevent="handleLogin">
				<div>
					<label>DLSU E-mail</label>
					<input v-model="email" class="login-input" placeholder="name@dlsu.edu.ph" />
				</div>

				<div>
					<label>Password</label>
					<input v-model="password" class="login-input" placeholder="••••••••" />
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

<style>
@import '@/assets/login_styles.css';
</style>
