<template>
  <div class="marquee-bar">
    <marquee scrollamount="3">
      {{ messages.join(' ♥ ') }}
    </marquee>
  </div>
</template>

<script setup lang="ts">
const messages = [
  'This site best viewed in Netscape Navigator 4.0 at 800x600',
  'Please sign my guestbook!!!',
  'Webmaster: Spend Cloud Frontend Team 🍪 · now with 47% more Elari purple',
  '🔊 pshhkkkkkkrrrrkakingkakingkaaborrrring *ding ding ding*',
  'Tom: please use @pa-fe instead of pinging me directly',
  'No Jira tickets were created during the making of this website',
  'Vlada\'s longest office visit: 5 min. Purpose: telling Tom we\'re switching to React. Worth it.',
]
</script>

<style scoped>
.marquee-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9998;
  height: 36px;
  line-height: 36px;
  background: rgba(0, 0, 0, 0.85);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 24px;
  color: #e6c44c;
  font-family: var(--font-body);
  overflow: hidden;
}
</style>
