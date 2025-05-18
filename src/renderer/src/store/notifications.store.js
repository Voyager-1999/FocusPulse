import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
    state() {
        return {
            notifications: []
        }
    },
    actions: {
        addNotification(notifications) {
            this.notifications = notifications
        }
    },
    getters: {
    }
})
