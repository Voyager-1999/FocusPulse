<template>
  <div class="tomato-statistic">
    <h2>番茄统计</h2>

    <div class="summary">
      <p>专注总时长：<strong>{{ totalMinutes }}</strong> 分钟</p>
      <div class="selector">
        <label>统计周期：</label>
        <select v-model="days">
          <option :value="3">近三天</option>
          <option :value="7">近七天</option>
          <option :value="15">近十五天</option>
        </select>
      </div>
    </div>

    <div class="chart-wrapper" v-if="chartData.labels.length">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="loading">暂无数据</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const days = ref(7) // 默认近7天
const totalMinutes = ref(0)
const chartData = ref({ labels: [], datasets: [] })
const chartOptions = ref({
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: '每日专注时长（分钟）'
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

function getRecentDays(n) {
  const list = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    list.push(d.toISOString().split('T')[0])
  }
  return list
}

function sumMinutesByDay(data, dateStr) {
  return data
    .filter(p => p.type === 'work' && p.date === dateStr)
    .reduce((sum, p) => sum + p.duration, 0)
}


function updateChart() {
  const records = JSON.parse(localStorage.getItem('pomodoros') || '[]')
  const recentDays = getRecentDays(days.value)
  const dayMinutes = recentDays.map(d => sumMinutesByDay(records, d))

  totalMinutes.value = dayMinutes.reduce((a, b) => a + b, 0)

  chartData.value = {
    labels: recentDays.map(d => d.slice(5)), // 显示 MM-DD
    datasets: [{
      label: '专注时间（分钟）',
      data: dayMinutes,
      borderColor: '#f87171',
      backgroundColor: '#fecaca',
      fill: true,
      tension: 0.3
    }]
  }
}

onMounted(updateChart)
watch(days, updateChart)
</script>

<style scoped>
.tomato-statistic {
  padding: 1rem;
  background: #fefefe;
  border-radius: 12px;
}
.summary {
  font-size: 16px;
  margin-bottom: 1rem;
}
.selector {
  margin-top: 0.5rem;
}
.chart-wrapper {
  margin-top: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}
.loading {
  margin-top: 1rem;
  color: #999;
  text-align: center;
}
</style>
