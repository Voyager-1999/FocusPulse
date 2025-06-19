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
                <div class="controls-container">
                    <i
                        class="bi bi-collection category-manage-btn"
                        title="分类管理"
                        data-bs-toggle="modal"
                        data-bs-target="#SortsModal"
                    ></i>
                    <i
                        class="bi bi-arrow-repeat repeat-events-btn"
                        title="重复事件"
                        data-bs-toggle="modal"
                        data-bs-target="#RecurrentEventsModal"
                    ></i>
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
                <div class="quick-input-container">
                    <el-input
                        v-model="quickInput"
                        placeholder="在此添加内容，按回车新建事件"
                        @keyup.enter="onQuickInputEnter"
                        class="quick-input"
                    />
                </div>
                <el-dialog v-model="showQuickEdit" :show-close="false" width="auto" align-center>
                    <editTodo :initialText="quickInput" @saved="onQuickEditSaved" />
                </el-dialog>
                <!-- 移除直接渲染的 RecurrentEventsModal 组件 -->
            </div>
        </div>
        <div class="todo-list">
            <div v-if="currentDayTodos.length === 0" class="empty-tip">
                今天还没有待办事项
            </div>
            <div v-else>
                <div v-for="todo in uncompletedTodos" :key="todo.id" class="todo-item">
                    <todoItem :todo="todo"/>
                </div>
                <div v-if="showChecked">
                    <div v-for="todo in completedTodos" :key="todo.id" class="todo-item">
                        <todoItem :todo="todo"/>
                    </div>
                </div>

            </div>
        </div>
        <RecurrentEventsModal />
        <SortsModal />
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
    import RecurrentEventsModal from '../components/RecurrentEventsModal.vue'
    import SortsModal from '../components/SortsModal.vue'
    import 'bootstrap-icons/font/bootstrap-icons.css'
    import { Modal } from 'bootstrap';


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
        if ( sort.name === '不分类' ){
            selectedSort.value = null
        }
        else {
            selectedSort.value = sort 
        }
        if (sortPopoverRef.value) sortPopoverRef.value.hide()
    }

    const currentDayTodos = computed(() => {
        return TodoListStore.todoList[selectedDate.value] || []
    })

    const completedTodos = computed(() => {
        if (selectedSort.value) {
            return currentDayTodos.value.filter(todo => todo.checked && todo.sort && todo.sort.name === selectedSort.value.name)
        } else {
            return currentDayTodos.value.filter(todo => todo.checked)
        }
    })

    const uncompletedTodos = computed(() => {
        if (selectedSort.value) {
            return currentDayTodos.value.filter(todo => !todo.checked && todo.sort && todo.sort.name === selectedSort.value.name)
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

    onMounted(() => {
      const modalElement = document.getElementById('RecurrentEventsModal');
      if (modalElement) {
        const modal = new Modal(modalElement, { backdrop: 'static' });

        modalElement.addEventListener('hidden.bs.modal', () => {
          // 将焦点移到页面的主内容区
          const mainContent = document.querySelector('.DayToDo');
          if (mainContent) {
            mainContent.focus();
          }
        });
      }
    });
</script>


<style scoped>
.DayToDo {
    padding: 8px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 32px);
    box-sizing: border-box;
    background-color: #fff;
}

.header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    flex-shrink: 0;
    padding: 0 4px;
}

.header-top {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.header-bottom {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 8px;
}

.quick-input-container {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.quick-input {
    width: 100%;
    height: 48px;
    font-size: 15px;
    margin-bottom: 0;
    border-radius: 8px;
}

.quick-input :deep(.el-input__wrapper) {
    height: 48px;
    padding: 0 12px;
}

.quick-input :deep(.el-input__inner) {
    height: 48px;
    line-height: 48px;
}

.controls-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.category-manage-btn {
    font-size: 18px;
    color: #606266;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-right: 2px;
}

.category-manage-btn:hover {
    background-color: #f5f7fa;
    color: #409eff;
}

.repeat-events-btn {
    font-size: 18px;
    color: #606266;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
}

.repeat-events-btn:hover {
    background-color: #f5f7fa;
    color: #409eff;
}

.sort-container {
    position: relative;
}

.sort-select-btn {
    min-width: 90px;
    width: 90px;
    justify-content: space-between;
    font-weight: 500;
    height: 40px;
    padding: 0 8px;
    font-size: 14px;
    border-radius: 8px;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    transition: all 0.2s ease;
}

.sort-select-btn:hover {
    background-color: #eef1f6;
    border-color: #dcdfe6;
}

.sort-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: stretch;
    padding: 4px;
}

.sort-item,
.add-sort-btn {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    text-align: left !important;
    justify-content: flex-start !important;
    border-radius: 6px !important;
    padding: 8px 8px !important;
    height: 36px !important;
    line-height: 20px !important;
    display: flex !important;
    align-items: center !important;
    outline: none !important;
    box-shadow: none !important;
    border-width: 1px !important;
    font-size: 14px !important;
    font-family: inherit !important;
    background: #fff !important;
    border-color: #dcdfe6 !important;
    transition: all 0.2s ease !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

.sort-item:hover {
    background-color: #f5f7fa !important;
    border-color: #c0c4cc !important;
}

.add-sort-btn {
    margin-top: 4px !important;
    color: #409eff !important;
    border-style: dashed !important;
}

.add-sort-btn:hover {
    background-color: #ecf5ff !important;
    border-color: #409eff !important;
}

.todo-list {
    position: relative;
    height: calc(100vh - 180px);
    overflow-y: auto;
    margin-top: 12px;
    padding: 0 4px;
}

.todo-item {
    padding: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.empty-tip {
    text-align: center;
    color: #909399;
    padding: 16px;
    font-size: 14px;
}

.date-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.city-weather-icon-container {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 13px;
    color: #606266;
    transition: all 0.2s ease;
    cursor: pointer;
    background-color: #f5f7fa;
}

.city-weather-icon-container:hover {
    background-color: #eef1f6;
}

.city-text {
    font-weight: 500;
    color: #303133;
}

.weather-icon {
    color: #ffa500;
    font-size: 15px;
    margin-left: 4px;
}

.weather-text {
    color: #606266;
}

:deep(.day-todo-picker) {
    z-index: 2000;
}

:deep(.sort-popover) {
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 100px !important;
    width: 100px !important;
}

:deep(.el-popover) {
    min-width: 100px !important;
    width: 100px !important;
}

:deep(.el-popover__title) {
    margin: 0;
    font-size: 14px;
    color: #606266;
    padding: 8px 0;
    border-bottom: 1px solid #ebeef5;
}

:deep(.add-sort-dialog) {
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.add-sort-dialog .el-dialog) {
    width: 240px !important;
    height: 280px !important;
    border-radius: 10px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
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
    background-color: rgba(0, 0, 0, 0.4);
}

/* 自定义滚动条样式 */
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
</style>