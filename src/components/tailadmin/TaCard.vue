<template>
  <q-card
    flat
    class="ta-card ta-card-reflection"
    :class="customClass"
  >
    <div v-if="accent" class="ta-card__accent" :style="{ background: accent }" />
    <q-card-section v-if="title || $slots.header || $slots.actions" class="flex items-center justify-between">
      <div>
        <div v-if="title" class="text-h6 text-weight-bold">{{ title }}</div>
        <div v-if="subtitle" class="text-caption text-grey-6 q-mt-xs">{{ subtitle }}</div>
        <slot name="header" />
      </div>
      <div v-if="$slots.actions" class="flex items-center q-gutter-sm">
        <slot name="actions" />
      </div>
    </q-card-section>
    <q-separator v-if="title || $slots.header || $slots.actions" class="ta-card__divider" />
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
  accent: { type: String, default: '' },
  customClass: { type: String, default: '' },
})

const borderColor = computed(() => 'var(--ta-border-card)')
const bgColor     = computed(() => 'var(--ta-bg-card)')
const shadowBase = computed(() => {
  if (!props.shadow) return 'none'
  return $q.dark.isActive
    ? '0 1px 2px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)'
    : '0 1px 2px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.02)'
})
const shadowHover = computed(() =>
  $q.dark.isActive
    ? '0 20px 50px rgba(0,0,0,0.48), 0 0 0 1px rgba(167,139,250,0.12)'
    : '0 20px 50px rgba(107, 63, 160, 0.12), 0 10px 20px rgba(13, 148, 136, 0.08)'
)
</script>

<style scoped>
.ta-card {
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
.ta-card:hover {
  transform: translateY(-4px);
  box-shadow: v-bind(shadowHover);
  border-color: rgba(var(--primary-rgb), 0.22);
}
.ta-card__accent {
  height: 4px;
  width: 100%;
}
.ta-card__divider {
  background: var(--ta-border-card);
}
</style>
