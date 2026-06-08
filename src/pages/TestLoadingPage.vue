<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-weight-bold q-mb-sm">Laboratorio de Animaciones</div>
    <p class="text-grey q-mb-xl">Prueba cada efecto visual de forma aislada.</p>

    <div class="row q-col-gutter-lg">
      <!-- 1. Loading Screen -->
      <div class="col-12 col-md-6">
        <TaCard title="1. Loading Screen" subtitle="Overlay de carga (CSS nativo)">
          <div class="q-gutter-sm q-mt-sm">
            <TaButton variant="primary" icon="play_arrow" label="Mostrar 3s" customClass="ta-btn-premium" @click="mostrarLoading" />
            <TaButton variant="ghost" icon="stop" label="Ocultar" customClass="ta-btn-premium" @click="ocultarLoading" />
          </div>
        </TaCard>
      </div>

      <!-- 2. Reflection Hover -->
      <div class="col-12 col-md-6">
        <TaCard title="2. Reflection Hover" subtitle="Brillo en hover (CSS + anime.js)">
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-6">
              <div class="demo-card ta-card-reflection q-pa-lg text-center">
                <div class="demo-icon bg-primary">
                  <q-icon name="style" size="28px" color="white" />
                </div>
                <div class="text-caption text-grey q-mt-sm">Pasa el mouse</div>
              </div>
            </div>
            <div class="col-6">
              <div class="demo-card ta-card-reflection q-pa-lg text-center">
                <div class="demo-icon bg-orange">
                  <q-icon name="star" size="28px" color="white" />
                </div>
                <div class="text-caption text-grey q-mt-sm">Pasa el mouse</div>
              </div>
            </div>
          </div>
        </TaCard>
      </div>

      <!-- 3. Button Press -->
      <div class="col-12 col-md-6">
        <TaCard title="3. Button Press" subtitle="Efecto de presion (anime.js)">
          <div class="q-gutter-sm q-mt-md">
            <TaButton variant="primary" label="Presioname" customClass="ta-btn-premium" />
            <TaButton variant="outline" label="Presioname" customClass="ta-btn-premium" />
            <TaButton variant="ghost" label="Presioname" customClass="ta-btn-premium" />
          </div>
        </TaCard>
      </div>

      <!-- 4. Ripple Effect -->
      <div class="col-12 col-md-6">
        <TaCard title="4. Ripple Effect" subtitle="Onda expansiva al click (anime.js)">
          <div class="q-gutter-md q-mt-md">
            <q-btn unelevated color="primary" label="Click para ripple" class="ta-ripple q-px-md" style="border-radius: 10px" />
            <div class="ta-ripple q-pa-md bg-primary text-white text-center cursor-pointer shadow-sm" style="border-radius: 12px">
              <q-icon name="touch_app" size="18px" class="q-mr-xs" />
              Click aqui tambien
            </div>
          </div>
        </TaCard>
      </div>

      <!-- 5. Stagger Cards -->
      <div class="col-12 col-md-6">
        <TaCard title="5. Stagger Cards" subtitle="Entrada escalonada (anime.js)">
          <div class="row q-col-gutter-sm q-mt-md">
            <div v-for="i in 4" :key="i" class="col-6 card-item">
              <div class="demo-card q-pa-sm text-center">
                <q-icon name="folder" size="24px" color="teal" />
                <div class="text-caption">Card {{ i }}</div>
              </div>
            </div>
          </div>
        </TaCard>
      </div>

      <!-- 6. Page Transition -->
      <div class="col-12 col-md-6">
        <TaCard title="6. Page Transition" subtitle="Cambio de ruta con fade + slide">
          <div class="q-mt-md">
            <q-item class="demo-list-item q-mb-xs" clickable v-ripple to="/docente/dashboard">
              <q-item-section avatar><q-icon name="dashboard" color="primary" /></q-item-section>
              <q-item-section>Ir al Dashboard Docente</q-item-section>
              <q-item-section side><q-icon name="chevron_right" /></q-item-section>
            </q-item>
            <q-item class="demo-list-item q-mb-xs" clickable v-ripple to="/estudiante/dashboard">
              <q-item-section avatar><q-icon name="school" color="teal" /></q-item-section>
              <q-item-section>Ir al Dashboard Estudiante</q-item-section>
              <q-item-section side><q-icon name="chevron_right" /></q-item-section>
            </q-item>
            <q-item class="demo-list-item" clickable v-ripple to="/error-404-test">
              <q-item-section avatar><q-icon name="error" color="negative" /></q-item-section>
              <q-item-section>Ir a pagina 404</q-item-section>
              <q-item-section side><q-icon name="chevron_right" /></q-item-section>
            </q-item>
          </div>
        </TaCard>
      </div>
    </div>

    <!-- Loading Screen -->
    <TaLoadingScreen :visible="loadingVisible" message="Probando animaciones" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useReflectionHover, useButtonPress, useRippleEffect, useStaggerCards } from 'src/composables/useAnimations'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import TaLoadingScreen from 'src/components/tailadmin/TaLoadingScreen.vue'

const loadingVisible = ref(false)

useReflectionHover('.ta-card-reflection')
useButtonPress('.ta-btn-premium')
useRippleEffect('.ta-ripple')
useStaggerCards('.card-item')

function mostrarLoading() {
  loadingVisible.value = true
  setTimeout(() => {
    loadingVisible.value = false
  }, 3000)
}

function ocultarLoading() {
  loadingVisible.value = false
}
</script>

<style scoped>
.demo-card {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}
.body--dark .demo-card {
  border-color: #2e3a47;
  background: #1c2434;
}
.demo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.08);
}

.demo-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.demo-list-item {
  border-radius: 10px;
  transition: background 0.2s ease;
}
.demo-list-item:hover {
  background: rgba(37, 99, 235, 0.04);
}
.body--dark .demo-list-item:hover {
  background: rgba(79, 91, 236, 0.06);
}
</style>
