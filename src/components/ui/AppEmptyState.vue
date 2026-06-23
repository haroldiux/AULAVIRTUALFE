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

<style scoped>
.av-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--ta-text-secondary, #64748b);
}
.av-empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border-radius: 22px;
  background: var(--gradient-unitepc-soft, rgba(241, 245, 249, 0.8));
  color: var(--ta-primary, #6B3FA0);
  margin-bottom: 1rem;
  box-shadow: 0 10px 24px rgba(107, 63, 160, 0.10);
}
.body--dark .av-empty-state__icon {
  background: var(--gradient-unitepc-soft, rgba(30, 41, 59, 0.8));
  color: var(--ta-primary, #a78bfa);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.20);
}
.av-empty-state__message {
  margin: 0.5rem 0 0;
  max-width: 360px;
  line-height: 1.5;
  color: var(--ta-text-muted, #94a3b8);
}
</style>
