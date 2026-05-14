<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const VUE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 261.76 226.69" width="24" height="24"><path d="M161.096.001l-30.224 52.35L100.647.001H0l130.877 226.688L261.749.001z" fill="#41b883"/><path d="M161.096.001l-30.224 52.35L100.647.001H52.346l78.526 136.01L209.398.001z" fill="#34495e"/></svg>`

interface Particle {
  x: number
  y: number
  age: number
  hue: number
}

const canvas = ref<HTMLCanvasElement | null>(null)
const particles: Particle[] = []
let animId = 0
let mouseX = -100
let mouseY = -100
let hue = 0

function onMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
  hue = (hue + 3) % 360
  particles.push(
    { x: mouseX, y: mouseY, age: 0, hue },
    { x: mouseX + (Math.random() - 0.5) * 8, y: mouseY + (Math.random() - 0.5) * 8, age: 0, hue: (hue + 30) % 360 },
  )
  if (particles.length > 80) particles.splice(0, particles.length - 80)
}

const vueLogo = new Image()
vueLogo.src = `data:image/svg+xml;base64,${btoa(VUE_SVG)}`

function draw() {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx || !canvas.value) { animId = requestAnimationFrame(draw); return }

  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.age++
    if (p.age > 30) { particles.splice(i, 1); continue }

    const alpha = 1 - p.age / 30
    const size = 6 + (1 - alpha) * 4

    ctx.beginPath()
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha * 0.7})`
    ctx.fill()

    if (p.age < 5) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, size + 3, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${alpha * 0.3})`
      ctx.fill()
    }
  }

  if (vueLogo.complete) {
    ctx.save()
    ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.8)`
    ctx.shadowBlur = 12
    ctx.drawImage(vueLogo, mouseX - 12, mouseY - 12, 24, 24)
    ctx.restore()
  }

  animId = requestAnimationFrame(draw)
}

onMounted(() => {
  document.body.style.cursor = 'none'
  window.addEventListener('mousemove', onMove)
  animId = requestAnimationFrame(draw)
})

onUnmounted(() => {
  document.body.style.cursor = ''
  window.removeEventListener('mousemove', onMove)
  cancelAnimationFrame(animId)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="cursor-canvas"
  />
</template>

<style scoped>
.cursor-canvas {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}
</style>
