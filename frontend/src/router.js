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

const routes = [
    // Guest-only routes (only when NOT logged in)
    { 
        path: '/', 
        component: GuestLanding,
        meta: { requiresGuest: true }
    },
    { 
        path: '/login', 
        component: Login,
        meta: { requiresGuest: true }
    },
    { 
        path: '/register', 
        component: Register,
        meta: { requiresGuest: true }
    },

    // Role-specific landing pages
    { 
        path: '/student-landing', 
        component: StudentLanding, 
        meta: { requiresAuth: true, role: 'Student' }
    },
    { 
        path: '/technician-landing', 
        component: TechLanding, 
        meta: { requiresAuth: true, role: 'Technician' }
    },
    { 
        path: '/admin-landing', 
        component: AdminLanding, 
        meta: { requiresAuth: true, role: 'Admin' }
    },

    // Shared authenticated routes (all roles)
    { 
        path: '/profile', 
        component: Profile_Page, 
        meta: { requiresAuth: true }
    },

    // Student & Tech only routes
    { 
        path: '/reservation/:labId', 
        component: Reservation, 
        meta: { requiresAuth: true, roles: ['Student', 'Technician'] }
    },
    {
        path: '/reservation/:labId/:reservationId',
        component: Reservation,
        meta: { requiresAuth: true, roles: ['Student', 'Technician'] }
    },

    { 
        path: '/profile/:userId', 
        component: Profile_Page, 
        meta: { requiresAuth: true, roles: ['Student', 'Technician']}
    },  
	
    { 
        path: '/view', 
        component: View, 
        meta: { requiresAuth: true, roles: ['Student', 'Technician'] }
    },

    // Admin only routes
    {
        path: '/admin-manage-technicians',
        component: AdminManageTechnicians,
        meta: { requiresAuth: true, role: 'Admin' }
    }
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

// Updated navigation guard
router.beforeEach((to, from, next) => {
    const usersStore = useUsersStore()
    if (!usersStore.currentUser) {
        usersStore.initUserSession()
    }
    
    const user = usersStore.currentUser

    // Guest-only routes check
    if (to.meta.requiresGuest && user) {
        // Redirect logged-in users to their landing page
        const roleRoutes = {
            'Student': '/student-landing',
            'Technician': '/technician-landing',
            'Admin': '/admin-landing'
        }
        return next(roleRoutes[user.role])
    }

    // Auth required check
    if (to.meta.requiresAuth && !user) {
        return next('/login')
    }

    // Role-specific route check
    if (to.meta.role && user?.role !== to.meta.role) {
        // Redirect to user's landing if wrong role
        const roleRoutes = {
            'Student': '/student-landing',
            'Technician': '/technician-landing',
            'Admin': '/admin-landing'
        }
        return next(roleRoutes[user.role] || '/login')
    }

    // Multiple roles check (for Student & Tech routes)
    if (to.meta.roles && !to.meta.roles.includes(user?.role)) {
        const roleRoutes = {
            'Student': '/student-landing',
            'Technician': '/technician-landing',
            'Admin': '/admin-landing'
        }
        return next(roleRoutes[user.role] || '/login')
    }

    next()
})

export default router
