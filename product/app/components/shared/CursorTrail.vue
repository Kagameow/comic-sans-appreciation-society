<script setup lang="ts">
import { useEventListener, useRafFn } from '@vueuse/core'

type Point = { x: number, y: number, t: number, hue: number }

const LIFETIME = 900
const MIN_SPAWN_MS = 45
const FADE_LAYERS = 14

const points = ref<Point[]>([])
const now = ref(0)
let hue = 0
let lastSpawn = 0

useEventListener('mousemove', (e: MouseEvent) => {
  const t = performance.now()
  if (t - lastSpawn < MIN_SPAWN_MS) return
  lastSpawn = t
  hue = (hue + 6) % 360
  points.value.push({ x: e.clientX, y: e.clientY, t, hue })
})

useRafFn(() => {
  const t = performance.now()
  now.value = t
  const cutoff = t - LIFETIME
  let i = 0
  while (i < points.value.length && points.value[i]!.t < cutoff) i++
  if (i > 0) points.value.splice(0, i)
})

onMounted(() => {
  document.documentElement.classList.add('vue-cursor')
})
onUnmounted(() => {
  document.documentElement.classList.remove('vue-cursor')
})

const pathData = computed(() => {
  const pts = points.value
  if (pts.length < 2) return ''
  let d = `M${pts[0]!.x},${pts[0]!.y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`
  }
  return d
})

const head = computed(() => points.value.at(-1) ?? null)

const layers = computed(() => {
  const N = FADE_LAYERS
  const baseHue = head.value?.hue ?? 0
  const out: { dasharray: string, dashoffset: number, opacity: number, width: number, hue: number }[] = []
  // Tiny overlap between slices so seams don't show
  const slice = 1 / N
  const overlap = slice * 0.15
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N // 0 = tail, 1 = head
    out.push({
      dasharray: `${slice + overlap} 1`,
      dashoffset: -(i * slice),
      opacity: 0.95 * t,
      width: 2 + 8 * t,
      hue: (baseHue - (1 - t) * 70 + 360) % 360,
    })
  }
  return out
})
</script>

<template>
  <div class="trail-layer">
    <svg class="trail-svg">
      <path
        v-for="(layer, i) in layers"
        :key="i"
        :d="pathData"
        :stroke="`hsl(${layer.hue} 100% 65%)`"
        :stroke-width="layer.width"
        :stroke-opacity="layer.opacity"
        fill="none"
        pathLength="1"
        :stroke-dasharray="layer.dasharray"
        :stroke-dashoffset="layer.dashoffset"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        v-if="head"
        :cx="head.x"
        :cy="head.y"
        r="6"
        :fill="`hsl(${head.hue} 100% 65%)`"
      />
    </svg>
  </div>
</template>

<style>
.vue-cursor,
.vue-cursor * {
  cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-40 -40 340 310' width='24' height='24'><g transform='rotate(135 130.88 113.35)'><path d='M161.096.001l-30.224 52.35L100.647.001H0l130.877 226.688L261.749.001z' fill='%2341b883'/><path d='M161.096.001l-30.224 52.35L100.647.001H52.346l78.526 136.01L209.398.001z' fill='%2334495e'/></g></svg>") 4 2, auto !important;
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

.trail-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
