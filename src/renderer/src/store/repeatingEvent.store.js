import { defineStore } from 'pinia';
import dbRepository from "../../repositories/dbRepository";

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
      this.repeatingEventByDate[obj.key] = obj.val ? obj.val : {};
    },

    async loadRepeatingEventById(repeatingEventId) {
      let db_req = dbRepository.open();

      db_req.onsuccess = function (event) {
        let db = event.target.result;
        let get_req = dbRepository.get(db, "repeating_events", repeatingEventId);

        get_req.onsuccess = function (event) {
          let repeatingEvent = event.target.result;
          this.loadRepeatingEvent(repeatingEvent);
        }.bind(this);
      }.bind(this);
    },

    async loadAllRepeatingEvent() {
      return new Promise((resolve) => {
        let db_req = dbRepository.open();
        db_req.onsuccess = function (event) {
          let db = event.target.result;
          let get_req = dbRepository.selectAll(db, "repeating_events");
          let repeatingEvents = {};
          get_req.onsuccess = function () {
            let cursor = get_req.result;
            if (cursor) {
              repeatingEvents[cursor.key] = cursor.value;
              cursor.continue();
            } else {
              this.loadRepeatingEventList(repeatingEvents);
              resolve();
            }
          }.bind(this);
        }.bind(this);
      });
    },

    async loadRepeatingEventGeneratedByDate(date) {
      return new Promise((resolve) => {
        let db_req = dbRepository.open();
        db_req.onsuccess = function (event) {
          let db = event.target.result;
          let get_req = dbRepository.get(db, "repeating_events_by_date", date);
          get_req.onsuccess = function (event) {
            let re_list = event.target.result;
            this.loadRepeatingEventGeneratedByDate({ key: date, val: re_list });
            resolve();
          }.bind(this);
        }.bind(this);
      });
    },
  },
});
