<script setup lang="ts">
import logoUrl from '~/assets/images/logo.png'
</script>

<template>
  <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
    <img :src="logoUrl" alt="" class="h-9 w-9" />
    <span class="hidden sm:inline font-semibold tracking-tight">The Great Migration</span>
  </NuxtLink>
</template>
