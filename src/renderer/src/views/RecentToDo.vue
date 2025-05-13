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
import moment from 'moment'

const quickInput = ref('')
const showQuickEdit = ref(false)
const todoListStore = useTodoListStore()

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
        result.today = notChecked.concat(checked)
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
        result.tomorrow = notChecked.concat(checked)
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
        result.theDayAfterTomorrow = notChecked.concat(checked)
    }

    // Handle expired todos
    const todayMoment = moment()
    const sevenDaysAgoMoment = moment().subtract(7, 'days')

    for (let date = moment(sevenDaysAgoMoment); date.isBefore(todayMoment); date.add(1, 'day')){
        let dateStr = date.format('YYYYMMDD')
        if(todoListStore.todoList[dateStr]){
            todoListStore.todoList[dateStr].forEach(todo => {
                if(todo.checked){
                    result.expiredAndCompleted.push(todo)
                }
                else{
                    result.expiredAndNotCompleted.push(todo)
                }
            })
        }
    }

    // Handle follow-up todos
    const threeDayAfterMoment = moment().add(3,'day')
    const nineDaysAfterMoment = moment().add(9, 'days')

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
    result.follow = notChecked.concat(checked)

    return result
})
</script>


<style scoped>
.quick-input {
    width: 540px;
    height: 44px;
    font-size: 16px;
    margin-bottom: 8px;
    border-radius: 8px;
}
</style>