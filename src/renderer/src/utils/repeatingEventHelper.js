import { useRepeatingEventStore } from "../store/repeatingEvent.store";
import { useRepeatingEventDateCacheStore } from "../store/repeatingEventDateCache.store";
import { useTodoListStore } from "../store/todoList.store";
import toDoListRepository from "../repositories/toDoListRepository";
import dbRepository from "../repositories/dbRepository";
import dayjs from "dayjs";
import tasksHelper from "./tasksHelper";
import repeatingEventByDateRepository from "../repositories/repeatingEventByDateRepository";

export default {
  generateRepeatingEventsIntances(listId) { // 为指定日期自动生成所有应出现的重复任务实例
    const repeatingEventStore = useRepeatingEventStore();
    const repeatingEventDateCacheStore = useRepeatingEventDateCacheStore();
    const todoListStore = useTodoListStore();

    let r_events = repeatingEventDateCacheStore.getRepeatingEventDateCache[listId] || [];
    r_events.forEach((re_id) => {
      let re = repeatingEventStore.getRepeatingEventList[re_id];
      if (!re) return;

      let re_by_date = repeatingEventStore.getRepeatingEventByDate[listId] || {};
      if (!re_by_date[re_id]) { // 如果重复事件还未在这一天生成实例
        let new_instanced_event = JSON.parse(JSON.stringify(re.data)); // 深拷贝重复事件的原始任务数据
        new_instanced_event.listId = listId;

        todoListStore.addTodo(new_instanced_event); // 将新任务添加到待办列表

        re_by_date[re_id] = true;
        console.log(re_by_date)
        // 构造日期关联对象
        const re_by_date_obj = {
          re_by_date,  // 直接使用 re_by_date 对象
          listId: listId    // 添加主键
        }
        repeatingEventByDateRepository.update(listId, re_by_date_obj);
      }
    });
  },
  removeGeneratedRepeatingEvents(listId) { // 移除指定日期下所有已经失效的重复任务实例
    const repeatingEventStore = useRepeatingEventStore();
    const todoListStore = useTodoListStore();

    // Initialize todoLists if it doesn't exist
    if (!todoListStore.todoList || !todoListStore.todoList[listId]) {
      return;
    }

    todoListStore.todoList[listId].forEach(async (todo, index) => { // 遍历日期下所有待办事项
      if (todo.repeatingEvent && !repeatingEventStore.getRepeatingEventList[todo.repeatingEvent]) { // 有重复字段但重复事件不存在全局重复事件列表（即已被删除）
        if (dayjs(todo.listId).isBefore(Date(), "day")) { // 任务日期早于今天，仅清空其 repeatingEvent 字段
          todoListStore.$patch((state) => {
            state.todoList[listId][index].repeatingEvent = null;
          });
        } else {
          todoListStore.$patch((state) => {
            state.todoList[listId].splice(index, 1); // 在未来或今天，直接从待办列表中移除该任务
          });
        }
        // 更新数据库
        const todoList = todoListStore.todoList;
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
    });
  },
};
