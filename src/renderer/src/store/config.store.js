import { defineStore } from "pinia";
import configRepository from "../repositories/configRepository";

export const useConfigStore = defineStore('config', {
    actions:{
        async loadConfig() {
            return new Promise((resolve) => {
                this.config = configRepository.load();
                resolve();
            });
        },

        updateConfig(key, value){
            this.config[key] = value
            configRepository.update(this.config)
        }
    },
    state(){
        return {
            config:{}
        }
    },
    getters:{

    }
})