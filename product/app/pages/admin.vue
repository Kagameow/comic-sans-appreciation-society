<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

await useGameSync()
</script>

<template>
  <div class="container mx-auto max-w-6xl px-6 py-8 space-y-6">
    <AdminPageHeader />
    <AdminMultiplierPanel />
    <AdminPlayersPanel />
    <AdminCodesPanel />
  </div>
</template>
