<style scoped>
@import '@/assets/register_styles.css';
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users_store.js'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const error = ref('')
const router = useRouter()
const usersStore = useUsersStore()

function handleRegister() {
	const emailPattern = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/
	if (!emailPattern.test(email.value)) {
		error.value = 'Please enter a valid DLSU email address.'
		return
	}
	if (password.value !== confirmPassword.value) {
		error.value = 'Passwords do not match.'
		return
	}
	const existingUser = usersStore.users.find((u) => u.email === email.value)
	if (existingUser) {
		error.value = 'Email already registered. Please use a different email.'
		return
	}
	const newUser = {
		user_id: Date.now(), // Simple unique ID based on timestamp
		email: email.value,
		password: password.value,
		first_name: firstName.value,
		last_name: lastName.value,
		role: 'Student', // Default role for new users
		status: 'Active', // Default status for new users
		profile_pic_path: '',
		description: '',
	}
	usersStore.addUser(newUser)
	error.value = ''
	router.push({ path: '/login', query: { registered: 'true' } })
}
</script>

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

			<form class="form-fields" @submit.prevent="handleRegister">
				<div v-if="error" class="error-message">
					{{ error }}
				</div>

				<div>
					<label class="form-label">First Name</label>
					<input
						v-model="firstName"
						type="text"
						class="form-input"
						placeholder="First Name"
					/>
				</div>

				<div>
					<label class="form-label">Last Name</label>
					<input
						v-model="lastName"
						type="text"
						class="form-input"
						placeholder="Last Name"
					/>
				</div>

				<div>
					<label class="form-label">DLSU E-mail</label>
					<input
						v-model="email"
						type="email"
						class="form-input"
						placeholder="name@dlsu.edu.ph"
					/>
				</div>
				<div>
					<label class="form-label">Password</label>
					<input
						v-model="password"
						type="password"
						class="form-input"
						placeholder="••••••••"
					/>
				</div>
				<div>
					<label class="form-label">Confirm Password</label>
					<input
						v-model="confirmPassword"
						type="password"
						class="form-input"
						placeholder="••••••••"
					/>
				</div>

				<button type="submit" class="form-button">Register <span>→</span></button>
			</form>
		</div>
	</div>
</template>

