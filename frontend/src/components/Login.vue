<style>
@import '@/assets/login_styles.css';
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthentication } from '@/composables/useAuthentication'

const credentials = ref({
    email: '',
    password: '',
    rememberMe: false
})

const { login, error, loading } = useAuthentication()
const route = useRoute()
const success = ref('')

onMounted(() => {
    if (route.query.registered === 'true') {
        success.value = 'Registration successful! You may now log in.'
    }
})

async function handleLogin() {
    try {
        await login(credentials.value)
    } catch (err) {
        // Error is handled by the composable
        console.error(err)
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
					<input v-model="credentials.email" class="login-input" placeholder="name@dlsu.edu.ph" />
				</div>

				<div>
					<label>Password</label>
					<input
						v-model="credentials.password"
						type="password"
						class="login-input"
						placeholder="••••••••"
					/>
				</div>

				<div class="login-checkbox">
					<input type="checkbox" id="rememberMe" class="mr-2" v-model="credentials.rememberMe" />
					<label for="rememberMe">Remember Me</label>
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
