<script setup lang="ts">
interface Props {
  text: string
  tag?: 'h1' | 'h2' | 'h3' | 'span'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  arc?: boolean
}

withDefaults(defineProps<Props>(), {
  tag: 'h1',
  size: 'lg',
  arc: false,
})
</script>

<template>
  <component
    :is="tag"
    class="wordart" :class="[
      `wordart--${size}`,
      { 'wordart--arc': arc },
    ]"
  >
    <span class="wordart__text" :data-text="text">{{ text }}</span>
  </component>
</template>

<style scoped lang="scss">
.wordart {
  display: inline-block;
  line-height: 1.1;
  font-family: 'Comic Neue', 'Impact', 'Arial Black', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  position: relative;

  &--sm { font-size: clamp(1.25rem, 3vw, 1.75rem); }
  &--md { font-size: clamp(1.75rem, 4vw, 2.5rem); }
  &--lg { font-size: clamp(2.5rem, 6vw, 4rem); }
  &--xl { font-size: clamp(3.5rem, 8vw, 5.5rem); }

  &--arc {
    .wordart__text {
      display: inline-block;
      transform: perspective(500px) rotateX(8deg);
    }
  }
}

.wordart__text {
  position: relative;
  display: inline-block;

  background: linear-gradient(
    180deg,
    #ff0000 0%,
    #ff8800 16%,
    #ffff00 33%,
    #00cc00 50%,
    #0066ff 66%,
    #8833ff 83%,
    #ff00ff 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;

  filter: drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.8))
          drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.5));

  &::before {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    -webkit-text-stroke: 2px rgba(0, 0, 0, 0.7);
    color: transparent;
    z-index: -1;
  }
}
</style>
