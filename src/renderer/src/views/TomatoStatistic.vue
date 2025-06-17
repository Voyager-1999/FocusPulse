<template>
  <div class="tomato-statistic">
    <h2>番茄统计</h2>

    <div class="summary">
      <div class="summary-row">
        <p>专注总时长：<strong>{{ totalMinutes }}</strong> 分钟</p>
        <div class="controls">
          <label>查看周期：</label>
          <select v-model="historyDays" class="period-select">
            <option :value="3">近三天</option>
            <option :value="7">近七天</option>
            <option :value="15">近十五天</option>
          </select>
        </div>
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
  background: #ffffff;
  border-radius: 12px;
  margin: 0.5rem 0.5rem 1rem 0.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

.tomato-statistic h2 {
  color: #303133;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.summary {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.summary p {
  margin: 0;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary strong {
  color: #303133;
  font-size: 1.1rem;
  font-weight: 600;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.period-select {
  padding: 0.5rem;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  color: #606266;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.period-select:hover {
  border-color: #c0c4cc;
}

.period-select:focus {
  border-color: #409eff;
}

.chart-wrapper {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  flex: 1;
  min-height: 0;
  position: relative;
  margin-bottom: 0.5rem;
}

.loading {
  padding: 2rem;
  text-align: center;
  color: #909399;
  font-size: 0.9rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
}

:deep(.chartjs-render-monitor) {
  animation: none !important;
}

:deep(.chartjs-tooltip) {
  background: rgba(0, 0, 0, 0.8) !important;
  border-radius: 4px !important;
  padding: 8px 12px !important;
  font-size: 12px !important;
  color: #fff !important;
}
</style>
