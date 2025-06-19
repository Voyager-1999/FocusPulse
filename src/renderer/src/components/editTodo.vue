<template>
  <div class="editTodo">
    <!-- 1. 顶部 -->
    <div class="header">
      <div class="sort-ellipse" :style="{ background: selectedSort.color || '#f2f3f4', color: selectedSort.color ? '#fff' : '#f2f3f4' }">
        {{ selectedSort.name || '不分类' }}
      </div>
      <el-popover v-model:visible="showSortPopover" placement="bottom" width="200">
        <template #reference>
          <el-button circle class="sort-pop-btn"><el-icon><ArrowDown /></el-icon></el-button>
        </template>
        <div class="sort-list">
          <el-button
            v-for="sort in sortsStore.sorts"
            :key="sort.name"
            class="sort-item"
            :style="{ color: sort.color }"
            @click="selectSort(sort)"
          >
            {{ sort.name }}
          </el-button>
          <el-button class="add-sort-btn" @click="showAddSort = true">
            <el-icon><Plus /></el-icon>新建分类
          </el-button>
        </div>
      </el-popover>
      <el-dialog v-model="showAddSort" :show-close="false" width="auto" align-center>
        <addSort @close="showAddSort = false" />
      </el-dialog>
      <div class="time">
        <timePicker
          :time="todoData.time"
          @timeSelected="onTimeSelected"
        />
      </div>
      <div class="alarm">
        <i
          class="header-menu-icons"
          :class="{ 'bi-bell': !todoData.alarm, 'bi-bell-fill': todoData.alarm }"
          @click="toggleAlarm"
          title="提醒"
        ></i>
      </div>
      <div class="repeat">
        <repeating-event 
          :repeatingEvent="todoData.repeatingEvent" 
          :todo="todoData"
          :rule="rule"
          @repeatingEventSelected="changeRepeatingEvent"
        ></repeating-event>
      </div>
    </div>
    <!-- 2. text输入框 -->
    <el-input v-model="todoData.text" placeholder="输入待办内容" class="todo-text-input" />
    <!-- 3. desc输入框 -->
    <el-input v-model="todoData.desc" placeholder="添加描述" class="todo-desc-input" />
    <!-- 4. 开始日期选择 -->
    <div class="startDate-row">
      <span>开始日期：</span>
      <el-button :type="start_isToday ? 'primary' : 'default'" @click="setStartToday">今天</el-button>
      <el-button :type="start_isTomorrow ? 'primary' : 'default'" @click="setStartTomorrow">明天</el-button>
      <datePicker
        v-model="todoData.startDate"
        type="date"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYYMMDD"
        @change="onStartDateChange"
        :teleported="false"
        class="date-picker"
      />
    </div>
    <!-- 5. 结束日期选择 -->
    <div class="Date-row">
      <span>结束日期：</span>
      <el-button :type="due_isToday ? 'primary' : 'default'" @click="setdueToday">今天</el-button>
      <el-button :type="due_isTomorrow ? 'primary' : 'default'" @click="setdueTomorrow">明天</el-button>
      <datePicker
        v-model="todoData.dueDate"
        type="date"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYYMMDD"
        @change="ondueDateChange"
        :teleported="false"
        class="date-picker"
      />
    </div>
    <!-- 5. 子任务 -->
    <div class="subtodo-list" v-if="todoData.subTodos.length">
      <div v-for="(sub, idx) in todoData.subTodos" :key="idx" class="subtodo-item">
        <el-checkbox v-model="sub.checked" />
        <span :class="{ 'subtodo-done': sub.checked }">{{ sub.text }}</span>
        <el-button link class="subtodo-delete-btn" @click="deleteSubTodo(idx)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <el-input v-model="subInput" placeholder="添加子任务,按下回车新建" @keyup.enter="addSubTodo" class="subtodo-input" />
    <!-- 7. 保存按钮 -->
    <el-button type="primary" class="save-btn" @click="saveTodo">保存</el-button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTodoListStore } from '../store/todoList.store'
import { useSortsStore } from '../store/sorts.store'
import addSort from './addSort.vue'
import timePicker from './timePicker.vue'
import { ArrowDown, Plus, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import datePicker from './datePicker.vue'
import notifications from '../utils/notifications'
import repeatingEvent from './repeatingEvent.vue'
import repeatingEventByDateRepository from '../repositories/repeatingEventByDateRepository'
import repeatingEventRepository from '../repositories/repeatingEventRepository'
import repeatingEventHelper from '../utils/repeatingEventHelper.js'
import { useRepeatingEventStore } from '../store/repeatingEvent.store'
import { useRepeatingEventDateCacheStore } from '../store/repeatingEventDateCache.store'
import { rrulestr } from 'rrule'



const props = defineProps({
  todo: Object, // 传入则为编辑，否则新建
  initialText: String // 新建时初始内容
})
const emit = defineEmits(['saved'])

const TodoListStore = useTodoListStore()
const sortsStore = useSortsStore()

const showSortPopover = ref(false)
const showAddSort = ref(false)
const subInput = ref('')

const todoData = ref({
  text: '',
  desc: '',
  startDate: dayjs().format('YYYYMMDD'),
  dueDate: dayjs().format('YYYYMMDD'),
  listId:dayjs().format('YYYYMMDD'),
  checked: false,
  subTodos: [],
  repeatingEvent: null,
  sort: null,
  alarm: false,
  time: null
})

const selectedSort = computed(() => {
  if (!todoData.value.sort) {
    return { name: '不分类', color: '#f2f3f4' };
  }
  return todoData.value.sort;
})
const start_isToday = computed(() => todoData.value.startDate === dayjs().format('YYYYMMDD'))
const start_isTomorrow = computed(() => todoData.value.startDate === dayjs().add(1, 'day').format('YYYYMMDD'))
const due_isToday = computed(() => todoData.value.dueDate === dayjs().format('YYYYMMDD'))
const due_isTomorrow = computed(() => todoData.value.dueDate === dayjs().add(1, 'day').format('YYYYMMDD'))

let rule = ref(null)
let repeatingType = ref(null)
let ocurrencesType = ref(null)

// Store
const repeatingEventStore = useRepeatingEventStore()
const repeatingEventDateCacheStore = useRepeatingEventDateCacheStore()

onMounted(() => {
  if (props.todo) {
    todoData.value = JSON.parse(JSON.stringify(props.todo))
  } else if (props.initialText) {
    todoData.value.text = props.initialText
  }
})

function selectSort(sort) {
  // 如果选择的是"不分类"，则将sort设置为null
  if (sort.name === '不分类') {
    todoData.value.sort = null;
  } else {
    todoData.value.sort = sort;
  }
  showSortPopover.value = false
}
function setStartToday() {
  todoData.value.startDate = dayjs().format('YYYYMMDD')
  todoData.value.listId = todoData.value.startDate
}
function setStartTomorrow() {
  todoData.value.startDate = dayjs().add(1, 'day').format('YYYYMMDD')
  todoData.value.listId = todoData.value.startDate
}

function setdueToday() {
  todoData.value.dueDate = dayjs().format('YYYYMMDD')
}
function setdueTomorrow() {
  todoData.value.dueDate = dayjs().add(1, 'day').format('YYYYMMDD')
}
function onStartDateChange(val) {
  todoData.value.startDate = val
  todoData.value.listId = todoData.value.startDate
}

function ondueDateChange(val) {
  todoData.value.dueDate = val
}
function addSubTodo() {
  if (subInput.value.trim()) {
    todoData.value.subTodos.push({ text: subInput.value.trim(), checked: false })
    subInput.value = ''
  }
}
function deleteSubTodo(idx) {
  todoData.value.subTodos.splice(idx, 1)
}

function generateRepeatingEvent(rule, repeatingEventId) {
  let todo_data = todoData.value
  todo_data.repeatingEvent = repeatingEventId
  const rule2 = rrulestr(rule.toString())
  
  let re_event = {
    start_date: rule.options.dtstart,
    repeating_rule: rule.toString(),
    type: repeatingType.value,
    ocurrencesType: ocurrencesType.value,
    data: todo_data,
    id: repeatingEventId
  }

  if (ocurrencesType.value == 'ocurrences') {
    re_event.end_date = dayjs(rule2.all().slice(-1)[0]).toDate()
  } else if (ocurrencesType.value == 'untilDate') {
    re_event.end_date = dayjs(rule.options.until).toDate()
  } else {
    let date = dayjs().add(15, 'year').toDate()
    re_event.end_date = date
  }

  return re_event
}

async function saveTodo() {
  console.log(todoData.value)
  if (!todoData.value.text) return
  // console.log(todoData.value)
  if (props.todo) {
    await TodoListStore.updateTodo(props.todo, todoData.value)
  } else {
    await TodoListStore.addTodo(todoData.value)
  }
  if ( todoData.value.time && todoData.value.alarm ){
    notifications.refreshDayNotifications(todoData.value.listId)
  }
  emit('saved', todoData.value)

  let repeatingEventId = todoData.value.repeatingEvent
  if (todoData.value.repeatingEvent && rule.value) {
    let date = todoData.value
    let re_by_date = repeatingEventStore.repeatingEventByDate[date] || {}
    re_by_date[repeatingEventId] = true // 记录该日期下已生成了这个重复事件的实例

    const re_event = generateRepeatingEvent(rule.value, repeatingEventId)

    console.log(re_event)

    // 更新状态
    repeatingEventStore.updateRepeatingEvent({ key: repeatingEventId, val: re_event })
    repeatingEventDateCacheStore.addRepeatingEventToDateCache(re_event)
    
    // 构造重复事件对象
    const re_event_obj = {
      ...re_event,
      id: repeatingEventId  // 确保 id 字段存在
    }
    
    // 构造日期关联对象
    const re_by_date_obj = {
      re_by_date,  // 直接使用 re_by_date 对象
      listId: todoData.value.listId    // 添加主键
    }
    
    // 更新数据库
    repeatingEventRepository.update(repeatingEventId, re_event_obj)
    repeatingEventByDateRepository.update(date, re_by_date_obj)
    
    // 生成未来3个月内的重复事件实例
    const today = dayjs();
    const threeMonthsLater = today.add(3, 'month');
    let current = today.clone().add(1, 'day'); // 从明天开始
    while (current.isBefore(threeMonthsLater)) {
      repeatingEventHelper.generateRepeatingEventsIntances(current.format('YYYYMMDD'));
      current = current.add(1, 'day');
    }
  }
}

function onTimeSelected(time) {
  todoData.value.time = time
  todoData.value.alarm = !!time
}

function toggleAlarm() {
  todoData.value.alarm = !todoData.value.alarm
}

function changeRepeatingEvent(repeatingEvent, receivedRule, receivedRepeatingType, receivedOcurrencesType) {
  todoData.value.repeatingEvent = repeatingEvent;
  rule.value = receivedRule;
  repeatingType.value = receivedRepeatingType;
  ocurrencesType.value = receivedOcurrencesType;
  
  // 如果清除了重复规则，重置相关值
  if (!repeatingEvent) {
    todoData.value.repeatingEvent = null;
    rule.value = null;
    repeatingType.value = null;
    ocurrencesType.value = null;
  }
}

watch(
  () => props.initialText,
  (val) => {
    if (!props.todo && val !== undefined) {
      todoData.value = {
        text: val,
        desc: '',
        startDate: dayjs().format('YYYYMMDD'),
        dueDate: dayjs().format('YYYYMMDD'),
        listId: dayjs().format('YYYYMMDD'),
        checked: false,
        subTodos: [],
        repeatingEvent: null,
        sort: null,
        alarm: false,
        time: null
      }
    }
  }
)
</script>

<style scoped>
.editTodo {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 12px;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
}

.sort-ellipse {
  min-width: 56px;
  padding: 4px 12px;
  border-radius: 16px;
  background: #dcdfe6;
  color: #606266;
  font-size: 13px;
  text-align: center;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sort-pop-btn {
  background: #f5f7fa;
  padding: 6px;
  font-size: 14px;
  margin-right: 4px;
  transition: all 0.2s ease;
}

.sort-pop-btn:hover {
  background: #eef1f6;
  color: #409eff;
}

.sort-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
  padding: 8px;
}

.sort-item {
  width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  text-align: left !important;
  justify-content: flex-start !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  height: 36px !important;
  line-height: 20px !important;
  display: flex !important;
  align-items: center !important;
  outline: none !important;
  box-shadow: none !important;
  border-width: 1px !important;
  font-size: 14px !important;
  font-family: inherit !important;
  background: #fff !important;
  border-color: #dcdfe6 !important;
  transition: all 0.2s ease !important;
}

.sort-item:hover {
  background: #f5f7fa !important;
  border-color: #c0c4cc !important;
  transform: translateY(-1px);
}

.add-sort-btn {
  margin-top: 4px !important;
  color: #409eff !important;
  border-style: dashed !important;
  transition: all 0.2s ease !important;
  width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  text-align: left !important;
  justify-content: flex-start !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  height: 36px !important;
  line-height: 20px !important;
  display: flex !important;
  align-items: center !important;
  outline: none !important;
  box-shadow: none !important;
  border-width: 1px !important;
  font-size: 14px !important;
  font-family: inherit !important;
  background: #fff !important;
  border-color: #dcdfe6 !important;
}

.add-sort-btn:hover {
  background: #ecf5ff !important;
  border-color: #409eff !important;
  transform: translateY(-1px);
}

:deep(.el-popover) {
  padding: 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #ebeef5 !important;
}

.todo-text-input {
  font-size: 15px;
  margin-top: 2px;
}

.todo-text-input :deep(.el-input__wrapper) {
  padding: 0px, 2px;
  min-height: 42px;
}

.todo-desc-input {
  font-size: 14px;
}

.todo-desc-input :deep(.el-input__wrapper) {
  padding: 0px, 2px;
  min-height: 38px;
}

.startDate-row, .Date-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 2px 0;
}

.startDate-row span, .Date-row span {
  min-width: 60px;
  white-space: nowrap;
  color: #606266;
}

.startDate-row .el-button, .Date-row .el-button {
  padding: 4px 12px;
  font-size: 12px;
  height: 26px;
  line-height: 1;
  margin: 4px;
}

.startDate-row .el-button:last-child, .Date-row .el-button:last-child {
  margin-right: 0;
}

.date-picker {
  width: 110px;
}

.subtodo-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 2px 0;
  max-height: 180px;
  overflow-y: auto;
}

.subtodo-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  padding: 1px 0;
}

.subtodo-done {
  text-decoration: line-through;
  color: #909399;
}

.subtodo-input {
  font-size: 13px;
  margin-top: 2px;
}

.subtodo-input :deep(.el-input__wrapper) {
  padding: 0px, 2px;
  min-height: 36px;
}

.save-btn {
  width: 100%;
  margin-top: 4px;
  height: 34px;
  font-size: 14px;
  font-weight: 500;
}

.subtodo-delete-btn {
  margin-left: 4px;
  color: #f56c6c;
  padding: 4px;
  font-size: 14px;
}

.subtodo-delete-btn:hover {
  color: #ff0000;
}

.time {
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-right: 8px;
}

.alarm {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.header-menu-icons {
  font-size: 1.2rem;
  border-radius: 6px;
  padding: 8px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-menu-icons:hover {
  color: #303133;
  background-color: #f4f4f4;
}

.header-menu-icons:active {
  background-color: #e9e9e9;
}

.dark-theme .header-menu-icons {
  color: #909399;
}

.dark-theme .header-menu-icons:hover {
  color: #ffffff;
  background-color: #303940;
}

.dark-theme .header-menu-icons:active {
  background-color: #354048;
}

/* 滚动条样式 */
.subtodo-list::-webkit-scrollbar {
  width: 6px;
}

.subtodo-list::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.subtodo-list::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

:deep(.el-dialog) {
  width: 480px !important;
  height: 600px !important;
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog__body) {
  flex: 1;
  padding: 0 !important;
  overflow: hidden;
}
</style>