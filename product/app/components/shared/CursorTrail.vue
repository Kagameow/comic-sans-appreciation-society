<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const particles = ref<{ id: number, x: number, y: number, hue: number }[]>([])
let nextId = 0
let hue = 0
let lastSpawn = 0

function onMove(e: MouseEvent) {
  const now = Date.now()
  if (now - lastSpawn < 30) return
  lastSpawn = now

  hue = (hue + 4) % 360
  const id = nextId++
  particles.value.push({ id, x: e.clientX, y: e.clientY, hue })

  setTimeout(() => {
    const idx = particles.value.findIndex(p => p.id === id)
    if (idx !== -1) particles.value.splice(idx, 1)
  }, 600)
}

onMounted(() => {
  document.documentElement.classList.add('vue-cursor')
  window.addEventListener('mousemove', onMove)
})

onUnmounted(() => {
  document.documentElement.classList.remove('vue-cursor')
  window.removeEventListener('mousemove', onMove)
})
</script>

<template>
  <div class="trail-layer">
    <div
      v-for="p in particles"
      :key="p.id"
      class="trail-dot"
      :style="{
        left: `${p.x}px`,
        top: `${p.y}px`,
        '--hue': p.hue,
      }"
    />
  </div>
</template>

<style>
.vue-cursor,
.vue-cursor * {
  cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-40 -40 340 310' width='24' height='24'><g transform='rotate(210 130.88 113.35)'><path d='M161.096.001l-30.224 52.35L100.647.001H0l130.877 226.688L261.749.001z' fill='%2341b883'/><path d='M161.096.001l-30.224 52.35L100.647.001H52.346l78.526 136.01L209.398.001z' fill='%2334495e'/></g></svg>") 4 2, auto !important;
}
</style>

<style scoped>
.trail-layer {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;
}

.trail-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: hsl(var(--hue) 100% 65%);
  box-shadow: 0 0 8px hsl(var(--hue) 100% 65% / 0.8);
  transform: translate(-50%, -50%) scale(1);
  animation: trail-fade 0.6s ease-out forwards;
}

@keyframes trail-fade {
  0% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2.5);
  }
}
</style>
