<template>
  <div class="tomato-statistic">
    <h2>番茄统计</h2>
    <div class="summary">
      <p>本周专注时间：<strong>{{ totalMinutes }}</strong> 分钟</p>
    </div>
    <div class="chart-wrapper" v-if="chartData.labels.length > 0">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const totalMinutes = ref(0)
const chartData = ref({
  labels: [],
  datasets: [{
    label: '每日专注时长（分钟）',
    data: [],
    borderColor: '#f87171',
    backgroundColor: '#fecaca',
    fill: true,
    tension: 0.3,
  }]
})

const chartOptions = ref({
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: '过去 7 天番茄专注时间'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 10
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

function sumMinutesByDay(data, dateStr) {
  return data
    .filter(p => p.type === 'work' && p.start_time?.startsWith(dateStr))
    .reduce((sum, p) => sum + p.duration, 0)
}

onMounted(() => {
  loadChartData()
})

onBeforeUnmount(() => {
  // 清理数据防止内存泄漏
  chartData.value = {
    labels: [],
    datasets: []
  }
})

async function loadChartData() {
  try {
    const pomos = JSON.parse(localStorage.getItem('pomodoros') || '[]')
    const days = getLast7Days()
    const minutes = days.map(d => sumMinutesByDay(pomos, d))
    totalMinutes.value = minutes.reduce((a, b) => a + b, 0)
    
    chartData.value = {
      labels: days,
      datasets: [{
        ...chartData.value.datasets[0],
        data: minutes
      }]
    }
  } catch (error) {
    console.error('加载图表数据失败:', error)
  }
}
</script>
