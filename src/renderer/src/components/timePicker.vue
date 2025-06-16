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
      v-show="showDropdown"
      class="time-picker-dropdown"
      aria-labelledby="btnTaskTimePicker"
      style="display: none;"
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
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  time: { required: true, type: [String, null] },
});

const emit = defineEmits(["timeSelected"]);

const selectedTime = ref(props.time || "");
const showDropdown = ref(false);

const toggleDropdown = () => {
  console.log('Toggle clicked, current state:', showDropdown.value);
  showDropdown.value = !showDropdown.value;
  console.log('New state:', showDropdown.value);
  
  if (showDropdown.value) {
    // 获取按钮位置
    const button = document.getElementById('btnTaskTimePicker');
    const dropdown = document.querySelector('.time-picker-dropdown');
    if (button && dropdown) {
      const rect = button.getBoundingClientRect();
      dropdown.style.display = 'block';
      dropdown.style.top = `${rect.bottom + 4}px`;
      dropdown.style.left = `${rect.left}px`;
    }
  } else {
    const dropdown = document.querySelector('.time-picker-dropdown');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  }
};

const selectTime = (time) => {
  emit("timeSelected", time);
  showDropdown.value = false;
};

const clearTime = () => {
  selectedTime.value = null;
  selectTime(selectedTime.value);
};

watch(
  () => props.time,
  (newVal) => {
    selectedTime.value = newVal;
  }
);

// Add a watch to monitor showDropdown changes
watch(showDropdown, (newVal) => {
  console.log('showDropdown changed to:', newVal);
});

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.time-picker-dropdown');
  const button = document.getElementById('btnTaskTimePicker');
  if (dropdown && button && !dropdown.contains(event.target) && !button.contains(event.target)) {
    showDropdown.value = false;
    dropdown.style.display = 'none';
  }
};

// 添加和移除点击外部事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="scss">
@use "/src/assets/style/globalVars.scss" as *;

.header-menu-icons {
  margin-left: 6px;
  @include btn-icon; // 引用 globalVars.scss 中定义的 btn-icon mixin
}

.bi-trash {
  margin: 0px;
}

input[type="time"] {
  background-color: transparent;
  border: none;
  font-size: 16px;
  width: 130px;
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

.time-picker-container {
  position: relative;
  display: inline-block;
  z-index: 2001;
}

.time-picker-dropdown {
  position: fixed;
  transform: translateY(0);
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  padding: 8px 0;
  min-width: 200px;
  z-index: 2002;
}

.dark-theme .time-picker-dropdown {
  background: #303940;
  border-color: #4c4c4c;
}
</style>