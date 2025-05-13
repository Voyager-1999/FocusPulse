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
// 或者通过右上角下载压缩包
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

### 如何推送本地修改
该仓库只有一个分支main，克隆后应该会自动在本地创建一个同名的分支并自动建立追踪关系，无需手动关联
```bash
$ git remote add origin https://github.com/Voyager-1999/FocusPulse.git //关联该仓库并将远程仓库命名为origin
$ git remote -v //查看当前已关联的远程仓库
$ git remote remove <remote-name> // 删除指定的远程仓库

$ git branch -vv // 查看本地分支与远程分支的关联关系

$ git branch -M main // 强制重命名当前分支为main

$ git push origin main // 向远程仓库推送本地分支main

// 当远程分支前于本地分支时，推送会失败，此时先抓取最新提交，然后在本地合并，解决冲突(可能需要手动解决），再推送
$ git pull // 抓取
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
