// slots.js
const timeSlots = [
	{ time_slot_id: 1, start_time: '07:00', end_time: '07:30' },
	{ time_slot_id: 2, start_time: '07:30', end_time: '08:00' },
	{ time_slot_id: 3, start_time: '08:00', end_time: '08:30' },
	{ time_slot_id: 4, start_time: '08:30', end_time: '09:00' },
	{ time_slot_id: 5, start_time: '09:00', end_time: '09:30' },
	{ time_slot_id: 6, start_time: '09:30', end_time: '10:00' },
	{ time_slot_id: 7, start_time: '10:00', end_time: '10:30' },
	{ time_slot_id: 8, start_time: '10:30', end_time: '11:00' },
	{ time_slot_id: 9, start_time: '11:00', end_time: '11:30' },
	{ time_slot_id: 10, start_time: '11:30', end_time: '12:00' },
	{ time_slot_id: 11, start_time: '12:00', end_time: '12:30' },
	{ time_slot_id: 12, start_time: '12:30', end_time: '13:00' },
	{ time_slot_id: 13, start_time: '13:00', end_time: '13:30' },
	{ time_slot_id: 14, start_time: '13:30', end_time: '14:00' },
	{ time_slot_id: 15, start_time: '14:00', end_time: '14:30' },
	{ time_slot_id: 16, start_time: '14:30', end_time: '15:00' },
	{ time_slot_id: 17, start_time: '15:00', end_time: '15:30' },
	{ time_slot_id: 18, start_time: '15:30', end_time: '16:00' },
	{ time_slot_id: 19, start_time: '16:00', end_time: '16:30' },
	{ time_slot_id: 20, start_time: '16:30', end_time: '17:00' },
	{ time_slot_id: 21, start_time: '17:00', end_time: '17:30' },
	{ time_slot_id: 22, start_time: '17:30', end_time: '18:00' },
]

const slots = []
let slotId = 1

// Generate slots for 5 labs
for (let labId = 1; labId <= 5; labId++) {
	// Generate slots for 35 seats
	for (let seatNum = 1; seatNum <= 35; seatNum++) {
		// Generate slots for all time slots
		for (const timeSlot of timeSlots) {
			slots.push({
				slot_id: slotId++,
				lab_id: labId,
				seat_num: seatNum,
				time_slot_id: timeSlot.time_slot_id,
				start_time: timeSlot.start_time,
				end_time: timeSlot.end_time,
				status: 'available',
			})
		}
	}
}

export default slots
