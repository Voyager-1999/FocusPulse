<template>
  <div class="overview">
    <h2>数据总览</h2>
    
    <div class="cards">
      <div class="card" v-if="!loading">
        <div class="card-title">昨日完成任务</div>
        <div class="card-value">{{ yesterdayTasks }}</div>
      </div>
      <div class="card" v-if="!loading">
        <div class="card-title">昨日专注时间</div>
        <div class="card-value">{{ yesterdayFocus }} 分钟</div>
      </div>
      <div class="card" v-if="!loading">
        <div class="card-title">本周完成任务</div>
        <div class="card-value">{{ weeklyTasks }}</div>
      </div>
      
      <div class="loading-placeholder" v-if="loading">
        <div class="loading-spinner"></div>
        <div>数据加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const yesterdayTasks = ref(0)
const yesterdayFocus = ref(0)
const weeklyTasks = ref(0)
const loading = ref(true)

function getDateStr(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

async function loadOverviewData() {
  try {
    loading.value = true
    
    const [tasks, pomos] = await Promise.all([
      JSON.parse(localStorage.getItem('tasks') || '[]'),
      JSON.parse(localStorage.getItem('pomodoros') || '[]')
    ])

    // 昨日数据
    const yDate = getDateStr(-1)
    yesterdayTasks.value = tasks.filter(t => 
      t.completed && t.deadline === yDate
    ).length

    yesterdayFocus.value = pomos
      .filter(p => p.type === 'work' && p.start_time?.startsWith(yDate))
      .reduce((sum, p) => sum + (p.duration || 0), 0)

    // 本周数据
    weeklyTasks.value = 0
    for (let i = -6; i <= 0; i++) {
      const d = getDateStr(i)
      weeklyTasks.value += tasks.filter(t => 
        t.completed && t.deadline === d
      ).length
    }
  } catch (error) {
    console.error('加载总览数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOverviewData()
})

onBeforeUnmount(() => {
  // 重置数据
  yesterdayTasks.value = 0
  yesterdayFocus.value = 0
  weeklyTasks.value = 0
})
</script>

<style scoped>
.overview {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 1rem;
  position: relative;
  min-height: 120px;
}

.card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  flex: 1;
  min-width: 220px;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-3px);
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.loading-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #42b983;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
