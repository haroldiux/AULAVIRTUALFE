<template>
  <div class="ta-page-header q-mb-lg">
    <nav v-if="breadcrumbs && breadcrumbs.length" class="flex items-center q-gutter-xs text-caption q-mb-sm">
      <span v-for="(crumb, idx) in breadcrumbs" :key="idx" class="flex items-center q-gutter-xs">
        <span v-if="idx > 0" class="text-white" style="opacity: 0.55">/</span>
        <span class="text-white text-weight-medium" :style="{ opacity: idx === breadcrumbs.length - 1 ? 1 : 0.72 }">
          {{ crumb }}
        </span>
      </span>
    </nav>
    <div class="ta-page-header__row">
      <div>
        <div class="ta-page-header__eyebrow">Aula Virtual UNITEPC</div>
        <div class="ta-page-header__title">{{ title }}</div>
      </div>
      <div v-if="$slots.actions" class="flex items-center q-gutter-sm">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  breadcrumbs: { type: Array, default: () => [] },
})
</script>

<style scoped>
.ta-page-header {
  padding: 20px 24px;
  border: 1px solid rgba(255, 255, 255, 0.20);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(107, 63, 160, 0.92) 0%, rgba(13, 148, 136, 0.92) 100%),
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.20), transparent 30%);
  box-shadow: 0 18px 40px rgba(20, 28, 45, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.16);
  position: relative;
  overflow: hidden;
}
.ta-page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(255,255,255,0.12), transparent 40%, rgba(255,255,255,0.06) 70%, transparent);
  pointer-events: none;
}

.ta-page-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.ta-page-header__eyebrow {
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.ta-page-header__title {
  color: #ffffff;
  font-size: 1.55rem;
  font-weight: 850;
  line-height: 1.15;
}

@media (max-width: 599px) {
  .ta-page-header__row {
    display: block;
  }

  .ta-page-header__row > div:last-child {
    margin-top: 12px;
  }
}
</style>
