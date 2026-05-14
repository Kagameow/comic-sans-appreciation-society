<script setup lang="ts">
import { APP_QUOTE, APP_VERSION } from '#shared/constants/game'

// docs/voice.md §7 + design-system.md §4 — the protected 8-second sequence.
// Timeline is owned by useMasterMergeBroadcast(); this component renders
// its slice and draws the particle burst on the canvas at t=4.8s.

const props = defineProps<{ name: string }>()
const emit = defineEmits<{ (e: 'dismiss'): void }>()

const broadcast = useMasterMergeBroadcast()

onMounted(() => broadcast.play({ name: props.name, at: Date.now() }))
watch(() => props.name, n => broadcast.play({ name: n, at: Date.now() }))

const canvasEl = ref<HTMLCanvasElement | null>(null)
const headlineEl = ref<HTMLDivElement | null>(null)

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

const particles: Particle[] = []
let raf = 0

function spawnBurst() {
  const canvas = canvasEl.value
  const headline = headlineEl.value
  if (!canvas || !headline)
    return
  const rect = headline.getBoundingClientRect()
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  // 60 particles, half vue half amber, random 360° cone (design §4)
  for (let i = 0; i < 60; i++) {
    const a = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 6
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 1,
      color: i % 2 === 0 ? '#42b883' : '#f5a623',
    })
  }
  if (!raf)
    tick()
}

function tick() {
  const canvas = canvasEl.value
  if (!canvas)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]!
    p.vy += 0.06 // gravity per spec
    p.vx *= 0.94
    p.vy *= 0.94
    p.x += p.vx
    p.y += p.vy
    p.life -= 1 / 84 // ~1.4s at 60fps
    if (p.life <= 0) {
      particles.splice(i, 1)
      continue
    }
    ctx.globalAlpha = Math.max(0, p.life)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  if (particles.length) {
    raf = requestAnimationFrame(tick)
  }
  else {
    cancelAnimationFrame(raf)
    raf = 0
  }
}

watch(() => broadcast.fireParticles.value, () => spawnBurst())

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  particles.length = 0
})

const isFlickering = computed(() => broadcast.stage.value === 'flicker')
const showBanner = computed(() => ['banner', 'headline', 'particles', 'tag', 'wellplayed'].includes(broadcast.stage.value))
const showHeadline = computed(() => ['headline', 'particles', 'tag', 'wellplayed', 'settled'].includes(broadcast.stage.value))
const showTag = computed(() => ['tag', 'wellplayed', 'settled'].includes(broadcast.stage.value))
const showWellPlayed = computed(() => ['wellplayed', 'settled'].includes(broadcast.stage.value))

const dim = computed(() => broadcast.stage.value !== 'settled' && broadcast.stage.value !== 'idle')

const bannerLines = [
  '> Verifying deploy key...',
  '> Authentication successful',
  '> Resolving merge conflicts... none found',
  '> Running final test suite...',
  '> ✓ 847 tests passing',
  '> Preparing to merge into main...',
]
</script>

<template>
  <!-- Full-screen overlay. Click anywhere AFTER settled to dismiss. -->
  <div
    class="fixed inset-0 z-50 flex flex-col items-center justify-center p-8" :class="[
      isFlickering ? 'animate-flicker' : '',
    ]"
    @click="broadcast.stage.value === 'settled' && emit('dismiss')"
  >
    <!-- Backdrop dims the leaderboard underneath -->
    <div
      class="absolute inset-0 transition-opacity duration-200" :class="[
        dim ? 'bg-[color:var(--bg)]/85' : 'bg-[color:var(--bg)]/0 pointer-events-none',
      ]"
    />

    <!-- Particle canvas (full screen) -->
    <canvas ref="canvasEl" class="pointer-events-none absolute inset-0 z-10" />

    <div class="relative z-20 text-center max-w-4xl">
      <!-- Boot banner — type-ins one line at a time -->
      <div v-if="showBanner" class="font-mono text-base sm:text-xl text-[color:var(--vue)] text-left mb-8 max-w-md mx-auto space-y-1">
        <div
          v-for="(line, i) in bannerLines"
          :key="line"
          class="animate-type-in"
          :style="{
            '--type-in-steps': line.length,
            '--type-in-duration': '300ms',
            'animation-delay': `${i * 200}ms`,
            'animation-fill-mode': 'both',
          }"
        >
          {{ line }}
        </div>
      </div>

      <!-- Headline -->
      <div v-if="showHeadline" ref="headlineEl">
        <div class="font-display text-2xl sm:text-4xl text-[color:var(--amber)] mb-2 uppercase tracking-[0.04em]">
          WINNER
        </div>
        <h1 class="font-display text-5xl sm:text-7xl md:text-8xl text-[color:var(--ink)] mb-4 glow-hot animate-charge-in leading-tight">
          {{ name }}
        </h1>
        <div class="font-display text-3xl sm:text-5xl text-[color:var(--vue)] animate-digit-roll">
          MERGED TO PRODUCTION
        </div>
        <p class="mt-4 font-mono text-sm sm:text-base text-[color:var(--ink-body)]">
          Vue 3 migration complete. Options API officially deprecated.
        </p>
      </div>

      <div v-if="showTag" class="mt-6 font-mono text-sm text-[color:var(--ink-muted)] animate-fade-in">
        &gt; git tag {{ APP_VERSION }} — released to the world
      </div>

      <div v-if="showWellPlayed" class="mt-4 font-mono text-sm text-[color:var(--vue)] animate-type-in space-y-0.5" :style="{ '--type-in-steps': 60, '--type-in-duration': '1100ms' }">
        <div>&gt; well played, {{ name }}.</div>
        <div>&gt; the migration is complete.</div>
      </div>

      <p v-if="broadcast.stage.value === 'settled'" class="mt-8 font-mono text-[11px] text-[color:var(--ink-muted)]/70 animate-fade-in">
        “{{ APP_QUOTE }}” &mdash; click to return
      </p>
    </div>
  </div>
</template>
