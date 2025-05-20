import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import localeData from 'dayjs/plugin/localeData'
import { useNotificationsStore } from '../store/notifications.store'
import { useTodoListStore } from '../store/todoList.store'
import { useConfigStore } from '../store/config.store'

// 配置 dayjs
dayjs.extend(localeData)
dayjs.locale('zh-cn')

export default {
  refreshDayNotifications(todoListId) {
    if (todoListId !== dayjs().format("YYYYMMDD")) return
    
    const todoListStore = useTodoListStore()
    const configStore = useConfigStore()
    const notificationsStore = useNotificationsStore()
    
    let todoList = todoListStore.todoList[todoListId]
    const notificationSound = configStore.config.notificationSound

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
        this.createNotification(targetTime.format("HH:mm"), todoText, notificationSound)
      },
      duration
    )

    return alertTimeOut
  },

  createNotification(header, body, notificationSound) {
    window.electron.createNotification({
      title: header,
      body: body,
      silent: true
    })
    this.playNotificationSound(notificationSound)
  },

  playNotificationSound(notificationSound) {
    if (notificationSound === "none") return

    let soundName
    switch (notificationSound) {
      case "pop":
        soundName = "pop-alert.wav"
        break
      case "positive":
        soundName = "positive.wav"
        break
      case "bell":
        soundName = "loud-bell.wav"
        break
      case "soft":
        soundName = "soft.wav"
        break
      case "tiny":
        soundName = "tiny.wav"
        break
      case "piano":
        soundName = "piano.wav"
        break
      case "soft-bell":
        soundName = "soft-bell.wav"
        break
      case "metal":
        soundName = "metal-gear.wav"
        break
    }

    if (soundName) {
      console.log('Playing notification sound:', soundName)
      window.electron.playSound(soundName)
    }
  },
}
