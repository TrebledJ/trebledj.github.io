<template>
  <!-- <p>{{hierarchy}}</p> -->
  <div v-if="hierarchy.length" class="breadcrumbs">
    <template v-for="(item, index) in hierarchy" :key="index">
      <span 
        class="crumb" 
        :class="{ 
          active: index === hierarchy.length - 1,
          parent: index < hierarchy.length - 1 
        }"
      >
        {{ item }}
      </span>
      <span v-if="index < hierarchy.length - 1" class="separator">›</span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()

const hierarchy = computed(() => {
    // return JSON.stringify(Object.keys($slidev.nav), null, 2);
  const currentSlideNo = $slidev.nav.currentSlideNo;
  const currentSlide = $slidev.nav.slides[currentSlideNo - 1];
  const fm = currentSlide.meta.slide.frontmatter;
  const parts = []
  
  if (fm.part) parts.push(fm.part)
  if (fm.chapter) parts.push(fm.chapter)
  if (fm.section) parts.push(fm.section)
  if (fm.subsection) parts.push(fm.subsection)
  return parts
})
</script>

<style scoped>
.breadcrumbs {
  position: fixed;
  bottom: 8px;
  /* left: 50%; */
  left: 2.5rem;
  /* transform: translateX(-50%); */
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  opacity: 0.72;
  /* background: rgba(0, 0, 0, 0.6); */
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 400;
  z-index: 100;
  color: rgba(255, 255, 255);
  pointer-events: none;
  user-select: none;
}

.crumb {
  transition: all 0.3s ease;
  padding: 2px 4px;
  border-radius: 4px;
  /* opacity: 0.72; */
}

.crumb.parent {
  color: rgba(255, 255, 255, 0.5);
}

.crumb.active {
  color: #fff;
  background: rgba(70, 130, 255, 0.25);
  padding: 2px 10px;
}

.separator {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin: 0 2px;
}
</style>