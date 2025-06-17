<template>
  <div class="tomato-statistic">
    <h2>番茄统计</h2>

    <div class="controls">
      <label>查看周期：</label>
      <select v-model="historyDays">
        <option :value="3">近三天</option>
        <option :value="7">近七天</option>
        <option :value="15">近十五天</option>
      </select>
    </div>

    <div class="summary">
      <p>专注总时长：<strong>{{ totalMinutes }}</strong> 分钟</p>
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
  LinearScale,
} from 'chart.js'
import dayjs from 'dayjs'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const totalMinutes = ref(0)
const chartData = ref({ labels: [], datasets: [] })
const chartOptions = ref({})
const historyDays = ref(7) // 默认7天

function getLastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
  }
  return days
}

function sumMinutesByDay(data, dateStr) {
  return data
    .filter(p => p.type === 'work' && p.date === dateStr)
    .reduce((sum, p) => sum + p.duration, 0)
}

function loadChartData() {
  try {
    const raw = localStorage.getItem('pomodoros')
    if (!raw) return

    const data = JSON.parse(raw)
    const days = getLastNDays(historyDays.value)
    const dailyMinutes = days.map(d => sumMinutesByDay(data, d))
    totalMinutes.value = dailyMinutes.reduce((a, b) => a + b, 0)

    chartData.value = {
      labels: days,
      datasets: [{
        label: '每日专注时长（分钟）',
        data: dailyMinutes,
        borderColor: '#f87171',
        backgroundColor: '#fecaca',
        fill: true,
        tension: 0.3
      }]
    }

    chartOptions.value = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `过去 ${historyDays.value} 天专注时长`
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 5 }
        }
      }
    }
  } catch (err) {
    console.error('读取番茄统计数据失败：', err)
  }
}

onMounted(loadChartData)
watch(historyDays, loadChartData)
</script>

<style scoped>
.tomato-statistic {
  padding: 1rem;
  background: #fef9f9;
  border-radius: 12px;
}

.controls {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.summary {
  font-size: 16px;
  margin-bottom: 1rem;
}

.chart-wrapper {
  max-width: 100%;
}

.loading {
  text-align: center;
  color: #999;
  padding: 1rem;
}
</style>
