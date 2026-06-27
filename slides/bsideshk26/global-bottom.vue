<!-- global-bottom.vue -->
<template>
  <div class="geometric-shapes">
    <div
      v-for="shape in shapes"
      :key="shape.id"
      class="shape"
      :class="shape.className"
      :style="{
        top: shape.top,
        left: shape.left,
        right: shape.right,
        bottom: shape.bottom,
        width: shape.width || '0',
        height: shape.height || '0',
        borderLeft: shape.borderLeft,
        borderRight: shape.borderRight,
        borderTop: shape.borderTop,
        borderBottom: shape.borderBottom,
        background: shape.background,
        transform: getShapeTransform(shape),
        transition: 'transform 2s cubic-bezier(0.22, 1, 0.36, 1)',
      }"
    >
      <!-- <p>{{shape.id}}</p> -->
    </div>
  </div>
  <QRCode v-if="should_show_qrcode" />
  <Breadcrumbs />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useSlideContext } from '@slidev/client'

const { $slidev } = useSlideContext()
const EXPORT = false;
const should_show_qrcode = ref(!EXPORT);

// Get current slide number
const slideNumber = computed(() => {
  if (EXPORT)
    return 0;
  return $slidev.nav.currentPage || 0
})

// Color palette: different shades of blue
// Each shade is [opacity, label] for reference
const shades = {
  light: 0.15,
  mid: 0.24,
  dark: 0.32,
}

const size2dist = (size) => {
  // Distance derived from size: smaller = closer (faster)
  // Map size 40-120 to distance 7-1
  const distance = Math.max(1, Math.min(7, Math.round(6 - (size - 40) / 20)))
  return distance
}

// Helper to create triangle shapes
const triangle = ({ id, position, size, shade = 'mid', rotation = 0 }) => {
  const height = size
  const sides = size / 1.732
  const opacity = shades[shade] || 0.2
  const colorStr = `rgba(70, 130, 255, ${opacity})`
  
  // Determine which side the triangle points to
  const isPointingDown = position.pointing === 'down'
  const isPointingUp = position.pointing === 'up'
  
  const distance = size2dist(height)
  
  return {
    id: `triangle-${id}`,
    className: 'shape-triangle',
    top: position.top,
    left: position.left,
    right: position.right,
    bottom: position.bottom,
    borderLeft: `${sides}px solid transparent`,
    borderRight: `${sides}px solid transparent`,
    borderTop: isPointingDown ? `${height}px solid ${colorStr}` : undefined,
    borderBottom: isPointingUp ? `${height}px solid ${colorStr}` : undefined,
    baseRotation: rotation,
    distance: distance,
    size: size,
    shade: shade,
  }
}

// Helper to create square shapes
const square = ({ id, position, size, shade = 'mid', rotation = 0 }) => {
  const opacity = shades[shade] || 0.2
  
  const distance = size2dist(size)
  
  return {
    id: `square-${id}`,
    className: 'shape-square',
    top: position.top,
    left: position.left,
    right: position.right,
    bottom: position.bottom,
    width: `${size}px`,
    height: `${size}px`,
    background: `rgba(70, 130, 255, ${opacity})`,
    baseRotation: rotation,
    distance: distance,
    size: size,
    shade: shade,
  }
}

const shapes = [
  // === TRIANGLES ===
  triangle({
    id: 'tr',
    position: { top: '5%', right: '5%', pointing: 'down' },
    size: 160,
    shade: 'light',
    rotation: 15,
  }),
  triangle({
    id: 'bl',
    position: { bottom: '25%', left: '30%', pointing: 'up' },
    size: 120,
    shade: 'light',
    rotation: -20,
  }),
  triangle({
    id: 'tl',
    position: { top: '15%', left: '8%', pointing: 'down' },
    size: 60,
    shade: 'light',
    rotation: 45,
  }),
  triangle({
    id: 'br',
    position: { bottom: '15%', right: '8%', pointing: 'up' },
    size: 70,
    shade: 'mid',
    rotation: -25,
  }),
  triangle({
    id: 'cl',
    position: { top: '45%', left: '3%', pointing: 'down' },
    size: 40,
    shade: 'dark',
    rotation: 60,
  }),
  triangle({
    id: 'cr',
    position: { top: '45%', right: '3%', pointing: 'up' },
    size: 45,
    shade: 'dark',
    rotation: -40,
  }),
  
  // More triangles spread out
  triangle({
    id: 'tl-far',
    position: { top: '2%', left: '25%', pointing: 'up' },
    size: 80,
    shade: 'light',
    rotation: 20,
  }),
  triangle({
    id: 'br-far',
    position: { bottom: '2%', right: '25%', pointing: 'down' },
    size: 90,
    shade: 'light',
    rotation: -15,
  }),

  // === SQUARES ===
  square({
    id: 'tr',
    position: { top: '20%', right: '30%' },
    size: 105,
    shade: 'light',
    rotation: 30,
  }),
  square({
    id: 'bl',
    position: { bottom: '5%', left: '8%' },
    size: 160,
    shade: 'mid',
    rotation: -60,
  }),
  square({
    id: 'tl',
    position: { top: '35%', left: '35%' },
    size: 80,
    shade: 'mid',
    rotation: 50,
  }),
  square({
    id: 'br',
    position: { bottom: '35%', right: '35%' },
    size: 40,
    shade: 'dark',
    rotation: -35,
  }),
  square({
    id: 'center',
    position: { top: '45%', left: '45%' },
    size: 45,
    shade: 'mid',
    rotation: 15,
  }),
  
  // More squares spread out
  square({
    id: 'tl-far',
    position: { top: '5%', left: '50%' },
    size: 55,
    shade: 'mid',
    rotation: 10,
  }),
  square({
    id: 'br-far',
    position: { bottom: '5%', right: '50%' },
    size: 50,
    shade: 'mid',
    rotation: -10,
  })
]

if (!EXPORT)
  shapes.push(
    triangle({
      id: 'tr-edge',
      position: { top: '8%', right: '-20%', pointing: 'down' },
      size: 50,
      shade: 'light',
      rotation: 35,
    }),
    triangle({
      id: 'bl-edge',
      position: { bottom: '12%', left: '-20%', pointing: 'up' },
      size: 95,
      shade: 'light',
      rotation: -30,
    }),
    triangle({
      id: 'right-mid',
      position: { top: '45%', right: '-20%', pointing: 'up' },
      size: 40,
      shade: 'mid',
      rotation: 50,
    }),
    triangle({
      id: 'right-bottom',
      position: { bottom: '-10%', right: '-15%', pointing: 'down' },
      size: 140,
      shade: 'mid',
      rotation: -45,
    }),
    triangle({
      id: 'right-top',
      position: { top: '35%', right: '-45%', pointing: 'up' },
      size: 65,
      shade: 'mid',
      rotation: 30,
    }),
    triangle({
      id: 'right-far-bottom',
      position: { bottom: '35%', right: '-50%', pointing: 'down' },
      size: 55,
      shade: 'mid',
      rotation: -55,
    }),
    triangle({
      id: 'right-1',
      position: { bottom: '35%', right: '-120%', pointing: 'down' },
      size: 50,
      shade: 'mid',
      rotation: -40,
    }),
    square({
      id: 'right-2',
      position: { bottom: '50%', right: '-100%' },
      size: 70,
      shade: 'mid',
      rotation: 15,
    }),
    triangle({
      id: 'right-3',
      position: { top: '20%', right: '-10%', pointing: 'down' },
      size: 80,
      shade: 'dark',
      rotation: -20,
    }),
    triangle({
      id: 'right-4',
      position: { bottom: '8%', right: '-80%', pointing: 'up' },
      size: 67,
      shade: 'light',
      rotation: -20,
    }),
    triangle({
      id: 'far-right-3',
      position: { top: '40%', right: '-115%', pointing: 'down' },
      size: 70,
      shade: 'mid',
      rotation: -20,
    }),
    triangle({
      id: 'far-right-4',
      position: { bottom: '5%', right: '-150%', pointing: 'down' },
      size: 65,
      shade: 'mid',
      rotation: -85,
    }),
    triangle({
      id: 'far-right-5',
      position: { bottom: '50%', right: '-160%', pointing: 'down' },
      size: 45,
      shade: 'mid',
      rotation: -40,
    }),
    triangle({
      id: 'far-right-6',
      position: { bottom: '30%', right: '-170%', pointing: 'down' },
      size: 50,
      shade: 'mid',
      rotation: 15,
    }),
    triangle({
      id: 'far-right-7',
      position: { bottom: '25%', right: '-70%', pointing: 'up' },
      size: 112,
      shade: 'mid',
      rotation: 24,
    }),
    triangle({
      id: 'far-right-8',
      position: { bottom: '50%', right: '-150%', pointing: 'up' },
      size: 54,
      shade: 'mid',
      rotation: 58,
    }),
    square({
      id: 'far-right-6',
      position: { bottom: '10%', right: '-130%' },
      size: 45,
      shade: 'mid',
      rotation: 60,
    }),
    square({
      id: 'far-right-1',
      position: { bottom: '20%', right: '-100%' },
      size: 80,
      shade: 'dark',
      rotation: 50,
    }),
    square({
      id: 'far-right-2',
      position: { top: '20%', right: '-40%' },
      size: 160,
      shade: 'light',
      rotation: 10,
    }),
    square({
      id: 'right-1',
      position: { top: '70%', right: '-20%' },
      size: 70,
      shade: 'mid',
      rotation: 25,
    }),
    square({
      id: 'right-2',
      position: { bottom: '40%', right: '-30%' },
      size: 60,
      shade: 'mid',
      rotation: -25,
    }),
    square({
      id: 'right-3',
      position: { top: '15%', right: '-40%' },
      size: 90,
      shade: 'light',
      rotation: 40,
    }),
    square({
      id: 'left-edge',
      position: { top: '70%', left: '-15%' },
      size: 75,
      shade: 'mid',
      rotation: -15,
    }),
    square({
      id: 'right-4',
      position: { top: '65%', right: '-45%' },
      size: 45,
      shade: 'dark',
      rotation: 60,
    }),
    square({
      id: 'right-5',
      position: { bottom: '10%', right: '-55%' },
      size: 55,
      shade: 'mid',
      rotation: -40,
    }),
    square({
      id: 'right-6',
      position: { bottom: '40%', right: '-75%' },
      size: 70,
      shade: 'mid',
      rotation: -10,
    }),
    square({
      id: 'right-7',
      position: { top: '10%', right: '-65%' },
      size: 100,
      shade: 'mid',
      rotation: -25,
    }),
    square({
      id: 'right-8',
      position: { top: '10%', right: '-125%' },
      size: 75,
      shade: 'dark',
      rotation: -36,
    }),
    square({
      id: 'right-9',
      position: { top: '15%', right: '-125%' },
      size: 50,
      shade: 'dark',
      rotation: -75,
    }),
    square({
      id: 'right-10',
      position: { top: '30%', right: '-85%' },
      size: 60,
      shade: 'dark',
      rotation: -25,
    }),
    square({
      id: 'right-11',
      position: { top: '80%', right: '-135%' },
      size: 80,
      shade: 'dark',
      rotation: 78,
    }),
  )

// Calculate transform for a shape based on current slide
const getShapeTransform = (shape) => {
  const currentSlide = slideNumber.value
  if (currentSlide === 0) {
    return `rotate(${shape.baseRotation}deg)`
  }

  // Base shift: 15px per slide, max 400px total movement
  const baseShift = Math.min(currentSlide * 15, 1000)
  
  // Distance multiplier: far shapes (1) move 0.5x, near shapes (5) move 2x
  // Map distance 1-5 to multiplier 0.5-2.0
  const speedMultiplier = 0.5 + (shape.distance - 1) * 0.375
  
  // Apply speed to get final offset (negative = left)
  const xOffset = -(baseShift * speedMultiplier)
  
  // Slight vertical drift based on distance and slide number
  // Near shapes drift more, creating depth
  const verticalDrift = Math.sin(currentSlide * 0.05 + shape.distance) * (shape.distance * 2)
  
  // Rotation drift - more for near shapes, extra for small shapes
  let rotDrift = currentSlide * 0.02 * shape.distance
  
  // Extra rotation for smaller shapes (size < 60px)
  if (shape.size < 60) {
    rotDrift *= 1.5 // 50% more rotation for small shapes
  }
  
  return `translate(${xOffset}px, ${verticalDrift}px) rotate(${shape.baseRotation + rotDrift}deg)`
}
</script>

<style scoped>
.geometric-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
  opacity: 0.85; /* Use this to lower opacity across all shapes */
}

.shape {
  position: absolute;
  opacity: 0.25;
  will-change: transform;
}

/* Shared triangle styles */
.shape-triangle {
  width: 0;
  height: 0;
}

/* Shared square styles */
.shape-square {
  /* All square styles are applied via inline styles */
}
</style>