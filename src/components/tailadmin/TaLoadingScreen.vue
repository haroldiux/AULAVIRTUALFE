<template>
  <div
    class="ta-loading"
    :class="[
      $q.dark.isActive ? 'ta-loading--dark' : 'ta-loading--light',
      { 'ta-loading--visible': visible }
    ]"
  >
    <div class="ta-loading__content">
      <!-- Logo -->
      <div class="ta-loading__logo">
        <q-icon name="school" size="40px" color="white" />
      </div>

      <!-- Barras ecualizador -->
      <div class="ta-loading__bars">
        <div class="ta-loading__bar" />
        <div class="ta-loading__bar" />
        <div class="ta-loading__bar" />
        <div class="ta-loading__bar" />
        <div class="ta-loading__bar" />
      </div>

      <!-- Texto -->
      <p class="ta-loading__text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'

defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, default: 'Cargando' },
})

const $q = useQuasar()
</script>

<style scoped>
.ta-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.ta-loading--visible {
  opacity: 1;
  pointer-events: auto;
}

.ta-loading--light {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.ta-loading--dark {
  background: rgba(11, 17, 33, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.ta-loading__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Logo */
.ta-loading__logo {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: var(--gradient-unitepc);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.25);
  animation: logoPulse 1.8s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* Barras */
.ta-loading__bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 48px;
}

.ta-loading__bar {
  width: 8px;
  border-radius: 4px;
  background: linear-gradient(180deg, #6B3FA0 0%, #0D9488 100%);
  height: 16px;
  animation: barBounce 0.7s ease-in-out infinite alternate;
}

.ta-loading__bar:nth-child(1) { animation-delay: 0s; opacity: 0.5; }
.ta-loading__bar:nth-child(2) { animation-delay: 0.12s; opacity: 0.6; }
.ta-loading__bar:nth-child(3) { animation-delay: 0.24s; opacity: 0.7; }
.ta-loading__bar:nth-child(4) { animation-delay: 0.36s; opacity: 0.8; }
.ta-loading__bar:nth-child(5) { animation-delay: 0.48s; opacity: 0.9; }

@keyframes barBounce {
  0% { transform: scaleY(1); }
  100% { transform: scaleY(3.25); }
}

/* Texto */
.ta-loading__text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #475569;
  margin: 0;
}

.body--dark .ta-loading__text {
  color: #cbd5e1;
}
</style>
