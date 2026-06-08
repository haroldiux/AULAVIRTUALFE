<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">{{ actividad.titulo }}</div>
    <q-badge color="pink" text-color="white" class="q-mb-md">Contenido H5P</q-badge>
    <p v-if="actividad.descripcion" class="text-grey-7">{{ actividad.descripcion }}</p>

    <q-separator class="q-my-md" />

    <div class="h5p-wrapper q-mb-lg">
      <div ref="h5pContainer" class="h5p-container"></div>
    </div>

    <q-separator class="q-my-md" />

    <div class="row items-center q-mt-lg">
      <div class="col">
        <q-btn
          v-if="completada"
          color="green"
          icon="check_circle"
          label="Actividad Completada"
          disable
        />
        <q-btn
          v-else
          color="primary"
          icon="arrow_back"
          label="Volver al Curso"
          @click="$emit('volver')"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { H5P } from 'h5p-standalone'

const $q = useQuasar()
const props = defineProps({
  actividad: { type: Object, required: true },
})

const emit = defineEmits(['volver', 'h5p-completed'])

const h5pContainer = ref(null)
const completada = ref(false)
let h5pInstance = null

onMounted(async () => {
  if (!h5pContainer.value) return

  const demoPath = props.actividad.config?.demo_content_path || '/h5p/contents/demo-1'

  try {
    h5pInstance = new H5P(h5pContainer.value, {
      h5pJsonPath: demoPath,
      frameJs: '/h5p-standalone/frame.bundle.js',
      frameCss: '/h5p-standalone/styles/h5p.css',
      frame: true,
      fullScreen: true,
    })

    await h5pInstance

    if (window.H5P && window.H5P.externalDispatcher) {
      window.H5P.externalDispatcher.on('xAPI', (event) => {
        const stmt = event.data?.statement
        if (!stmt) return

        const verb = stmt.verb?.id || ''
        const isCompleted = verb.includes('completed') || verb.includes('answered') || verb.includes('passed') || verb.includes('submitted')
        const raw = stmt.result?.score?.raw
        const max = stmt.result?.score?.max

        if (isCompleted && raw !== undefined && max) {
          const notaFinal = Math.round((raw / max) * (props.actividad.nota_maxima || 100))
          completada.value = true
          emit('h5p-completed', { raw, max, notaFinal })
          $q.notify({
            message: `Actividad completada. Nota: ${notaFinal}/${props.actividad.nota_maxima || 100}`,
            color: 'positive',
            icon: 'check_circle',
            timeout: 3000,
          })
        }
      })
    }
  } catch (err) {
    console.error('Error cargando H5P:', err)
    $q.notify({
      message: 'Error al cargar el contenido H5P. Intenta recargar la pagina.',
      color: 'negative',
      icon: 'error',
      timeout: 3000,
    })
  }
})

onUnmounted(() => {
  if (window.H5P && window.H5P.externalDispatcher) {
    window.H5P.externalDispatcher.off('xAPI')
  }
})
</script>

<style scoped>
.h5p-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  background: #fafafa;
}
.h5p-container {
  min-height: 400px;
}
</style>
