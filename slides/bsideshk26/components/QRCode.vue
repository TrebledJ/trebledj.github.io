<template>
  <div v-if="0 < $page && $page < 11" class="qrcode-wrapper" :class="{ 'dark-mode': isDark }">
    <div class="qrcode-container">
      <div class="qrcode-content">
        <div class="qrcode-text">
          <span class="label">Scan to View Slides (~12MB)</span>
          <!-- <span class="url">{{ shortUrl }}</span> -->
        </div>
        <div class="qrcode-image" v-html="qrCodeSVG"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDark } from '@vueuse/core'

// Detect dark mode
const isDark = useDark()

// Your presentation URL - replace with your actual URL
const fullUrl = 'https://trebledj.me/talks/pdfs/bsideshk26.pdf';
// const shortUrl = ref('bit.ly/slides-2024')

// Generate QR Code using qrcode library
import QRCode from 'qrcode'

const qrCodeSVG = ref('')

onMounted(async () => {
  try {
    // Generate QR code as SVG
    qrCodeSVG.value = await QRCode.toString(fullUrl, {
      type: 'svg',
      width: 360,
      height: 360,
      color: {
        dark: isDark.value ? '#ffffff' : '#1e293b',
        light: isDark.value ? '#1e293b' : '#ffffff'
      },
      margin: 2,
      errorCorrectionLevel: 'H'
    })
  } catch (err) {
    console.error('Failed to generate QR code:', err)
  }
})
</script>

<style scoped>
.qrcode-wrapper {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 100;
  animation: slideIn 0.5s ease-out;
}

.qrcode-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.qrcode-container:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
}

.qrcode-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* gap: 12px; */
}

.qrcode-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.qrcode-image :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.qrcode-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 100px;
}

.icon {
  font-size: 20px;
}

.label {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.url {
  font-size: 11px;
  color: #64748b;
  font-family: monospace;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
  transition: all 0.2s;
}

.url:hover {
  background: #e2e8f0;
  color: #334155;
}

/* Dark mode styles */
.qrcode-wrapper.dark-mode .qrcode-container {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.qrcode-wrapper.dark-mode .label {
  color: #f1f5f9;
}

.qrcode-wrapper.dark-mode .url {
  background: #1e293b;
  color: #94a3b8;
}

.qrcode-wrapper.dark-mode .url:hover {
  background: #334155;
  color: #cbd5e1;
}

/* Animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive adjustments */
/* @media (max-width: 768px) {
  .qrcode-wrapper {
    bottom: 70px;
    right: 10px;
  }
  
  .qrcode-content {
    gap: 8px;
  }
  
  .qrcode-image {
    width: 60px;
    height: 60px;
  }
  
  .label {
    font-size: 11px;
  }
  
  .url {
    font-size: 10px;
  }
} */
</style>