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
        </div>
    </div>
</template>


<script setup>
import { useConfigStore } from '../store/config.store';

const configStore = useConfigStore()
const { config } = configStore

const spanOptions = [
    {
        label: '3天',
        value: 3,
    },
    {
        label: '5天',
        value: 5,
    },
    {
        label: '7天',
        value: 7,
    },
    {
        label: '10天',
        value: 10,
    },
    {
        label: '15天',
        value: 15,
    },
    {
        label: '30天',
        value: 30,
    },
]

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