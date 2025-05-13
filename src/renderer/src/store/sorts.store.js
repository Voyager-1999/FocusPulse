import { defineStore } from "pinia";
import sortsRepository from '../repositories/sortsRepository'

export const useSortsStore = defineStore('sortsStore', {
    actions: {
        // 初始化加载sorts和sorts_colors
        loadSorts() {
            const sortsStore = sortsRepository.load();
            this.sorts = sortsStore.sorts;
            this.sorts_colors = sortsStore.sorts_colors;
        },

        // 添加新的sort
        addSort(name, color) {
            const newSort = { name, color };
            this.sorts.push(newSort);
            this.updateConfig();
        },

        // 删除sort
        deleteSort(name) {
            const index = this.sorts.findIndex(sort => sort.name === name);
            if (index !== -1) {
                this.sorts.splice(index, 1);
                this.updateConfig();
            }
        },

        // 添加新的颜色
        addColor(color) {
            if (!this.sorts_colors.includes(color)) {
                this.sorts_colors.push(color);
                this.updateConfig();
            }
        },

        // 删除颜色
        deleteColor(color) {
            const index = this.sorts_colors.indexOf(color);
            if (index !== -1) {
                this.sorts_colors.splice(index, 1);
                this.updateConfig();
            }
        },

        // 更新配置到数据库
        updateConfig() {
            const sortsStore = {
                sorts: this.sorts,
                sorts_colors: this.sorts_colors
            };
            sortsRepository.update(sortsStore);
        }
    },

    state() {
        return {
            sorts: [],
            sorts_colors: [],
        }
    },

    getters: {
        // 可以添加一些getter如果需要
    }
})