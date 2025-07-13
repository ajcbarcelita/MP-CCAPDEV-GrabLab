import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useReservationsStore = defineStore('reservations', {
    state: () => ({
        reservations: [],
        loading: false,
        error: null
    }),
    actions: {
        async fetchReservations() {
            this.loading = true
            try {
                const response = await axios.get(`${API_URL}/reservations`)
                this.reservations = response.data.map(reservation => ({
                    ...reservation,
                    time_slots: reservation.time_slots || [] // Ensure time_slots is always an array
                }))
                this.error = null
            } catch (error) {
                this.error = error.message
                console.error('Error fetching reservations:', error)
            } finally {
                this.loading = false
            }
        },
        async fetchReservationsByUserId(userId) {
            this.loading = true;
            try {
                const response = await axios.get(`${API_URL}/reservations/user/${userId}`);
                this.reservations = response.data.map(reservation => ({
                    ...reservation,
                    time_slots: reservation.time_slots || [],
                    lab: reservation.lab_slot?.lab || null, // Include lab information if available
                    user: reservation.user || null // Include user information if available
                }));
                this.error = null;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching user reservations:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchReservationsByLab(labId) {
            this.loading = true
            try {
                const response = await axios.get(`${API_URL}/reservations/lab/${labId}`)
                this.reservations = response.data
                this.error = null
            } catch (error) {
                this.error = error.message
                console.error('Error fetching lab reservations:', error)
            } finally {
                this.loading = false
            }
        },
        async deleteReservation(reservationId) {
            this.loading = true
            try {
                await axios.delete(`${API_URL}/reservations/${reservationId}`)
                this.reservations = this.reservations.filter(res => res._id !== reservationId)
                this.error = null
            } catch (error) {
                this.error = error.message
                console.error('Error deleting reservation:', error)
            } finally {
                this.loading = false
            }
        },
        async updateReservationStatus(reservationId, status) {
            this.loading = true
            try {
                const response = await axios.patch(`${API_URL}/reservations/${reservationId}`, { status })
                const index = this.reservations.findIndex(res => res._id === reservationId)
                if (index !== -1) {
                    this.reservations[index] = response.data
                }
                this.error = null
            } catch (error) {
                this.error = error.message
                console.error('Error updating reservation:', error)
            } finally {
                this.loading = false
            }
        }
    },
    getters: {
        getReservationById: (state) => (id) => {
            return state.reservations.find(res => res._id === id)
        },
        activeReservations: (state) => {
            return state.reservations.filter(res => res.status === 'Active')
        },
        cancelledReservations: (state) => {
            return state.reservations.filter(res => res.status === 'Cancelled')
        },
        completedReservations: (state) => {
            return state.reservations.filter(res => res.status === 'Completed')
        }
    }
})
