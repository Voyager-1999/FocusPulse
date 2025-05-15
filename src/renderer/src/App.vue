<template>
    <div class="app">
      <!-- 导航区 - 固定在左侧 -->
      <nav class="navigation">
        <div class="nav-header">
          <img src=".\\assets\\logo.png" alt="Logo" class="logo" />
          <h1 class="app-title">FocusPulse</h1>
        </div>
        
        <div class="nav-links">
          <RouterLink :to="{ 
            name: 'DayToDo', 
            query: {
              city: cityData?.city,
              weather: weatherData?.weather
            }
          }" class="nav-link">
            <el-icon><List /></el-icon>
            <span>Day Todo</span>
          </RouterLink>
          <RouterLink :to="{ name: 'RecentToDo' }" class="nav-link">
            <el-icon><Clock /></el-icon>
            <span>最近待办</span>
          </RouterLink>
          <RouterLink :to="{ name: 'Overview' }" class="nav-link">
            <el-icon><View /></el-icon>
            <span>日程概览</span>
          </RouterLink>
          <RouterLink to="/TomatoClock" class="nav-link">
            <el-icon><Timer /></el-icon>
            <span>番茄钟</span>
          </RouterLink>
          <RouterLink to="/ClassSchedule" class="nav-link">
            <el-icon><Calendar /></el-icon>
            <span>课程表</span>
          </RouterLink>
          <RouterLink :to="{name: 'DataAnalysis'}" class="nav-link">
            <el-icon><DataLine /></el-icon>
            <span>数据分析</span>
          </RouterLink>
          <RouterLink :to="{name: 'User'}" class="nav-link">
            <el-icon><User /></el-icon>
            <span>我的</span>
          </RouterLink>
        </div>
      </nav>
      
      <!-- 主内容区 - 占据剩余空间 -->
      <main class="content">
        <RouterView />
      </main>
    </div>
</template>
  
<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { List, Timer, Calendar, View, Clock, DataLine, User } from '@element-plus/icons-vue'
import { useTodoListStore } from './store/todoList.store'
import { useSortsStore } from './store/sorts.store'
import { useConfigStore } from './store/config.store'
import { onMounted, onBeforeMount, ref } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader';

const TodoListStore = useTodoListStore()
const sortsStore = useSortsStore()
const configStore = useConfigStore()
const showSettings = ref(false)

const cityData = ref(null)
const weatherData = ref(null)
let AMapInstance = null

// 加载高德地图
function loadAMap(){
  window._AMapSecurityConfig = {
    securityJsCode: "c82d1d5ab59cd55e73a3cdedfb8f2510",
  };
  AMapLoader.load({
    key: "a2073bdbfee2977c91b2005a9d46b7b6", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.CitySearch", "AMap.Weather"], //需要使用的的插件列表
  })
    .then((AMap) => {
      AMapInstance = AMap
      loadCityInfo()
    })
    .catch((e) => {
      console.log('地图加载失败：', e);
    });
}

// 加载城市信息
function loadCityInfo() {
  if (!AMapInstance) return
  
  AMapInstance.plugin('AMap.CitySearch', function () {
    let citySearch = new AMapInstance.CitySearch()
    citySearch.getLocalCity(function (status, result) {
      if (status === 'complete' && result.info === 'OK') {
        // console.log('城市信息：', result)
        cityData.value = result
        // 获取到城市信息后加载天气
        loadWeatherInfo()
      }
    })
  })
}

// 加载天气信息
function loadWeatherInfo() {
  if (!AMapInstance || !cityData.value) return
  
  AMapInstance.plugin("AMap.Weather", function () {
    let weather = new AMapInstance.Weather();
    weather.getLive(cityData.value.city, function (err, data) {
      if (err) {
        console.error('获取天气信息失败：', err)
        return
      }
      // console.log('天气信息：', data);
      weatherData.value = data
    });
  })
}

onBeforeMount(() => {
  loadAMap() // 初始化时加载地图
})

onMounted(() => {
    TodoListStore.loadTodos()
    sortsStore.loadSorts()
    configStore.loadConfig()
})
</script>

<style>
html,
body {
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Prevent scrollbars on html/body */
}
</style>

<style scoped>
/* 基础布局设置 */
.app {
    display: flex;
    height: 100%; /* Take full height from body */
    margin: 0;
    padding: 0;
}

/* 导航栏样式 */
.navigation {
    width: 180px;
    height: 100vh;
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    color: white;
    display: flex;
    flex-direction: column;
    padding: 16px 0;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
}

.nav-header {
padding: 0 16px;
margin-bottom: 24px;
display: flex;
align-items: center;
gap: 8px;
}

.logo {
width: 24px;
height: 24px;
}

.app-title {
font-size: 16px;
font-weight: 600;
margin: 0;
background: linear-gradient(45deg, #3498db, #2ecc71);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
}

.nav-links {
flex: 1;
display: flex;
flex-direction: column;
gap: 4px;
padding: 0 10px;
}

.nav-link {
display: flex;
align-items: center;
gap: 8px;
padding: 8px 12px;
color: #ecf0f1;
text-decoration: none;
border-radius: 6px;
transition: all 0.3s ease;
}

.nav-link:hover {
background-color: rgba(255, 255, 255, 0.1);
transform: translateX(4px);
}

.nav-link.router-link-active {
background-color: #3498db;
color: white;
}

.nav-link .el-icon {
font-size: 16px;
}

.nav-link span {
font-size: 13px;
font-weight: 500;
}

.nav-footer {
padding: 16px;
border-top: 1px solid rgba(255, 255, 255, 0.1);
display: flex;
justify-content: center;
margin-top: auto; /* 将footer推到底部 */
}

.settings-btn {
background-color: transparent;
border: 1px solid rgba(255, 255, 255, 0.2);
color: white;
padding: 6px;
}

.settings-btn:hover {
background-color: rgba(255, 255, 255, 0.1);
border-color: rgba(255, 255, 255, 0.3);
}

/* 主内容区样式 */
.content {
    flex: 1;
    margin-left: 180px;
    padding: 20px; 
    height: 100%; /* Fill the allocated flex space vertically */
    box-sizing: border-box;
    overflow-y: hidden; /* Ensure content itself does not scroll */
}

/* 响应式设计 */
@media (max-width: 768px) {
.navigation {
width: 56px;
}

.app-title {
display: none;
}

.nav-link span {
display: none;
}

.content {
margin-left: 56px;
}
}

/* 动画效果 */
.nav-link {
position: relative;
overflow: hidden;
}

.nav-link::after {
content: '';
position: absolute;
bottom: 0;
left: 0;
width: 100%;
height: 2px;
background-color: #3498db;
transform: scaleX(0);
transition: transform 0.3s ease;
}

.nav-link:hover::after {
transform: scaleX(1);
}

/* 自定义滚动条 */
.navigation::-webkit-scrollbar {
width: 6px;
}

.navigation::-webkit-scrollbar-track {
background: transparent;
}

.navigation::-webkit-scrollbar-thumb {
background-color: rgba(255, 255, 255, 0.2);
border-radius: 3px;
}

.navigation::-webkit-scrollbar-thumb:hover {
background-color: rgba(255, 255, 255, 0.3);
}
</style>
