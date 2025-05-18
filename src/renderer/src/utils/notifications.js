import dayjs from 'dayjs'
import { useNotificationsStore } from '../store/notifications.store'
import { useTodoListStore } from '../store/todoList.store'
import { useConfigStore } from '../store/config.store'

export default {
  refreshDayNotifications(todoListId) {
    const todoListStore = useTodoListStore()
    const configStore = useConfigStore()
    const notificationsStore = useNotificationsStore()
    
    let todoList = todoListStore.todoList[todoListId]
    const notificationSound = configStore.config.notificationSound
    
    if (todoListId !== dayjs().format("YYYYMMDD")) return

    notificationsStore.notifications.forEach((notification) => {
      clearTimeout(notification)
    })
    
    const notificationsList = []

    if (todoList != null) {
      todoList.forEach((todo) => {
        if (todo.alarm && !todo.checked && dayjs(todo.time, "HH:mm").isAfter(dayjs())) {
          notificationsList.push(this.createNotificationAlert(todo.time, todo.text, notificationSound))
        }
      })
    }

    notificationsStore.addNotification(notificationsList)
  },

  createNotificationAlert(todoTime, todoText, notificationSound) {
    const now = dayjs()
    const targetTime = dayjs(todoTime, "HH:mm")
    const duration = targetTime.diff(now)

    const alertTimeOut = setTimeout(
      () => {
        this.createNotification(dayjs(todoTime, "HH:mm").format("LT"), todoText, notificationSound)
      },
      duration
    )

    return alertTimeOut
  },

  createNotification(header, body, notificationSound) {
    new Notification(header, {
      body: body,
      icon: "/favicon.ico",
      silent: true,
    })
    this.playNotificationSound(notificationSound)
  },

  playNotificationSound(notificationSound) {
    let sound
    switch (notificationSound) {
      case "pop":
        sound = new Audio("sounds/pop-alert.ogg")
        break
      case "positive":
        sound = new Audio("sounds/positive.ogg")
        break
      case "bell":
        sound = new Audio("sounds/loud-bell.ogg")
        break
      case "soft":
        sound = new Audio("sounds/soft.ogg")
        break
      case "tiny":
        sound = new Audio("sounds/tiny.ogg")
        break
      case "piano":
        sound = new Audio("sounds/piano.ogg")
        break
      case "soft-bell":
        sound = new Audio("sounds/soft-bell.ogg")
        break
      case "metal":
        sound = new Audio("sounds/metal-gear.ogg")
        break
      case "none":
        return
    }
    sound.addEventListener("canplaythrough", () => {
      sound.play()
    })
  },
}
