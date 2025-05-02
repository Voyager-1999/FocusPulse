<template>
    <div class="app">
      <!-- 导航区 - 固定在左侧 -->
      <nav class="navigation">
        <RouterLink to="/ToDo">待办</RouterLink>
        <RouterLink to="/TomatoClock">番茄钟</RouterLink>
        <RouterLink to="/ClassSchedule">课程表</RouterLink>
      </nav>
      
      <!-- 主内容区 - 占据剩余空间 -->
      <main class="content">
        <RouterView />
      </main>
    </div>
</template>
  
<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
/* 基础布局设置 */
.app {
display: flex;
min-height: 100vh;
margin: 0;
padding: 0;
}

/* 导航栏样式 */
.navigation {
width: 80px; /* 加宽以便更好显示文字 */
min-height: 100vh;
background-color: #2c3e50;
color: white;
display: flex;
flex-direction: column;
align-items: center;
padding: 20px 0;
position: fixed;
left: 0;
top: 0;
bottom: 0;
z-index: 100;
}

/* 导航链接样式 */
.navigation a {
color: white;
text-decoration: none;
margin: 15px 0;
padding: 8px 0;
width: 100%;
text-align: center;
transition: background-color 0.3s;
}

.navigation a:hover {
background-color: #34495e;
}

.navigation a.router-link-active {
background-color: #3498db;
}

/* 主内容区样式 */
.content {
flex: 1;
margin-left: 80px; /* 与导航栏宽度一致 */
padding: 20px;
background-color: #ecf0f1;
min-height: 100vh;
}
</style>
