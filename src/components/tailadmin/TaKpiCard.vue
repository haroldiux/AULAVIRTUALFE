<template>
  <q-card
    flat
    class="ta-kpi-card ta-card-reflection cursor-pointer"
    data-tour="kpi-card"
  >
    <q-card-section>
      <div class="flex items-center justify-between">
        <div class="ta-kpi-icon" :style="`background: ${iconColor}`">
          <q-icon :name="icon" size="26px" color="white" />
        </div>
        <q-chip
          v-if="trend !== undefined"
          dense
          size="sm"
          class="text-caption text-weight-medium ta-kpi-trend"
          :color="trend >= 0 ? 'positive' : 'negative'"
          text-color="white"
        >
          <q-icon :name="trend >= 0 ? 'arrow_upward' : 'arrow_downward'" size="12px" class="q-mr-xs" />
          {{ Math.abs(trend) }}%
        </q-chip>
      </div>
      <div class="q-mt-md">
        <div class="ta-kpi-label">{{ label }}</div>
        <div class="ta-kpi-value" :style="valueGradient">{{ value }}</div>
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

const borderColor = computed(() => 'var(--ta-border-card)')
const bgColor     = computed(() => 'var(--ta-bg-card)')
const bgHover     = computed(() => 'var(--ta-bg-hover)')
const shadowBase = computed(() =>
  $q.dark.isActive
    ? '0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)'
    : '0 1px 2px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.02)'
)
const shadowHover = computed(() =>
  $q.dark.isActive
    ? '0 20px 50px rgba(0,0,0,0.48), 0 0 0 1px rgba(167,139,250,0.12)'
    : '0 20px 50px rgba(107, 63, 160, 0.12), 0 10px 20px rgba(13, 148, 136, 0.08)'
)
const valueGradient = computed(() => {
  if ($q.dark.isActive) return {}
  return {
    background: 'linear-gradient(135deg, var(--brand-unitepc-purple) 0%, var(--brand-unitepc-turquoise) 100%)',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    backgroundClip: 'text',
  }
})
</script>

<style scoped>
.ta-kpi-card {
  border-radius: 22px;
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
  border-color: rgba(var(--primary-rgb), 0.22);
}

.ta-kpi-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(107, 63, 160, 0.22);
}

.ta-kpi-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ta-text-secondary);
  letter-spacing: 0.01em;
}

.ta-kpi-value {
  font-size: 1.65rem;
  font-weight: 850;
  line-height: 1.15;
  color: var(--ta-text-primary);
  margin-top: 6px;
}

.ta-kpi-trend {
  border-radius: 999px;
  padding: 2px 8px;
}
</style>
