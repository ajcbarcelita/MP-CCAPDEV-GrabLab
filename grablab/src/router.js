import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from './components/LandingPage.vue'
import StudentMain from './components/student_main.vue'

const routes = [
  { path: '/', component: LandingPage },
  { path: '/student', component: StudentMain }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
