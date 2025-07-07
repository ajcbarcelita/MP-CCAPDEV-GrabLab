export default [
	{
		reservation_id: 1,
		user_id: 4,
		lab_id: 1,
		reservation_date: '2025-06-18',
		status: 'confirmed',
		created_at: '2025-06-17T08:00:00',
		slots: [
			{ slot_id: 1 }, // seat 1, time slot 1
			{ slot_id: 2 }, // seat 1, time slot 2
		],
	},
	{
		reservation_id: 2,
		user_id: 4,
		lab_id: 1,
		reservation_date: '2025-06-19',
		status: 'confirmed',
		created_at: '2025-06-17T09:15:00',
		slots: [
			{ slot_id: 67 }, // seat 4, time slot 1
			{ slot_id: 68 }, // seat 4, time slot 2
		],
	},
	{
		reservation_id: 3,
		user_id: 2,
		lab_id: 1,
		reservation_date: '2025-06-18',
		status: 'confirmed',
		created_at: '2025-06-17T10:00:00',
		slots: [
			{ slot_id: 133 }, // seat 7, time slot 1
			{ slot_id: 134 }, // seat 7, time slot 2
		],
	},
	{
		reservation_id: 4,
		user_id: 2,
		lab_id: 1,
		reservation_date: '2025-06-19',
		status: 'confirmed',
		created_at: '2025-06-17T11:00:00',
		slots: [
			{ slot_id: 200 }, // seat 10, time slot 2
			{ slot_id: 201 }, // seat 10, time slot 3
		],
	},
	{
		reservation_id: 5,
		user_id: 5,
		lab_id: 1,
		reservation_date: '2025-06-20',
		status: 'pending',
		created_at: '2025-06-17T12:00:00',
		slots: [
			{ slot_id: 275 }, // seat 13, time slot 1
			{ slot_id: 276 }, // seat 13, time slot 2
		],
	},
]

// Calculation:
// slot_id = (seat_num - 1) * 22 + time_slot_id;
