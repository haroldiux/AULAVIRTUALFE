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
  padding: 18px 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(107, 63, 160, 0.92) 0%, rgba(13, 148, 136, 0.92) 100%);
  box-shadow: 0 12px 32px rgba(20, 28, 45, 0.12);
}

.ta-page-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  font-size: 1.45rem;
  font-weight: 850;
  line-height: 1.2;
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
