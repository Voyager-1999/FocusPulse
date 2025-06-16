<template>
  <transition name="fade">
    <div
      v-if="show"
      id="splashScreen"
      class="splash-screen"
    >
      <div class="content-container">
        <div class="logo-container">
          <img
            class="logo"
            src="..\assets\logo.png"
            alt="FocusPulse Logo"
          />
        </div>
        <h2 class="loading-text">FocusPulse 正在启动</h2>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div v-if="loadingProgress < 100" class="progress-container">
          <div class="progress-bar">
            <div class="progress" :style="{ width: loadingProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ Math.floor(loadingProgress) }}%</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const show = ref(true)
const loadingProgress = ref(0)
let interval = null

const hideSplash = () => {
  show.value = false
}

// 模拟加载进度
const simulateLoading = () => {
  interval = setInterval(() => {
    if (loadingProgress.value < 100) {
      loadingProgress.value += Math.random() * 5
      if (loadingProgress.value > 100) {
        loadingProgress.value = 100
      }
    } else {
      clearInterval(interval)
      setTimeout(() => {
        hideSplash()
      }, 500)
    }
  }, 100)
}

onMounted(() => {
  simulateLoading()
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})

// Expose methods to parent components if needed
defineExpose({
  hideSplash
})
</script>

<style scoped>
.splash-screen {
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dark-theme .splash-screen {
  background: linear-gradient(135deg, #1a1f2c 0%, #2d3748 100%);
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.logo-container {
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1));
}

.logo {
  width: 280px;
  height: auto;
  transition: transform 0.3s ease;
}

.loading-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  letter-spacing: 0.5px;
}

.dark-theme .loading-text {
  color: #e2e8f0;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

.dark-theme .loading-dots span {
  background-color: #60a5fa;
}

.progress-container {
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.dark-theme .progress-bar {
  background-color: rgba(255, 255, 255, 0.1);
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 3px;
  transition: width 0.3s ease-out;
}

.progress-text {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
}

.dark-theme .progress-text {
  color: #a0aec0;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  }
  40% { 
    transform: scale(1.0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
