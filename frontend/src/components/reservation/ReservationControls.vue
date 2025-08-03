<style scoped>
@import '@/assets/reservations.css';
</style>

<template>
	<div class="lg:col-span-1 space-y-4">
		<!-- Back Button -->
		<button
			@click="$emit('goBack')"
			class="w-full grablab-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg transition-colors duration-200"
		>
			← Go Back to Labs
		</button>

		<!-- Lab Selector -->
		<div class="bg-white rounded-lg shadow-sm p-4">
			<label class="block text-sm font-medium text-gray-700 mb-2">Lab Selector</label>
			<select
				:value="selectedLab"
				@change="$emit('update:selectedLab', $event.target.value)"
				class="w-full p-3 border border-gray-300 rounded-lg"
			>
				<option value="">Select Lab</option>
				<option v-for="lab in allLabs" :key="lab._id" :value="lab._id">
					{{ lab.display_name }}
				</option>
			</select>
		</div>

		<!-- Date Selector -->
		<div class="bg-white rounded-lg shadow-sm p-4">
			<label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
			<input
				type="date"
				:value="selectedDate"
				:min="minDate"
				:max="maxDate"
				@change="$emit('update:selectedDate', $event.target.value)"
				class="w-full p-3 border border-gray-300 rounded-lg"
			/>
		</div>

		<!-- Quick Reserve Panel -->
		<div class="bg-white rounded-lg shadow-sm p-4" v-if="selectedSlots.length > 0">
			<h3 class="font-medium text-gray-800 mb-3">Reserve Selected Slots</h3>
			<p class="text-sm text-gray-600 mb-2">
				Lab: {{ getLabName(selectedLab) }}, Date: {{ formatDate(selectedDate) }}
			</p>
			<ul class="text-sm text-gray-600 mb-3 max-h-24 overflow-y-auto border p-2 rounded">
				<li v-for="slot in selectedSlots" :key="slot.identifier">
					Seat {{ slot.seat }} at {{ slot.timeSlot.startTime }} -
					{{ slot.timeSlot.endTime }}
				</li>
			</ul>

			<div class="space-y-3">
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						:checked="reserveAnonymously"
						@change="$emit('update:reserveAnonymously', $event.target.checked)"
					/>
					<span class="text-sm">Reserve Anonymously</span>
				</label>

				<div v-if="showStudentIdInput">
					<label class="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
					<input
						type="text"
						:value="studentIdForReservation"
						@input="$emit('update:studentIdForReservation', $event.target.value)"
						placeholder="Student ID"
						class="w-full p-2 border rounded"
					/>
					<p class="text-xs text-gray-500 mt-1">For technicians</p>
				</div>

				<button
					@click="$emit('reserveSlot')"
					class="w-full grablab-primary text-white py-3 rounded-lg font-medium hover:opacity-90"
				>
					{{ isEditing ? 'Update Reservation' : 'Reserve Slot' }}
				</button>
				<button
					@click="$emit('clearSelection')"
					class="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
	selectedLab: {
		type: String,
		default: '',
	},
	selectedDate: {
		type: String,
		required: true,
	},
	selectedSlots: {
		type: Array,
		default: () => [],
	},
	reserveAnonymously: {
		type: Boolean,
		default: false,
	},
	studentIdForReservation: {
		type: String,
		default: '',
	},
	allLabs: {
		type: Array,
		default: () => [],
	},
	minDate: {
		type: String,
		required: true,
	},
	maxDate: {
		type: String,
		required: true,
	},
	showStudentIdInput: {
		type: Boolean,
		default: false,
	},
	isEditing: {
		type: Boolean,
		default: false,
	},
})

// Emits
const emit = defineEmits([
	'goBack',
	'update:selectedLab',
	'update:selectedDate',
	'update:reserveAnonymously',
	'update:studentIdForReservation',
	'reserveSlot',
	'clearSelection',
])

// Computed
const getLabName = (labId) => {
	if (!labId) return 'No Lab Selected'
	const lab = props.allLabs.find((l) => l._id === labId)
	return lab ? lab.display_name : 'Unknown Lab'
}

const formatDate = (dateStr) => {
	if (!dateStr) return 'Invalid Date'
	const date = new Date(dateStr)
	if (isNaN(date)) return 'Invalid Date'
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}
</script>
