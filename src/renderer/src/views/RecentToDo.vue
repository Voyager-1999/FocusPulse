<template>
    <div class="recentToDo">
        <div class="header">
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
        <div class="main-container">
            <div v-for="(todos, type) in computedStore" :key="type">
                <div v-if="todos.length!==0">
                    <recentTodoItem :type="type" :todos="todos"/>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import editTodo from '../components/editTodo.vue'
import recentTodoItem from '../components/recentTodoItem.vue'
import { useTodoListStore } from '../store/todoList.store'
import { useConfigStore } from '../store/config.store'
import moment from 'moment'

const quickInput = ref('')
const showQuickEdit = ref(false)
const todoListStore = useTodoListStore()
const configStore = useConfigStore()


let showChecked = computed(() => configStore.config.showChecked)
let expiredAndCompletedSpan = computed(() => configStore.config.expiredAndCompletedSpan)
let expiredAndNotCompletedSpan = computed(() => configStore.config.expiredAndNotCompletedSpan)
let followSpan = computed(() => configStore.config.followSpan)

function onQuickInputEnter() {
    if (quickInput.value.trim()) {
        showQuickEdit.value = true
    }
}

function onQuickEditSaved() {
    showQuickEdit.value = false
    quickInput.value = ''
}

const computedStore = computed(() => {
    const result = {
        expiredAndCompleted: [],
        expiredAndNotCompleted: [],
        today: [],
        tomorrow: [],
        theDayAfterTomorrow: [],
        follow: []
    }

    // Get dates 
    const todayDate = moment().format('YYYYMMDD')
    const tomorrowDate = moment().add(1, 'days').format('YYYYMMDD')
    const theDayAfterTomorrowDate = moment().add(2, 'days').format('YYYYMMDD')

    // Handle today, tomorrow, and day after tomorrow
    if(todoListStore.todoList[todayDate]){
        let notChecked = []
        let checked = []
        todoListStore.todoList[todayDate].forEach(todo => {
            if(todo.checked){
                checked.push(todo)
            }
            else{
                notChecked.push(todo)
            }
        })
        if(showChecked.value){  // 修改这里，使用 .value 访问计算属性的值
            result.today = [...notChecked, ...checked]  // 使用展开运算符创建新数组
        }
        else{
            result.today = notChecked
        }
    }
    if(todoListStore.todoList[tomorrowDate]){
        let notChecked = []
        let checked = []
        todoListStore.todoList[tomorrowDate].forEach(todo => {
            if(todo.checked){
                checked.push(todo)
            }
            else{
                notChecked.push(todo)
            }
        })
        if(showChecked.value){  // 修改这里，使用 .value 访问计算属性的值
            result.tomorrow = [...notChecked, ...checked]  // 使用展开运算符创建新数组
        }
        else{
            result.tomorrow = notChecked
        }
    }
    if(todoListStore.todoList[theDayAfterTomorrowDate]){
        let notChecked = []
        let checked = []
        todoListStore.todoList[theDayAfterTomorrowDate].forEach(todo => {
            if(todo.checked){
                checked.push(todo)
            }
            else{
                notChecked.push(todo)
            }
        })
        if(showChecked.value){  // 修改这里，使用 .value 访问计算属性的值
            result.theDayAfterTomorrow = [...notChecked, ...checked]  // 使用展开运算符创建新数组
        }
        else{
            result.theDayAfterTomorrow = notChecked
        }
    }

    // Handle expired todos
    const todayMoment = moment()

    for (let date = moment().subtract(expiredAndCompletedSpan.value, 'days'); date.isBefore(todayMoment); date.add(1, 'day')){
        let dateStr = date.format('YYYYMMDD')
        if(todoListStore.todoList[dateStr]){
            todoListStore.todoList[dateStr].forEach(todo => {
                if(todo.checked){
                    result.expiredAndCompleted.push(todo)
                }
            })
        }
    }    

    for (let date = moment().subtract(expiredAndNotCompletedSpan.value, 'days'); date.isBefore(todayMoment); date.add(1, 'day')){
        let dateStr = date.format('YYYYMMDD')
        if(todoListStore.todoList[dateStr]){
            todoListStore.todoList[dateStr].forEach(todo => {
                if(!todo.checked){
                    result.expiredAndNotCompleted.push(todo)
                }
            })
        }
    }

    // Handle follow-up todos
    const threeDayAfterMoment = moment().add(3,'day')
    const nineDaysAfterMoment = moment().add(3+followSpan.value, 'days')

    let notChecked = []
    let checked = []
    for (let date = moment(threeDayAfterMoment); date.isSameOrBefore(nineDaysAfterMoment); date.add(1, 'day')){
        let dateStr = date.format('YYYYMMDD')
        if(todoListStore.todoList[dateStr]){
            todoListStore.todoList[dateStr].forEach(todo => {
                if(todo.checked){
                    checked.push(todo)
                }
                else{
                    notChecked.push(todo)
                }
            })
        }
    }
    if(showChecked.value){  // 修改这里，使用 .value 访问计算属性的值
        result.follow = [...notChecked, ...checked]  // 使用展开运算符创建新数组
    }
    else{
        result.follow = notChecked
    }

    return result
})
</script>


<style scoped>
.recentToDo {
    padding: 10px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 40px);
    box-sizing: border-box;
}

.header {
    display: flex;
    flex-direction: column;
    gap: 0;
    align-items: stretch;
    flex-shrink: 0;
}

.quick-input {
    width: 540px;
    height: 44px;
    font-size: 16px;
    margin-bottom: 8px;
    border-radius: 8px;
}

.main-container {
    position: relative;
    height: calc(100vh - 200px);
    overflow-y: auto;
    margin-top: 20px;
    padding-right: 4px;
}

/* Custom scrollbar styles */
.main-container::-webkit-scrollbar {
    width: 4px;
}

.main-container::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 2px;
}

.main-container::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 2px;
}

.main-container::-webkit-scrollbar-thumb:hover {
    background: #c0c4cc;
}
</style>