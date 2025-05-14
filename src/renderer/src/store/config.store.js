import { defineStore } from "pinia";
import configRepository from "../repositories/configRepository";

export const useConfigStore = defineStore('config', {
    actions:{
        loadConfig() {
            this.config = configRepository.load();
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