<template>
    <div class="User">
        <div class="information-container">
            用户头像&姓名展示
        </div>
        <button @click="showSettings = true" class="setting-btn">
            <el-icon><Setting /></el-icon>
                设置
        </button>

        <!-- 设置对话框 -->
        <el-dialog 
            v-model="showSettings"
            title="设置"
            width="50%"
            :close-on-click-modal="false"
            class="dialog"
        >
            <setting />
        </el-dialog>
    </div>
</template>


<script setup>
import { ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import setting from '../components/setting.vue';

const showSettings = ref(false)
</script>


<style scoped>
.User {
    padding: 20px;
}

.setting-btn {
    display: flex;
    align-items: center;
    gap: 8px;
}

.setting-btn .el-icon {
    margin-right: 4px;
}

/* 自定义对话框标题样式 */
:deep(.dialog .el-dialog__header) {
    margin: 0;
    padding: 10px;
    border-bottom: 1px solid #eee;
}

:deep(.dialog .el-dialog__title) {
    font-size: 16px;
    font-weight: 500;
    color: #333;
}

:deep(.dialog .el-dialog__headerbtn) {
    top: 15px;
    right: 15px;
}
</style>