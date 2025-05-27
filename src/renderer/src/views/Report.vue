<template>
  <div class="weekly-report">
    <h2>本周数据报告</h2>

    <div class="report-cards">
      <div class="card">
        <p>本周完成任务数：</p>
        <h3>{{ taskCount }}</h3>
      </div>
      <div class="card">
        <p>本周专注时间：</p>
        <h3>{{ focusMinutes }} 分钟</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const taskCount = ref(0)
const focusMinutes = ref(0)

function getDateStr(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

function getLast7Dates() {
  const days = []
  for (let i = -6; i <= 0; i++) {
    days.push(getDateStr(i))
  }
  return days
}

onMounted(() => {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
  const pomodoros = JSON.parse(localStorage.getItem('pomodoros') || '[]')
  const dates = getLast7Dates()

  // 统计过去7天完成任务数
  taskCount.value = tasks.filter(t =>
    t.completed && dates.includes(t.deadline)
  ).length

  // 统计过去7天专注时长（分钟）
  focusMinutes.value = pomodoros
    .filter(p => p.type === 'work' && dates.includes(p.start_time?.split('T')[0]))
    .reduce((sum, p) => sum + p.duration, 0)
})
</script>

<style scoped>
.weekly-report {
  padding: 1.5rem;
  background-color: #f5f7fa;
  border-radius: 12px;
}

.report-cards {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  min-width: 200px;
  flex: 1;
}

.card h3 {
  font-size: 24px;
  color: #2c3e50;
  margin-top: 0.5rem;
}
</style>
