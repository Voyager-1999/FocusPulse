<template>
  <div class="yesterday-summary">
    <h2>昨日小结</h2>
    <div class="summary-card">
      <p>完成任务数：<strong>{{ completedTasks }}</strong></p>
      <p>专注时长：<strong>{{ focusMinutes }}</strong> 分钟</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { useTodoListStore } from '../store/todoList.store'
import dayjs from 'dayjs'

const completedTasks = ref(0)
const focusMinutes = ref(0)
const todoStore = useTodoListStore()

function getYesterdayDateStr() {
  return dayjs().subtract(1, 'day').format('YYYYMMDD')
}

function getYesterdayIsoDate() {
  return dayjs().subtract(1, 'day').format('YYYY-MM-DD')
}

function loadSummaryData() {
  const yesterday = getYesterdayDateStr()
  const todos = todoStore.getTodosByDate(yesterday)
  completedTasks.value = todos.filter(t => t.checked).length

  const saved = localStorage.getItem('pomodoroData')
  if (saved) {
    const data = JSON.parse(saved)
    const history = data.history || []
    const yIso = getYesterdayIsoDate()

    focusMinutes.value = history
      .filter(h => h.type === '工作' && h.time?.startsWith(yIso))
      .reduce((sum, h) => sum + (h.duration || 0), 0)
  }
}

onMounted(() => {
  loadSummaryData()
})

onBeforeUnmount(() => {
  completedTasks.value = 0
  focusMinutes.value = 0
})
</script>


<style scoped>
.yesterday-summary {
  padding: 1.25rem;
  background: #ffffff;
  border-radius: 12px;
  margin: 0.75rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.yesterday-summary h2 {
  color: #303133;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.summary-card {
  background: #f8f9fa;
  padding: 1.25rem;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.summary-card p {
  margin: 0;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-card strong {
  color: #303133;
  font-size: 1.1rem;
  font-weight: 600;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-size: 0.9rem;
}
</style>
