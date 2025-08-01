<template>
	<div id="app-bg" class="flex flex-col min-h-screen">
		<!-- Navbar -->
		<div id="navbar" class="flex justify-between items-center px-8 py-4 bg-[#436850]">
			<span id="navbar-brand" class="text-4xl font-['Jomhuria'] text-[#FBFADA]"
				>GrabLab Admin</span
			>
			<div id="links" class="flex items-center">
				<router-link
					id="profile"
					to="/profile"
					class="font-['Jomhuria'] text-[35px] mr-6 text-[#adbc9f] hover:underline"
					>Profile</router-link
				>
				<router-link
					id="admin-home"
					to="/admin-landing"
					class="font-['Jomhuria'] text-[35px] mr-6 text-[#adbc9f] hover:underline"
					>Home</router-link
				>
				<a
					id="logout"
					href="#"
					@click.prevent="logout"
					class="font-['Jomhuria'] text-[35px] text-[#adbc9f] hover:underline"
					>Log Out</a
				>
			</div>
		</div>

		<div class="flex-1 px-8 py-6">
			<!-- Title and Add Button -->
			<div class="flex justify-between items-center mb-8">
				<h1 class="font-['Jomhuria'] text-5xl text-[#12372A]">Manage Technicians</h1>
				<button class="btn btn-add text-xl" @click="openAddForm">+ Add Technician</button>
			</div>

			<!-- Message Box -->
			<div
				v-if="message"
				:class="[
					'admin-message',
					messageType === 'success' ? 'admin-message-success' : 'admin-message-error',
				]"
			>
				{{ message }}
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
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				<div v-for="tech in technicians" :key="tech._id" class="tech-card">
					<div class="tech-card-header">{{ tech.first_name }} {{ tech.last_name }}</div>
					<div class="tech-card-body text-lg">
						<div>
							<span class="font-bold text-[#436850]">Email:</span> {{ tech.email }}
						</div>
						<div>
							<span class="font-bold text-[#436850]">Status:</span>
							<span
								:class="
									tech.status === 'Active' ? 'text-green-600' : 'text-red-600'
								"
								>{{ tech.status }}</span
							>
						</div>
						<div>
							<span class="font-bold text-[#436850]">ID:</span> {{ tech.user_id }}
						</div>
					</div>
					<div class="tech-card-actions">
						<button class="btn btn-edit" @click="openEditForm(tech)">Edit</button>
						<button v-if="tech.status === 'Active'" class="btn btn-deactivate" @click="setStatus(tech.user_id, 'Inactive')">Deactivate</button>
						<button v-else class="btn btn-activate" @click="setStatus(tech.user_id, 'Active')">Reactivate</button>
					</div>
				</div>
			</div>

			<!-- Add/Edit Technician Modal -->
			<div v-if="showForm" class="admin-modal-overlay">
				<div class="admin-modal-content">
					<h2 class="text-3xl font-bold mb-4 text-[#12372A]">
						{{ isEdit ? 'Edit Technician' : 'Add Technician' }}
					</h2>
					<form @submit.prevent="submitTechForm">
						<div v-if="error" class="admin-message admin-message-error">
							{{ error }}
						</div>
						<label class="admin-form-label">First Name<span class="text-red-600">*</span></label>
						<input v-model="form.fname" class="admin-form-input" required />
						<label class="admin-form-label">Middle Name</label>
						<input v-model="form.mname" class="admin-form-input" />
						<label class="admin-form-label">Last Name<span class="text-red-600">*</span></label>
						<input v-model="form.lname" class="admin-form-input" required />
						<label class="admin-form-label">Email<span class="text-red-600">*</span></label>
						<input
							v-model="form.email"
							type="email"
							class="admin-form-input"
							required
						/>
						<div v-if="!isEdit">
							<label class="admin-form-label">Password<span class="text-red-600">*</span></label>
							<input
								v-model="form.password"
								type="password"
								class="admin-form-input"
								required
							/>
							<label class="admin-form-label">Confirm Password<span class="text-red-600">*</span></label>
							<input
								v-model="form.confirmPassword"
								type="password"
								class="admin-form-input"
								required
							/>
						</div>
						<label class="admin-form-label">Status<span class="text-red-600">*</span></label>
						<select v-model="form.status" class="admin-form-select">
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
						</select>
						<div class="flex justify-end gap-3 mt-6">
							<button type="button" class="btn btn-cancel" @click="closeForm">
								Cancel
							</button>
							<button type="submit" class="btn btn-save">
								{{ isEdit ? 'Save Changes' : 'Add Technician' }}
							</button>
						</div>
					</form>
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
import '@/assets/admin_manage_tech.css'

const usersStore = useUsersStore()
const router = useRouter()
const { logout } = useLandingPage()
const message = ref('')
const messageType = ref('success') // 'success' or 'error'
const loading = ref(false)
const technicians = ref([])
const showForm = ref(false)
const isEdit = ref(false)
const error = ref('')
const editTech = ref(null)
const form = ref({
	fname: '',
	mname: '',
	lname: '',
	email: '',
	password: '',
	confirmPassword: '',
	status: 'Active',
})

async function fetchTechnicians() {
	loading.value = true
	await usersStore.fetchUsers()
	technicians.value = usersStore.users.filter((u) => u.role === 'Technician')
	loading.value = false
}

onMounted(fetchTechnicians)

function openAddForm() {
	showForm.value = true
	isEdit.value = false
	editTech.value = null
	error.value = ''
	form.value = {
		fname: '',
		mname: '',
		lname: '',
		email: '',
		password: '',
		confirmPassword: '',
		status: 'Active',
	}
}

function openEditForm(tech) {
	showForm.value = true
	isEdit.value = true
	editTech.value = tech
	error.value = ''
	form.value = {
		fname: tech.first_name,
		mname: tech.mname || '',
		lname: tech.last_name,
		email: tech.email,
		password: '',
		confirmPassword: '',
		status: tech.status,
	}
}

function closeForm() {
	showForm.value = false
	isEdit.value = false
	editTech.value = null
	error.value = ''
	form.value = {
		fname: '',
		mname: '',
		lname: '',
		email: '',
		password: '',
		confirmPassword: '',
		status: 'Active',
	}
}

async function submitTechForm() {
	const emailPattern = /^[a-zA-Z0-9._%+-]+@dlsu\.edu\.ph$/
	if (!emailPattern.test(form.value.email)) {
		error.value = 'Please enter a valid DLSU email address.'
		return
	}
	if (!isEdit.value && form.value.password !== form.value.confirmPassword) {
		error.value = 'Passwords do not match.'
		return
	}
	try {
		if (isEdit.value && editTech.value) {
			await usersStore.updateTechnician(editTech.value.user_id, {
				fname: form.value.fname,
				mname: form.value.mname,
				lname: form.value.lname,
				email: form.value.email,
				status: form.value.status,
			})
			message.value = 'Technician updated successfully!'
			messageType.value = 'success'
		} else {
			await usersStore.addTechnician({
				fname: form.value.fname,
				mname: form.value.mname,
				lname: form.value.lname,
				email: form.value.email,
				password: form.value.password,
				role: 'Technician',
				status: form.value.status,
				description: '',
			})
			message.value = 'Technician added successfully!'
			messageType.value = 'success'
		}
		await fetchTechnicians()
		closeForm()
	} catch (err) {
		error.value = err.response?.data?.message || 'Failed to save technician.'
		message.value = error.value
		messageType.value = 'error'
	}
}

async function setStatus(id, status) {
	try {
		await usersStore.updateTechnician(id, { status })
		await fetchTechnicians()
		message.value = status === 'Active' ? 'Technician reactivated!' : 'Technician deactivated!'
		messageType.value = 'success'
	} catch (err) {
		error.value = err.response?.data?.message || 'Failed to update status.'
		message.value = error.value
		messageType.value = 'error'
	}
}
</script>

<style scoped>
@import '@/assets/admin_manage_tech.css';
</style>
