// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import draggable from 'vuedraggable'

const app = createApp(App)
const pinia = createPinia()

app.component('draggable', draggable)

app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.mount('#app')

