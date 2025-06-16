import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from './components/LandingPage.vue'
import StudentMain from './components/student_main.vue'
import Profile_Page from './components/Profile_Page.vue'
import Login from './components/Login.vue' // add this line

const routes = [
	{ path: '/', component: LandingPage },
	{ path: '/student', component: StudentMain },
	{ path: '/profile', component: Profile_Page },
	{ path: '/login', component: Login }, // add this line
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
