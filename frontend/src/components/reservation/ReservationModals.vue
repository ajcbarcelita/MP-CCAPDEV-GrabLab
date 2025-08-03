<style scoped>
@import '@/assets/reservations.css';
</style>

<template>
	<!-- Reservation Details Modal -->
	<div
		v-if="showReservationDetailsModal"
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
		@click="$emit('closeReservationDetailsModal')"
	>
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" @click.stop>
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-lg font-semibold text-gray-900">Reservation Details</h3>
				<button
					@click="$emit('closeReservationDetailsModal')"
					class="text-gray-400 hover:text-gray-600 transition-colors"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			<div class="space-y-4">
				<!-- Lab and Date Info -->
				<div class="bg-gray-50 p-3 rounded-lg">
					<p class="text-sm text-gray-600">
						<strong>Lab:</strong> {{ getLabName(reservationDetails.lab_id) }}
					</p>
					<p class="text-sm text-gray-600">
						<strong>Reservation Date:</strong>
						{{
							formatDateTime(
								reservationDetails.reservation_date || reservationDetails.date,
							)
						}}
					</p>
				</div>

				<!-- Reserved Slots -->
				<div>
					<h4 class="font-medium text-gray-900 mb-2">Reserved Slots:</h4>
					<div class="max-h-48 overflow-y-auto border rounded-lg">
						<div class="divide-y">
							<div
								v-for="(slot, index) in reservationDetails.slots"
								:key="`${slot.seat}-${slot.timeSlot.startTime}`"
								class="bg-blue-50 p-3 border-blue-200 hover:bg-blue-100 transition-colors"
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-3">
										<span class="text-sm font-medium text-blue-600"
											>#{{ index + 1 }}</span
										>
										<div>
											<p class="text-sm font-medium text-gray-900">
												Seat {{ slot.seat }}
											</p>
											<p class="text-sm text-gray-600">
												{{ slot.timeSlot.startTime }} -
												{{ slot.timeSlot.endTime }}
											</p>
										</div>
									</div>
									<div class="w-3 h-3 bg-blue-400 rounded-full"></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- User Information -->
				<div v-if="reservationDetails.user">
					<h4 class="font-medium text-gray-900 mb-2">Reserved by:</h4>
					<div class="bg-gray-50 p-3 rounded-lg">
						<div v-if="reservationDetails.user.isAnonymous" class="text-center">
							<p class="text-sm text-gray-600 italic">
								<strong>Anonymous Reservation</strong>
							</p>
							<p class="text-xs text-gray-500 mt-1">
								This reservation was made anonymously
							</p>
						</div>
						<div v-else>
							<p class="text-sm">
								<strong>Name:</strong> {{ reservationDetails.user.name }}
							</p>
							<p class="text-sm">
								<strong>Email:</strong> {{ reservationDetails.user.email }}
							</p>
							<p class="text-sm">
								<strong>ID:</strong> {{ reservationDetails.user.user_id }}
							</p>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-3 pt-4 border-t">
					<button
						v-if="canCancelReservation(reservationDetails.reservation_id)"
						@click="$emit('removeReservation', reservationDetails.reservation_id)"
						class="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
					>
						Cancel Reservation
					</button>
					<button
						@click="$emit('closeReservationDetailsModal')"
						class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Cancel Confirmation Modal -->
	<div
		v-if="showCancelConfirmationModal"
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
		@click="$emit('closeCancelConfirmationModal')"
	>
		<div
			class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col"
			@click.stop
		>
			<!-- Header -->
			<div class="flex justify-between items-center p-6 border-b">
				<h3 class="text-lg font-semibold text-gray-900">Confirm Cancellation</h3>
				<button
					@click="$emit('closeCancelConfirmationModal')"
					class="text-gray-400 hover:text-gray-600 transition-colors"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-6">
				<div class="space-y-4">
					<!-- Warning Message -->
					<div class="bg-red-50 border border-red-200 rounded-lg p-4">
						<div class="flex items-center">
							<svg
								class="w-5 h-5 text-red-400 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
								></path>
							</svg>
							<p class="text-red-800 font-medium">
								Are you sure you want to cancel this reservation?
							</p>
						</div>
						<p class="text-red-700 text-sm mt-2">This action cannot be undone.</p>
					</div>

					<!-- Reservation Info -->
					<div class="bg-gray-50 p-4 rounded-lg">
						<p class="text-sm text-gray-600">
							<strong>Lab:</strong> {{ getLabName(reservationDetails.lab_id) }}
						</p>
						<p class="text-sm text-gray-600">
							<strong>Date:</strong> {{ formatDate(reservationDetails.date) }}
						</p>
						<p class="text-sm text-gray-600">
							<strong>Total Slots:</strong>
							{{ reservationDetails.slots?.length || 0 }}
						</p>
					</div>

					<!-- Slots to be Cancelled -->
					<div>
						<h4 class="font-medium text-gray-900 mb-3">
							The following slots will be cancelled:
						</h4>
						<div class="max-h-64 overflow-y-auto border rounded-lg">
							<div class="divide-y">
								<div
									v-for="(slot, index) in reservationDetails.slots"
									:key="`${slot.seat}-${slot.timeSlot.startTime}`"
									class="p-3 hover:bg-gray-50 transition-colors"
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-3">
											<span class="text-sm font-medium text-gray-500"
												>#{{ index + 1 }}</span
											>
											<div>
												<p class="text-sm font-medium text-gray-900">
													Seat {{ slot.seat }}
												</p>
												<p class="text-xs text-gray-500">
													{{ slot.timeSlot.startTime }} -
													{{ slot.timeSlot.endTime }}
												</p>
											</div>
										</div>
										<div class="w-3 h-3 bg-red-400 rounded-full"></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex gap-3 p-6 border-t bg-gray-50">
				<button
					@click="$emit('closeCancelConfirmationModal')"
					class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
				>
					Keep Reservation
				</button>
				<button
					@click="$emit('confirmCancelReservation')"
					class="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
				>
					Cancel Reservation
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
// Props
const props = defineProps({
	showReservationDetailsModal: {
		type: Boolean,
		default: false,
	},
	showCancelConfirmationModal: {
		type: Boolean,
		default: false,
	},
	reservationDetails: {
		type: Object,
		default: () => ({
			reservation_id: null,
			lab_id: null,
			date: null,
			slots: [],
			user: {},
		}),
	},
	allLabs: {
		type: Array,
		default: () => [],
	},
	canCancelReservation: {
		type: Function,
		required: true,
	},
})

// Emits
const emit = defineEmits([
	'closeReservationDetailsModal',
	'closeCancelConfirmationModal',
	'removeReservation',
	'confirmCancelReservation',
])

// Methods
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

const formatDateTime = (dateStr) => {
	if (!dateStr) return 'Invalid Date'
	const date = new Date(dateStr)
	if (isNaN(date)) return 'Invalid Date'
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	})
}
</script>
