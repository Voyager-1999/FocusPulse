<template>
    <div class="addSort">
        <!-- 顶部标题和关闭按钮 -->
        <div class="header">
            <h3>新建分类</h3>
            <el-button circle @click="$emit('close')" class="close-btn">
                <el-icon><Close /></el-icon>
            </el-button>
        </div>

        <!-- 中间输入区域 -->
        <div class="input-section">
            <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
            <el-input 
                v-model="sortName" 
                placeholder="请输入分类名称"
                maxlength="10"
                show-word-limit
                class="sort-input"
            />
        </div>

        <!-- 底部颜色选择区域 -->
        <div class="color-section">
            <div class="color-grid">
                <div 
                    v-for="color in sortsStore.sorts_colors" 
                    :key="color"
                    class="color-item"
                    :style="{ backgroundColor: color }"
                    :class="{ 'selected': color === selectedColor }"
                    @click="selectColor(color)"
                ></div>
                <div 
                    class="color-item add-color"
                    @click="showColorPicker = true"
                >
                    <el-icon><Plus /></el-icon>
                </div>
            </div>
        </div>

        <!-- 创建按钮 -->
        <div class="footer">
            <el-button 
                type="primary" 
                class="create-btn"
                @click="createSort"
            >
                创建
            </el-button>
        </div>

        <!-- 颜色选择器对话框 -->
        <el-dialog
            v-model="showColorPicker"
            title="选择颜色"
            width="300px"
            :show-close="false"
            :close-on-click-modal="false"
            class="color-picker-dialog"
        >
            <el-color-picker
                v-model="newColor"
                show-alpha
                @change="handleColorChange"
            />
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showColorPicker = false">取消</el-button>
                    <el-button type="primary" @click="addNewColor">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSortsStore } from '../store/sorts.store'
import { Close, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['close'])
const sortsStore = useSortsStore()

const sortName = ref('')
const selectedColor = ref(sortsStore.sorts_colors[0] || '#f94144')
const showColorPicker = ref(false)
const newColor = ref('')

// 选择颜色
const selectColor = (color) => {
    selectedColor.value = color
}

// 处理新颜色选择
const handleColorChange = (color) => {
    newColor.value = color
}

// 添加新颜色
const addNewColor = () => {
    if (newColor.value) {
        sortsStore.addColor(newColor.value)
        selectedColor.value = newColor.value
        showColorPicker.value = false
        ElMessage.success('颜色添加成功')
    }
}

// 创建新分类
const createSort = () => {
    if (!sortName.value) {
        ElMessage.warning('请输入分类名称')
        return
    }
    sortsStore.addSort(sortName.value, selectedColor.value)
    ElMessage.success('分类创建成功')
    emit('close')
}
</script>

<style scoped>
.addSort {
    width: 250px;
    height: 300px;
    display: flex;
    flex-direction: column;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.header h3 {
    margin: 0;
    font-size: 16px;
    color: #303133;
    font-weight: 600;
}

.close-btn {
    padding: 4px;
    border: none;
    background: transparent;
}

.close-btn:hover {
    background-color: #f5f7fa;
}

.input-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.color-preview {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #dcdfe6;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.color-preview:hover {
    transform: scale(1.1);
}

.sort-input {
    flex: 1;
}

.color-section {
    flex: 1;
    overflow: hidden;
    margin-bottom: 16px;
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    padding: 8px 0;
    max-height: 120px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #dcdfe6 #f5f7fa;
}

.color-grid::-webkit-scrollbar {
    width: 6px;
}

.color-grid::-webkit-scrollbar-track {
    background: #f5f7fa;
    border-radius: 3px;
}

.color-grid::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 3px;
}

.color-item {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #dcdfe6;
    transition: all 0.3s ease;
}

.color-item:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-item.selected {
    border: 2px solid #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.add-color {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    color: #909399;
}

.add-color:hover {
    background-color: #e4e7ed;
    color: #606266;
}

.footer {
    display: flex;
    justify-content: center;
    margin-top: auto;
}

.create-btn {
    width: 100%;
    border-radius: 20px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.create-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.color-picker-dialog :deep(.el-dialog__body) {
    padding: 20px;
    display: flex;
    justify-content: center;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
}
</style>