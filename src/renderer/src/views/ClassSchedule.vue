<template>
  <div style="position: relative;">
    <!-- 选择月份和添加贴纸按钮 -->
    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
      <el-select v-model="selectedMonth" placeholder="选择月份">
        <el-option
          v-for="month in 12"
          :key="month"
          :label="`${month}月`"
          :value="month"
        />
      </el-select>
      <el-button size="small" @click="showStickerDialog = true">添加贴纸</el-button>
    </div>
    <!-- 贴纸选择弹窗 -->
    <el-dialog v-model="showStickerDialog" title="选择贴纸图案" width="600px" :show-close="false" align-center>
      <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;">
        <div v-for="(img, idx) in stickerImages" :key="img" style="cursor:pointer; position:relative;">
          <img :src="img" alt="贴纸图案" style="width:70px;height:70px;background:transparent;" @click="addSticker(img)" />
        </div>
      </div>
    </el-dialog>
    <!-- 日程表 -->
    <table class="schedule-table">
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td
            v-for="(day, colIndex) in row"
            :key="colIndex"
            :style="{ backgroundColor: getLightDayColor(day) }"
          >
            <div v-if="day">
              <span class="date-number">{{ day }}</span>
              <div
                class="schedule-content"
                contenteditable
                @input="updateSchedule(day, $event.target.innerText)"
              >
                {{ getScheduleForDay(day) }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- 贴纸渲染区 -->
    <Sticker
      v-for="(sticker, idx) in currentMonthStickers"
      :key="sticker.id"
      :x="sticker.x"
      :y="sticker.y"
      :imgSrc="sticker.imgSrc"
      :text="sticker.text"
      :width="sticker.width"
      :height="sticker.height"
      @update:position="pos => updateStickerPosition(idx, pos)"
      @update:size="size => updateStickerSize(idx, size)"
      @delete="deleteSticker(idx)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import Sticker from '../components/Sticker.vue';
import sticker from '../assets/sticker.svg'
import sticker1 from '../assets/sticker1.svg'
import sticker2 from '../assets/sticker2.svg'
import sticker3 from '../assets/sticker3.svg'
import sticker4 from '../assets/sticker4.svg'
import sticker5 from '../assets/sticker5.svg'
import sticker6 from '../assets/sticker6.svg'
import sticker7 from '../assets/sticker7.svg'
import sticker9 from '../assets/sticker9.svg'
import sticker10 from '../assets/sticker10.svg'
import sticker11 from '../assets/sticker11.svg'
import sticker12 from '../assets/sticker12.svg'
import sticker13 from '../assets/sticker13.svg'
import sticker14 from '../assets/sticker14.svg'
import sticker15 from '../assets/sticker15.svg'
import sticker16 from '../assets/sticker16.svg'
import sticker17 from '../assets/sticker17.svg'
import sticker18 from '../assets/sticker18.svg'
import sticker19 from '../assets/sticker19.svg'
import sticker20 from '../assets/sticker20.svg'
import sticker21 from '../assets/sticker21.svg'
import sticker22 from '../assets/sticker22.svg'
import sticker23 from '../assets/sticker23.svg'
import sticker24 from '../assets/sticker24.svg'
import sticker25 from '../assets/sticker25.svg'
import sticker26 from '../assets/sticker26.svg'
import sticker27 from '../assets/sticker27.svg'
import sticker28 from '../assets/sticker28.svg'
import sticker29 from '../assets/sticker29.svg'
import sticker30 from '../assets/sticker30.svg'
import sticker31 from '../assets/sticker31.svg'
import sticker32 from '../assets/sticker32.svg'
import sticker33 from '../assets/sticker33.svg'
import sticker34 from '../assets/sticker34.svg'
import sticker35 from '../assets/sticker35.svg'
import sticker36 from '../assets/sticker36.svg'
import sticker37 from '../assets/sticker37.svg'
import sticker38 from '../assets/sticker38.svg'
import sticker39 from '../assets/sticker39.svg'
import sticker40 from '../assets/sticker40.svg'
import sticker41 from '../assets/sticker41.svg'
import sticker42 from '../assets/sticker42.svg'
import sticker43 from '../assets/sticker43.svg'
import sticker44 from '../assets/sticker44.svg'
import sticker45 from '../assets/sticker45.svg'

const stickerImages = [
  sticker, sticker1, sticker2, sticker3, sticker4, sticker5, sticker6, sticker7,
  sticker9, sticker10, sticker11, sticker12, sticker13, sticker14, sticker15, sticker16, sticker17, sticker18, sticker19, sticker20, sticker21, sticker22, sticker23, sticker24, sticker25,
  sticker26, sticker27, sticker28, sticker29, sticker30, sticker31, sticker32, sticker33, sticker34, sticker35, sticker36, sticker37, sticker38,
  sticker39, sticker40, sticker41, sticker42, sticker43, sticker44, sticker45
];
const showStickerDialog = ref(false);

// 选择的月份
const selectedMonth = ref(new Date().getMonth() + 1);

// 每月贴纸独立存储
const stickersByMonth = ref({}); // { 1: [...], 2: [...], ... }
let stickerId = 1;

// 按月份存储日程数据
const scheduleByMonth = ref({});

const currentMonthStickers = computed(() => {
  return stickersByMonth.value[selectedMonth.value] || [];
});

// 从本地存储加载数据
const loadData = () => {
  try {
    const storedStickers = localStorage.getItem('stickersByMonth');
    if (storedStickers) {
      stickersByMonth.value = JSON.parse(storedStickers);
    }
    const storedSchedule = localStorage.getItem('scheduleByMonth');
    if (storedSchedule) {
      scheduleByMonth.value = JSON.parse(storedSchedule);
    }
  } catch (error) {
    console.error('加载数据失败:', error);
  }
};

// 保存数据到本地存储
const saveData = () => {
  try {
    localStorage.setItem('stickersByMonth', JSON.stringify(stickersByMonth.value));
    localStorage.setItem('scheduleByMonth', JSON.stringify(scheduleByMonth.value));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
};

function addSticker(imgSrc) {
  showStickerDialog.value = false;
  if (!stickersByMonth.value[selectedMonth.value]) {
    stickersByMonth.value[selectedMonth.value] = [];
  }
  stickersByMonth.value[selectedMonth.value].push({
    id: stickerId++,
    x: 120 + Math.random() * 100,
    y: 120 + Math.random() * 100,
    text: '', // 只用图片贴纸
    imgSrc: imgSrc,
    width: 60,
    height: 60,
  });
  saveData();
}
function updateStickerPosition(idx, pos) {
  const arr = stickersByMonth.value[selectedMonth.value];
  if (arr && arr[idx]) {
    arr[idx].x = pos.x;
    arr[idx].y = pos.y;
    saveData();
  }
}
function updateStickerSize(idx, size) {
  const arr = stickersByMonth.value[selectedMonth.value];
  if (arr && arr[idx]) {
    arr[idx].width = size.width;
    arr[idx].height = size.height;
    saveData();
  }
}
function deleteSticker(idx) {
  const arr = stickersByMonth.value[selectedMonth.value];
  if (arr) arr.splice(idx, 1);
  saveData();
}
function moveSticker(idx, dir) {
  const arr = stickerImages
  const temp = arr[idx]
  arr.splice(idx, 1)
  arr.splice(idx + dir, 0, temp)
}
// 计算所选月份的天数
const daysInMonth = computed(() => {
  const year = new Date().getFullYear();
  return new Date(year, selectedMonth.value, 0).getDate();
});
// 将天数按每行七个分组
const rows = computed(() => {
  const days = Array.from({ length: daysInMonth.value }, (_, i) => i + 1);
  const result = [];
  for (let i = 0; i < days.length; i += 7) {
    result.push(days.slice(i, i + 7));
  }
  return result;
});

// 根据月份和日期获取日程数据
const getScheduleForDay = (day) => {
  return scheduleByMonth.value[selectedMonth.value]?.[day] || '';
};

// 更新日程表数据
const updateSchedule = (day, value) => {
  if (!scheduleByMonth.value[selectedMonth.value]) {
    scheduleByMonth.value[selectedMonth.value] = {};
  }
  scheduleByMonth.value[selectedMonth.value][day] = value;
  saveData();
};

// 根据月份设置不同颜色（更浅版）
const getLightDayColor = (day) => {
  const baseColors = [
    'rgba(255, 179, 179, 0.1)', 'rgba(179, 255, 179, 0.1)', 'rgba(179, 179, 255, 0.1)',
    'rgba(255, 255, 179, 0.1)', 'rgba(255, 179, 255, 0.1)', 'rgba(179, 255, 255, 0.1)',
    'rgba(255, 217, 179, 0.1)', 'rgba(217, 255, 179, 0.1)', 'rgba(179, 217, 255, 0.1)',
    'rgba(255, 179, 217, 0.1)', 'rgba(217, 179, 255, 0.1)', 'rgba(179, 255, 217, 0.1)'
  ];
  return baseColors[selectedMonth.value - 1];
};

onMounted(() => {
  loadData();
});

onBeforeUnmount(() => {
  saveData();
});
</script>

<style scoped>
.schedule-table {
  width: 100%; /* 调整表格宽度 */
  margin: 0 auto; /* 居中显示 */
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
  vertical-align: top;
  width: calc(100% / 7); /* 平均分配列宽 */
  height: calc(100% / 5);
}
.date-number {
  display: block;
  margin-bottom: 10px; /* 上移日期数字 */
  font-weight: bold;
}
.schedule-content {
  min-height: 70px; /* 设置最小高度 */
  max-height: 70px; /* 设置最大高度 */
  text-align: left;
  outline: none; /* 去除聚焦边框 */
  overflow-y: auto; /* 当内容溢出时显示滚动条 */
}
.drag-ghost {
  opacity: 0.5 !important;
  box-shadow: 0 4px 16px #ffd96699 !important;
  z-index: 9999 !important;
  border: 2px dashed #ffd966 !important;
  border-radius: 8px !important;
}
.drag-chosen {
  opacity: 0.8 !important;
  box-shadow: 0 2px 8px #b8860b99 !important;
  z-index: 10000 !important;
}
</style>
