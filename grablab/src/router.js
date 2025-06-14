import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from './components/LandingPage.vue'
import StudentMain from './components/student_main.vue'
import Profile_Page from './components/Profile_Page.vue'

const routes = [
  { path: '/', component: LandingPage },
  { path: '/student', component: StudentMain },
  { path: '/profile', component: Profile_Page}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
