<template>
    <div class="setting">
        <div class="header">
        </div>
        <div class="todo-setting">
            <h2 class="title">待办事件设置</h2>
            <div>
                <span>显示已完成待办：    </span>
                <el-switch
                    v-model="config.showChecked"
                    size="small"
                    @change="configStore.updateConfig('showChecked', config.showChecked)"
                ></el-switch>
            </div>
            <div>
                <span>过往已完成的显示范围：</span>
                <el-select v-model="config.expiredAndCompletedSpan" 
                            style="width: 100px" size="small" 
                            @change="configStore.updateConfig('expiredAndCompletedSpan', config.expiredAndCompletedSpan)">
                    <el-option
                        v-for="item in spanOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        size="small"
                    />
                </el-select>
            </div>
            <div>
                <span>过往未完成的显示范围：</span>
                <el-select v-model="config.expiredAndNotCompletedSpan" 
                            style="width: 100px" size="small" 
                            @change="configStore.updateConfig('expiredAndNotCompletedSpan', config.expiredAndNotCompletedSpan)">
                    <el-option
                        v-for="item in spanOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        size="small"
                    />
                </el-select>
            </div>
            <div>
                <span>后续日程的显示范围：</span>
                <el-select v-model="config.followSpan" 
                            style="width: 100px" size="small" 
                            @change="configStore.updateConfig('followSpan', config.followSpan)">
                    <el-option
                        v-for="item in spanOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        size="small"
                    />
                </el-select>
            </div>
            <div>
                <span>自动移动旧任务：</span>
                <el-switch
                    v-model="config.moveOldTodos"
                    size="small"
                    @change="configStore.updateConfig('moveOldTodos', config.moveOldTodos)"
                ></el-switch>
            </div>
            <div>
                <span>在启动时通知：</span>
                <el-switch
                    v-model="config.notificationOnStartup"
                    size="small"
                    @change="configStore.updateConfig('notificationOnStartup', config.notificationOnStartup)"
                ></el-switch>
            </div>
            <div>
                <span>通知声音：</span>
                <el-select v-model="config.notificationSound" 
                            style="width: 100px" size="small" 
                            @change="onSoundsChange">
                    <el-option
                        v-for="item in soundsOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        size="small"
                    />
                </el-select>
            </div>
        </div>
    </div>
</template>


<script setup>
import { useConfigStore } from '../store/config.store';
import notifications from '../utils/notifications';
import dayjs from 'dayjs';

const configStore = useConfigStore()
const { config } = configStore

const spanOptions = [
    { label: '3天', value: 3 },
    { label: '5天', value: 5 },
    { label: '7天', value: 7 },
    { label: '10天', value: 10 },
    { label: '15天', value: 15 },
    { label: '30天', value: 30 },
]

const soundsOptions = [
    { label: 'None', value: 'none' },
    { label: 'Pop', value: 'pop' },
    { label: 'Bell', value: 'bell' },
    { label: 'Soft Bell', value: 'soft-bell' },
    { label: 'Soft', value: 'soft' },
    { label: 'Tiny', value: 'tiny' },
    { label: 'Piano', value: 'piano' },
    { label: 'Positive', value: 'positive' },
    { label: 'Metal', value: 'metal' },
]

function onSoundsChange(){
    configStore.updateConfig('notificationSound', config.notificationSound) // 更新配置
    notifications.refreshDayNotifications(dayjs().format('YYYYMMDD')) // 刷新今天的通知
}
</script>


<style scoped>
.setting {
    padding: 10px;
}

.header {
    margin-bottom: 20px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
}

.back-btn .el-icon {
    margin-right: 4px;
}

.title {
    font-size: medium;
    color: #84a98c;
    margin: 5px;
}

.todo-setting {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.todo-setting > div {
    display: flex;
    align-items: center;
    gap: 12px;
}
</style>