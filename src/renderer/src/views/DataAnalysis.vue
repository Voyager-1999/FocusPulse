<template>
    <div class="DataAnalysis">
        <div class="navigation">
            <RouterLink :to="{ name: 'YesterdaySummary' }" class="nav-link">
                <el-icon><List /></el-icon>
                <span>昨日小结</span>
            </RouterLink>
            <RouterLink :to="{ name: 'TodoStatistic' }" class="nav-link">
                <el-icon><Checked /></el-icon>
                <span>待办统计</span>
            </RouterLink>
            <RouterLink :to="{ name: 'TomatoStatistic'}" class="nav-link">
                <el-icon><Sugar /></el-icon>
                <span>番茄统计</span>
            </RouterLink>
            <RouterLink :to="{ name: 'Report'}" class="nav-link">
                <el-icon><TrendCharts /></el-icon>
                <span>周报</span>
            </RouterLink>
        </div>
        <div class="content">
            <RouterView/>
        </div>
    </div>
</template>


<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { Checked, List, Sugar, TrendCharts  } from '@element-plus/icons-vue';

</script>


<style scoped>
.DataAnalysis {
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure it takes full height if needed */
}

.navigation {
  display: flex; /* Changed from default block to flex for easier item alignment */
  justify-content: flex-start; /* Align items to the start, or use space-around for even spacing */
  align-items: center;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0; /* Light border for separation */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-link {
  display: flex;
  flex-direction: row; /* Icon on top, text below */
  align-items: center; /* Center icon and text horizontally */
  justify-content: center; /* Center content vertically if nav-link has fixed height */
  padding: 8px 15px; /* Adjust padding as needed */
  text-decoration: none;
  color: #333; /* Darker text color for white background */
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;
  text-align: center; /* Ensure text below icon is centered */
}

.nav-link .el-icon {
  font-size: 20px; /* Adjust icon size if needed */
  margin-bottom: 4px; /* Space between icon and text */
}

.nav-link span {
  font-size: 12px; /* Adjust text size if needed */
}

.nav-link:hover {
  background-color: #f0f0f0; /* Light grey on hover */
}

.nav-link.router-link-active {
  background-color: #e9e9e9; /* Slightly different or same light grey for active */
  color: #007bff; /* Optional: different text color for active link */
}

.content {
  flex-grow: 1; /* Allows content to take remaining space */
  overflow-y: hidden; /* Remove vertical scroll, hide overflow */
  padding: 10px;
}
</style>