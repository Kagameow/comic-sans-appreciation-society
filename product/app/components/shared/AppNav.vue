<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'inline' | 'stacked' }>(), { variant: 'inline' })
defineEmits<{ (e: 'navigate'): void }>()

const route = useRoute()
const { isAdmin } = useAuthSession()

// /check uses transient posture (docs/refactor-plan.md §1.1) — one primary
// action, no nav distractions. The nav still renders inside the slideover
// (hamburger), just not in the desktop header on that route.
const isCheckRoute = computed(() => route.path === '/')

const items = computed(() => [
  { to: '/', label: 'git status', icon: 'i-lucide-terminal', show: true },
  { to: '/tv', label: 'pipeline', icon: 'i-lucide-tv', show: true },
  { to: '/admin', label: 'maintainer', icon: 'i-lucide-shield', show: isAdmin.value },
].filter(n => n.show))
</script>

<template>
  <nav
    :class="variant === 'stacked'
      ? 'flex flex-col gap-1'
      : ['items-center gap-1', isCheckRoute ? 'hidden' : 'hidden md:flex']"
  >
    <NuxtLink
      v-for="n in items"
      :key="n.to"
      :to="n.to"
      class="flex items-center font-mono uppercase tracking-[0.04em] transition-colors" :class="[
        variant === 'stacked'
          ? 'gap-3 px-3 py-2.5 text-base'
          : 'gap-2 px-3 py-1.5 text-xs',
        route.path === n.to
          ? 'bg-[color:var(--surface-deep)] text-[color:var(--vue)] border border-[color:var(--line-hot)]'
          : 'text-[color:var(--ink-muted)] hover:text-[color:var(--ink-body)] border border-transparent hover:border-[color:var(--line)]',
      ]"
      @click="$emit('navigate')"
    >
      <UIcon :name="n.icon" :class="variant === 'stacked' ? 'h-5 w-5' : 'h-3.5 w-3.5'" />
      {{ n.label }}
    </NuxtLink>
  </nav>
</template>
