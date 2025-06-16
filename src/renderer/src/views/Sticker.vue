<template>
  <div
    class="sticker"
    :style="{ ...stickerStyle, opacity: 0.4, transform: `rotate(${rotation}deg)` }"
    @mousedown="startDrag"
    @touchstart="startDrag"
    @contextmenu.prevent="showDelete = true"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <!-- 旋转按钮，仅悬停时显示 -->
    <div
      v-if="hover"
      class="rotate-handle"
      @mousedown.stop="startRotate"
      @touchstart.stop="startRotate"
      title="旋转贴纸"
    >
      <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 3v3.5a.5.5 0 0 0 .5.5H13" stroke="#b8860b" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M15 9a6 6 0 1 1-6-6" stroke="#b8860b" stroke-width="1.5" fill="none"/></svg>
    </div>
    <!-- 覆盖全贴纸的大×，仅右键后显示，正方形且自适应 -->
    <div
      v-if="showDelete"
      class="delete-overlay"
      :style="deleteOverlayStyle"
      @click.stop="onDeleteClick"
    >
      ×
    </div>
    <img v-if="imgSrc" :src="imgSrc" class="sticker-img" :style="imgStyle" />
    <span v-else class="sticker-text">{{ text }}</span>
    <!-- 缩放控件 -->
    <div class="resize-handle" @mousedown.stop="startResize" @touchstart.stop="startResize"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  imgSrc: String,
  text: String,
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: { type: Number, default: 60 },
  height: { type: Number, default: 60 },
})
const emit = defineEmits(['update:position', 'update:size', 'delete'])

const pos = ref({ x: props.x, y: props.y })
const size = ref({ width: props.width, height: props.height })
const showDelete = ref(false)
const hover = ref(false)
const rotation = ref(0)
let dragging = false
let resizing = false
let rotating = false
let offset = { x: 0, y: 0 }
let resizeStart = { x: 0, y: 0, width: 0, height: 0 }
let rotateStart = { x: 0, y: 0, angle: 0 }

const stickerStyle = computed(() => ({
  position: 'absolute',
  left: pos.value.x + 'px',
  top: pos.value.y + 'px',
  width: size.value.width + 'px',
  height: size.value.height + 'px',
  cursor: dragging ? 'grabbing' : (resizing ? 'nwse-resize' : 'grab'),
  zIndex: 10,
  boxSizing: 'border-box',
  background: 'transparent',
  border: 'none',
  borderRadius: 0,
  boxShadow: 'none',
  padding: 0,
  transition: 'box-shadow 0.2s, opacity 0.2s',
}))
const imgStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  background: 'transparent',
  border: 'none',
  borderRadius: 0,
  boxShadow: 'none',
}))
// 删除大×自适应样式，正方形，字号为min(width, height)
const deleteOverlayStyle = computed(() => {
  const minSide = Math.min(size.value.width, size.value.height)
  return {
    width: minSide + 'px',
    height: minSide + 'px',
    left: `calc(50% - ${minSide / 2}px)` ,
    top: `calc(50% - ${minSide / 2}px)` ,
    fontSize: (minSide * 0.7) + 'px',
    lineHeight: minSide + 'px',
    borderRadius: (minSide/8) + 'px',
  }
})

function startDrag(e) {
  if (resizing || rotating) return
  dragging = true
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
  offset.x = clientX - pos.value.x
  offset.y = clientY - pos.value.y
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

function onDrag(e) {
  if (!dragging) return
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
  pos.value.x = clientX - offset.x
  pos.value.y = clientY - offset.y
  emit('update:position', { x: pos.value.x, y: pos.value.y })
}

function stopDrag() {
  dragging = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

function startResize(e) {
  resizing = true
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
  resizeStart.x = clientX
  resizeStart.y = clientY
  resizeStart.width = size.value.width
  resizeStart.height = size.value.height
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', onResize)
  document.addEventListener('touchend', stopResize)
}

function onResize(e) {
  if (!resizing) return
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
  let newWidth = resizeStart.width + (clientX - resizeStart.x)
  let newHeight = resizeStart.height + (clientY - resizeStart.y)
  newWidth = Math.max(40, newWidth)
  newHeight = Math.max(40, newHeight)
  size.value.width = newWidth
  size.value.height = newHeight
  emit('update:size', { width: newWidth, height: newHeight })
}

function stopResize() {
  resizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', onResize)
  document.removeEventListener('touchend', stopResize)
}

// 旋转功能
function startRotate(e) {
  rotating = true
  const rect = e.target.closest('.sticker').getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
  const dx = clientX - centerX
  const dy = clientY - centerY
  rotateStart.angle = rotation.value
  rotateStart.x = clientX
  rotateStart.y = clientY
  rotateStart.startAngle = Math.atan2(dy, dx) * 180 / Math.PI
  document.addEventListener('mousemove', onRotate)
  document.addEventListener('mouseup', stopRotate)
  document.addEventListener('touchmove', onRotate)
  document.addEventListener('touchend', stopRotate)
}
function onRotate(e) {
  if (!rotating) return
  const rect = document.querySelector('.sticker[style*="z-index: 10"]')?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 }
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
  const dx = clientX - centerX
  const dy = clientY - centerY
  const angle = Math.atan2(dy, dx) * 180 / Math.PI
  rotation.value = rotateStart.angle + (angle - rotateStart.startAngle)
}
function stopRotate() {
  rotating = false
  document.removeEventListener('mousemove', onRotate)
  document.removeEventListener('mouseup', stopRotate)
  document.removeEventListener('touchmove', onRotate)
  document.removeEventListener('touchend', stopRotate)
}

function onDeleteClick() {
  emit('delete')
  showDelete.value = false
}
// 右键后，点击贴纸外部关闭大×
function handleClickOutside(e) {
  if (!e.target.closest('.sticker')) {
    showDelete.value = false
  }
}
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(() => [props.x, props.y], ([newX, newY]) => {
  pos.value.x = newX
  pos.value.y = newY
})
watch(() => [props.width, props.height], ([w, h]) => {
  size.value.width = w
  size.value.height = h
})
</script>

<style scoped>
.sticker {
  min-width: 40px;
  min-height: 40px;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: box-shadow 0.2s, opacity 0.2s, transform 0.2s;
  overflow: hidden;
  position: absolute;
}
.rotate-handle {
  position: absolute;
  right: 2px;
  top: 2px;
  width: 22px;
  height: 22px;
  background: rgba(255,255,255,0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 30;
  box-shadow: 0 1px 4px #ffd96633;
  border: 1px solid #ffd966;
}
.rotate-handle:hover {
  background: #ffe066;
}
.delete-overlay {
  position: absolute;
  background: rgba(255,255,255,0.7);
  color: #b8860b;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-overlay:hover {
  background: rgba(255,224,102,0.85);
}
.sticker-img {
  display: block;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.sticker-text {
  font-size: 18px;
  color: #b8860b;
  font-weight: bold;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  transition: opacity 0.2s;
}
.resize-handle {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 16px;
  height: 16px;
  background: rgba(255, 217, 102, 0.8);
  border-radius: 4px;
  border: 1px solid #ffd966;
  cursor: nwse-resize;
  z-index: 20;
}
</style> 
