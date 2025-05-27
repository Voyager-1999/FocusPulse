import toDoListRepository from "../repositories/toDoListRepository";
import repeatingEventByDateRepository from "../repositories/repeatingEventByDateRepository";
import dayjs from "dayjs";
import tasksHelper from "./tasksHelper";

export default {
  generateRepeatingEventsIntances(listId, vue) { // 为指定日期自动生成所有应出现的重复任务实例
    let r_events = vue.$store.getters.repeatingEventDateCache[listId] || [];
    r_events.forEach((re_id) => {
      let re = vue.$store.getters.repeatingEventList[re_id];
      let re_by_date = vue.$store.getters.repeatingEventByDate[listId];
      if (!re_by_date[re_id]) { // 如果重复事件还未在这一天生成实例
        let new_instanced_event = JSON.parse(JSON.stringify(re.data)); // 深拷贝重复事件的原始任务数据
        new_instanced_event.listId = listId;
        vue.$store.commit("addTodo", new_instanced_event); // 通过addTodo添加到vuex的待办列表

        if(vue.$store.getters.config.autoReorderTasks){ // 保存到本地仓库
          toDoListRepository.update(listId, tasksHelper.reorderTasksList(vue.$store.getters.todoLists[listId]));
        } else {
          toDoListRepository.update(listId, vue.$store.getters.todoLists[listId]);
        }
     
        re_by_date[re_id] = true;
        repeatingEventByDateRepository.update(listId, re_by_date);
      }
    });
  },
  removeGeneratedRepeatingEvents(listId, vue) { // 移除指定日期下所有已经失效的重复任务实例
    vue.$store.getters.todoLists[listId].forEach((todo, index) => { // 遍历日期下所有待办事项
      if (todo.repeatingEvent && !vue.$store.getters.repeatingEventList[todo.repeatingEvent]) { // 有重复字段但重复事件不存在全局重复事件列表（即已被删除）
        if (dayjs(todo.listId).isBefore(Date(), "day")) { // 任务日期早于今天，仅清空其repeatingEvent字段
          todo.repeatingEvent = null;
        } else {
          vue.$store.commit("removeTodo", { // 在未来或今天，直接从待办列表中移除该任务
            toDoListId: todo.listId,
            index: index,
          });
        }
        toDoListRepository.update(todo.listId, vue.$store.getters.todoLists[todo.listId]); // 同步更新本地仓库
      }
    });
  },
};
