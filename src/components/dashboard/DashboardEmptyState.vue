<template>
  <div class="av-empty-state">
    <div class="av-empty-state__icon">
      <q-icon :name="icon" size="34px" />
    </div>
    <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
    <p v-if="message" class="av-empty-state__message">{{ message }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'inbox' },
  title: { type: String, required: true },
  message: { type: String, default: '' },
})
</script>
