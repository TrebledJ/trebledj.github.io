<script setup>
const props = defineProps({
  text: {
    type: String,
    default: 'Example'
  },
  color: {
    type: String,
    default: 'blue',
    validator: (val) => ['blue', 'red', 'green', 'yellow', 'purple', 'pink', 'gray'].includes(val)
  }
})

const colorMap = {
  blue: { bg: '#3b82f6', text: '#ffffff' },
  red: { bg: '#ef4444', text: '#ffffff' },
  green: { bg: '#127938', text: '#ffffff' },
  yellow: { bg: '#eab308', text: '#000000' },
  purple: { bg: '#a825f7', text: '#ffffff' },
  pink: { bg: '#ec4899', text: '#ffffff' },
  gray: { bg: '#6b7280', text: '#ffffff' }
}

const colors = colorMap[props.color] || colorMap.blue
</script>

<template>
  <div 
    class="ribbon-banner"
    :style="{
      '--ribbon-bg': colors.bg,
      '--ribbon-text': colors.text
    }"
  >
    {{ text }}
  </div>
</template>

<style scoped>
.ribbon-banner {
  position: fixed;
  /* top: 16%;
  right: -1%; */
  top: 0;
  right: 0;
  padding: 0.5rem 4rem;
  background: var(--ribbon-bg);
  color: var(--ribbon-text);
  font-weight: 700;
  font-size: 1em;
  text-transform: uppercase;
  /* text-align: center; */
  letter-spacing: 0.05em;
  /* transform: rotate(45deg) translate(15%, -15%); */
  transform: translate(-22%, 115%) rotate(45deg) translate(50%, -50%);
  transform-origin: top right;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); */
  pointer-events: none;
  z-index: 50;
  white-space: nowrap;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Optional: Add a subtle border */
.ribbon-banner::before {
  content: '';
  position: absolute;
  inset: 2px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  pointer-events: none;
}
</style>