<template>
	<div id="app-bg">
		<!-- Navbar -->
		<div id="navbar">
			<span id="navbar-brand">GrabLab Admin</span>
			<div id="links" class="flex items-center">
				<router-link id="profile" to="/profile">Profile</router-link>
				<router-link id="admin-home" to="/admin-landing" class="ml-4">Home</router-link>
				<a id="logout" href="#" @click.prevent="logout">Log Out</a>
			</div>
		</div>

		<div class="min-h-screen flex flex-col">
			<div class="flex-1">
				<!-- Title and Add Button -->
				<div class="flex justify-between items-center px-8 py-6">
					<h1 class="font-['Jomhuria'] text-5xl text-[#12372A]">Manage Technicians</h1>
					<button
						class="bg-[#436850] hover:bg-[#234c36] text-[#FBFADA] font-bold py-3 px-6 rounded-lg text-xl"
						@click="showAddForm = true"
					>
						+ Add Technician
					</button>
				</div>

				<!-- Technician List -->
				<div v-if="loading" class="text-center py-10 text-xl text-[#12372A]">
					Loading technicians...
				</div>
				<div
					v-else-if="technicians.length === 0"
					class="text-center py-10 text-xl text-[#d32f2f]"
				>
					No technicians found.
				</div>
				<div class="lab-slots-grid">
					<div v-for="tech in technicians" :key="tech._id" class="lab-card">
						<div class="lab-card-header">{{ tech.fname }} {{ tech.lname }}</div>
						<div class="lab-card-body">
							<div class="lab-info">
								<span class="lab-info-label">Email:</span> {{ tech.email }}
							</div>
							<div class="lab-info">
								<span class="lab-info-label">Status:</span>
								<span
									:class="
										tech.status === 'Active' ? 'text-green-600' : 'text-red-600'
									"
									>{{ tech.status }}</span
								>
							</div>
							<div class="lab-info">
								<span class="lab-info-label">ID:</span> {{ tech.user_id }}
							</div>
						</div>
						<div class="lab-card-actions">
							<button
								class="lab-btn bg-[#f39c12] text-white"
								@click="editTechnician(tech)"
							>
								Edit
							</button>
							<button
								v-if="tech.status === 'Active'"
								class="lab-btn bg-[#d32f2f] text-white"
								@click="setStatus(tech._id, 'Inactive')"
							>
								Deactivate
							</button>
							<button
								v-else
								class="lab-btn bg-green-600 text-white"
								@click="setStatus(tech._id, 'Active')"
							>
								Activate
							</button>
						</div>
					</div>
				</div>

				<!-- Add/Edit Technician Modal -->
				<div
					v-if="showAddForm || editTech"
					class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
				>
					<div class="bg-[#FBFADA] rounded-xl shadow-lg p-8 w-full max-w-md">
						<h2 class="text-3xl font-bold mb-4 text-[#12372A]">
							{{ editTech ? 'Edit Technician' : 'Add Technician' }}
						</h2>
						<form @submit.prevent="submitTechForm">
							<div class="mb-4">
								<label class="block text-[#436850] mb-1">First Name</label>
								<input
									v-model="form.fname"
									class="w-full p-2 border rounded"
									required
								/>
							</div>
							<div class="mb-4">
								<label class="block text-[#436850] mb-1">Last Name</label>
								<input
									v-model="form.lname"
									class="w-full p-2 border rounded"
									required
								/>
							</div>
							<div class="mb-4">
								<label class="block text-[#436850] mb-1">Email</label>
								<input
									v-model="form.email"
									type="email"
									class="w-full p-2 border rounded"
									required
								/>
							</div>
							<div class="mb-4" v-if="!editTech">
								<label class="block text-[#436850] mb-1">Password</label>
								<input
									v-model="form.password"
									type="password"
									class="w-full p-2 border rounded"
									required
								/>
							</div>
							<div class="mb-4">
								<label class="block text-[#436850] mb-1">Status</label>
								<select v-model="form.status" class="w-full p-2 border rounded">
									<option value="Active">Active</option>
									<option value="Inactive">Inactive</option>
								</select>
							</div>
							<div class="flex justify-end gap-3 mt-6">
								<button type="button" class="lab-btn" @click="closeForm">
									Cancel
								</button>
								<button type="submit" class="lab-btn bg-[#436850] text-[#FBFADA]">
									{{ editTech ? 'Save Changes' : 'Add Technician' }}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<footer class="bg-[#12372A] text-[#FBFADA] text-center p-4 text-sm font-bold">
			<div class="flex justify-center gap-2">
				<p>&copy; 2025 GrabLab. All rights reserved.<br /></p>
			</div>
		</footer>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users_store'
import { useLandingPage } from '@/composables/useLandingPage'

const usersStore = useUsersStore()
const router = useRouter()
const { logout } = useLandingPage()
const loading = ref(false)
const technicians = ref([])
const showAddForm = ref(false)
const editTech = ref(null)
const form = ref({
	fname: '',
	lname: '',
	email: '',
	password: '',
	status: 'Active',
})

// Fetch technicians from store/backend
async function fetchTechnicians() {
	loading.value = true
	await usersStore.fetchUsers()
	technicians.value = usersStore.users.filter((u) => u.role === 'Technician')
	loading.value = false
}

onMounted(fetchTechnicians)

// Add/Edit Technician
function closeForm() {
	showAddForm.value = false
	editTech.value = null
	form.value = { fname: '', lname: '', email: '', password: '', status: 'Active' }
}

function editTechnician(tech) {
	editTech.value = tech
	form.value = { ...tech, password: '' }
	showAddForm.value = true
}

async function submitTechForm() {
	if (editTech.value) {
		await usersStore.updateTechnician(editTech.value._id, form.value)
	} else {
		// Always set role to Technician
		await usersStore.addTechnician({ ...form.value, role: 'Technician' })
	}
	await fetchTechnicians()
	closeForm()
}

async function setStatus(id, status) {
	await usersStore.updateTechnician(id, { status })
	await fetchTechnicians()
}
</script>

<style scoped>
@import '@/assets/landing_page.css';

/* Modal overrides */
.bg-black.bg-opacity-40 {
	backdrop-filter: blur(2px);
}
</style>
