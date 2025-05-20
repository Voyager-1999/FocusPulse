<template>
  <div class="time-picker-container">
    <div
      class="header-menu-icons"
      type="button"
      @click="toggleDropdown"
      title="时间"
    >
      <i
        id="btnTaskTimePicker"
        :class="{ 'bi-alarm': !selectedTime, 'bi-alarm-fill': selectedTime }"
      ></i>
    </div>

    <ul
      v-if="showDropdown"
      class="dropdown-menu color-picker-dropdown"
      aria-labelledby="btnTaskTimePicker"
    >
      <div class="d-flex align-items-center mx-3">
        <input
          type="time"
          v-model="selectedTime"
          @blur="selectTime(selectedTime)"
        />
        <i
          class="header-menu-icons bi-trash"
          type="button"
          @click="clearTime"
        ></i>
      </div>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

// 定义 props
const props = defineProps({
  time: {
    required: true,
    type: [String, null]
  }
})

// 定义 emits
const emit = defineEmits(['timeSelected'])

// 响应式数据
const selectedTime = ref('')
const showDropdown = ref(false)

// 方法
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectTime = (time) => {
  emit('timeSelected', time)
  showDropdown.value = false
}

const clearTime = () => {
  selectedTime.value = null
  selectTime(selectedTime.value)
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.color-picker-dropdown')
  const trigger = document.querySelector('.header-menu-icons')
  if (dropdown && trigger && !dropdown.contains(event.target) && !trigger.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 监听 props 变化
watch(() => props.time, (newVal) => {
  selectedTime.value = newVal
}, { immediate: true })
</script>

<style scoped lang="scss">
// Variables
$black-bg-color: #21262d;
$black-border-color: 1px solid #30363d;
$text-color: #212529;
$dt-text-color: #f7f7f7;
$btn-color: #5c5c5c;
$btn-hover-color: black;
$btn-hover-bg-color: #f4f4f4;
$btn-active-bg-color: #e9e9e9;
$dt-btn-color: #ababab;
$dt-btn-hover-color: white;
$dt-btn-hover-bg-color: #303940;
$dt-btn-active-bg-color: #354048;

.time-picker-container {
  position: relative;
  display: inline-block;
}

.color-picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 180px;
  padding: 8px 0;
  margin: 2px 0 0;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .dark-theme & {
    background-color: $black-bg-color;
    border-color: $black-border-color;
  }
}

@mixin btn-icon {
  font-size: 1.1rem;
  border-radius: 5px;
  padding: 8px;
  color: $btn-color;
  &:hover {
    color: $btn-hover-color;
    background-color: $btn-hover-bg-color;
    cursor: pointer;
  }
  &:active {
    background-color: $btn-active-bg-color;
  }
  .dark-theme & {
    color: $dt-btn-color;

    &:hover {
      color: $dt-btn-hover-color;
      background-color: $dt-btn-hover-bg-color;
    }

    &:active {
      background-color: $dt-btn-active-bg-color;
    }
  }
}

.header-menu-icons {
  margin-left: 6px;
  @include btn-icon;
}

.bi-trash {
  margin: 0;
  padding: 8px;
}

.d-flex.align-items-center {
  padding: 0 8px;
}

input[type="time"] {
  background-color: transparent;
  border: none;
  font-size: 16px;
  width: 120px;
  outline: unset;
  height: 40px;
}

input[type="time"]::-webkit-datetime-edit-text {
  padding: 19px 2px;
}

input[type="time"]::-webkit-datetime-edit-fields-wrapper {
  padding: 8px 2px 8px 2px;
  border: none;
}

input[type="time"]::-webkit-datetime-edit-hour-field,
input[type="time"]::-webkit-datetime-edit-minute-field,
input[type="time"]::-webkit-datetime-edit-ampm-field {
  background-color: transparent;
  border: 2px solid transparent;
  border-radius: 5px;
  padding: 5px;
  min-width: 80px;
  width: 80px;
  color: #494949;

  .dark-theme & {
    color: #bfbfbf;
  }
}

input[type="time"]::-webkit-calendar-picker-indicator {
  background: none;
  display: none;
}

input[type="time"]::-webkit-datetime-edit-hour-field:hover,
input[type="time"]::-webkit-datetime-edit-minute-field:hover,
input[type="time"]::-webkit-datetime-edit-ampm-field:hover {
  color: black;
  background-color: #f4f4f4;

  .dark-theme & {
    color: white;
    background-color: #303940;
  }
}

input[type="time"]::-webkit-datetime-edit-hour-field:focus,
input[type="time"]::-webkit-datetime-edit-minute-field:focus,
input[type="time"]::-webkit-datetime-edit-ampm-field:focus {
  border: 2px solid black;
  color: black;
  background-color: transparent;

  .dark-theme & {
    border: 2px solid white;
    color: white;
  }
}
</style>