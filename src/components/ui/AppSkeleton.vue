<template>
  <div class="app-skeleton" :class="`app-skeleton--${variant}`">
    <!-- Variante dashboard: hero + kpis + cards -->
    <template v-if="variant === 'dashboard'">
      <div class="as-hero skeleton-shimmer rounded-3xl" />
      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="i in kpis" :key="`kpi-${i}`" class="col-12 col-sm-6 col-lg-3">
          <div class="as-kpi-card skeleton-shimmer rounded-2xl" />
        </div>
      </div>
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-lg-8">
          <div class="as-chart-card skeleton-shimmer rounded-2xl" />
        </div>
        <div class="col-12 col-lg-4">
          <div class="as-chart-card skeleton-shimmer rounded-2xl" />
        </div>
      </div>
    </template>

    <!-- Variante card-grid: encabezado + grid de tarjetas -->
    <template v-else-if="variant === 'card-grid'">
      <div v-if="showHeader" class="as-section-header">
        <div class="as-title skeleton-shimmer rounded-md" />
        <div class="as-subtitle skeleton-shimmer rounded-md" />
      </div>
      <div class="row q-col-gutter-md">
        <div v-for="i in count" :key="`card-${i}`" class="col-12 col-md-6 col-lg-4">
          <div class="as-course-card skeleton-shimmer rounded-2xl">
            <div class="as-course-card__top" />
            <div class="as-course-card__body">
              <div class="as-line as-line--title skeleton-shimmer rounded-md" />
              <div class="as-line as-line--sm skeleton-shimmer rounded-md" />
              <div class="as-line as-line--md skeleton-shimmer rounded-md" />
            </div>
            <div class="as-course-card__footer">
              <div class="as-pill skeleton-shimmer rounded-md" />
              <div class="as-pill skeleton-shimmer rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Variante list: items de lista -->
    <template v-else-if="variant === 'list'">
      <div v-if="showHeader" class="as-section-header">
        <div class="as-title skeleton-shimmer rounded-md" />
        <div class="as-subtitle skeleton-shimmer rounded-md" />
      </div>
      <div class="as-list">
        <div v-for="i in count" :key="`list-${i}`" class="as-list-item">
          <div class="as-avatar skeleton-shimmer rounded-xl" />
          <div class="as-list-item__content">
            <div class="as-line as-line--title skeleton-shimmer rounded-md" />
            <div class="as-line as-line--sm skeleton-shimmer rounded-md" />
          </div>
          <div class="as-list-item__meta">
            <div class="as-pill skeleton-shimmer rounded-md" />
          </div>
        </div>
      </div>
    </template>

    <!-- Variante table: tabla -->
    <template v-else-if="variant === 'table'">
      <div class="as-table">
        <div class="as-table__header">
          <div v-for="c in columns" :key="`th-${c}`" class="as-cell skeleton-shimmer rounded-md" />
        </div>
        <div v-for="i in count" :key="`tr-${i}`" class="as-table__row">
          <div class="as-cell skeleton-shimmer rounded-md" />
          <div class="as-cell skeleton-shimmer rounded-md" />
          <div class="as-cell skeleton-shimmer rounded-md" />
          <div class="as-cell skeleton-shimmer rounded-md" />
          <div class="as-cell skeleton-shimmer rounded-md" />
        </div>
      </div>
    </template>

    <!-- Variante hero: solo el encabezado premium -->
    <template v-else-if="variant === 'hero'">
      <div class="as-hero skeleton-shimmer rounded-3xl" />
    </template>

    <!-- Variante compact: bloques simples -->
    <template v-else>
      <div class="as-compact">
        <div v-for="i in count" :key="`compact-${i}`" class="as-compact__item skeleton-shimmer rounded-xl" />
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'list',
    validator: (v) => ['dashboard', 'card-grid', 'list', 'table', 'hero', 'compact'].includes(v),
  },
  count: { type: Number, default: 4 },
  kpis: { type: Number, default: 4 },
  columns: { type: Number, default: 5 },
  showHeader: { type: Boolean, default: true },
})
</script>

<style scoped>
.app-skeleton {
  width: 100%;
}

/* Shimmer base */
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background: var(--skeleton-base);
}
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--skeleton-shine) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: skeletonShimmer 1.6s infinite linear;
}

/* CSS variables adaptativas */
.app-skeleton {
  --skeleton-base: rgba(0, 0, 0, 0.10);
  --skeleton-shine: rgba(255, 255, 255, 0.55);
}
.body--dark .app-skeleton {
  --skeleton-base: rgba(255, 255, 255, 0.11);
  --skeleton-shine: rgba(255, 255, 255, 0.16);
}

/* Dashboard */
.as-hero {
  height: 180px;
  margin-bottom: 24px;
}
.as-kpi-card {
  height: 120px;
}
.as-chart-card {
  height: 320px;
}

/* Card grid */
.as-section-header {
  margin-bottom: 18px;
}
.as-title {
  width: 220px;
  height: 22px;
  margin-bottom: 10px;
}
.as-subtitle {
  width: 360px;
  height: 14px;
  opacity: 0.7;
}
.as-course-card {
  height: 100%;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ta-border-card);
}
.as-course-card__top {
  height: 120px;
  background: rgba(0, 0, 0, 0.04);
}
.body--dark .as-course-card__top {
  background: rgba(255, 255, 255, 0.04);
}
.as-course-card__body {
  flex: 1;
  padding: 16px;
}
.as-course-card__footer {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--ta-border-card);
}

/* List */
.as-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.as-list-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid var(--ta-border-card);
  background: var(--ta-bg-card);
}
.as-avatar {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}
.as-list-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.as-list-item__meta {
  flex-shrink: 0;
}

/* Table */
.as-table {
  border: 1px solid var(--ta-border-card);
  border-radius: 16px;
  overflow: hidden;
  background: var(--ta-bg-card);
}
.as-table__header,
.as-table__row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 14px 16px;
  align-items: center;
}
.as-table__header {
  background: var(--ta-bg-page);
  border-bottom: 1px solid var(--ta-border-card);
}
.as-table__row {
  border-bottom: 1px solid var(--ta-border-card);
}
.as-table__row:last-child {
  border-bottom: 0;
}
.as-cell {
  height: 16px;
}

/* Lines & pills */
.as-line {
  height: 12px;
}
.as-line--title {
  width: 70%;
  height: 16px;
}
.as-line--sm {
  width: 45%;
}
.as-line--md {
  width: 60%;
}
.as-pill {
  width: 70px;
  height: 22px;
}

/* Compact */
.as-compact {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 24px 0;
}
.as-compact__item {
  width: 100%;
  max-width: 720px;
  height: 80px;
  border-radius: 18px;
}

@media (max-width: 599px) {
  .as-subtitle {
    width: 80%;
  }
  .as-table__header,
  .as-table__row {
    grid-template-columns: 2fr 1fr 1fr;
  }
  .as-table__header > :nth-child(4),
  .as-table__header > :nth-child(5),
  .as-table__row > :nth-child(4),
  .as-table__row > :nth-child(5) {
    display: none;
  }
}

@keyframes skeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
