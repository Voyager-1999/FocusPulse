import storageRepository from "./storageRepository";
import moment from "moment";

export default {
  load() { // 加载配置
    let config = storageRepository.get("config");
    if (config) {
      return config;
    } else {
      let default_config = {
        firstTimeOpen: true, // 是否第一次打开
        lastDayOpened: moment().format("YYYY-MM-DD"), // 上次打开的日期
        showChecked: true, // 是否展示已完成
        expiredAndCompletedSpan: 7, // 过往已达成的显示范围
        expiredAndNotCompletedSpan: 7, // 过期未达成的显示范围
        followSpan: 7, //后续日程的显示范围
      };
      storageRepository.set("config", default_config);
      return default_config;
    }
  },
  update(config) {
    storageRepository.set("config", config);
  },
};
