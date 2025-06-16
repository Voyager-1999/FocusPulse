<template>
  <div class="todo-item-root" @click="onEdit">
    <!-- 左侧复选框 -->
    <el-checkbox
      :model-value="todo.checked"
      @change="onCheckedChange"
      @click.stop
      class="main-checkbox"
      :class="['color-' + (todo.sort?.color || 'default')]"
    />
    <!-- 右侧内容 -->
    <div class="todo-content">
      <div class="todo-text" :class="{ 'todo-done': todo.checked }">{{ todo.text }}</div>
      <div class="todo-desc" v-if="todo.desc" :class="{ 'todo-done': todo.checked }">{{ todo.desc }}</div>
      <div v-if="todo.time" class="todo-time">
        <i class="bi bi-alarm"></i>
        <span>{{ todo.time }}</span>
      </div>
      <div v-if="todo.subTodos && todo.subTodos.length" class="subtodo-toggle-row">
        <el-button link size="small" @click.stop="showSubTodos = !showSubTodos">
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
            @click.stop
            :style="{ '--el-checkbox-checked-bg-color': todo.sort?.color || '#409eff', '--el-checkbox-checked-border-color': todo.sort?.color || '#409eff' }"
          />
          <span :class="{ 'subtodo-done': sub.checked || todo.checked }">{{ sub.text }}</span>
        </div>
      </div>
    </div>
    <!-- 删除按钮 -->
    <el-button link class="delete-btn" @click.stop="onDelete">
      <el-icon><Delete /></el-icon>
    </el-button>
  </div>

  <!-- 编辑对话框 -->
  <el-dialog
    v-model="showEditDialog"
    :show-close="false"
    width="auto"
    align-center
    destroy-on-close
  >
    <editTodo
      :todo="todo"
      @saved="onEditSaved"
    />
  </el-dialog>
</template>


<script setup>
    import { ref, computed } from 'vue'
    import { useTodoListStore } from '../store/todoList.store'
    import { Delete, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
    import editTodo from './editTodo.vue'
    const { todo } = defineProps(['todo'])

    const TodoListStore = useTodoListStore()
    const showSubTodos = ref(true)
    const showEditDialog = ref(false)
    const mainColor = computed(() => todo.sort?.color || '#409eff')
    

    // 点击编辑
    const onEdit = () => {
      showEditDialog.value = true
    }

    // 编辑保存后
    const onEditSaved = () => {
      showEditDialog.value = false
    }

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
      await TodoListStore.removeTodo(todo.listId, todo.id)
    }
</script>


<style scoped>
.todo-item-root {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin: 0 -10px;
  padding: 12px 10px;
  border: 1px solid transparent;
}

.todo-item-root:hover {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  transform: translateY(-1px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.main-checkbox {
  margin-top: 4px;
}

.todo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-text {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  word-break: break-all;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.todo-desc {
  font-size: 13px;
  color: #606266;
  margin-top: 2px;
  word-break: break-all;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.todo-done {
  text-decoration: line-through;
  color: #c0c4cc !important;
}

.todo-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  padding: 2px 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  width: fit-content;
}

.todo-time i {
  font-size: 12px;
}

.todo-done + .todo-time {
  color: #c0c4cc;
  background-color: #f5f7fa;
}

.subtodo-toggle-row {
  margin-top: 6px;
}

.subtodo-list {
  margin-top: 6px;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 2px solid #e4e7ed;
}

.subtodo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.subtodo-item:hover {
  background-color: #f5f7fa;
}

.subtodo-done {
  text-decoration: line-through;
  color: #c0c4cc;
}

.delete-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  color: #909399;
  opacity: 0;
  transition: all 0.3s ease;
}

.todo-item-root:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #f56c6c;
  transform: scale(1.1);
}

/* 选中时 */
:deep(.main-checkbox.is-checked .el-checkbox__inner) {
  border-color: v-bind(mainColor) !important;
  background-color: v-bind(mainColor) !important;
  box-shadow: 0 0 0 2px rgba(v-bind(mainColor), 0.1);
}

/* 未选中时 */
:deep(.main-checkbox .el-checkbox__inner) {
  border-color: v-bind(mainColor) !important;
  transition: all 0.3s ease;
}

:deep(.main-checkbox:hover .el-checkbox__inner) {
  box-shadow: 0 0 0 2px rgba(v-bind(mainColor), 0.1);
}
</style>