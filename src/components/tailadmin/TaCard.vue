<template>
  <q-card
    flat
    class="ta-card ta-card-reflection"
    :class="customClass"
  >
    <q-card-section v-if="title || $slots.header || $slots.actions" class="flex items-center justify-between">
      <div>
        <div v-if="title" class="text-h6 text-weight-bold">{{ title }}</div>
        <div v-if="subtitle" class="text-caption text-grey q-mt-xs">{{ subtitle }}</div>
        <slot name="header" />
      </div>
      <div v-if="$slots.actions" class="flex items-center q-gutter-sm">
        <slot name="actions" />
      </div>
    </q-card-section>
    <q-separator v-if="title || $slots.header || $slots.actions" />
    <q-card-section v-if="padding" class="q-pa-md">
      <slot />
    </q-card-section>
    <template v-else>
      <slot />
    </template>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  padding: { type: Boolean, default: true },
  shadow: { type: Boolean, default: true },
  customClass: { type: String, default: '' },
})

const borderColor = computed(() => 'var(--ta-border-card)')
const bgColor     = computed(() => 'var(--ta-bg-card)')
const shadowBase  = computed(() =>
  props.shadow && !$q.dark.isActive
    ? '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)'
    : 'none'
)
const shadowHover = computed(() =>
  $q.dark.isActive
    ? '0 12px 32px rgba(0,0,0,0.35)'
    : '0 12px 32px rgba(37, 99, 235, 0.10), 0 4px 12px rgba(0,0,0,0.06)'
)
</script>

<style scoped>
.ta-card {
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
.ta-card:hover {
  transform: translateY(-4px);
  box-shadow: v-bind(shadowHover);
}
</style>
