<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">{{ actividad.titulo }}</div>
    <p class="text-grey-7">{{ actividad.descripcion }}</p>
    <div class="row q-gutter-sm q-mb-md">
      <q-badge color="teal" text-color="white">Foro {{ labelTipoForo }}</q-badge>
      <q-badge v-if="actividad.config?.moderado" color="orange" text-color="white">Moderado</q-badge>
      <q-badge v-if="actividad.config?.anonimo" color="grey" text-color="white">Anonimo</q-badge>
      <q-badge v-if="actividad.tiene_nota" color="primary" text-color="white">{{ actividad.nota_maxima }} pts</q-badge>
    </div>

    <q-separator class="q-my-md" />

    <div class="row items-center q-mb-md">
      <div class="col text-subtitle2">{{ hilos.length }} hilos de discusion</div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="Nuevo Hilo" @click="mostrarFormHilo = true" />
      </div>
    </div>

    <template v-if="!hiloActivo">
      <q-list bordered separator>
        <q-item v-for="hilo in hilos" :key="hilo.id" clickable v-ripple @click="hiloActivo = hilo" class="hilo-item">
          <q-item-section avatar top>
            <q-avatar size="40px">
              <img :src="hilo.autorAvatar || defaultAvatar" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-body1 text-weight-medium">{{ hilo.titulo }}</q-item-label>
            <q-item-label caption>
              {{ hilo.autor }} · {{ formatFecha(hilo.fecha) }} · {{ Array.isArray(hilo.respuestas) ? hilo.respuestas.length : hilo.respuestas || 0 }} respuestas
            </q-item-label>
            <q-item-label class="q-mt-sm text-grey-8" :lines="2">{{ hilo.contenido }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-badge v-if="hilo.fijado" color="orange" text-color="white" icon="push_pin" />
            <q-badge color="teal-2" text-color="teal-9" class="q-mt-xs">{{ Array.isArray(hilo.respuestas) ? hilo.respuestas.length : hilo.respuestas || 0 }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </template>

    <template v-else>
      <q-btn flat color="primary" icon="arrow_back" label="Volver a hilos" class="q-mb-md" @click="hiloActivo = null" />

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row items-center q-mb-sm">
            <q-avatar size="48px" class="q-mr-md">
              <img :src="hiloActivo.autorAvatar || defaultAvatar" />
            </q-avatar>
            <div>
              <div class="text-h6">{{ hiloActivo.titulo }}</div>
              <div class="text-caption text-grey-7">{{ hiloActivo.autor }} · {{ formatFecha(hiloActivo.fecha) }}</div>
            </div>
          </div>
          <q-separator class="q-my-sm" />
          <div class="text-body1">{{ hiloActivo.contenido }}</div>
        </q-card-section>
      </q-card>

      <div class="text-subtitle2 q-mb-sm">Respuestas ({{ respuestasHilo.length }})</div>
      <q-list bordered separator>
        <q-item v-for="resp in respuestasHilo" :key="resp.id" class="q-mb-sm">
          <q-item-section avatar top>
            <q-avatar size="36px">
              <img :src="resp.autorAvatar || defaultAvatar" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-body2 text-weight-medium">{{ resp.autor }}</q-item-label>
            <q-item-label caption>{{ formatFecha(resp.fecha) }}</q-item-label>
            <q-item-label class="q-mt-sm">{{ resp.contenido }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card flat bordered class="q-mt-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Responder</div>
          <q-input v-model="nuevaRespuesta" outlined type="textarea" rows="3" placeholder="Escribe tu respuesta..." />
          <q-btn color="primary" icon="send" label="Enviar Respuesta" class="q-mt-sm" @click="enviarRespuesta" :disable="!nuevaRespuesta.trim()" />
        </q-card-section>
      </q-card>
    </template>

    <q-dialog v-model="mostrarFormHilo">
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">Nuevo Hilo de Discusion</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="nuevoHilo.titulo" label="Titulo del hilo" outlined class="q-mb-sm" />
          <q-input v-model="nuevoHilo.contenido" label="Contenido" outlined type="textarea" rows="4" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Crear Hilo" @click="crearHilo" :disable="!nuevoHilo.titulo.trim()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

const hiloActivo = ref(null)
const mostrarFormHilo = ref(false)
const nuevoHilo = ref({ titulo: '', contenido: '' })
const nuevaRespuesta = ref('')

const defaultAvatar = 'https://i.pravatar.cc/150?img=33'

const labelTipoForo = computed(() => {
  const m = { normal: 'General', debate: 'Debate', pregunta_respuesta: 'Pregunta y Respuesta' }
  return m[props.actividad.config?.tipo_foro] || 'General'
})

const hilos = computed(() => {
  // Asegurar inicializacion del array de hilos para esta actividad
  actividadesStore.getHilosForo(props.actividad.id)
  return actividadesStore.hilosForo[props.actividad.id] || []
})

const respuestasHilo = computed(() => {
  if (!hiloActivo.value) return []
  return hiloActivo.value.respuestas || []
})

function formatFecha(fecha) {
  if (!fecha) return 'Ahora'
  try {
    return new Date(fecha).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return fecha
  }
}

function crearHilo() {
  if (!authStore.usuario) {
    $q.notify({ message: 'Debes iniciar sesion para crear un hilo', color: 'negative', icon: 'warning' })
    return
  }
  const autorNombre = props.actividad.config?.anonimo
    ? 'Anonimo'
    : (authStore.usuario?.nombre || 'Estudiante')
  const hilo = {
    titulo: nuevoHilo.value.titulo,
    contenido: nuevoHilo.value.contenido,
    autor: autorNombre,
    autorId: authStore.usuario?.id ?? null,
    autorAvatar: authStore.usuario?.avatar || defaultAvatar,
    fijado: false,
  }
  actividadesStore.crearHiloForo(props.actividad.id, hilo)
  nuevoHilo.value = { titulo: '', contenido: '' }
  mostrarFormHilo.value = false
  $q.notify({ message: 'Hilo creado exitosamente', color: 'positive', timeout: 2000 })
}

function enviarRespuesta() {
  if (!authStore.usuario) {
    $q.notify({ message: 'Debes iniciar sesion para responder', color: 'negative', icon: 'warning' })
    return
  }
  if (!hiloActivo.value) return
  const respuesta = {
    autor: authStore.usuario?.nombre || 'Estudiante',
    autorId: authStore.usuario?.id ?? null,
    autorAvatar: authStore.usuario?.avatar || defaultAvatar,
    contenido: nuevaRespuesta.value,
  }
  actividadesStore.crearRespuestaForo(props.actividad.id, hiloActivo.value.id, respuesta)
  nuevaRespuesta.value = ''
  $q.notify({ message: 'Respuesta enviada', color: 'positive', timeout: 1500 })
}

watch(() => props.actividad.id, () => {
  hiloActivo.value = null
})
</script>

<style scoped>
.hilo-item { transition: background 0.15s; }
.hilo-item:hover { background: rgba(var(--primary-rgb), 0.04); }
.body--dark .hilo-item:hover { background: rgba(255, 255, 255, 0.04); }
</style>
