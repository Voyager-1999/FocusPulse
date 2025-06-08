<template>
  <div class="notes-container">
    <div class="notes-header">
      <h2><el-icon><Notebook /></el-icon> 我的便签</h2>
      <div class="header-actions">
        <el-button type="primary" @click="addNewNote" round>
          <el-icon><Plus /></el-icon>新建便签
        </el-button>
        <el-dropdown @command="handleTagFilter">
          <el-button>
            <el-icon><Filter /></el-icon>筛选
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">全部便签</el-dropdown-item>
              <el-dropdown-item 
                v-for="tag in uniqueTags" 
                :key="tag" 
                :command="tag"
              >
                <el-tag :color="getTagColor(tag)" effect="dark">{{ tag }}</el-tag>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <div 
      class="notes-grid"
      v-if="filteredNotes.length > 0"
    >
      <draggable 
        v-model="filteredNotes" 
        item-key="id"
        @end="saveNotes"
        class="drag-container"
      >
        <template #item="{ element: note, index }">
          <div 
            class="note-card"
            :style="{ 
              backgroundColor: note.color || '#fff',
              borderLeft: `4px solid ${getTagColor(note.tag)}`
            }"
          >
            <div class="note-header">
              <el-input 
                v-model="note.title" 
                placeholder="标题" 
                class="note-title"
                @blur="saveNotes"
              />
              <div class="note-actions">
                <el-popover
                  placement="bottom"
                  :width="200"
                  trigger="click"
                >
                  <template #reference>
                    <el-button text>
                      <el-icon><Brush /></el-icon>
                    </el-button>
                  </template>
                  <div class="color-palette">
                    <div 
                      v-for="color in colorPalette"
                      :key="color"
                      class="color-option"
                      :style="{ backgroundColor: color }"
                      @click="changeColor(index, color)"
                    />
                  </div>
                </el-popover>
                
                <el-dropdown @command="(cmd) => handleTagCommand(cmd, index)">
                  <el-button text>
                    <el-icon><PriceTag /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item 
                        v-for="tag in availableTags"
                        :key="tag"
                        :command="tag"
                      >
                        <el-tag :color="getTagColor(tag)" effect="dark">{{ tag }}</el-tag>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                
                <el-button text @click="removeNote(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            
            <el-input
              v-model="note.content"
              type="textarea"
              :rows="4"
              placeholder="写下你的想法..."
              resize="none"
              class="note-content"
              @blur="saveNotes"
            />
            
            <div class="note-footer">
              <el-tag 
                v-if="note.tag"
                :color="getTagColor(note.tag)"
                effect="plain"
                size="small"
              >
                {{ note.tag }}
              </el-tag>
              <span class="note-date">{{ formatDate(note.createdAt) }}</span>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    
    <div v-else class="empty-state">
      <el-empty description="暂无便签">
        <el-button type="primary" @click="addNewNote">创建第一个便签</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Delete, Brush, Notebook, Filter, PriceTag } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'

// 便签数据
const notes = ref([])
const activeFilter = ref('all')

// 颜色和标签配置
const colorPalette = [
  '#f0f9ff', '#e6f7ff', '#f6ffed', '#fff2e8', 
  '#fff0f6', '#f9f0ff', '#f0f5ff', '#f0fff3'
]

const availableTags = ['工作', '学习', '生活', '灵感', '重要']
const tagColors = {
  '工作': '#3498db',
  '学习': '#2ecc71',
  '生活': '#e74c3c',
  '灵感': '#9b59b6',
  '重要': '#f39c12'
}

// 计算属性
const filteredNotes = computed(() => {
  if (activeFilter.value === 'all') return notes.value
  return notes.value.filter(note => note.tag === activeFilter.value)
})

const uniqueTags = computed(() => {
  const tags = new Set(notes.value.map(note => note.tag).filter(Boolean))
  return Array.from(tags)
})

// 方法
const initNotes = () => {
  const savedNotes = localStorage.getItem('focusPulse-notes')
  if (savedNotes) {
    notes.value = JSON.parse(savedNotes)
  } else {
    notes.value = [createNewNote()]
  }
}

const createNewNote = () => {
  return {
    id: Date.now(),
    title: '',
    content: '',
    color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
    tag: '',
    createdAt: new Date()
  }
}

const addNewNote = () => {
  notes.value.unshift(createNewNote())
  saveNotes()
}

const removeNote = (index) => {
  notes.value.splice(index, 1)
  saveNotes()
  ElMessage.success('便签已删除')
}

const changeColor = (index, color) => {
  notes.value[index].color = color
  saveNotes()
}

const handleTagCommand = (tag, index) => {
  notes.value[index].tag = tag
  saveNotes()
}

const handleTagFilter = (tag) => {
  activeFilter.value = tag
}

const saveNotes = () => {
  localStorage.setItem('focusPulse-notes', JSON.stringify(notes.value))
}

const getTagColor = (tag) => {
  return tagColors[tag] || '#ddd'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  initNotes()
})
</script>

<style scoped>
.notes-container {
  padding: 20px;
  height: calc(100vh - 40px);
  overflow-y: auto;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.notes-header h2 {
  margin: 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 5px;
}

.drag-container {
  display: contents;
}

.note-card {
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 280px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: grab;
  position: relative;
  overflow: hidden;
}

.note-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.note-card:active {
  cursor: grabbing;
}

.note-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.note-title {
  flex: 1;
  margin-right: 10px;
}

.note-title :deep(.el-input__wrapper) {
  box-shadow: none;
  background: transparent;
  padding-left: 0;
  font-weight: 600;
  font-size: 16px;
}

.note-actions {
  display: flex;
  gap: 2px;
}

.note-content {
  flex: 1;
  margin-bottom: 12px;
}

.note-content :deep(.el-textarea__inner) {
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 0;
  resize: none;
  height: 100%;
  font-size: 14px;
  line-height: 1.6;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.note-date {
  font-size: 12px;
  color: #7f8c8d;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 8px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid #eee;
}

.color-option:hover {
  transform: scale(1.1);
}

/* 动画效果 */
.note-card {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
  
  .notes-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>