<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">{{ actividad.titulo }}</div>
    <q-badge :color="colorEstado" text-color="white" class="q-mb-md">
      {{ labelEstado }}
    </q-badge>
    <p class="text-grey-7">{{ actividad.descripcion }}</p>

    <q-separator class="q-my-md" />

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 text-weight-medium">Instrucciones</div>
            <p class="text-grey-7 q-mb-none">{{ actividad.config?.instrucciones || 'Sube tu trabajo en los formatos permitidos.' }}</p>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 text-weight-medium">Detalles de Entrega</div>
            <q-list dense>
              <q-item>
                <q-item-section avatar><q-icon name="event" size="xs" /></q-item-section>
                <q-item-section>
                  <q-item-label>Fecha de entrega</q-item-label>
                  <q-item-label caption>{{ formatFecha(actividad.config?.fecha_entrega) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar><q-icon name="event_busy" size="xs" /></q-item-section>
                <q-item-section>
                  <q-item-label>Fecha limite</q-item-label>
                  <q-item-label caption>{{ formatFecha(actividad.config?.fecha_limite) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar><q-icon name="description" size="xs" /></q-item-section>
                <q-item-section>
                  <q-item-label>Formatos permitidos</q-item-label>
                  <q-item-label caption>{{ actividad.config?.archivos_permitidos || 'pdf, docx' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar><q-icon name="cloud_upload" size="xs" /></q-item-section>
                <q-item-section>
                  <q-item-label>Tamaño maximo</q-item-label>
                  <q-item-label caption>{{ actividad.config?.tamano_max_mb || 10 }} MB</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <template v-if="estadoEntrega === 'pendiente'">
      <div class="text-subtitle2 text-weight-medium q-mb-sm">Subir Archivos</div>
      <q-card flat bordered class="q-mb-md drop-zone" :class="{ 'drag-over': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
      >
        <q-card-section class="text-center q-pa-lg">
          <q-icon name="cloud_upload" size="48px" color="grey-5" class="q-mb-sm" />
          <div class="text-body2 text-grey-7">Arrastra tus archivos aqui o haz click para seleccionar</div>
          <div class="text-caption text-grey-6">{{ actividad.config?.archivos_permitidos || 'pdf, docx' }} — Max {{ actividad.config?.tamano_max_mb || 10 }}MB</div>
          <q-btn color="primary" icon="attach_file" label="Seleccionar Archivos" class="q-mt-sm" @click="simularSeleccion" />
        </q-card-section>
      </q-card>

      <div v-if="archivosMock.length" class="q-mb-md">
        <q-list bordered separator>
          <q-item v-for="(archivo, i) in archivosMock" :key="i">
            <q-item-section avatar>
              <q-icon name="insert_drive_file" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ archivo.nombre }}</q-item-label>
              <q-item-label caption>{{ archivo.tamano }} — {{ archivo.fecha }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat round dense icon="delete" color="negative" @click="archivosMock.splice(i, 1)" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <q-input v-model="textoEntrega" label="Texto de la entrega (opcional)" outlined type="textarea" rows="3" class="q-mb-md" />

      <div class="row q-gutter-sm">
        <q-btn color="primary" icon="send" label="Enviar Entrega" @click="entregar"
          :disable="archivosMock.length === 0 && !textoEntrega.trim()" />
        <q-btn outline color="grey" icon="save" label="Guardar Borrador" />
      </div>
    </template>

    <template v-else-if="estadoEntrega === 'entregado'">
      <q-banner rounded class="bg-green-1 text-green-8 q-mb-md">
        <template #avatar>
          <q-icon name="check_circle" color="green" size="md" />
        </template>
        <div class="text-weight-medium">Entrega Realizada</div>
        <div>Tu trabajo fue entregado el {{ fechaEntrega }}. Espera la calificacion del docente.</div>
      </q-banner>

      <q-list bordered separator>
        <q-item v-for="(archivo, i) in archivosEntregados" :key="i">
          <q-item-section avatar>
            <q-icon name="insert_drive_file" color="green" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ archivo.nombre }}</q-item-label>
            <q-item-label caption>{{ archivo.tamano }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-if="textoEntregado" class="q-mt-md q-pa-md bg-grey-2 rounded-borders">
        <div class="text-caption text-grey-7 q-mb-xs">Texto de la entrega:</div>
        {{ textoEntregado }}
      </div>

      <q-btn flat color="primary" icon="edit" label="Reenviar Entrega" class="q-mt-md" @click="estadoEntrega = 'pendiente'" />
    </template>

    <template v-else-if="estadoEntrega === 'calificado'">
      <q-banner rounded class="bg-blue-1 text-blue-8 q-mb-md">
        <template #avatar>
          <q-icon name="grading" color="blue" size="md" />
        </template>
        <div class="text-weight-medium">Calificacion: {{ calificacion?.nota }}/{{ actividad.nota_maxima }}</div>
        <div>Retroalimentacion: {{ calificacion?.retroalimentacion || 'Buen trabajo.' }}</div>
      </q-banner>
    </template>

    <div class="text-center q-mt-lg">
      <q-btn flat color="primary" icon="arrow_back" label="Volver al Curso" @click="$emit('volver')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useActividadesStore } from 'src/stores/actividades.js'
import { useAuthStore } from 'src/stores/auth.js'

const $q = useQuasar()
const props = defineProps({ actividad: { type: Object, required: true } })
defineEmits(['volver'])

const actividadesStore = useActividadesStore()
const authStore = useAuthStore()

const isDragging = ref(false)
const archivosMock = ref([])
const textoEntrega = ref('')
const reenviarModo = ref(false)

// Buscar entrega existente para este estudiante y actividad
const entregaExistente = computed(() => {
  if (!authStore.usuario) return null
  return actividadesStore.entregas.find(
    (e) => e.estudiante_id === authStore.usuario.id && e.actividad_id === props.actividad.id
  ) || null
})

const estadoEntrega = computed({
  get() {
    if (reenviarModo.value) return 'pendiente'
    return entregaExistente.value?.estado || 'pendiente'
  },
  set(val) {
    if (val === 'pendiente') {
      reenviarModo.value = true
      // Precargar datos previos si existen
      if (entregaExistente.value) {
        try {
          const data = JSON.parse(entregaExistente.value.contenido || '{}')
          textoEntrega.value = data.texto || ''
          archivosMock.value = data.archivos || []
        } catch {
          textoEntrega.value = entregaExistente.value.contenido || ''
          archivosMock.value = []
        }
      }
    } else {
      reenviarModo.value = false
    }
  },
})

const fechaEntrega = computed(() => {
  if (!entregaExistente.value?.fecha_entrega) return ''
  return new Date(entregaExistente.value.fecha_entrega).toLocaleString('es-BO')
})

const archivosEntregados = computed(() => {
  if (!entregaExistente.value) return []
  try {
    const data = JSON.parse(entregaExistente.value.contenido || '{}')
    return data.archivos || []
  } catch {
    return []
  }
})

const textoEntregado = computed(() => {
  if (!entregaExistente.value) return ''
  try {
    const data = JSON.parse(entregaExistente.value.contenido || '{}')
    return data.texto || ''
  } catch {
    return entregaExistente.value.contenido || ''
  }
})

const calificacion = computed(() => {
  if (!entregaExistente.value || entregaExistente.value.estado !== 'calificado') return null
  return {
    nota: entregaExistente.value.nota ?? 0,
    retroalimentacion: entregaExistente.value.retroalimentacion || 'Buen trabajo.',
  }
})

const colorEstado = computed(() => {
  const m = { pendiente: 'orange', entregado: 'green', calificado: 'blue' }
  return m[estadoEntrega.value] || 'grey'
})

const labelEstado = computed(() => {
  const m = { pendiente: 'Pendiente', entregado: 'Entregado', calificado: 'Calificado' }
  return m[estadoEntrega.value] || estadoEntrega.value
})

function formatFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No definida'
}

function simularSeleccion() {
  archivosMock.value.push({
    nombre: `tarea_${archivosMock.value.length + 1}.pdf`,
    tamano: (Math.random() * 5 + 1).toFixed(1) + ' MB',
    fecha: new Date().toLocaleDateString('es-BO'),
  })
}

function onDrop() {
  isDragging.value = false
  simularSeleccion()
}

function entregar() {
  if (!authStore.usuario) {
    $q.notify({ message: 'Debes iniciar sesion para entregar', color: 'negative', icon: 'warning' })
    return
  }
  const contenido = JSON.stringify({
    texto: textoEntrega.value,
    archivos: archivosMock.value,
  })
  actividadesStore.crearEntrega(authStore.usuario.id, props.actividad.id, contenido)
  reenviarModo.value = false
  archivosMock.value = []
  textoEntrega.value = ''
  $q.notify({ message: 'Tarea entregada exitosamente!', color: 'positive', icon: 'check_circle', timeout: 3000 })
}

// Si cambia la actividad, resetear modo reenviar
watch(() => props.actividad.id, () => {
  reenviarModo.value = false
  archivosMock.value = []
  textoEntrega.value = ''
})
</script>

<style scoped>
.drop-zone {
  border: 2px dashed var(--ta-border-input);
  transition: all 0.2s;
}
.drop-zone.drag-over {
  border-color: var(--q-primary);
  background: rgba(var(--primary-rgb), 0.06);
}
</style>
