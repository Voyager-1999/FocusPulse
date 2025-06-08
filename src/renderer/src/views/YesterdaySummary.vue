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

// 响应式数据初始化
const completedTasks = ref(0)
const focusMinutes = ref(0)
let isLoading = ref(false)

// 获取昨日日期字符串
function getYesterdayDateStr() {
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return y.toISOString().split('T')[0]
}

// 加载数据函数
async function loadSummaryData() {
  try {
    isLoading.value = true
    const yDate = getYesterdayDateStr()

    // 从 localStorage 获取数据
    const [tasks, pomos] = await Promise.all([
      JSON.parse(localStorage.getItem('tasks') || '[]'),
      JSON.parse(localStorage.getItem('pomodoros') || '[]')
    ])

    // 计算完成任务数
    completedTasks.value = tasks.filter(t => 
      t.completed && t.deadline === yDate
    ).length

    // 计算专注时长
    focusMinutes.value = pomos
      .filter(p => {
        try {
          return p.start_time?.split('T')[0] === yDate && p.type === 'work'
        } catch {
          return false
        }
      })
      .reduce((sum, p) => sum + (p.duration || 0), 0)
  } catch (error) {
    console.error('加载昨日小结数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadSummaryData()
})

// 组件卸载时重置数据
onBeforeUnmount(() => {
  completedTasks.value = 0
  focusMinutes.value = 0
})
</script>

<style scoped>
.yesterday-summary {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 1rem;
  transition: all 0.3s ease;
}

.summary-card {
  background: #ffffff;
  padding: 1.2rem;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  font-size: 1.1rem;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
