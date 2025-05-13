<template>
  <div class="todo-item-root">
    <!-- 左侧复选框 -->
    <el-checkbox
      :model-value="todo.checked"
      @change="onCheckedChange"
      class="main-checkbox"
      :class="['color-' + (todo.sort?.color || 'default')]"
    />
    <!-- 右侧内容 -->
    <div class="todo-content">
      <div class="todo-text" :class="{ 'todo-done': todo.checked }">{{ todo.text }}</div>
      <div class="todo-desc" v-if="todo.desc" :class="{ 'todo-done': todo.checked }">{{ todo.desc }}</div>
      <div v-if="todo.subTodos && todo.subTodos.length" class="subtodo-toggle-row">
        <el-button link size="small" @click="showSubTodos = !showSubTodos">
          <el-icon v-if="!showSubTodos"><ArrowDown /></el-icon>
          <el-icon v-else><ArrowUp /></el-icon>
          <span>{{ showSubTodos ? '收起子任务' : '展开子任务' }}</span>
        </el-button>
      </div>
      <div v-if="showSubTodos && todo.subTodos && todo.subTodos.length" class="subtodo-list">
        <div v-for="(sub, idx) in todo.subTodos" :key="idx" class="subtodo-item">
          <el-checkbox
            :model-value="sub.checked"
            @change="checked => onSubCheckedChange(idx, checked)"
            :style="{ '--el-checkbox-checked-bg-color': todo.sort?.color || '#409eff', '--el-checkbox-checked-border-color': todo.sort?.color || '#409eff' }"
          />
          <span :class="{ 'subtodo-done': sub.checked || todo.checked }">{{ sub.text }}</span>
        </div>
      </div>
    </div>
    <!-- 删除按钮 -->
    <el-button link class="delete-btn" @click="onDelete">
      <el-icon><Delete /></el-icon>
    </el-button>
  </div>
</template>


<script setup>
    import { ref, computed } from 'vue'
    import { useTodoListStore } from '../store/todoList.store'
    import { Delete, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
    const { todo } = defineProps(['todo'])

    const TodoListStore = useTodoListStore()
    const showSubTodos = ref(true)
    const mainColor = computed(() => todo.sort?.color || '#409eff')

    // 复选框切换待办完成状态
    const onCheckedChange = async (val) => {
      let newTodo = { ...todo, checked: val }
      if (val && Array.isArray(todo.subTodos) && todo.subTodos.length > 0) {
        newTodo.subTodos = todo.subTodos.map(sub => ({ ...sub, checked: true }))
      }
      await TodoListStore.updateTodo(todo, newTodo)
    }

    // 子任务切换
    const onSubCheckedChange = async (idx, checked) => {
      const newSubTodos = todo.subTodos.map((sub, i) => i === idx ? { ...sub, checked } : sub)
      // 如果所有子任务都完成，主任务也完成
      const allDone = newSubTodos.length > 0 && newSubTodos.every(sub => sub.checked)
      const newTodo = { ...todo, subTodos: newSubTodos, checked: allDone ? true : todo.checked }
      await TodoListStore.updateTodo(todo, newTodo)
    }

    // 删除
    const onDelete = async () => {
      await TodoListStore.removeTodo(todo.startDate, todo.id)
    }
</script>


<style scoped>
.todo-item-root {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  position: relative;
}

.main-checkbox {
  margin-top: 4px;
}

.todo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.todo-text {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  word-break: break-all;
}

.todo-desc {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
  word-break: break-all;
}

.todo-done {
  text-decoration: line-through;
  color: #bfbfbf !important;
}

.subtodo-toggle-row {
  margin-top: 4px;
}

.subtodo-list {
  margin-top: 4px;
  padding-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.subtodo-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.subtodo-done {
  text-decoration: line-through;
  color: #bfbfbf;
}

.delete-btn {
  position: absolute;
  right: 0;
  top: 6px;
  color: #f56c6c;
}

.delete-btn:hover {
  color: #ff0000;
}

/* 选中时 */
:deep(.main-checkbox.is-checked .el-checkbox__inner) {
  border-color: v-bind(mainColor) !important;
  background-color: v-bind(mainColor) !important;
}

/* 未选中时 */
:deep(.main-checkbox .el-checkbox__inner) {
  border-color: v-bind(mainColor) !important;
}
</style>