import { defineStore } from 'pinia'
import initialUsers from '@/data/users.js'

export const useUsersStore = defineStore('users', {
	state: () => ({
		users: [...initialUsers],
	}),
	actions: {
		addUser(user) {
			this.users.push(user)
		},
	},
})
