<template>
  <div class="yesterday-summary">
    <h2>昨日小结</h2>

    <div class="summary-card">
      <p>完成任务数：<strong>{{ completedTasks }}</strong></p>
      <!-- <p>专注时长：<strong>{{ focusMinutes }}</strong> 分钟</p> -->
    </div>

    <div class="quote-section" @click="changeQuote" title="点击更换一句励志语录">
      <p class="quote-text">“{{ currentQuote }}”</p>
      <p class="quote-note">点击语录即可切换</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTodoListStore } from '../store/todoList.store'
import dayjs from 'dayjs'

const completedTasks = ref(0)
const focusMinutes = ref(0)
const todoStore = useTodoListStore()

// 励志语录数组
const quotes = [
  '成功源于每天的积累。',
  '再小的努力，乘以365都会很惊人。',
  '专注当下，就是最好的修行。',
  '自律给我自由。',
  '滴水穿石，非一日之功。',
  '把今天过好，就是对未来最大的尊重。',
  '时间会证明一切。',
  '你不努力，谁也给不了你想要的生活。',
  '一日之计在于晨，一生之计在于勤。',
  '热爱可抵岁月漫长。'
]
const currentQuote = ref(quotes[0])
function changeQuote() {
  const idx = Math.floor(Math.random() * quotes.length)
  currentQuote.value = quotes[idx]
}

function getYesterdayDateStr() {
  return dayjs().subtract(1, 'day').format('YYYYMMDD')
}

function getYesterdayIsoDate() {
  return dayjs().subtract(1, 'day').format('YYYY-MM-DD')
}

function loadSummaryData() {
  const yesterday = getYesterdayDateStr()
  const todos = todoStore.getTodosByDate(yesterday)
  //const todos = todoStore.getTodosByDate(dayjs().subtract(1, 'day').format('YYYYMMDD'))
  completedTasks.value = todos.filter(t => t.checked).length
  
  const saved = localStorage.getItem('pomodoroData')
  if (saved) {
    const data = JSON.parse(saved)
    const history = data.history || []
    const yIso = getYesterdayIsoDate()

    focusMinutes.value = history
      //.filter(h => h.type === '工作' && h.time?.startsWith(yIso))
      //.filter(h => h.type === '工作' && h.date === yIso)
      .filter(h => h.type === '工作' && h.time?.includes(yIso))
      .reduce((sum, h) => sum + (h.duration || 0), 0)
  }
}

onMounted(() => {
  loadSummaryData()
})

onBeforeUnmount(() => {
  completedTasks.value = 0
  focusMinutes.value = 0
})
</script>

<style scoped>
.yesterday-summary {
  padding: 1.5rem;
  background: #f9fefc; /* 更加清新的底色 */
  border-radius: 12px;
  margin: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

h2 {
  font-size: 1.5rem;
  color: #40916c; /* 柔和绿色 */
  margin-bottom: 1rem;
  text-align: center;
}

.summary-card {
  background: #ffffff;
  padding: 1.25rem;
  border-radius: 10px;
  font-size: 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(64, 145, 108, 0.08); /* 绿色阴影 */
}

.summary-card strong {
  color: #1b4332;
  font-size: 1.15rem;
}

.summary-card p {
  color: #555;
}

.quote-section {
  background: linear-gradient(135deg, #e0f7f1, #c9f1e5); /* 清新渐变 */
  border-radius: 10px;
  padding: 1.25rem;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: background 0.3s ease;
  box-shadow: 0 2px 6px rgba(64, 145, 108, 0.08);
}

.quote-section:hover {
  background: linear-gradient(135deg, #d0eee4, #b8e8da);
}

.quote-text {
  font-size: 1.1rem;
  color: #2b7a78; /* 蓝绿调文字 */
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.quote-note {
  font-size: 0.85rem;
  color: #7f8c8d;
}
</style>
