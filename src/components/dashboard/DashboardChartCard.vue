<template>
  <TaCard class="av-chart-card card-item" :padding="false" data-tour="chart-card">
    <q-card-section class="av-chart-card__header">
      <div class="av-chart-card__title">
        <div v-if="icon" class="av-chart-card__icon" :style="{ background: iconColor }">
          <q-icon :name="icon" size="22px" color="white" />
        </div>
        <div>
          <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
          <div v-if="subtitle" class="text-caption text-grey-6">{{ subtitle }}</div>
        </div>
      </div>
      <slot name="actions" />
    </q-card-section>
    <q-separator class="av-chart-card__divider" />
    <q-card-section class="av-chart-card__body" :style="{ minHeight: height }">
      <slot />
    </q-card-section>
  </TaCard>
</template>

<script setup>
import TaCard from 'src/components/tailadmin/TaCard.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  iconColor: { type: String, default: 'var(--gradient-unitepc-reverse)' },
  height: { type: String, default: '280px' },
})
</script>
