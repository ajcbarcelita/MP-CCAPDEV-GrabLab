<style scoped>
@import '@/assets/reservations.css';
</style>

<template>
	<div class="lg:col-span-3">
		<div class="bg-white rounded-lg shadow-sm p-6">
			<h2 class="font-jersey text-xl text-grablab-primary mb-4">
				{{ selectedLab ? getLabName(selectedLab) : 'Select a Lab' }} Schedule
				{{ isEditing ? ' (Editing)' : '' }}
			</h2>

			<!-- Loading indicator -->
			<div v-if="isLoadingSchedule" class="text-center py-12">
				<div
					class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"
				></div>
				<p class="text-gray-500 mt-4">Loading schedule...</p>
			</div>

			<div v-else-if="!selectedLab" class="text-center py-12 text-gray-500">
				Please select a lab to view the schedule
			</div>

			<div v-else>
				<!-- Operating Hours Info -->
				<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
					<p class="text-sm text-blue-800">
						Operating Hours: {{ getLabOperatingHours(selectedLab) }}
					</p>
				</div>

				<!-- Time Slot Filter -->
				<div class="flex justify-center gap-4 mb-4 flex-wrap">
					<button
						@click="$emit('setTimeFilter', 'Morning')"
						:class="{
							'grablab-secondary text-white': timeFilter === 'Morning',
							'bg-gray-200 text-gray-700': timeFilter !== 'Morning',
						}"
						class="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors duration-200"
					>
						Morning (7 AM - 12 PM)
					</button>
					<button
						@click="$emit('setTimeFilter', 'Afternoon')"
						:class="{
							'grablab-secondary text-white': timeFilter === 'Afternoon',
							'bg-gray-200 text-gray-700': timeFilter !== 'Afternoon',
						}"
						class="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors duration-200"
					>
						Afternoon (12 PM - 6 PM)
					</button>
					<button
						@click="$emit('setTimeFilter', 'Evening')"
						:class="{
							'grablab-secondary text-white': timeFilter === 'Evening',
							'bg-gray-200 text-gray-700': timeFilter !== 'Evening',
						}"
						class="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors duration-200"
					>
						Evening (6 PM - 7 PM)
					</button>
				</div>

				<div class="overflow-x-auto custom-scrollbar">
					<!-- Time Header -->
					<div class="schedule-grid mb-2 min-w-max">
						<div class="font-medium text-center py-2"></div>
						<div
							v-for="timeSlot in filteredTimeSlots"
							:key="`${timeSlot.startTime}-${timeSlot.endTime}`"
							class="font-medium text-center py-2 text-sm"
						>
							{{ timeSlot.startTime }} - {{ timeSlot.endTime }}
						</div>
					</div>

					<!-- Seat Rows -->
					<div
						class="schedule-grid min-w-max"
						v-for="seat in currentSeatsPage"
						:key="seat"
					>
						<div class="font-medium text-center py-3 bg-gray-50 rounded">
							Seat {{ seat }}
						</div>
						<button
							v-for="timeSlot in filteredTimeSlots"
							:key="`${seat}-${timeSlot.startTime}`"
							@click="$emit('handleSlotClick', seat, timeSlot)"
							:class="getSlotClass(seat, timeSlot)"
							class="seat-button rounded text-xs font-medium transition-all hover:scale-105"
						>
							{{ getSlotText(seat, timeSlot) }}
						</button>
					</div>
				</div>

				<!-- Pagination Controls -->
				<div class="flex justify-between items-center mt-6 p-2 bg-gray-100 rounded-lg">
					<button
						@click="$emit('prevPage')"
						:disabled="currentPage === 1"
						class="flex items-center gap-1 px-4 py-2 grablab-primary text-white rounded-lg font-medium hover:bg-grablab-primary transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							></path>
						</svg>
						Previous
					</button>

					<div class="flex items-center gap-2">
						<span class="text-sm text-gray-600">
							Page {{ currentPage }} of {{ totalPages }}
						</span>
						<span class="text-sm text-gray-500">
							({{ currentSeatsPage.length }} seats)
						</span>
					</div>

					<button
						@click="$emit('nextPage')"
						:disabled="currentPage === totalPages"
						class="flex items-center gap-1 px-4 py-2 grablab-primary text-white rounded-lg font-medium hover:bg-grablab-primary transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Next
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							></path>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
// Props
const props = defineProps({
	selectedLab: {
		type: String,
		default: '',
	},
	allLabs: {
		type: Array,
		default: () => [],
	},
	isLoadingSchedule: {
		type: Boolean,
		default: false,
	},
	filteredTimeSlots: {
		type: Array,
		default: () => [],
	},
	currentSeatsPage: {
		type: Array,
		default: () => [],
	},
	currentPage: {
		type: Number,
		default: 1,
	},
	totalPages: {
		type: Number,
		default: 1,
	},
	timeFilter: {
		type: String,
		default: 'Morning',
	},
	isEditing: {
		type: Boolean,
		default: false,
	},
	selectedSlots: {
		type: Array,
		default: () => [],
	},
	isSlotOccupied: {
		type: Function,
		required: true,
	},
	getSlotClass: {
		type: Function,
		required: true,
	},
	getSlotText: {
		type: Function,
		required: true,
	},
})

// Emits
const emit = defineEmits(['setTimeFilter', 'handleSlotClick', 'prevPage', 'nextPage'])

// Methods
const getLabName = (labId) => {
	if (!labId) return 'No Lab Selected'
	const lab = props.allLabs.find((l) => l._id === labId)
	return lab ? lab.display_name : 'Unknown Lab'
}

const getLabOperatingHours = (labId) => {
	if (!labId) return 'N/A'
	const lab = props.allLabs.find((l) => l._id === labId)
	if (!lab || !lab.operating_hours) return 'N/A'
	return `${lab.operating_hours.open} - ${lab.operating_hours.close}`
}
</script>
