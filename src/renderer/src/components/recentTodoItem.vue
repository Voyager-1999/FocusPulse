<template>
    <div class="recentTodoItem">
        <button @click="changeShow" class="header" :class="typeClass">
            <div class="icon-container">
                <el-icon v-if="!showTodoItem"><ArrowRight /></el-icon>
                <el-icon v-else><ArrowDown /></el-icon>
            </div>
            <div class="text-container">
                {{ displayText }} <span class="count">({{ todos.length }})</span>
            </div>
        </button>
        <div v-if="showTodoItem" class="todo-list">
            <div class="separator"></div>
            <div v-for="todo in todos" :key="todo.id" class="todo-item">
                <todoItem :todo="todo"/>
            </div>
        </div>
    </div>
</template>


<script setup>
import { computed, ref, onMounted } from 'vue'
import todoItem from './todoItem.vue'
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import moment from 'moment'
import 'moment/dist/locale/zh-cn'

// 设置 moment 语言为中文
moment.locale('zh-cn')

const props = defineProps({
    type: {
        type: String,
        required: true
    },
    todos: {
        type: Array,
        required: true,
        default: () => []
    }
})

const type2text = {
    expiredAndCompleted: '过往已完成（7天内）',
    expiredAndNotCompleted: '过往未完成（7天内）',
    today: '今天',
    tomorrow: '明天',
    theDayAfterTomorrow: '后天',
    follow: '后续日程（7天内）',
}

// 计算显示文本，为今天、明天和后天添加星期几
const displayText = computed(() => {
    const baseText = type2text[props.type] || props.type
    
    if (props.type === 'today') {
        return `${baseText} (${moment().format('dddd')})`
    } else if (props.type === 'tomorrow') {
        return `${baseText} (${moment().add(1, 'day').format('dddd')})`
    } else if (props.type === 'theDayAfterTomorrow') {
        return `${baseText} (${moment().add(2, 'days').format('dddd')})`
    }
    
    return baseText
})

// 根据类型计算样式类
const typeClass = computed(() => {
    switch (props.type) {
        case 'expiredAndCompleted':
            return 'expired-completed'
        case 'expiredAndNotCompleted':
            return 'expired-not-completed'
        default:
            return 'normal'
    }
})

let showTodoItem = ref(true)

function changeShow(){
    showTodoItem.value = !showTodoItem.value
}

</script>


<style scoped>
.recentTodoItem {
    margin-bottom: 16px;
}

.header {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    border-radius: 8px 8px 0 0;
    transition: background-color 0.2s ease;
}

.header:hover {
    background: #f5f7fa;
}

.header:hover + .todo-list .separator {
    background-color: transparent;
}

.header.expired-completed {
    color: #909399;
}

.header.expired-not-completed {
    color: #f56c6c;
}

.header.normal {
    color: #303133;
}

.icon-container {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.text-container {
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.count {
    color: #909399;
    font-size: 14px;
}

.todo-list {
    padding: 0 12px;
}

.separator {
    height: 1px;
    background-color: #EBEEF5;
    margin: 0;
}

.todo-item {
    padding-left: 32px;
    margin-top: 12px;
    margin-bottom: 8px;
}

.todo-item:first-child {
    margin-top: 12px;
}
</style>