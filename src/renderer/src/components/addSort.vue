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
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
}

.header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
}

.header h3 {
    margin: 0 auto;
    font-size: 20px;
    color: #303133;
    font-weight: 700;
    letter-spacing: 1px;
}

.close-btn {
    position: absolute;
    right: 0;
    top: 0;
    padding: 6px;
    border: none;
    background: transparent;
    transition: background 0.2s, color 0.2s;
}

.close-btn:hover {
    background-color: #f5f7fa;
    color: #409eff;
}

.input-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    justify-content: center;
}

.color-preview {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #dcdfe6;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(.4,2,.6,1);
}

.color-preview:hover {
    transform: scale(1.12) rotate(-4deg);
    box-shadow: 0 4px 16px rgba(64,158,255,0.15);
}

.sort-input {
    flex: 1;
    height: 40px;
    border-radius: 20px;
    font-size: 15px;
    padding: 0 16px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

.color-section {
    flex: 1;
    overflow: hidden;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    padding: 16px 16px;
    height: 100%;
    min-height: 0;
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
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #dcdfe6;
    transition: all 0.3s cubic-bezier(.4,2,.6,1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.color-item:hover {
    transform: scale(1.13);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.13);
}

.color-item.selected {
    border: 3px solid #409eff;
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.18);
    transform: scale(1.18);
}

.color-item .el-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60%;
    height: 60%;
    font-size: 1.5em;
    margin: auto;
}

.add-color {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    color: #409eff;
    border: 2px dashed #b3d8ff;
    font-size: 18px;
    transition: background 0.2s, color 0.2s, border 0.2s, transform 0.2s;
}

.add-color:hover {
    background-color: #e4f1ff;
    color: #1976d2;
    border: 2px solid #409eff;
    transform: scale(1.08);
}

.footer {
    display: flex;
    justify-content: center;
    margin-top: auto;
}

.create-btn {
    width: 90%;
    border-radius: 22px;
    font-weight: 600;
    font-size: 16px;
    height: 42px;
    letter-spacing: 1px;
    background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.10);
    transition: box-shadow 0.2s, transform 0.2s;
}

.create-btn:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.18);
    background: linear-gradient(90deg, #66b1ff 0%, #409eff 100%);
}

.color-picker-dialog :deep(.el-dialog__body) {
    padding: 20px;
    display: flex;
    justify-content: center;
}

.color-picker-dialog :deep(.el-dialog) {
    border-radius: 18px !important;
}

.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
}
</style>