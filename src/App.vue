<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useNotificacionesStore } from 'src/stores/notificaciones'

const $q = useQuasar()
const auth = useAuthStore()
const notifStore = useNotificacionesStore()

const darkSaved = localStorage.getItem('lms_dark_mode') === 'true'
$q.dark.set(darkSaved)

onMounted(() => {
  auth.inicializar()
  notifStore.inicializar()
  notifStore.generarIniciales()
})
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

body.body--dark {
  background: #121212;
}
</style>
