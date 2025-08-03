import { createRouter, createWebHistory } from 'vue-router'
import GuestLanding from './components/GuestLanding.vue'
import StudentLanding from './components/StudentLanding.vue'
import Profile_Page from './components/Profile_Page.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import TechLanding from './components/TechLanding.vue'
import Reservation from './components/reservation/ReservationPage.vue'
import View from './components/View.vue'
import AdminLanding from './components/AdminLanding.vue'
import AdminManageTechnicians from './components/AdminManageTechnicians.vue'

import { useUsersStore } from '@/stores/users_store'

// import the components you want to use in your routes
// then list all the routes you want to use in your app, path and correspondng component
const routes = [
	{ path: '/', component: GuestLanding },
	{ path: '/login', component: Login },
	{ path: '/register', component: Register },
	{ path: '/student-landing', component: StudentLanding, meta: { requiresAuth: true } },
	{ path: '/technician-landing', component: TechLanding, meta: { requiresAuth: true } },
	{ path: '/profile', component: Profile_Page, meta: { requiresAuth: true } },
	{ path: '/reservation/:labId', component: Reservation, meta: { requiresAuth: true } },
	{
		path: '/reservation/:labId/:reservationId',
		component: Reservation,
		meta: { requiresAuth: true },
	},
	{ path: '/view', component: View, meta: { requiresAuth: true } },
	{ path: '/admin-landing', component: AdminLanding, meta: { requiresAuth: true } },
	{
		path: '/admin-manage-technicians',
		component: AdminManageTechnicians,
		meta: { requiresAuth: true, requiresAdmin: true },
	},
	{ path: '/profile/:userId', component: Profile_Page, meta: { requiresAuth: true } },
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach((to, from, next) => {
	const usersStore = useUsersStore()
	// Restore session if needed
	if (!usersStore.currentUser) {
		usersStore.initUserSession()
	}
	// Check if the route requires authentication, if so, check if the user is logged in
	// I feel like this logic isnt fully correct, but it works for now
	if (to.matched.some((record) => record.meta.requiresAuth) && !usersStore.currentUser) {
		return next('/login')
	}
	// Check for admin access
	if (
		to.matched.some((record) => record.meta.requiresAdmin) &&
		usersStore.currentUser?.role !== 'Admin'
	) {
		return next('/login')
	}
	next()
})
// Create a nav guard for RBAC redirection with router.beforeEach
// For example, if user is not logged in, redirect to guest landing page
// If user is logged in, redirect to either student or technician landing page, but cannot go back to guest landing page

export default router
