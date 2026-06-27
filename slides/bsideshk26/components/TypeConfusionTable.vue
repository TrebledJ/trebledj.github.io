<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    required: true
  },
  actualTypeOverall: {
    type: String,
    default: ''
  },
  confusedTypeOverall: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})

// Color mapping
const colorMap = {
  yellow: '#facc15',
  red: '#f87171',
  green: '#4ade80',
  blue: '#7ab7ff',
  gray: '#6b7280',
  white: '#e8f0fe',
  purple: '#a78bfa',
  pink: '#f472b6'
}

const getColor = (colorName) => {
  return colorMap[colorName] || colorName || '#e8f0fe'
}

// Process rows with auto-calculated offsets
let currentOffset = 0
const processedRows = computed(() => {
  const result = []
  for (const row of props.rows) {
    let offset = row.offset
    if (offset === undefined || offset === null) {
      offset = '0x' + currentOffset.toString(16).padStart(2, '0').toUpperCase()
    } else {
      const offsetNum = parseInt(offset, 16)
      currentOffset = offsetNum
    }
    result.push({
      ...row,
      offset
    })
    if (row.size !== undefined) {
      currentOffset += row.size
    }
  }
  return result
})
</script>

<template>
  <div class="type-confusion-table">
    <h2 v-if="title" class="text-2xl font-bold mb-6" style="color: #7ab7ff;">
      {{ title }}
    </h2>
    
    <div class="memory-table">
      <!-- Header with 5 columns -->
      <div class="memory-header">
        <span class="col-value">Value</span>
        <!-- <span class="">Field</span> -->
        <span class="col-actual">
          <span v-if="actualTypeOverall" class="annotation">
            {{ actualTypeOverall }}
          </span>
          Intended
        </span>
        <span class="col-confused">Confused
          <span v-if="confusedTypeOverall" class="annotation">
            {{ confusedTypeOverall }}
          </span>
        </span>
        <span class="col-offset">Size</span>
        <span class="col-offset">Offset</span>
      </div>
      
      <!-- Rows -->
      <div
        v-for="(row, index) in processedRows"
        :key="index"
        class="memory-row"
        :style="{
          minHeight: (row.height || 1) * 3 + 'rem',
          borderLeft: row.color ? `4px solid ${getColor(row.color)}` : '4px solid transparent'
        }"
      >
        <span class="col-value font-mono text-sm" :style="{ color: row.color ? getColor(row.color) : '#e8f0fe' }">
          <span v-if="row.value">{{ row.value }}</span>
        </span>
        <span class="col-actual">
          <span v-if="row.actualType">{{ row.actualType }}</span>
          &nbsp;
          <span class="field-name">{{ row.field }}</span>
        </span>
        <!-- <span class="col-actual font-mono text-sm" style="color: #4ade80;">
        </span> -->
        <span class="col-confused font-mono text-sm" style="color: #f87171;">
          <span v-if="row.confusedField" class="field-name">{{ row.confusedField }}</span>
          &nbsp;
          <span v-if="row.confusedType">{{ row.confusedType }}</span>
        </span>
        <span class="col-offset font-mono text-sm">
          {{ row.size }} bytes
        </span>
        <span class="col-offset font-mono text-sm">
          {{ row.offset }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.type-confusion-table {
  width: 100%;
  max-width: 5xl;
}

.memory-table {
  border: 1px solid rgba(70, 130, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  
  font-family: 'JetBrains Mono', monospace;
}

.memory-header, .memory-row {
  display: grid;
  grid-template-columns: 1.5fr 2.5fr 2.2fr 0.75fr 0.75fr;
  gap: 0.75rem;
}

.memory-header {
  padding: 0.5rem 1.5rem;
  background: rgba(70, 130, 255, 0.1);
  border-bottom: 1px solid rgba(70, 130, 255, 0.2);
  color: #7ab7ff;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.memory-row {
  gap: 0.75rem;
  /* padding: 0.5rem 1.5rem; */
  padding: 0 1.5rem;
  padding-left: calc(1.5rem - 4px);
  align-items: center;
  border-bottom: 1px solid rgba(70, 130, 255, 0.05);
  transition: background 0.2s;
  min-height: 3rem;
}

.memory-row:nth-child(2n) {
  background: #12306188;
}

.memory-row:last-child {
  border-bottom: none;
}

.memory-row:hover {
  background: rgba(70, 130, 255, 0.05);
}

.col-offset, .col-value, .col-actual, .col-confused {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.col-offset {
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
}

.col-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  word-break: break-all;
}
/* 
.col-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  color: #e8f0fe;
  font-size: 0.8rem;
} */

.field-name {
  font-weight: 600;
  color: #e8f0fe;
}

.field-type {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: 'JetBrains Mono', monospace;
}

.annotation {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  background: rgba(70, 130, 255, 0.1);
  border: 1px solid rgba(70, 130, 255, 0.15);
  font-weight: 500;
  white-space: nowrap;
  text-transform: none;
}

.col-actual {
  color: #4ade80;
  text-align: right;
  padding-right: 1rem;
  border-right: 1px solid rgba(70, 130, 255, 1);
}

.col-confused {
  color: #f87171;
}

.col-actual, .col-confused {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
}
</style>