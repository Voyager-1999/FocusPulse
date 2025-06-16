<template>
    <div class="User">
        <div class="information-container">
            <el-avatar 
                :size="64" 
                :src="userAvatar" 
                @click="handleAvatarClick"
            />
            <div class="user-info">
                <el-input
                    v-model="userName"
                    placeholder="请输入姓名"
                    class="name-input"
                    @blur="handleNameChange"
                />
            </div>
            <input
                type="file"
                ref="fileInput"
                style="display: none"
                accept="image/*"
                @change="handleFileChange"
            />
        </div>
        <button @click="showSettings = true" class="setting-btn">
            <div class="setting-btn-content">
                <div class="setting-btn-left">
                    <el-icon><Setting /></el-icon>
                    <span>设置</span>
                </div>
                <el-icon class="arrow-right"><ArrowRight /></el-icon>
            </div>
        </button>

        <!-- 设置对话框 -->
        <el-dialog 
            v-model="showSettings"
            title="设置"
            width="50%"
            :close-on-click-modal="false"
            class="dialog"
            :before-open="handleBeforeOpen"
            :before-close="handleBeforeClose"
        >
            <setting />
        </el-dialog>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { Setting, ArrowRight } from '@element-plus/icons-vue'
import setting from '../components/setting.vue';

const showSettings = ref(false)
const dialogAnimate = ref(false)
const userAvatar = ref('')
const userName = ref('')
const fileInput = ref(null)

const handleAvatarClick = () => {
    fileInput.value.click()
}

const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            userAvatar.value = e.target.result
            // 保存头像到本地存储
            localStorage.setItem('userAvatar', userAvatar.value)
        }
        reader.readAsDataURL(file)
    }
}

const handleNameChange = () => {
    // 保存用户名到本地存储
    localStorage.setItem('userName', userName.value)
    console.log('Name changed to:', userName.value)
}

const handleBeforeOpen = () => {
    dialogAnimate.value = true
}

const handleBeforeClose = (done) => {
    dialogAnimate.value = false
    setTimeout(done, 300)
}

onMounted(() => {
    // 从本地存储加载用户信息
    const savedAvatar = localStorage.getItem('userAvatar')
    const savedName = localStorage.getItem('userName')
    
    if (savedAvatar) {
        userAvatar.value = savedAvatar
    }
    if (savedName) {
        userName.value = savedName
    }
})
</script>


<style scoped>
/* 定义颜色变量 */
:root {
  --primary-color: #409EFF;
  --primary-light: #ECF5FF;
  --text-color: #333;
  --text-secondary: #666;
  --border-color: #ebeef5;
  --hover-color: #f5f7fa;
  --shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.User {
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.information-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.name-input {
  width: 200px;
}

.name-input :deep(.el-input__wrapper) {
  box-shadow: none;
  border: 1px solid var(--border-color);
}

.name-input :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
}

/* 优化设置按钮样式 */
.setting-btn {
    width: 100%;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: white;
    color: var(--text-color);
    font-size: 16px;
    transition: all 0.3s ease;
    box-shadow: var(--shadow);
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.setting-btn:hover {
    background-color: var(--primary-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.setting-btn:hover .arrow-right {
    transform: translateX(4px);
    color: var(--primary-color);
}

.setting-btn:hover .setting-btn-left .el-icon {
    transform: rotate(30deg);
}

.setting-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.setting-btn-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.setting-btn-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.setting-btn .el-icon {
    font-size: 20px;
    transition: all 0.3s ease;
}

.arrow-right {
    color: var(--text-secondary);
    transition: all 0.3s ease;
}

/* 优化对话框样式 */
.dialog {
  .el-dialog__wrapper {
    .el-dialog {
      /* 其他样式不变... */
      
      :deep(.el-dialog__header) {
        padding: 12px 20px; /* 减少标题栏上下内边距 */
      }
      
      :deep(.el-dialog__body) {
        padding: 16px 20px; /* 减少内容区上下内边距 */
      }
      
      /* 关键调整：减少标题与内容之间的边框间距 */
      :deep(.el-dialog__header + .el-dialog__body) {
        border-top: none; /* 移除默认边框 */
      }
    }
  }
}

/* 自定义对话框标题样式 */
:deep(.dialog .el-dialog__header) {
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: #f9fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

:deep(.dialog .el-dialog__headerbtn) {
  top: 16px;
  right: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--primary-color);
  }
}

:deep(.dialog .el-dialog__body) {
  padding: 20px;
}

:deep(.dialog .el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>