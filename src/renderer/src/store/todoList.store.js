import { defineStore } from "pinia";
import { v4 as uuidv4 } from 'uuid';
import dbRepository from '../repositories/dbRepository';

export const useTodoListStore = defineStore('TodoList', {
    actions: {
        // 从数据库加载TodoList数据到 Pinia
        async loadTodos() {
            this.loading = true
            try {
                const db = await new Promise((resolve, reject) => {
                    const req = dbRepository.open()
                    req.onsuccess = () => resolve(req.result)
                    req.onerror = () => reject(req.error)
                })
    
                // 获取所有数据
                const todos = await new Promise((resolve, reject) => {
                    const req = dbRepository.selectAll(db, 'todo_lists')
                    const items = {}
                    
                    req.onsuccess = (event) => {
                        const cursor = event.target.result
                        if (cursor) {
                            const data = cursor.value
                            items[data.date] = data.todos
                            cursor.continue()
                        } else {
                            resolve(items)
                        }
                    }
                    req.onerror = () => reject(req.error)
                })
    
                // 更新 Pinia 状态
                this.todoList = todos
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        // 修改已有待办事项
        async updateTodo(oldTodo, newTodo) {
            // 1. 更新 Pinia 状态
            if (oldTodo.id === newTodo.id) { // 如果是同一个待办事项，则直接替换
                const idx = this.todoList[oldTodo.startDate].findIndex(t => t.id === oldTodo.id);
                this.todoList[oldTodo.startDate].splice(idx, 1, newTodo);
            } else { // 如果是不同的待办事项，则需要移动
                const oldList = this.todoList[oldTodo.startDate] || [];
                const idx = oldList.findIndex(t => t.id === oldTodo.id);
                if (idx !== -1) {
                    oldList.splice(idx, 1);
                }
                if (!this.todoList[newTodo.startDate]) {
                    this.todoList[newTodo.startDate] = [];
                }
                this.todoList[newTodo.startDate].push(newTodo);
            }

            // 2. 更新数据库
            const todoList = this.todoList;
            await new Promise((resolve, reject) => {
                const db_req = dbRepository.open();
                db_req.onsuccess = (event) => {
                    const db = event.target.result;
                    dbRepository.update(db, "todo_lists", { date: oldTodo.startDate, todos: todoList[oldTodo.startDate] });
                    dbRepository.update(db, "todo_lists", { date: newTodo.startDate, todos: todoList[newTodo.startDate] });
                    resolve();
                };
                db_req.onerror = () => reject(db_req.error);
            });
        },

        // 删除待办事项
        async removeTodo(date, todoId) {
            try {
                // 1. 更新 Pinia 状态
                if (this.todoList[date]) {
                    this.todoList[date] = this.todoList[date].filter(todo => todo.id !== todoId);
                    
                // 2. 更新数据库
                const todoList = this.todoList;
                await new Promise((resolve, reject) => {
                    const db_req = dbRepository.open();
                    db_req.onsuccess = (event) => {
                        const db = event.target.result;
                        dbRepository.update(db, "todo_lists", { date, todos: todoList[date] });
                        resolve();
                    };
                    db_req.onerror = () => reject(db_req.error);
                });
                }
            } catch (error) {
                this.error = error.message;
            }
        },

        // 修改待办事项的检查状态
        async changeChecked(date, todoId) {
            if (!this.todoList[date]) return;
            const todo = this.todoList[date].find(todo => todo.id === todoId);
            if (todo) {
                todo.checked = !todo.checked;
                await this.updateTodo(todo, todo);
            }
        },

        // 新增待办事项
        async addTodo(newTodo) {
            try {
                // 1. 生成唯一ID
                const id = uuidv4();
                const todo = {
                    id, // 唯一ID
                    text: newTodo.text, // 主文本
                    desc: newTodo.desc, // 描述
                    startDate: newTodo.startDate, // 开始日期 格式为YYYYMMDD
                    dueDate: newTodo.dueDate, // 结束日期 格式为YYYYMMDD
                    checked: false, // 是否完成
                    subTodos: newTodo.subTodos || [], // 子任务，数据中元素为{text: string, checked: boolean}
                    repeat: newTodo.repeat, // 重复类型
                    sort: newTodo.sort, // 分类，数据中元素为{name: string, color: string}
                };

                // 2. 格式化日期为 YYYYMMDD
                const formattedDate = newTodo.startDate

                // 3. 更新 Pinia 状态
                if (!this.todoList[formattedDate]) {
                    this.todoList[formattedDate] = [];
                }
                this.todoList[formattedDate].push(todo);
                
                // 4. 保存到数据库
                const todoList = this.todoList;
                await new Promise((resolve, reject) => {
                    const db_req = dbRepository.open();
                    db_req.onsuccess = (event) => {
                        const db = event.target.result;
                        dbRepository.update(db, "todo_lists", { date: formattedDate, todos: todoList[formattedDate] });
                        resolve();
                    };
                    db_req.onerror = () => reject(db_req.error); // 将错误消息传递到外部
                });
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        }
    },
    state() {
        return {
            todoList: {},
            loading: false,
            error: null
        }
    },

    getters: {
        getTodosByDate: (state) => (date) => {
            const formattedDate = date.replace(/-/g, '');
            return state.todoList[formattedDate] || [];
        }
    }
})