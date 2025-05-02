import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '/src/renderer/src') // 设置路径别名
    },
    extensions: ['.js', '.vue', '.json'] // 确保包含 .vue 扩展名
  },
  build: {
    outDir: 'out/renderer', // 输出目录，与主进程分开
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, '/src/renderer/index.html'), // 指定渲染进程入口文件
      },
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router'], // 将 Vue 和 Vue Router 单独打包
        }
      }
    }
  }
})

