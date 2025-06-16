<template>
  <div class="tomato-clock-root">
    <div class="container"> 
      <h1>专注脉搏不停，目标就永远在跳动中靠近</h1>
      <!-- 状态显示 -->
      <div class="status" :class="isWorking ? 'working' : 'resting'">
        {{ statusText }}
      </div>
      <!-- 计时器与进度环 -->
      <div class="timer-container">
        <svg class="progress-ring">
          <circle
            class="progress-ring__circle"
            stroke="#EBE5D0"
            stroke-width="10"
            fill="transparent"
            r="140"
            cx="150"
            cy="150"
          />
          <circle
            class="progress-ring__circle"
            :stroke="isWorking ? '#62928C' : '#4B6B8A'"
            stroke-width="10"
            fill="transparent"
            r="140"
            cx="150"
            cy="150"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
          />
        </svg>
        <div class="timer-display">
          {{ minutes }}:{{ seconds }}
        </div>
      </div>
      <!-- 控制按钮 -->
      <div class="controls">
        <button class="start-btn" @click="startTimer" :disabled="isRunning">
          开始
        </button>
        <button class="pause-btn" @click="pauseTimer" :disabled="!isRunning">
          暂停
        </button>
        <button id="resetBtn" @click="resetTimer">
          重置
        </button>
      </div>
      <!-- 任务管理 -->
      <div class="task-section">
        <h2>任务管理</h2>
        <div class="task-input">
          <input v-model="taskInput" type="text" placeholder="输入任务名称" @keyup.enter="addTask">
          <button id="addTaskBtn" @click="addTask">添加任务</button>
        </div>
        <ul class="task-list">
          <li v-for="task in tasks" :key="task.id" class="task-item" 
              :class="{ 'selected': currentTask === task.name && isWorking }"
              @click="selectTask(task)">
            <span>
              <span v-if="task.completed" class="text-green-600 mr-1">✓</span>
              <span v-else class="mr-1">○</span>
              {{ task.name }}
            </span>
            <div class="task-actions">
              <button class="delete-btn" @click.stop="deleteTask(task.id)">删除</button>
            </div>
          </li>
        </ul>
      </div>
      <!-- 设置 -->
      <div class="settings-section">
        <h2>设置</h2>
        <div class="settings-form">
          <div class="setting-item">
            <label for="workTimeInput">工作时间(分钟):</label>
            <input id="workTimeInput" type="number" min="1" v-model.number="workTimeInput">
          </div>
          <div class="setting-item">
            <label for="shortBreakInput">短休息(分钟):</label>
            <input id="shortBreakInput" type="number" min="1" v-model.number="shortBreakInput">
          </div>
          <div class="setting-item">
            <label for="longBreakInput">长休息(分钟):</label>
            <input id="longBreakInput" type="number" min="1" v-model.number="longBreakInput">
          </div>
          <div>
            <button id="saveSettingsBtn" @click="saveSettings">保存设置</button>
          </div>
        </div>
      </div>
      <div class="history-section">
        <div style="text-align: center; margin-bottom: 1rem;">
          <h2 style="margin: 0;">历史记录</h2>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <select v-model="historyDays" style="height: 2rem;">
            <option :value="3">近三天</option>
            <option :value="7">近七天</option>
            <option :value="15">近十五天</option>
            <option :value="0">全部</option>
          </select>
          <button id="showHistoryBtn" @click="toggleHistory">
            {{ showHistory ? '隐藏历史记录' : '显示历史记录' }}
          </button>
        </div>
        <div v-show="showHistory">
          <table class="history-table">
            <thead>
              <tr>
                <th>选择</th>
                <th>任务</th>
                <th>时间</th>
                <th>类型</th>
                <th>专注时长</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in [...history].reverse()" :key="record.time + record.task">
                <td>
                  <input
                    type="checkbox"
                    :value="record.time + record.task"
                    v-model="selectedHistory"
                  />
                </td>
                <td class="border px-2 py-1">{{ record.task }}</td>
                <td class="border px-2 py-1">{{ record.time }}</td>
                <td class="border px-2 py-1">{{ record.type }}</td>
                <td class="border px-2 py-1">
                  <span v-if="record.type === '工作'">{{ record.duration }} 分钟</span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div style="text-align: right; margin-top: 1rem;">
            <button
              v-if="selectedHistory.length > 0"
              @click="deleteSelectedHistory"
              style="background-color: #e57373; color: #fff;"
            >
              删除所选历史记录
            </button>
          </div>
        </div>
      </div>
      <!-- 通知 -->
      <div v-if="notification" class="notification">
        {{ notification }}
      </div>
      <!-- 铃声 -->
      <audio ref="alarmSound" preload="auto">
        <source src="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3" type="audio/mpeg" />
      </audio>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 状态
const workTime = ref(25 * 60)
const shortBreak = ref(5 * 60)
const longBreak = ref(15 * 60)
const workTimeInput = ref(25)
const shortBreakInput = ref(5)
const longBreakInput = ref(15)

const isRunning = ref(false)
const isWorking = ref(true)
const timeLeft = ref(workTime.value)
const totalTime = ref(workTime.value)
const pomodoroCount = ref(0)
const currentTask = ref('')
const tasks = ref([])
const history = ref([])
const notification = ref('')
const showHistory = ref(false)
const taskInput = ref('')

const circumference = 2 * Math.PI * 140
const progressOffset = computed(() => circumference * (1 - timeLeft.value / totalTime.value))

const minutes = computed(() => String(Math.floor(timeLeft.value / 60)).padStart(2, '0'))
const seconds = computed(() => String(timeLeft.value % 60).padStart(2, '0'))
const statusText = computed(() => {
  if (isWorking.value) {
    return currentTask.value ? `工作中: ${currentTask.value}` : '准备开始'
  } else {
    return pomodoroCount.value % 4 === 0 ? '长休息中' : '短休息中'
  }
})

let timer = null
const alarmSound = ref(null)

// 计时器逻辑
function startTimer() {
  if (!currentTask.value) {
    showNotification('请先选择一个任务')
    return
  }
  if (isRunning.value) return
  isRunning.value = true
  clearInterval(timer) // 防止多次叠加
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      timerFinished()
    }
  }, 1000)
}
function pauseTimer() {
  isRunning.value = false
  clearInterval(timer)
}
function resetTimer() {
  pauseTimer()
  if (isWorking.value) {
    timeLeft.value = workTime.value
    totalTime.value = workTime.value
  } else {
    timeLeft.value = pomodoroCount.value % 4 === 0 ? longBreak.value : shortBreak.value
    totalTime.value = pomodoroCount.value % 4 === 0 ? longBreak.value : shortBreak.value
  }
}
function timerFinished() {
  pauseTimer()
  pomodoroCount.value++
  playAlarm()
  if (isWorking.value) {
    // 记录历史，增加 duration 字段
    history.value.push({
      task: currentTask.value,
      time: new Date().toLocaleString(),
      type: '工作',
      duration: workTimeInput.value // 单位：分钟
    })
    // 任务完成标记
    const task = tasks.value.find(t => t.name === currentTask.value)
    if (task) task.completed = true

    timeLeft.value = pomodoroCount.value % 4 === 0 ? longBreak.value : shortBreak.value
    totalTime.value = pomodoroCount.value % 4 === 0 ? longBreak.value : shortBreak.value
    showNotification(pomodoroCount.value % 4 === 0 ? '工作时间结束，该长休息了！' : '工作时间结束，该短休息了！')
    isWorking.value = false

    // 自动开始休息倒计时
    isRunning.value = true
    clearInterval(timer)
    timer = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        timerFinished()
      }
    }, 1000)
  } else {
    timeLeft.value = workTime.value
    totalTime.value = workTime.value
    isWorking.value = true
    showNotification('休息时间结束，准备开始工作！')
    // 不自动开始工作，等待用户点击"开始"
    isRunning.value = false
    clearInterval(timer)
  }
  saveData()
}
function playAlarm() {
  if (alarmSound.value) {
    alarmSound.value.currentTime = 0
    alarmSound.value.play()
  }
}
function showNotification(msg) {
  notification.value = msg
  setTimeout(() => notification.value = '', 3000)
}

const selectedHistory = ref([])

// 删除所选历史记录
function deleteSelectedHistory() {
  if (selectedHistory.value.length === 0) return
  if (!confirm('确定要删除所选历史记录吗？此操作不可恢复。')) return
  // 只保留未被选中的历史记录
  history.value = history.value.filter(
    r => !selectedHistory.value.includes(r.time + r.task)
  )
  selectedHistory.value = []
  saveData()
  showNotification('已删除所选历史记录')
}

// 任务管理
function addTask() {
  const name = taskInput.value.trim()
  if (!name) {
    showNotification('任务名称不能为空')
    return
  }
  if (tasks.value.some(t => t.name === name)) {
    showNotification('任务已存在')
    return
  }
  tasks.value.push({
    id: Date.now(),
    name,
    completed: false
  })
  taskInput.value = ''
  saveData()
}
function selectTask(task) {
  currentTask.value = task.name
  if (isRunning.value) {
    pauseTimer()
    timeLeft.value = workTime.value
    totalTime.value = workTime.value
  }
}
function deleteTask(id) {
  const idx = tasks.value.findIndex(t => t.id === id)
  if (idx !== -1) {
    if (tasks.value[idx].name === currentTask.value) {
      currentTask.value = ''
      pauseTimer()
      resetTimer()
    }
    tasks.value.splice(idx, 1)
    saveData()
  }
}

// 设置
function saveSettings() {
  if (workTimeInput.value <= 0 || shortBreakInput.value <= 0 || longBreakInput.value <= 0) {
    showNotification('请输入有效的数字')
    return
  }
  workTime.value = workTimeInput.value * 60
  shortBreak.value = shortBreakInput.value * 60
  longBreak.value = longBreakInput.value * 60
  resetTimer()
  showNotification('设置已保存')
  saveData()
}

// 历史
function toggleHistory() {
  showHistory.value = !showHistory.value
}

// 本地存储
function saveData() {
  const data = {
    tasks: tasks.value,
    history: history.value,
    settings: {
      workTime: workTimeInput.value,
      shortBreak: shortBreakInput.value,
      longBreak: longBreakInput.value
    },
    pomodoroCount: pomodoroCount.value
  }
  localStorage.setItem('pomodoroData', JSON.stringify(data))
}
function loadData() {
  const saved = localStorage.getItem('pomodoroData')
  if (saved) {
    const data = JSON.parse(saved)
    tasks.value = data.tasks || []
    history.value = data.history || []
    workTimeInput.value = data.settings?.workTime || 25
    shortBreakInput.value = data.settings?.shortBreak || 5
    longBreakInput.value = data.settings?.longBreak || 15
    workTime.value = workTimeInput.value * 60
    shortBreak.value = shortBreakInput.value * 60
    longBreak.value = longBreakInput.value * 60
    pomodoroCount.value = data.pomodoroCount || 0
    timeLeft.value = workTime.value
    totalTime.value = workTime.value
  }
}

const historyDays = ref(7) // 默认显示近七天

const filteredHistory = computed(() => {
  if (historyDays.value === 0) return history.value
  const now = new Date()
  return history.value.filter(r => {
    if (!r.time) return false
    // 兼容不同日期格式
    let [dateStr] = r.time.split(' ')
    dateStr = dateStr.replace(/\//g, '-')
    const parts = dateStr.split('-').map(Number)
    if (parts.length < 3) return false
    const recordDate = new Date(parts[0], parts[1] - 1, parts[2])
    const diff = (now - recordDate) / (1000 * 60 * 60 * 24)
    return diff < historyDays.value
  })
})

onMounted(() => {
  loadData()
})
onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.progress-ring {
  display: block;
}
.progress-ring__circle {
  transition: stroke-dashoffset 0.35s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');

body {
    font-family: 'Luckiest Guy', sans-serif;
    background: linear-gradient(135deg, #EBE5D0 0%, #DBD8CF 100%);
    min-height: 100vh;
    margin: 0;
    padding: 0 0 2rem 0;  /* 添加底部内边距 */
    overflow-y: auto;
}

.container {
    background-color: #FFFFFF;
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    width: 98%;
    max-width: 1200px;
    color: #303030;
    border: 1px solid #DBD8CF;
    margin: 0.75rem auto;  /* 设置相等的上下外边距 */
    overflow-y: auto;
    max-height: calc(100vh - 3rem);  /* 调整最大高度，考虑上下边距 */
}

.tomato-clock-root h1,
.tomato-clock-root h2 {
  color: #4B6B8A;
  text-align: center;
  font-weight: 700;
}

h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;  /* 减少标题下方间距 */
}

.tomato-clock-root h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.timer-container {
    position: relative;
    width: 300px;
    height: 300px;
    margin: 1rem auto;  /* 减少计时器容器的上下间距 */
}

.tomato-clock-root .progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.tomato-clock-root .progress-ring__circle {
  transition: stroke-dashoffset 0.35s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  stroke: #62928C;
}

.tomato-clock-root .resting .progress-ring__circle {
  stroke: #4B6B8A;
}

.tomato-clock-root .timer-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4.5rem;
  text-align: center;
  color: #62928C;
  transition: color 0.3s ease;
}

.controls {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1rem;  /* 减少控制区域的下方间距 */
}

button {
    padding: 10px 24px;  /* 减少内边距 */
    border: none;
    border-radius: 24px;  /* 稍微减小圆角 */
    cursor: pointer;
    font-size: 14px;  /* 减小字体大小 */
    font-weight: 600;
    color: #FFFFFF;
    min-width: 100px;  /* 减小最小宽度 */
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    letter-spacing: 0.2px;  /* 稍微减小字间距 */
    transition: 
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.tomato-clock-root button:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.tomato-clock-root button:focus {
  outline: none;
  box-shadow: 
      0 0 0 3px rgba(75,107,138,0.3),
      inset 0 1px 0 rgba(255,255,255,0.2);
}

.tomato-clock-root button:active {
  transform: scale(0.98);
}

.tomato-clock-root .start-btn {
  background-color: #62928C;
}
.tomato-clock-root .start-btn:hover {
  background-color: #4B6B8A;
}
.tomato-clock-root .pause-btn {
  background-color: #4B6B8A;
}
.tomato-clock-root .pause-btn:hover {
  background-color: #3A556B;
}
.tomato-clock-root .delete-btn {
  background-color: #DBD8CF;
  color: #303030;
}
.tomato-clock-root .delete-btn:hover {
  background-color: #C5C2B9;
}
.tomato-clock-root #resetBtn {
  background-color: #EBE5D0;
  color: #303030;
}
.tomato-clock-root #resetBtn:hover {
  background-color: #D5CFBA;
}
.tomato-clock-root #addTaskBtn {
  background-color:rgb(91, 112, 206);
  color: #FFFFFF;
}
.tomato-clock-root #addTaskBtn:hover {
  background-color:rgb(84, 66, 162);
}

#saveSettingsBtn {
    background-color: #DBD8CF;
    color: #303030;
    padding: 8px 16px;  /* 设置按钮更小 */
    font-size: 13px;
    min-width: 80px;
}
.tomato-clock-root #saveSettingsBtn:hover {
  background-color: #C5C2B9;
}

#showHistoryBtn {
    background-color: #62928C;
    color: #FFFFFF;
    padding: 8px 16px;  /* 历史记录按钮更小 */
    font-size: 13px;
    min-width: 80px;
}
.tomato-clock-root #showHistoryBtn:hover {
  background-color: #4B6B8A;
}

.task-section, .settings-section, .history-section {
    margin-top: 1.5rem;  /* 减少各部分之间的间距 */
    padding-top: 0.75rem;
    border-top: 1px solid #DBD8CF;
}

.tomato-clock-root .task-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.task-input button {
    padding: 8px 16px;  /* 任务输入区域的按钮更小 */
    font-size: 13px;
    min-width: 80px;
}

input[type="text"], input[type="number"] {
    padding: 0.5rem;
    border: 1px solid #DBD8CF;
    border-radius: 0.375rem;
    flex-grow: 1;
    background-color: #FFFFFF;
    color: #303030;
    font-family: inherit;
}

.task-list {
    list-style: none;
    padding: 0;
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 1rem;
}

.tomato-clock-root .task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #DBD8CF;
  transition: background-color 0.3s ease;
}

.tomato-clock-root .task-item:hover {
  background-color: #EBE5D0;
}

.tomato-clock-root .task-actions {
  display: flex;
  gap: 0.5rem;
}

.task-actions button {
    padding: 6px 12px;  /* 任务操作按钮更小 */
    font-size: 12px;
    min-width: 60px;
}

.settings-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.tomato-clock-root .setting-item {
  display: flex;
  align-items: center;
}

.tomato-clock-root .setting-item label {
  margin-right: 0.5rem;
  min-width: 80px;
}

.history-section {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #DBD8CF;
    margin-bottom: 1rem;  /* 添加底部边距 */
}

.history-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    table-layout: fixed;
}

.history-table th, .history-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #DBD8CF;
    word-wrap: break-word;
}

.history-table th {
    background-color: #EBE5D0;
    color: #303030;
    position: sticky;
    top: 0;
    z-index: 1;
}

.tomato-clock-root .status {
  text-align: center;
  font-size: 1.25rem;
  margin: 1rem 0;
}

.tomato-clock-root .working {
  color: #62928C;
}

.tomato-clock-root .resting {
  color: #4B6B8A;
}

.tomato-clock-root .selected {
  background-color: #EBE5D0;
}

.tomato-clock-root .notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background-color: #FFFFFF;
  color: #4B6B8A;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  animation: fadeInOut 3s ease;
  border: 1px solid #4B6B8A;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}
</style>
