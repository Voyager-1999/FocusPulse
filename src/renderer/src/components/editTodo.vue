<template>
  <div class="edit-todo-root">
    <!-- 1. 类别选择 -->
    <div class="todo-sort-row">
      <div class="sort-ellipse" :style="{ background: selectedSort.color || '#dcdfe6', color: selectedSort.color ? '#fff' : '#606266' }">
        {{ selectedSort.name || '未分类' }}
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
    </div>
    <!-- 2. text输入框 -->
    <el-input v-model="todoData.text" placeholder="输入待办内容" class="todo-text-input" />
    <!-- 3. desc输入框 -->
    <el-input v-model="todoData.desc" placeholder="添加描述" class="todo-desc-input" />
    <!-- 4. 日期选择 -->
    <div class="date-row">
      <el-button :type="isToday ? 'primary' : 'default'" @click="setToday">今天</el-button>
      <el-button :type="isTomorrow ? 'primary' : 'default'" @click="setTomorrow">明天</el-button>
      <el-date-picker
        v-model="datePickerValue"
        type="date"
        placeholder="选择日期"
        format="YYYY-MM-DD"
        value-format="YYYYMMDD"
        @change="onDateChange"
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
    <el-input v-model="subInput" placeholder="添加子任务" @keyup.enter="addSubTodo" class="subtodo-input" />
    <!-- 6. 重复类型按钮（预留） -->
    <div class="repeat-row">
      <!-- 预留 -->
    </div>
    <!-- 7. 保存按钮 -->
    <el-button type="primary" class="save-btn" @click="saveTodo">保存</el-button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTodoListStore } from '../store/todoList.store'
import { useSortsStore } from '../store/sorts.store'
import addSort from './addSort.vue'
import { ArrowDown, Plus, Delete } from '@element-plus/icons-vue'
import moment from 'moment'

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
  startDate: moment().format('YYYYMMDD'),
  dueDate: '',
  checked: false,
  subTodos: [],
  repeat: null,
  sort: null
})

const selectedSort = computed(() => todoData.value.sort || { name: '未分类', color: '' })
const datePickerValue = ref(todoData.value.startDate)

const isToday = computed(() => todoData.value.startDate === moment().format('YYYYMMDD'))
const isTomorrow = computed(() => todoData.value.startDate === moment().add(1, 'day').format('YYYYMMDD'))

onMounted(() => {
  if (props.todo) {
    todoData.value = JSON.parse(JSON.stringify(props.todo))
    datePickerValue.value = todoData.value.startDate
  } else if (props.initialText) {
    todoData.value.text = props.initialText
  }
})

function selectSort(sort) {
  todoData.value.sort = sort
  showSortPopover.value = false
}
function setToday() {
  todoData.value.startDate = moment().format('YYYYMMDD')
  datePickerValue.value = todoData.value.startDate
}
function setTomorrow() {
  todoData.value.startDate = moment().add(1, 'day').format('YYYYMMDD')
  datePickerValue.value = todoData.value.startDate
}
function onDateChange(val) {
  todoData.value.startDate = val
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
async function saveTodo() {
  if (!todoData.value.text) return
  console.log(todoData.value)
  if (props.todo) {
    await TodoListStore.updateTodo(props.todo, todoData.value)
  } else {
    await TodoListStore.addTodo(todoData.value)
  }
  emit('saved', todoData.value)
}

watch(
  () => props.initialText,
  (val) => {
    if (!props.todo && val !== undefined) {
      todoData.value = {
        text: val,
        desc: '',
        startDate: moment().format('YYYYMMDD'),
        dueDate: '',
        checked: false,
        subTodos: [],
        repeat: null,
        sort: null
      }
    }
  }
)
</script>

<style scoped>
.edit-todo-root {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 20px;
  width: 340px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.todo-sort-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sort-ellipse {
  min-width: 60px;
  padding: 4px 16px;
  border-radius: 16px/50%;
  background: #dcdfe6;
  color: #606266;
  font-size: 14px;
  text-align: center;
}
.sort-pop-btn {
  background: #f5f7fa;
}
.sort-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
}
.sort-item {
  width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  text-align: left !important;
  justify-content: flex-start !important;
  border-radius: 8px !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  height: 40px !important;
  line-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  outline: none !important;
  box-shadow: none !important;
  border-width: 1px !important;
  font-size: 16px !important;
  font-family: inherit !important;
  background: #fff !important;
  border-color: #dcdfe6 !important;
}
.sort-item .el-button__text {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 16px !important;
  font-family: inherit !important;
}
.add-sort-btn {
  color: #409eff;
  border: 1px dashed #409eff;
}
.todo-text-input {
  font-size: 16px;
}
.todo-desc-input {
  font-size: 14px;
}
.date-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.date-picker {
  width: 120px;
}
.subtodo-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 4px;
}
.subtodo-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.subtodo-done {
  text-decoration: line-through;
  color: #bfbfbf;
}
.subtodo-input {
  font-size: 14px;
}
.save-btn {
  width: 100%;
  margin-top: 8px;
}
.subtodo-delete-btn {
  margin-left: 8px;
  color: #f56c6c;
  padding: 0 4px;
}
.subtodo-delete-btn:hover {
  color: #ff0000;
}
</style>