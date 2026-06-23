<template>
  <transition name="ta-loading-fade" mode="out-in">
    <div
      v-if="visible"
      class="ta-loading"
      :class="[$q.dark.isActive ? 'ta-loading--dark' : 'ta-loading--light']"
    >
      <div class="ta-loading__content">
        <!-- Logo UNITEPC -->
        <div class="ta-loading__logo">
          <div class="ta-loading__logo-mark">
            <q-icon name="school" size="36px" color="white" />
          </div>
          <div class="ta-loading__logo-ring" />
        </div>

        <!-- Marca -->
        <div class="ta-loading__brand">
          <div class="ta-loading__brand-name">UNITEPC</div>
          <div class="ta-loading__brand-tag">Aula Virtual</div>
        </div>

        <!-- Barras ecualizador -->
        <div class="ta-loading__bars">
          <div class="ta-loading__bar" />
          <div class="ta-loading__bar" />
          <div class="ta-loading__bar" />
          <div class="ta-loading__bar" />
          <div class="ta-loading__bar" />
        </div>

        <!-- Texto con puntos animados -->
        <p class="ta-loading__text">
          {{ message }}
          <span class="ta-loading__dots">
            <span />
            <span />
            <span />
          </span>
        </p>
      </div>
    </div>
  </transition>
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
  pointer-events: auto;
  transition: opacity 0.35s ease, backdrop-filter 0.35s ease;
}

.ta-loading--light {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.ta-loading--dark {
  background: rgba(11, 17, 33, 0.94);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.ta-loading__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

/* Logo */
.ta-loading__logo {
  position: relative;
  width: 84px;
  height: 84px;
  display: grid;
  place-items: center;
}

.ta-loading__logo-mark {
  position: relative;
  z-index: 2;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: var(--gradient-unitepc);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(13, 148, 136, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  animation: logoPulse 2s ease-in-out infinite;
}

.ta-loading__logo-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #6B3FA0;
  border-right-color: #0D9488;
  animation: logoSpin 1.4s linear infinite;
}

@keyframes logoPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

@keyframes logoSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Brand */
.ta-loading__brand {
  text-align: center;
  line-height: 1.1;
}

.ta-loading__brand-name {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #6B3FA0;
}

.body--dark .ta-loading__brand-name {
  color: #a78bfa;
}

.ta-loading__brand-tag {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #0D9488;
  margin-top: 2px;
}

.body--dark .ta-loading__brand-tag {
  color: #14b8a6;
}

/* Barras */
.ta-loading__bars {
  display: flex;
  align-items: flex-end;
  gap: 7px;
  height: 42px;
}

.ta-loading__bar {
  width: 7px;
  border-radius: 999px;
  background: linear-gradient(180deg, #6B3FA0 0%, #0D9488 100%);
  height: 14px;
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
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: #475569;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.body--dark .ta-loading__text {
  color: #cbd5e1;
}

.ta-loading__dots {
  display: inline-flex;
  gap: 3px;
}

.ta-loading__dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
  animation: dotPulse 1.2s infinite ease-in-out;
}

.ta-loading__dots span:nth-child(1) { animation-delay: 0s; }
.ta-loading__dots span:nth-child(2) { animation-delay: 0.2s; }
.ta-loading__dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-3px); }
}

/* Transicion */
.ta-loading-fade-enter-active,
.ta-loading-fade-leave-active {
  transition: opacity 0.35s ease;
}

.ta-loading-fade-enter-from,
.ta-loading-fade-leave-to {
  opacity: 0;
}
</style>
