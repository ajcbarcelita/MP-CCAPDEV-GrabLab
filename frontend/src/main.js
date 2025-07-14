import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'
import router from './router'
import { useUsersStore } from '@/stores/users_store.js' // <-- Add this

const app = createApp(App)
app.config.devtools = true

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize user session BEFORE mounting the app
const usersStore = useUsersStore()
usersStore.initUserSession()

app.mount('#app')
