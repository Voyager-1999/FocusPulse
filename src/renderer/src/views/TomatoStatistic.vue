<template>
  <div class="todo-statistic">
    <h2>待办统计</h2>

    <div class="summary">
      <p>已完成任务数：<strong>{{ completed }}</strong></p>
      <p>未完成任务数：<strong>{{ uncompleted }}</strong></p>
    </div>

    <div class="chart-wrapper" v-if="chartData.labels?.length">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="loading">加载数据中...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const completed = ref(0)
const uncompleted = ref(0)
const chartData = ref({
  labels: [],
  datasets: [{
    label: '每日完成任务数',
    data: [],
    backgroundColor: '#42A5F5',
    borderRadius: 4,
  }]
})

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: '过去 7 天任务完成情况'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
})

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function countTasksForDay(tasks, date) {
  return tasks.filter(t => t.completed && t.deadline === date).length
}

function loadData() {
  try {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    completed.value = tasks.filter(t => t.completed).length
    uncompleted.value = tasks.filter(t => !t.completed).length

    const days = getLast7Days()
    const data = days.map(d => countTasksForDay(tasks, d))

    chartData.value = {
      labels: days,
      datasets: [{
        ...chartData.value.datasets[0],
        data: data
      }]
    }
  } catch (error) {
    console.error('加载待办统计数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})

onBeforeUnmount(() => {
  // 清理数据防止切换时出现问题
  chartData.value = {
    labels: [],
    datasets: []
  }
})
</script>

<style scoped>
.todo-statistic {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 10px;
}

.summary {
  margin-bottom: 1rem;
  font-size: 16px;
  line-height: 1.8;
}

.chart-wrapper {
  max-width: 100%;
  height: 300px;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>
