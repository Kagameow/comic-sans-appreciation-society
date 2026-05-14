<script setup lang="ts">
const count = ref<number | null>(null)
const isFallback = ref(false)

const digits = computed(() => {
  const num = count.value ?? 0
  return String(num).padStart(7, '0').split('')
})

onMounted(async () => {
  try {
    const data = await $fetch('/api/counter')
    count.value = data.count
    isFallback.value = !!data.fallback
  }
  catch {
    count.value = 42069
    isFallback.value = true
  }
})
</script>

<template>
  <div class="hit-counter">
    <div class="hit-counter__label">
      YOU ARE VISITOR #
    </div>
    <div class="hit-counter__digits">
      <span v-for="(d, i) in digits" :key="i" class="hit-counter__digit">
        {{ d }}
      </span>
    </div>
    <div v-if="isFallback" class="hit-counter__note">
      (counter machine broke)
    </div>
  </div>
</template>

<style scoped>
.hit-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 1rem 0;
}

.hit-counter__label {
  font-family: var(--font-body);
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #aaa;
}

.hit-counter__digits {
  display: flex;
  gap: 2px;
}

.hit-counter__digit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 40px;
  background: #111;
  border: 1px solid #333;
  border-radius: 3px;
  color: #33ff33;
  font-family: 'Comic Mono', 'Courier New', monospace;
  font-size: 22px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(51, 255, 51, 0.6);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.05);
}

.hit-counter__note {
  font-family: var(--font-body);
  font-size: 10px;
  color: #666;
  font-style: italic;
}
</style>
