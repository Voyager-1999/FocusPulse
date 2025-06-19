import storageRepository from "./storageRepository";

export default {
  load() { // 加载配置
    let sortsStore = storageRepository.get("sortsStore");
    if (sortsStore) {
      return sortsStore;
    } else {
      let default_sortsStore = {
        sorts: [
          {name: '不分类', color: "#f2f3f4"}, // 用作测试
          {name: '工作', color: "#e6b0aa"},
          {name: '学习', color: "#d7bde2"},
          {name: '娱乐', color: "#aed6f1"},
        ],
        sorts_colors: [
          "#f2f3f4",
          "#e6b0aa",
          "#d7bde2",
          "#aed6f1",
          "#a2d9ce",
          '#fad7a0',
          '#f9e79f'
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
