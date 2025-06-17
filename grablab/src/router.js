import { createRouter, createWebHistory } from 'vue-router'
import GuestLanding from './components/GuestLanding.vue'
import StudentLanding from './components/StudentLanding.vue'
import Profile_Page from './components/Profile_Page.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import TechLanding from './components/TechLanding.vue'

// import the components you want to use in your routes
// then list all the routes you want to use in your app, path and correspondng component
const routes = [
	{ path: '/', component: GuestLanding },
	{ path: '/student-landing', component: StudentLanding },
  { path: '/technician-landing', component: TechLanding }, // Assuming the same component for technician landing
	{ path: '/profile', component: Profile_Page },
	{ path: '/login', component: Login },
	{ path: '/register', component: Register },
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

// Create a nav guard for RBAC redirection with router.beforeEach
// For example, if user is not logged in, redirect to guest landing page
// If user is logged in, redirect to either student or technician landing page, but cannot go back to guest landing page

export default router
