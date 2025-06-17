import { defineStore } from 'pinia'
import slots from '@/data/slots.js'

export const useSlotsStore = defineStore('slots', {
  state: () => ({
    slots: [...slots],
  }),
  actions: {
    addSlot(slot) {
      this.slots.push(slot)
    },
    updateSlotStatus(slotId, status) {
      const slot = this.slots.find(s => s.slot_id === slotId)
      if (slot) slot.status = status
    },
    getSlotsByLab(labId) {
      return this.slots.filter(s => s.lab_id === labId)
    },
    getAvailableSlots() {
      return this.slots.filter(s => s.status === 'available')
    },
  },
})