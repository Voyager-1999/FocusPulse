# electron-app

An Electron application with Vue

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

### 克隆项目
```bash
// 使用http
git clone https://github.com/Voyager-1999/FocusPulse.git
// 使用SSH
git clone git@github.com:Voyager-1999/FocusPulse.git
```


### Install 安装依赖
```bash
$ npm install
```

### Development 运行开发环境

```bash
$ npm run dev
```

### 构建

```bash
$ npm run build
```


### Build 打包成安装包

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## 已安装插件

### vue @vitejs/plugin-vue 支持单文件组件
```
npm install @vitejs/plugin-vue --save-dev   //支持单文件组件
```
配置vite.config.js
```
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer/src') // 设置路径别名
    },
    extensions: ['.js', '.vue', '.json'] // 确保包含 .vue 扩展名
  },
  build: {
    outDir: 'out/renderer', // 输出目录，与主进程分开
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, './src/renderer/index.html'), // 指定渲染进程入口文件
      },
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router'], // 将 Vue 和 Vue Router 单独打包
        }
      }
    }
  }
})
```
### vue-router 路由
```
npm install vue-router@4 --save
```

## 项目结构
```
FocusPulse
├── README.md                               // 项目说明文档
├── build                                   // 打包脚本
├── dist                                    // 打包后的文件
├── node_modules                            // 依赖包
├── out                                     // 打包后的文件
├── package-lock.json                       // 依赖包版本锁定文件
├── package.json                            // 项目配置文件
├── resources                               // 资源文件
├── src                                     // 源代码
    ├── main                                // Electron主进程
    │   └── index.js
    ├── preload                             // Electron预加载脚本
    │   └── index.js
    └── renderer                            // Electron渲染进程
        ├── index.html
        └── src                             // Vue源代码
            ├── App.vue                     // 主组件
            ├── assets                      // 静态资源
            ├── components                  // 组件
            ├── main.js                     // 主入口文件
            ├── router                      // 路由配置
            │   └── index.js
            └── views                       // 视图组件
                ├── ClassSchedule.vue       // 课程表组件
                ├── ToDo.vue                // 待办事项组件
                └── TomatoClock.vue         // 番茄钟组件

└── vite.config.js
```
