<script setup lang="ts">
import logoUrl from '~/assets/images/logo.png'

useHead({
  link: [{ rel: 'icon', type: 'image/png', href: logoUrl }],
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
