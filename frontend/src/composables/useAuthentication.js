import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users_store'

export function useAuthentication() {
    const router = useRouter()
    const usersStore = useUsersStore()
    const error = ref('')
    const loading = ref(false)

    const roleRoutes = {
        'Student': '/student-landing',
        'Technician': '/technician-landing',
        'Admin': '/admin-landing'
    }

        async function login(credentials) {
            loading.value = true
            try {
                // Add validation
                if (!credentials.email || !credentials.password) {
                    throw new Error('Email and password are required')
                }
                
                const user = await usersStore.loginUser(credentials)
                await router.push(roleRoutes[user.role] || '/')
                return user
            } catch (err) {
                error.value = err.response?.data?.message || 'Login failed'
                throw error
            } finally {
                loading.value = false
            }
        }

    function logout() {
        usersStore.clearUserSession()
        router.push('/')
    }

    return {
        login,
        logout,
        error,
        loading
    }
}