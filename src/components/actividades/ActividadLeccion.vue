<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">{{ actividad.titulo }}</div>
    <q-badge color="primary" text-color="white" class="q-mb-md">Leccion</q-badge>
    <p class="text-grey-7">{{ actividad.descripcion }}</p>

    <q-separator class="q-my-md" />

    <div v-if="actividad.config.contenido_html" class="contenido-leccion q-mb-lg" v-html="contenidoRenderizado" />
    <AppEmptyState
      v-else
      icon="article"
      title="Sin contenido"
      message="No hay contenido disponible para esta leccion."
    />

    <q-separator class="q-my-md" v-if="archivos.length" />

    <div v-if="archivos.length" class="q-mb-lg">
      <div class="text-subtitle2 q-mb-sm">Material de Apoyo</div>
      <q-list bordered separator>
        <q-item v-for="(archivo, i) in archivos" :key="i" clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="insert_drive_file" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ archivo.nombre }}</q-item-label>
            <q-item-label caption>{{ archivo.tipo?.toUpperCase() }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round dense icon="download" color="primary" aria-label="Descargar archivo" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <q-separator class="q-my-md" />

    <div class="row items-center q-mt-lg">
      <div class="col">
        <q-btn
          :color="completada ? 'green' : 'primary'"
          :icon="completada ? 'check_circle' : 'check'"
          :label="completada ? 'Leccion Completada' : 'Marcar como Completada'"
          @click="toggleCompletada"
          :disable="completada"
        />
      </div>
      <div class="col-auto">
        <q-badge v-if="completada" color="green" text-color="white" class="q-pa-sm">
          <q-icon name="check" size="xs" /> Estado: Completado
        </q-badge>
      </div>
    </div>

    <div class="text-center q-mt-lg">
      <q-btn flat color="primary" icon="arrow_back" label="Volver al Curso" @click="$emit('volver')" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useActividadesStore } from 'src/stores/actividades.js'
import { useAuthStore } from 'src/stores/auth.js'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const $q = useQuasar()
const props = defineProps({
  actividad: { type: Object, required: true },
})

defineEmits(['volver'])

const actividadesStore = useActividadesStore()
const authStore = useAuthStore()

const completada = computed(() => {
  if (!authStore.usuario) return false
  return actividadesStore.esLeccionCompletada(authStore.usuario.id, props.actividad.id)
})

const archivos = computed(() => props.actividad.config?.archivos_adjuntos || [])

const contenidoRenderizado = computed(() => {
  let html = props.actividad.config?.contenido_html || ''
  if (!html) {
    html = `<h3>${props.actividad.titulo}</h3><p>Material de estudio correspondiente a esta seccion del curso.</p>`
    html += `<p>En esta leccion aprenderas los conceptos fundamentales del tema. Revisa el material de apoyo adjunto y asegurate de comprender cada punto antes de continuar con las actividades practicas.</p>`
    html += `<ul><li>Concepto 1: Fundamentos teoricos</li><li>Concepto 2: Aplicacion practica</li><li>Concepto 3: Casos de estudio</li></ul>`
  }
  return html
})

function toggleCompletada() {
  if (!authStore.usuario) {
    $q.notify({ message: 'Debes iniciar sesion para marcar como completada', color: 'negative', icon: 'warning' })
    return
  }
  actividadesStore.marcarLeccionCompletada(authStore.usuario.id, props.actividad.id)
  $q.notify({ message: 'Leccion marcada como completada!', color: 'positive', icon: 'check_circle', timeout: 2000 })
}
</script>

<style scoped>
.contenido-leccion {
  line-height: 1.8;
  font-size: 1.05em;
}
.contenido-leccion :deep(h3) {
  color: var(--q-primary);
  margin-bottom: 1rem;
}
.contenido-leccion :deep(ul) {
  padding-left: 1.5rem;
}
.contenido-leccion :deep(li) {
  margin-bottom: 0.5rem;
}
</style>
