<script setup lang="ts">
const route = useRoute()
const { isAdmin } = useAuthSession()

const items = computed(() => [
  { to: '/',            label: 'Code Check',  icon: 'i-lucide-terminal', show: true },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'i-lucide-trophy',   show: true },
  { to: '/admin',       label: 'Admin',       icon: 'i-lucide-shield',   show: isAdmin.value },
].filter(n => n.show))
</script>

<template>
  <nav class="hidden md:flex items-center gap-1">
    <NuxtLink
      v-for="n in items"
      :key="n.to"
      :to="n.to"
      :class="[
        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
        route.path === n.to
          ? 'bg-emerald-500/15 text-emerald-300'
          : 'text-slate-400 hover:text-white hover:bg-white/5',
      ]"
    >
      <UIcon :name="n.icon" class="h-4 w-4" />
      {{ n.label }}
    </NuxtLink>
  </nav>
</template>
