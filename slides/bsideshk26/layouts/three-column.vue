<template>
  <div class="slidev-layout three-column">
    <div class="relative flex flex-col">
      <!-- Default slot for title/content above columns -->
      <div class="flex-none">
        <slot />
      </div>
      
      <!-- Three columns -->
      <div class="flex-1 mt-2 flex items-center justify-center" :style="{ alignItems: verticalAlign }">
        <div class="w-full max-w-7xl grid grid-cols-3 gap-8">
          <div class="col">
            <slot name="left" />
          </div>
          <div class="col">
            <slot name="center" />
          </div>
          <div class="col">
            <slot name="right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  align: {
    type: String,
    default: 'center',
    validator: (val) => ['top', 'center', 'bottom'].includes(val)
  }
})

const verticalAlign = computed(() => {
  const map = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end'
  }
  return map[props.align] || 'center'
})
</script>

<style scoped>
.col {
  color: #e8f0fe;
}

.col h3 {
  color: #7ab7ff;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.col ul {
  list-style: none;
  padding: 0;
}

.col li {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(70, 130, 255, 0.1);
}
</style>