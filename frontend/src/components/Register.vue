<style scoped>
@import '@/assets/register_styles.css';
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users_store.js'
import axios from 'axios'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const middleName = ref('')
const lastName = ref('')
const role = ref('Student') // Default role for new users
const error = ref('')

const router = useRouter()
const usersStore = useUsersStore()

// Replace the handleRegister function with:
async function handleRegister() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/
    if (!emailPattern.test(email.value)) {
        error.value = 'Please enter a valid DLSU email address.'
        return
    }
    if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match.'
        return
    }

    try {
        await usersStore.registerUser({
            email: email.value,
            password: password.value,
            fname: firstName.value,
            mname: middleName.value,
            lname: lastName.value,
            role: role.value,
            status: 'Active',
            profile_pic_path: '/uploads/profile_pictures/default_profile_picture.jpeg',
            description: '',
        })
        error.value = ''
        router.push({ path: '/login', query: { registered: 'true' } })
    } catch (err) {
        error.value = err.response?.data?.message || 'Registration failed. Please try again.'
    }
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
					<label class="form-label">Middle Name</label>
					<input
						v-model="middleName"
						type="text"
						class="form-input"
						placeholder="Middle Name"
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
