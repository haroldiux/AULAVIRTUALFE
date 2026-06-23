<template>
  <q-btn
    :label="label"
    :icon="icon"
    :outline="variant === 'outline'"
    :flat="variant === 'ghost'"
    :unelevated="variant === 'primary' || variant === 'danger'"
    :color="computedColor"
    :text-color="computedTextColor"
    :loading="loading"
    :disable="disable"
    :to="to"
    :type="type"
    :class="['ta-btn-premium text-body2 text-weight-medium', customClass]"
    :style="computedStyle"
    class="q-px-md q-py-sm"
  >
    <slot />
  </q-btn>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  icon: { type: String, default: '' },
  variant: { type: String, default: 'primary', validator: (v) => ['primary', 'secondary', 'outline', 'ghost', 'danger', 'light'].includes(v) },
  loading: { type: Boolean, default: false },
  disable: { type: Boolean, default: false },
  to: { type: [String, Object], default: undefined },
  type: { type: String, default: 'button' },
  customClass: { type: String, default: '' },
})

const computedColor = computed(() => {
  switch (props.variant) {
    case 'primary': return 'primary'
    case 'danger': return 'negative'
    case 'secondary': return 'grey-2'
    default: return undefined
  }
})

const computedTextColor = computed(() => {
  switch (props.variant) {
    case 'primary': return 'white'
    case 'danger': return 'white'
    case 'secondary': return 'grey-8'
    case 'outline': return 'primary'
    case 'ghost': return 'primary'
    case 'light': return 'white'
    default: return undefined
  }
})

const computedStyle = computed(() => {
  const base = []
  if (props.variant === 'outline' || props.variant === 'light') {
    base.push('border: 1.5px solid currentColor')
  }
  if (props.variant === 'ghost' || props.variant === 'light') {
    base.push('background: transparent')
  }
  if (props.variant === 'primary') {
    base.push('background: var(--gradient-unitepc)')
  }
  if (props.variant === 'danger') {
    base.push('background: linear-gradient(135deg, #ef4444 0%, #f87171 100%)')
  }
  return base.join('; ')
})
</script>

<style scoped>
.ta-btn-premium {
  border-radius: 12px !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease !important;
}
.ta-btn-premium:not(.q-btn--disabled):hover {
  transform: translateY(-2px);
}
.ta-btn-premium:not(.q-btn--disabled):active {
  transform: scale(0.98);
}
</style>
