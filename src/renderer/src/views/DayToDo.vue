<template>
    <div class="DayToDo">
        <div class="header">
            <div class="header-top">
                <div class="date-container">
                    <datePicker
                        v-model="selectedDate"
                        type="date"
                        placeholder="选择日期"
                        format="YYYY-MM-DD"
                        value-format="YYYYMMDD"
                        :teleported="false"
                        :popper-class="'day-todo-picker'"
                    />
                    <div class="city-weather-icon-container">
                        <span class="city-text">{{ route.query.city }}</span>
                        <span class="weather-text">{{ route.query.weather }}</span>
                        <el-icon class="weather-icon">
                            <component :is="getWeatherIcon(route.query.weather)" />
                        </el-icon>

                    </div>
                </div>
                <div class="sort-container">
                    <el-popover
                        ref="sortPopoverRef"
                        placement="bottom-start"
                        :width="200"
                        trigger="click"
                        popper-class="sort-popover"
                    >
                        <template #reference>
                            <el-button 
                                class="sort-select-btn"
                                :style="{ color: selectedSort ? selectedSort.color : '#606266' }"
                            >
                                {{ selectedSort ? selectedSort.name : '选择分类' }}
                                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                            </el-button>
                        </template>
                        
                        <div class="sort-list">
                            <el-button
                                v-for="sort in sortsStore.sorts"
                                :key="sort.name"
                                class="sort-item"
                                :style="{ color: sort.color }"
                                @click="selectSort(sort)"
                            >
                                {{ sort.name }}
                            </el-button>
                            <el-button
                                class="add-sort-btn"
                                @click="showAddSort = true"
                            >
                                <el-icon><Plus /></el-icon>
                                新建分类
                            </el-button>
                        </div>
                    </el-popover>

                    <!-- 新建分类组件 -->
                    <el-dialog
                        v-model="showAddSort"
                        :show-close="false"
                        :close-on-click-modal="false"
                        width="auto"
                        class="add-sort-dialog"
                        :modal-class="'add-sort-modal'"
                        align-center
                    >
                        <addSort @close="showAddSort = false" />
                    </el-dialog>
                </div>
            </div>
            <div class="header-bottom">
              <el-input
                v-model="quickInput"
                placeholder="在此添加内容，按回车新建事件"
                @keyup.enter="onQuickInputEnter"
                class="quick-input"
              />
              <el-dialog v-model="showQuickEdit" :show-close="false" width="auto" align-center>
                <editTodo :initialText="quickInput" @saved="onQuickEditSaved" />
              </el-dialog>
            </div>
        </div>
        <div class="todo-list">
            <div v-if="currentDayTodos.length === 0" class="empty-tip">
                今天还没有待办事项
            </div>
            <div v-else>
                <div v-for="todo in uncompletedTodos" :key="todo.id" class="todo-item">
                    <todoItem :todo="todo" :selectedDate="selectedDate"/>
                </div>
                <div v-if="showChecked">
                    <div v-for="todo in completedTodos" :key="todo.id" class="todo-item">
                        <todoItem :todo="todo"/>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>


<script setup>
    import { useTodoListStore } from '../store/ToDoList.store'
    import { useSortsStore } from '../store/sorts.store'
    import { useConfigStore } from '../store/config.store'
    import { ref, computed, onMounted } from 'vue'
    import todoItem from '../components/todoItem.vue'
    import addSort from '../components/addSort.vue'
    import datePicker from '../components/datePicker.vue'
    import { 
        ArrowDown, 
        Plus, 
        Sunny,
        Cloudy,
        MostlyCloudy,
        PartlyCloudy,
        Drizzling,
        Pouring
    } from '@element-plus/icons-vue'
    import moment from 'moment'
    import editTodo from '../components/editTodo.vue'
    import { useRoute } from 'vue-router'


    const TodoListStore = useTodoListStore()
    const sortsStore = useSortsStore()
    const configStore = useConfigStore()

    const route = useRoute()

    const selectedDate = ref(moment().format('YYYYMMDD'))
    const selectedSort = ref(null)
    const showAddSort = ref(false)
    const sortPopoverRef = ref(null)
    const quickInput = ref('')
    const showQuickEdit = ref(false)

    let showChecked = computed(() => {
        return configStore.config.showChecked
    })
    // 选择分类
    const selectSort = (sort) => {
        selectedSort.value = sort
        if (sortPopoverRef.value) sortPopoverRef.value.hide()
    }

    const currentDayTodos = computed(() => {
        return TodoListStore.todoList[selectedDate.value] || []
    })

    const completedTodos = computed(() => {
        if (selectedSort.value) {
            return currentDayTodos.value.filter(todo => todo.checked && todo.sort.name === selectedSort.value.name)
        } else {
            return currentDayTodos.value.filter(todo => todo.checked)
        }
    })

    const uncompletedTodos = computed(() => {
        if (selectedSort.value) {
            return currentDayTodos.value.filter(todo => !todo.checked && todo.sort.name === selectedSort.value.name)
        } else {
            return currentDayTodos.value.filter(todo => !todo.checked)
        }
    })

    function onQuickInputEnter() {
        if (quickInput.value.trim()) {
            showQuickEdit.value = true
        }
    }

    function onQuickEditSaved() {
        showQuickEdit.value = false
        quickInput.value = ''
    }

    // 根据天气文本返回对应的图标组件
    function getWeatherIcon(weather) {
        if (!weather) return Sunny
        
        const weatherMap = {
            '晴': Sunny,
            '多云': MostlyCloudy,
            '少云': PartlyCloudy,
            '毛毛雨/细雨': Drizzling,
            '小雨': Drizzling,
            '中雨': Drizzling,
            '大雨': Pouring,
            '暴雨': Pouring,
            '大暴雨': Pouring,
            '阴': Cloudy
        }
        
        // 遍历天气映射表，查找包含关键字的天气
        for (const [key, icon] of Object.entries(weatherMap)) {
            if (weather.includes(key)) {
                return icon
            }
        }
        
        return Sunny // 默认返回晴天图标
    }
</script>


<style scoped>
.DayToDo {
    padding: 10px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 40px); /* Subtract padding and any other spacing */
    box-sizing: border-box;
}

.header {
    display: flex;
    flex-direction: column;
    gap: 0;
    align-items: stretch;
    flex-shrink: 0;
}

.header-top {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.header-bottom {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 12px;
}

.quick-input {
    width: 540px;
    height: 44px;
    font-size: 16px;
    margin-bottom: 8px;
    border-radius: 8px;
}

.sort-container {
    position: relative;
}

.sort-select-btn {
    min-width: 120px;
    justify-content: space-between;
    font-weight: 500;
}

.sort-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
}

.sort-item,
.add-sort-btn {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    text-align: left !important;
    justify-content: flex-start !important;
    border-radius: 8px !important;
    padding-left: 16px !important;
    padding-right: 16px !important;
    height: 40px !important;
    line-height: 40px !important;
    display: flex !important;
    align-items: center !important;
    outline: none !important;
    box-shadow: none !important;
    border-width: 1px !important;
    font-size: 16px !important;
    font-family: inherit !important;
    background: #fff !important;
    border-color: #dcdfe6 !important;
}

.sort-item .el-button__text,
.add-sort-btn .el-button__text {
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    padding: 0 !important;
    margin: 0 !important;
    font-size: 16px !important;
    font-family: inherit !important;
}

.todo-list {
    position: relative;
    height: calc(100vh - 200px); /* Adjust this value based on your header height */
    overflow-y: auto;
    margin-top: 20px;
    padding-right: 4px;
}

/* Custom scrollbar styles */
.todo-list::-webkit-scrollbar {
    width: 4px;
}

.todo-list::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 2px;
}

.todo-list::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 2px;
}

.todo-list::-webkit-scrollbar-thumb:hover {
    background: #c0c4cc;
}

.todo-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
}

.empty-tip {
    text-align: center;
    color: #909399;
    padding: 20px;
}

:deep(.day-todo-picker) {
    z-index: 2000;
}

:deep(.sort-popover) {
    padding: 8px;
}

:deep(.add-sort-dialog) {
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.add-sort-dialog .el-dialog) {
    width: 250px !important;
    height: 300px !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.add-sort-dialog .el-dialog__body) {
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

:deep(.add-sort-modal) {
    background-color: rgba(0, 0, 0, 0.5);
}

.date-container {
    display: flex;
    align-items: center;
    gap: 16px;
}

.city-weather-icon-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    color: #606266;
    transition: all 0.3s ease;
    cursor: pointer;
}

.city-weather-icon-container:hover {
    background-color: #f5f7fa;
}

.city-text {
    font-weight: 500;
    color: #303133;
}

.weather-icon {
    color: #ffa500;
    font-size: 16px;
    margin-left: 4px;
}

.weather-text {
    color: #606266;
}
</style>