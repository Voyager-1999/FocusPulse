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
import { useTodoListStore } from '../store/ToDoList.store'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import moment from 'moment'
const TodoListStore = useTodoListStore()

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

function getRecentDates(n = 7) {
  const today = moment()
  // 改为从最早日期开始生成，到今天的日期
  return Array.from({ length: n }, (_, i) =>
    today.clone().subtract(n - 1 - i, 'days').format('YYYYMMDD')
  )
}

function loadData() {
  const dates = getRecentDates(7)
  // 1. 先对日期进行排序（确保顺序正确）
  dates.sort((a, b) => moment(a).diff(moment(b)))
  
  // 2. 提前格式化日期用于显示（避免在模板中重复计算）
  const displayDates = dates.map(d => moment(d).format('MM-DD'))
  let completedCount = 0
  let uncompletedCount = 0
  const chartCounts = []

  dates.forEach(date => {
    const list = TodoListStore.todoList[date] || []
    completedCount += list.filter(t => t.checked).length
    uncompletedCount += list.filter(t => !t.checked).length
    chartCounts.push(list.filter(t => t.checked).length)
  })

  completed.value = completedCount
  uncompleted.value = uncompletedCount

  chartData.value = {
    labels: dates.map(d => moment(d).format('MM-DD')),
    datasets: [{
      ...chartData.value.datasets[0],
      data: chartCounts
    }]
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
  background: #ffffff;
  border-radius: 12px;
  margin: 0.5rem 0.5rem 1rem 0.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
}

.todo-statistic h2 {
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
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
