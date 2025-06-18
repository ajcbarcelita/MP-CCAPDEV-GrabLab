<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/users_store.js'

// This login mechanism will only serve to demonstrate how landing pages can differ depending if logged in or not.
// This will be changed in the future to use a proper authentication system.

const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')
const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()

onMounted(() => {
	if (route.query.registered === 'true') {
		success.value = 'Registration successful! You may now log in.'
		// Optionally clear the query so it doesn't persist on refresh
		router.replace({ query: {} })
	}
})

function handleLogin() {
	const user = usersStore.users.find(
		(u) => u.email === email.value && u.password === password.value,
	)
	if (user) {
		sessionStorage.setItem('user', JSON.stringify(user))
		error.value = ''
		if (user.role === 'Technician') {
			router.push('/technician-landing')
		} else if (user.role === 'Student') {
			router.push('/student-landing')
		} else {
			router.push('/')
		}
	} else {
		error.value = 'Invalid email or password. Try again.'
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
				<router-link to="/register">Register.</router-link>
			</p>

			<div v-if="error" class="error-message">
				{{ error }}
			</div>

			<div v-if="success" class="success-message">
				{{ success }}
			</div>

			<form @submit.prevent="handleLogin">
				<div>
					<label>DLSU E-mail</label>
					<input v-model="email" class="login-input" placeholder="name@dlsu.edu.ph" />
				</div>

				<div>
					<label>Password</label>
					<input
						v-model="password"
						type="password"
						class="login-input"
						placeholder="••••••••"
					/>
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
