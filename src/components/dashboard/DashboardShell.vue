<template>
  <q-page class="av-dashboard-page ta-aurora">
    <section class="av-dashboard-hero" data-tour="dashboard-hero">
      <div class="av-dashboard-hero__content">
        <q-chip
          v-if="eyebrow"
          dense
          square
          color="white"
          text-color="primary"
          class="av-dashboard-hero__eyebrow"
        >
          <q-icon v-if="icon" :name="icon" size="16px" class="q-mr-xs" />
          {{ eyebrow }}
        </q-chip>

        <div class="av-dashboard-hero__title-row">
          <div>
            <h1 class="av-dashboard-hero__title">{{ title }}</h1>
            <p v-if="subtitle" class="av-dashboard-hero__subtitle">{{ subtitle }}</p>
          </div>
          <div v-if="$slots.actions" class="av-dashboard-hero__actions">
            <slot name="actions" />
          </div>
        </div>

        <div v-if="meta" class="av-dashboard-hero__meta">
          <q-icon name="event" size="18px" />
          <span>{{ meta }}</span>
        </div>
      </div>

      <div v-if="$slots.aside" class="av-dashboard-hero__aside">
        <slot name="aside" />
      </div>
    </section>

    <slot />
  </q-page>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  meta: { type: String, default: '' },
  icon: { type: String, default: '' },
})
</script>
