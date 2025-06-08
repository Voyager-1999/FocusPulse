import { defineStore } from 'pinia';
import { rrulestr } from "rrule";
import moment from "moment";

export const useRepeatingEventDateCacheStore = defineStore('repeatingEventDateCache', {
  state: () => ({
    repeatingEventDateCache: {}, // 键是日期（格式为 YYYYMMDD），值是一个数组，包含在该日期发生的重复事件的 ID
  }),

  getters: {
    getRepeatingEventDateCache: (state) => state.repeatingEventDateCache,
  },

  actions: {
    resetRepeatingEventDateCache() {
      this.repeatingEventDateCache = {};
    },
    loadRepeatingEventDateCache(repeatingEventList) {
      let today = new Date();
      let future_date = new Date();
      future_date.setFullYear(today.getFullYear() + 1); // 未来1年
      for (const [id, re] of Object.entries(repeatingEventList)) {
        const rule = rrulestr(re.repeating_rule);
        rule.between(today, future_date).forEach((date) => {
          const dateKey = moment.utc(date).format("YYYYMMDD");
          if (this.repeatingEventDateCache[dateKey]) {
            this.repeatingEventDateCache[dateKey].push(id);
          } else {
            this.repeatingEventDateCache[dateKey] = [id];
          }
        });
      }
    },
    addRepeatingEventToDateCache(re) {
      let today = new Date();
      let future_date = new Date();
      future_date.setFullYear(today.getFullYear() + 1);
      const rule = rrulestr(re.repeating_rule);
      rule.between(today, future_date).forEach((date) => {
        const dateKey = moment.utc(date).format("YYYYMMDD");
        if (this.repeatingEventDateCache[dateKey]) {
          this.repeatingEventDateCache[dateKey].push(re.id);
        } else {
          this.repeatingEventDateCache[dateKey] = [re.id];
        }
      });
    },
  },
});
