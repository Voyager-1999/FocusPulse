import storageRepository from "./storageRepository";

export default {
  load() { // 加载配置
    let sortsStore = storageRepository.get("sortsStore");
    if (sortsStore) {
      return sortsStore;
    } else {
      let default_sortsStore = {
        sorts: [
          {name: '未分类', color: "#f5f3f4"}, // 用作测试
          {name: '工作', color: "#f3722c"},
          {name: '学习', color: "#f8961e"},
          {name: '娱乐', color: "#f9844a"},
          {name: '其他', color: "#f9c74f"},
        ],
        sorts_colors: [
          "#f94144",
          "#f3722c",
          "#f8961e",
          "#f9844a",
          "#f9c74f",
          "#90be6d",
          "#4361ee",
          "#4cc9f0",
          "#57606f",
          "#82ccdd",
          "#5352ed",
          "#2bcbba",
        ]
      };
      storageRepository.set("sortsStore", default_sortsStore);
      return default_sortsStore;
    }
  },
  update(sortsStore) {
    storageRepository.set("sortsStore", sortsStore);
  },
};
