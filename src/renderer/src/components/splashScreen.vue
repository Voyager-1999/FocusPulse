<template>
  <transition name="fade">
    <div
      v-if="show"
      id="splashScreen"
      class="splash-screen d-flex justify-content-center align-items-center"
    >
      <h2>启动动画页面</h2>
      <div class="d-flex flex-column align-items-center">
        <div class="d-flex justify-content-center align-items-center" style="margin-bottom: 2.2rem">
          <img
            class="logo"
            src="..\assets\logo.png"
            alt="FocusPulse Logo"
            style="display: inline"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(true)

const hideSplash = () => {
  show.value = false
}

// Expose methods to parent components if needed
defineExpose({
  hideSplash
})
</script>

<style scoped>
.sponsor-container {
  height: fit-content;
  width: fit-content;
  padding: 4px 10px 4px 10px;
  font-size: 0.85rem;
  box-sizing: border-box;
  border-radius: 25px;
  -webkit-box-align: start;
  -ms-flex-align: start;
  -webkit-align-items: flex-start;
  -moz-align-items: flex-start;
  align-items: flex-start;
  position: relative;
  background-color: #fefefe;
  box-shadow: 0 2px 20px 0 rgb(0 0 0 / 7%);
  text-decoration: unset;
  color: unset;
  transition: transform 0.4s;
}

.dark-theme .sponsor-container {
  background-color: #102430;
}

.sponsor-container:hover {
  transform: scale(1.04);
}

.sponsor-img {
  width: 32px;
  border-radius: 25px;
}

.splash-screen {
  width: 100%;
  height: 100%;
  z-index: 1060;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #fcfcfc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dark-theme .splash-screen {
  background-color: #13171d;
}

.logo {
  width: 25rem;
}

.splash-screen h1 {
  color: #3f0e81;
}

.dark-theme .splash-screen h1 {
  color: #5329a3;
}

.splash-screen h1 {
  letter-spacing: 3px;
  font-size: 3rem;
  margin-bottom: 10px;
}

.splash-screen span {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.4rem;
  color: #79606b;
  margin-bottom: 20px;
}

.sponsor {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #bababa;
}

.dark-theme .splash-screen span {
  color: #c9d1d9;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
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
