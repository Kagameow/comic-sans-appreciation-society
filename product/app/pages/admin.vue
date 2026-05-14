<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

useGame()
</script>

<template>
  <div class="container mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
    <AdminPageHeader />
    <AdminMultiplierPanel />
    <AdminPlayersPanel />
    <AdminCodesPanel />
  </div>
</template>
