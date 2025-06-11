<template>
  <div>
    <!-- 选择月份 -->
    <el-select v-model="selectedMonth" placeholder="选择月份">
      <el-option
        v-for="month in 12"
        :key="month"
        :label="`${month}月`"
        :value="month"
      />
    </el-select>
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
                {{ schedule[day] }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 选择的月份
const selectedMonth = ref(new Date().getMonth() + 1);

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

// 日程表数据
const schedule = ref({});

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

// 更新日程表数据
const updateSchedule = (day, value) => {
  schedule.value[day] = value;
};
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
}
.date-number {
  display: block;
  margin-bottom: 10px; /* 上移日期数字 */
  font-weight: bold;
}
.schedule-content {
  min-height: 70px; /* 设置最小高度 */
  max-height: 70px; /* 设置最大高度 */
  padding: 10px; /* 设置内边距 */
  text-align: left;
  outline: none; /* 去除聚焦边框 */
  overflow-y: auto; /* 当内容溢出时显示滚动条 */
}
</style>
