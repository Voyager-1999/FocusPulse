// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 使用本地 Bootstrap 文件
import * as bootstrap from 'bootstrap'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import "./assets/style/globalVars.scss"
import "./assets/style/main.scss"
import "./assets/style/uiComponents.scss"

const app = createApp(App)
const pinia = createPinia()

app.config.globalProperties.$bootstrap = bootstrap
app.use(ElementPlus, {
    locale: zhCn,
  })
app.use(router)
app.use(pinia)
app.mount('#app')

