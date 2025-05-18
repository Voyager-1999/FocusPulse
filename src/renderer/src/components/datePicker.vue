<template>
    <el-date-picker v-model="dateValue" v-bind="$props">
      <template #default="dateCell">
        <el-tooltip
          :disabled="!showLunarTip"
          :show-after="lunarTipShowAfter"
          :content="getLunarDateStr(dateCell.date)"
          placement="bottom"
        >
          <div :class="getDateClass(dateCell)">
            <span class="solar-text">{{ dateCell.date.getDate() }}</span>
            <span class="lunar-text">{{ getLunarDay(dateCell.date) }}</span>
            <span v-if="isLegalHoliday(dateCell.date)" class="holiday-mark">休</span>
          </div>
        </el-tooltip>
      </template>
    </el-date-picker>
  </template>
  
<script setup>
  import { ref, watch } from 'vue'
  import { JieQi, Solar } from 'lunar-javascript'
  import { PropTypes } from '../utils/PropTypes'
  import { isEmpty } from '../utils/is'
  import { datePickerProps } from 'element-plus'
  import axios from 'axios'
  
  // 带农历日期显示的选择组件
  defineOptions({ name: 'datePicker' })
  
  const emit = defineEmits(['update:modelValue'])
  
  const props = defineProps({
    ...datePickerProps,
    showFestival: PropTypes.bool.def(true), // 是否显示节日
    showJieQi: PropTypes.bool.def(true), // 是否显示节气
    showLunarTip: PropTypes.bool.def(false), // 是否使用 tooltip 显示农历日期
    lunarTipShowAfter: PropTypes.number.def(2000), // 在触发后多久使用 tooltip 显示农历日期，单位毫秒
    showOtherFestivals: PropTypes.bool.def(true) // 是否显示西方节日
  })
  
  const dateValue = ref('')
  
  watch(
    () => props.modelValue,
    (val) => {
      dateValue.value = val
    },
    {
      immediate: true
    }
  )
  
  watch(
    () => dateValue.value,
    (val) => {
      emit('update:modelValue', val)
    }
  )
  
  // 补充部分非农历节日
  const otherFestivals = {
    '1-1': '元旦',
    '2-14': '情人节',
    '3-8': '妇女节',
    '3-15': '消费者日',
    '4-1': '愚人节',
    '5-1': '劳动节',
    '6-1': '儿童节',
    '10-1': '国庆节',
    '10-31': '万圣夜',
    '12-24': '平安夜',
    '12-25': '圣诞节'
  }
  
  // 法定节假日配置
  const legalHolidays = {
    '1-1': true, // 元旦
    '5-1': true, // 劳动节
    '10-1': true, // 国庆节
    '10-2': true,
    '10-3': true,
    '10-4': true,
    '10-5': true,
    '10-6': true,
    '10-7': true
  }
  
  /**
   * 判断是否为法定节假日
   * @param {Date} date 日期对象
   */
  const isLegalHoliday = (date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const key = `${year}-${month}-${day}`
    // // 将 key 拼接到 URL 中
    // axios.get(`http://api.haoshenqi.top/holiday?date=${key}`)
    // .then(response => {
    //     console.log(response.data); // 假设你需要处理响应数据
    // })
    // .catch(error => {
    //     console.error('There was an error making the request!', error);
    // });
    return legalHolidays[key] || false
  }
  
  /**
   * 获取指定月份的第n个星期几的日期
   * @param {number} year 年份
   * @param {number} month 月份 (1-12)
   * @param {number} nth 第几个
   * @param {number} dayOfWeek 星期几 (0-6, 0表示星期日)
   */
  const getNthDayOfMonth = (year, month, nth, dayOfWeek) => {
    const firstDay = new Date(year, month - 1, 1)
    const firstDayOfWeek = firstDay.getDay()
    let date = 1 + (dayOfWeek - firstDayOfWeek + 7) % 7
    date += (nth - 1) * 7
    return date
  }
  
  /**
   * 获取其它节日
   * @param {Date} date 日期对象
   */
  const getOtherFestivals = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
  
    // 检查固定日期节日
    const key = `${month}-${day}`
    if (otherFestivals[key]) {
      return otherFestivals[key]
    }
  
    // 检查母亲节（5月第二个星期日）
    if (month === 5 && day === getNthDayOfMonth(year, 5, 2, 0)) {
      return '母亲节'
    }
  
    // 检查父亲节（6月第三个星期日）
    if (month === 6 && day === getNthDayOfMonth(year, 6, 3, 0)) {
      return '父亲节'
    }
  
    // 检查感恩节（11月第四个星期四）
    if (month === 11 && day === getNthDayOfMonth(year, 11, 4, 4)) {
      return '感恩节'
    }
  
    return null
  }
  
  /**
   * 获取当前日期显示样式
   * @param {Object} dateCell 单元格日期信息
   */
  const getDateClass = (dateCell) => {
    let cla = 'date-wrapper'
    if (dateCell.type === 'today') {
      cla += ' today'
    }
  
    if (dateCell.isCurrent || dateCell.isSelected || dateCell.start || dateCell.end) {
      cla += ' active'
    } else if (dateCell.inRange) {
      cla += ' in-range'
    }
  
    if (dateCell.disabled) {
      cla += ' disabled-date'
    }
  
    if (isLegalHoliday(dateCell.date)) {
      cla += ' holiday'
    }
  
    return cla
  }
  
  /**
   * 获取农历 day 显示文字
   * @param {Date} date 日期对象
   */
  const getLunarDay = (date) => {
    // 优先显示西方节日
    if (props.showOtherFestivals) {
      const OtherFestivals = getOtherFestivals(date)
      if (OtherFestivals) {
        return OtherFestivals
      }
    }
  
    const solarDate = Solar.fromDate(date)
    const lunarDate = solarDate.getLunar()
    // 每月第一天显示月数
    if (lunarDate.getDay() == 1) {
      return lunarDate.getMonthInChinese() + '月'
    }
  
    // 显示农历节日
    if (props.showFestival) {
      const festivals = lunarDate.getFestivals()
      if (!isEmpty(festivals)) {
        return festivals[0]
      }
    }
  
    // 显示节气
    if (props.showJieQi) {
      const currJieQi = lunarDate.getCurrentJieQi()
      if (currJieQi && currJieQi.getName()) {
        return currJieQi.getName()
      }
    }
  
    return lunarDate.getDayInChinese()
  }
  
  /**
   * 根据日历获取农历日期，包含年份干支和生肖
   * @param {Date} date 日期对象
   */
  const getLunarDateStr = (date) => {
    const solarDate = Solar.fromDate(date)
    const lunarDate = solarDate.getLunar()
    return `${lunarDate.getYearInChinese()}年${lunarDate.getMonthInChinese()}月${lunarDate.getDayInChinese()} 【${lunarDate.getYearInGanZhi()}(${lunarDate.getYearShengXiao()})年】`
  }
  </script>
  
  <style lang="scss" scoped>
  .date-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 4px 0;
    line-height: 18px;
    text-align: center;
  
    .solar-text {
      font-size: 14px;
    }
  
    .lunar-text {
      white-space: nowrap;
      font-size: 10px;
      color: var(--el-text-color-secondary, #82868b);
    }
  
    .holiday-mark {
      position: absolute;
      top: 0;
      right: 2px;
      font-size: 10px;
      color: #67c23a;
      transform: scale(0.8);
    }
  }
  
  .today {
    font-weight: 700;
    color: var(--el-color-primary);
  }
  
  .active {
    color: #fff;
    background-color: var(--el-datepicker-active-color);
    border-radius: 5px;
  }
  
  .in-range {
    background-color: var(--el-datepicker-inrange-bg-color);
  }
  
  .disabled-date {
    cursor: not-allowed;
  }
  </style>
  
  