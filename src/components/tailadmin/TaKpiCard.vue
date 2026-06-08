<template>
  <q-card
    flat
    class="ta-kpi-card ta-card-reflection cursor-pointer"
    data-tour="kpi-card"
  >
    <q-card-section>
      <div class="flex items-center justify-between">
        <div class="ta-kpi-icon" :style="`background: ${iconColor}`">
          <q-icon :name="icon" size="24px" color="white" />
        </div>
        <q-chip
          v-if="trend !== undefined"
          dense
          size="sm"
          class="text-caption text-weight-medium"
          :color="trend >= 0 ? 'positive' : 'negative'"
          text-color="white"
        >
          <q-icon :name="trend >= 0 ? 'arrow_upward' : 'arrow_downward'" size="12px" class="q-mr-xs" />
          {{ Math.abs(trend) }}%
        </q-chip>
      </div>
      <div class="q-mt-md">
        <div class="text-caption text-weight-medium text-grey">{{ label }}</div>
        <div class="text-h5 text-weight-bold q-mt-xs">{{ value }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

defineProps({
  icon: { type: String, required: true },
  iconColor: { type: String, default: 'var(--gradient-unitepc)' },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  trend: { type: Number, default: undefined },
})

const borderColor = computed(() => $q.dark.isActive ? 'var(--ta-border-card)' : 'var(--ta-border-card)')
const bgColor     = computed(() => $q.dark.isActive ? 'var(--ta-bg-card)' : 'var(--ta-bg-card)')
const bgHover     = computed(() => $q.dark.isActive ? 'var(--ta-bg-hover)' : 'var(--ta-bg-hover)')
const shadowBase  = computed(() =>
  $q.dark.isActive
    ? '0 1px 3px rgba(0,0,0,0.2)'
    : '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)'
)
const shadowHover = computed(() =>
  $q.dark.isActive
    ? '0 12px 32px rgba(0,0,0,0.35)'
    : '0 12px 32px rgba(37, 99, 235, 0.10), 0 4px 12px rgba(0,0,0,0.06)'
)
</script>

<style scoped>
.ta-kpi-card {
  border-radius: 20px;
  border: 1px solid v-bind(borderColor);
  background: v-bind(bgColor);
  box-shadow: v-bind(shadowBase);
  overflow: hidden;
  position: relative;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.3s ease,
              border-color 0.3s ease;
}
.ta-kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: v-bind(shadowHover);
  background: v-bind(bgHover);
}

.ta-kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}
</style>
