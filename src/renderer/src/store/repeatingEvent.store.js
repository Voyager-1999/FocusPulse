import { defineStore } from 'pinia';
import dbRepository from "../repositories/dbRepository";

export const useRepeatingEventStore = defineStore('repeatingEvent', {
  state: () => ({
    repeatingEventList: {}, // 存储所有重复事件的对象，键是事件 ID，值是事件对象
    repeatingEventByDate: {}, // 存储按日期分组的重复事件对象，键是日期（格式为 YYYYMMDD），值是一个数组，包含在该日期发生的重复事件
  }),

  getters: {
    getRepeatingEventList: (state) => state.repeatingEventList,
    getRepeatingEventByDate: (state) => state.repeatingEventByDate,
  },

  actions: {
    loadRepeatingEvent(repeatingEvent) {
      this.repeatingEventList[repeatingEvent.id] = repeatingEvent;
    },

    updateRepeatingEvent(obj) {
      this.repeatingEventList[obj.key] = obj.val;
    },

    removeRepeatingEvent(id) {
      delete this.repeatingEventList[id];
    },

    loadRepeatingEventList(repeatingEventList) {
      this.repeatingEventList = repeatingEventList;
    },

    loadRepeatingEventGeneratedByDate(obj) {
      this.repeatingEventByDate[obj.key] = obj.val || {};
    },

    async loadRepeatingEventById(repeatingEventId) {
      try {
        const db = await new Promise((resolve, reject) => {
          const req = dbRepository.open();
          req.onsuccess = (event) => resolve(event.target.result);
          req.onerror = (event) => reject(event.target.error);
        });

        const repeatingEvent = await new Promise((resolve, reject) => {
          const req = dbRepository.get(db, "repeating_events", repeatingEventId);
          req.onsuccess = (event) => resolve(event.target.result);
          req.onerror = (event) => reject(event.target.error);
        });

        if (repeatingEvent) {
          this.loadRepeatingEvent(repeatingEvent);
        }
      } catch (error) {
        console.error('Error loading repeating event:', error);
      }
    },

    async loadAllRepeatingEvent() {
      try {
        // 使用 Promise 包装 dbRepository.open()
        const db = await new Promise((resolve, reject) => {
          const req = dbRepository.open();
          req.onsuccess = (event) => resolve(event.target.result);
          req.onerror = (event) => reject(event.target.error);
        });

        const repeatingEvents = {};
        
        // 使用 Promise 包装 selectAll 操作
        await new Promise((resolve, reject) => {
          const req = dbRepository.selectAll(db, "repeating_events");
          req.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              repeatingEvents[cursor.key] = cursor.value;
              cursor.continue();
            } else {
              resolve();
            }
          };
          req.onerror = (event) => reject(event.target.error);
        });
        
        this.loadRepeatingEventList(repeatingEvents);
      } catch (error) {
        console.error('Error loading all repeating events:', error);
      }
    },

    async loadAllRepeatingEventByDate() {
      try {
        const db = await new Promise((resolve, reject) => {
          const req = dbRepository.open();
          req.onsuccess = (event) => resolve(event.target.result);
          req.onerror = (event) => reject(event.target.error);
        });
    
        // 使用 selectAll 获取所有记录
        await new Promise((resolve, reject) => {
          const req = dbRepository.selectAll(db, "repeating_events_by_date");
          req.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              // 每条记录的结构: { re_by_date: {...}, listId: 'YYYYMMDD' }
              const dateData = cursor.value;
              // 更新 store 中的状态
              this.loadRepeatingEventGeneratedByDate({ 
                key: dateData.listId, 
                val: dateData.re_by_date 
              });
              cursor.continue();
            } else {
              resolve();
            }
          };
          req.onerror = (event) => reject(event.target.error);
        });
      } catch (error) {
        console.error('Error loading all repeating events by date:', error);
      }
    }
  },
});
