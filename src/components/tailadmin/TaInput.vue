<template>
  <div>
    <label
      v-if="label"
      class="block text-sm font-medium mb-2"
      :class="$q.dark.isActive ? 'text-slate-300' : 'text-slate-700'"
    >
      {{ label }}
    </label>
    <q-input
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :type="type"
      :dense="dense"
      :filled="filled"
      :outlined="outlined"
      :readonly="readonly"
      :disable="disable"
      :rules="rules"
      :hint="hint"
      :prefix="prefix"
      :suffix="suffix"
      :class="[
        'ta-input rounded-xl',
        $q.dark.isActive ? 'ta-input--dark' : 'ta-input--light',
        customClass,
      ]"
    >
      <template v-if="icon" #prepend>
        <q-icon :name="icon" size="20px" :class="$q.dark.isActive ? 'text-slate-500' : 'text-slate-400'" />
      </template>
      <template v-for="(_, slot) in $slots" :key="slot" #[slot]>
        <slot :name="slot" />
      </template>
    </q-input>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'

const $q = useQuasar()

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  icon: { type: String, default: '' },
  dense: { type: Boolean, default: false },
  filled: { type: Boolean, default: false },
  outlined: { type: Boolean, default: true },
  readonly: { type: Boolean, default: false },
  disable: { type: Boolean, default: false },
  rules: { type: Array, default: () => [] },
  hint: { type: String, default: '' },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  customClass: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.ta-input ::v-deep(.q-field__control) {
  border-radius: 0.75rem !important;
  min-height: 46px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;
}

.ta-input--light ::v-deep(.q-field__control) {
  background-color: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
}

.ta-input--light ::v-deep(.q-field__control:focus-within) {
  border-color: #6B3FA0 !important;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12) !important;
}

.ta-input--dark ::v-deep(.q-field__control) {
  background-color: #1c2434 !important;
  border: 1px solid #2e3a47 !important;
}

.ta-input--dark ::v-deep(.q-field__control:focus-within) {
  border-color: #4f5bec !important;
  box-shadow: 0 0 0 4px rgba(79, 91, 236, 0.18) !important;
}

.ta-input ::v-deep(.q-field__native),
.ta-input ::v-deep(.q-field__input) {
  color: inherit;
}

.ta-input--light ::v-deep(.q-field__native),
.ta-input--light ::v-deep(.q-field__input) {
  color: #1e293b;
}

.ta-input--dark ::v-deep(.q-field__native),
.ta-input--dark ::v-deep(.q-field__input) {
  color: #f1f5f9;
}

.ta-input ::v-deep(.q-field__label) {
  top: 11px;
}
</style>
