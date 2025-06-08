import { defineStore } from "pinia";
import { v4 as uuidv4 } from 'uuid';
import dbRepository from '../repositories/dbRepository';
import dayjs from 'dayjs';

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
                            items[data.listId] = data.todos
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
            if (oldTodo.id === newTodo.id && oldTodo.listId === newTodo.listId) { // 如果是同一个待办事项，则直接替换
                const idx = this.todoList[oldTodo.listId].findIndex(t => t.id === oldTodo.id);
                this.todoList[oldTodo.listId].splice(idx, 1, newTodo);
            } else { // 如果是不同的待办事项，则需要移动
                const oldList = this.todoList[oldTodo.listId] || [];
                const idx = oldList.findIndex(t => t.id === oldTodo.id);
                if (idx !== -1) {
                    oldList.splice(idx, 1);
                }
                if (!this.todoList[newTodo.listId]) {
                    this.todoList[newTodo.listId] = [];
                }
                this.todoList[newTodo.listId].push(newTodo);
            }

            // 2. 更新数据库
            const todoList = this.todoList;
            await new Promise((resolve, reject) => {
                const db_req = dbRepository.open();
                db_req.onsuccess = (event) => {
                    const db = event.target.result;
                    dbRepository.update(db, "todo_lists", { listId: oldTodo.listId, todos: todoList[oldTodo.listId] });
                    dbRepository.update(db, "todo_lists", { listId: newTodo.listId, todos: todoList[newTodo.listId] });
                    resolve();
                };
                db_req.onerror = () => reject(db_req.error);
            });
        },

        // 删除待办事项
        async removeTodo(listId, todoId) {
            try {
                // 1. 更新 Pinia 状态
                if (this.todoList[listId]) {
                    this.todoList[listId] = this.todoList[listId].filter(todo => todo.id !== todoId);
                    
                    // 2. 更新数据库
                    const todoList = this.todoList;
                    await new Promise((resolve, reject) => {
                        const db_req = dbRepository.open();
                        db_req.onsuccess = (event) => {
                            const db = event.target.result;
                            dbRepository.update(db, "todo_lists", { listId, todos: todoList[listId] });
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
        async changeChecked(listId, todoId) {
            if (!this.todoList[listId]) return;
            const todo = this.todoList[listId].find(todo => todo.id === todoId);
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
                    listId: newTodo.listId, // 数组标记 
                    checked: false, // 是否完成
                    subTodos: newTodo.subTodos ? newTodo.subTodos.map(subTodo => ({
                        text: subTodo.text,
                        checked: subTodo.checked
                    })) : [], // 子任务，数据中元素为{text: string, checked: boolean}
                    repeatingEvent: newTodo.repeatingEvent, // 重复事件ID
                    sort: newTodo.sort, // 分类，数据中元素为{name: string, color: string}
                    alarm: newTodo.alarm, // 是否提醒
                    time: newTodo.time, // 提醒时间
                };

                // 2. 更新 Pinia 状态
                if (!this.todoList[newTodo.listId]) {
                    this.todoList[newTodo.listId] = [];
                }
                this.todoList[newTodo.listId].push(todo);

                console.log(todo)
                
                // 3. 保存到数据库
                const todoList = this.todoList;
                await new Promise((resolve, reject) => {
                    const db_req = dbRepository.open();
                    db_req.onsuccess = (event) => {
                        const db = event.target.result;
                        dbRepository.update(db, "todo_lists", { listId: newTodo.listId, todos: todoList[newTodo.listId] });
                        resolve();
                    };
                    db_req.onerror = () => reject(db_req.error);
                });
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        // 移动未完成的待办事项
        async moveUndoneItems(originId, destinyId) {
            try {
                // 1. 获取源列表中的未完成且未过期的待办事项
                const originList = this.todoList[originId] || [];
                const today = dayjs().format('YYYYMMDD');

                if ( originList.length === 0 || destinyId !== today ) return;
                
                const itemsToMove = originList.filter(todo => {
                    // 检查是否未完成且未过期
                    return !todo.checked && (!todo.dueDate || todo.dueDate >= today);
                });

                // 2. 从源列表中移除这些待办事项
                this.todoList[originId] = originList.filter(todo => {
                    return todo.checked || (todo.dueDate && todo.dueDate < today);
                });

                // 3. 将待办事项添加到目标列表
                if (!this.todoList[destinyId]) {
                    this.todoList[destinyId] = [];
                }
                
                // 创建新的待办对象
                itemsToMove.forEach(todo => {
                    const newTodo = {
                        ...todo,
                        listId: destinyId,
                        repeatingEvent: null, // 暂时不知道有什么用
                        subTodos: todo.subTodos ? todo.subTodos.map(subTodo => ({
                            text: subTodo.text,
                            checked: subTodo.checked
                        })) : []
                    };
                    this.todoList[destinyId].push(newTodo);
                    console.log(newTodo)
                });

                // 4. 更新数据库
                const db = await new Promise((resolve, reject) => {
                    const req = dbRepository.open();
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                });

                // 更新源列表
                await new Promise((resolve, reject) => {
                    dbRepository.update(db, "todo_lists", {
                        listId: originId,
                        todos: this.todoList[originId]
                    });
                    resolve();
                });

                // 更新目标列表
                await new Promise((resolve, reject) => {
                    dbRepository.update(db, "todo_lists", {
                        listId: destinyId,
                        todos: this.todoList[destinyId]
                    });
                    resolve();
                });

                return itemsToMove.length; // 返回移动的待办事项数量
            } catch (error) {
                console.error('移动待办事项失败:', error);
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