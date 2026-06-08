<template>
  <q-page class="flex flex-center q-pa-lg" style="min-height: 200px">
    <div class="w-full max-w-3xl" ref="container">
      <div v-for="i in count" :key="i" class="flex items-center gap-4 p-5 skeleton-card">
        <div class="w-14 h-14 rounded-xl skeleton shimmer shrink-0" :style="{ height: '56px', width: '56px' }" />
        <div class="flex-1 space-y-3">
          <div class="h-4 rounded-md skeleton shimmer w-2/3" />
          <div class="h-3 rounded-md skeleton shimmer w-1/2" />
        </div>
        <div class="w-20 h-3 rounded-md skeleton shimmer shrink-0" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import anime from 'animejs'

defineProps({
  count: { type: Number, default: 4 },
})

const container = ref(null)

let pulseAnimation = null

onMounted(() => {
  const targets = container.value?.querySelectorAll('.skeleton')
  if (targets && targets.length) {
    pulseAnimation = anime({
      targets,
      opacity: [0.35, 0.75],
      duration: 1000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      delay: anime.stagger(100),
    })
  }
})

onUnmounted(() => {
  if (pulseAnimation) {
    anime.remove(container.value?.querySelectorAll('.skeleton'))
  }
})
</script>

<style scoped>
.skeleton-card {
  border-radius: 20px;
  background: rgba(0,0,0,0.02);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0,0,0,0.04);
  margin-bottom: 12px;
  transition: background 0.3s ease;
}
.body--dark .skeleton-card {
  background: rgba(255,255,255,0.02);
  border-color: rgba(255,255,255,0.04);
}

.skeleton {
  background: linear-gradient(90deg, #e2e2e2 0%, #f0f0f0 50%, #e2e2e2 100%);
  background-size: 200% 100%;
}
.body--dark .skeleton {
  background: linear-gradient(90deg, #2a2a2a 0%, #3a3a3a 50%, #2a2a2a 100%);
  background-size: 200% 100%;
}

.shimmer {
  animation: skeletonShimmer 1.6s infinite linear;
}

@keyframes skeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
