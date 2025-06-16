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
