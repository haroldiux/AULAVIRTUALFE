<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">{{ actividad.titulo }}</div>
    <p class="text-grey-7">{{ actividad.descripcion }}</p>
    <q-badge color="green" text-color="white" class="q-mb-md">Encuesta {{ actividad.config?.anonima ? 'Anonima' : '' }}</q-badge>

    <q-separator class="q-my-md" />

    <q-form v-if="!enviada" ref="encuestaForm" @submit.prevent="enviar" greedy>
      <q-card v-for="(pregunta, i) in preguntas" :key="i" flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 text-weight-medium q-mb-sm">
            {{ i + 1 }}. {{ pregunta.enunciado }}
            <q-badge v-if="pregunta.obligatorio !== false" color="red" text-color="white" dense>Obligatorio</q-badge>
          </div>

          <template v-if="pregunta.tipo === 'opcion_multiple'">
            <q-option-group
              v-model="respuestas[i]"
              :options="(pregunta.opciones || []).map((o, oi) => ({ label: o, value: oi }))"
              type="radio"
            />
          </template>

          <template v-else-if="pregunta.tipo === 'escala'">
            <div class="row items-center q-col-gutter-sm">
              <template v-for="(opcion, oi) in (pregunta.opciones || [])" :key="oi">
                <div class="col-auto text-center">
                  <q-btn
                    :color="respuestas[i] === oi ? 'primary' : 'grey-4'"
                    :text-color="respuestas[i] === oi ? 'white' : 'grey-7'"
                    :label="opcion"
                    flat
                    @click="respuestas[i] = oi"
                  />
                </div>
              </template>
            </div>
          </template>

          <template v-else-if="pregunta.tipo === 'texto_abierto'">
            <q-input v-model="respuestas[i]" outlined type="textarea" rows="2" placeholder="Escribe tu respuesta..." />
          </template>
        </q-card-section>
      </q-card>

      <div class="text-center q-mt-lg">
        <q-btn type="submit" color="primary" icon="send" label="Enviar Encuesta" />
      </div>
    </q-form>

    <template v-else>
      <div class="text-center q-pa-lg">
        <q-icon name="check_circle" size="64px" color="green" />
        <div class="text-h5 text-green q-mt-md">Encuesta Enviada</div>
        <p class="text-grey-7">Gracias por tu participacion. Tus respuestas han sido registradas.</p>
      </div>

      <q-card flat bordered class="q-mt-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium">Resultados Parciales</div>
          <div v-for="(pregunta, i) in preguntas" :key="i" class="q-mb-md">
            <div class="text-body2 text-weight-medium q-mb-sm">{{ pregunta.enunciado }}</div>
            <template v-if="pregunta.tipo === 'escala'">
              <div v-for="(opcion, oi) in (pregunta.opciones || [])" :key="oi" class="row items-center q-mb-xs">
                <div class="col-3 text-caption">{{ opcion }}</div>
                <div class="col-7">
                  <q-linear-progress :value="ratioResultado(i, oi)" color="primary" size="8px" rounded />
                </div>
                <div class="col-2 text-caption text-right">{{ conteoResultado(i, oi) }}/{{ totalResultado(i) }}</div>
              </div>
            </template>
          </div>
        </q-card-section>
      </q-card>
    </template>

    <div class="text-center q-mt-lg">
      <q-btn flat color="primary" icon="arrow_back" label="Volver al Curso" @click="$emit('volver')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useActividadesStore } from 'src/stores/actividades.js'
import { useAuthStore } from 'src/stores/auth.js'

const $q = useQuasar()
const props = defineProps({ actividad: { type: Object, required: true } })
defineEmits(['volver'])

const actividadesStore = useActividadesStore()
const authStore = useAuthStore()

const respuestas = ref({})
const encuestaForm = ref(null)
const enviada = ref(false)

const preguntas = computed(() => props.actividad.config?.preguntas || [])

onMounted(async () => {
  if (authStore.usuario) {
    const data = await actividadesStore.cargarMiRespuestaEncuesta(props.actividad.id)
    if (data?.respondida) {
      enviada.value = true
      respuestas.value = data.respuestas || {}
    }
  }
})

function conteoResultado() {
  return 0
}

function totalResultado() {
  return 0
}

function ratioResultado() {
  return 0
}

async function enviar() {
  const obligatorias = preguntas.value.filter((p) => p.obligatorio !== false)
  const faltantes = obligatorias.some((_, i) => respuestas.value[i] === undefined || respuestas.value[i] === '')
  if (faltantes) {
    $q.notify({ message: 'Responde todas las preguntas obligatorias antes de enviar.', color: 'negative', icon: 'warning' })
    return
  }
  if (!authStore.usuario) {
    $q.notify({ message: 'Debes iniciar sesion para enviar la encuesta', color: 'negative', icon: 'warning' })
    return
  }
  try {
    await actividadesStore.guardarRespuestaEncuesta(authStore.usuario.id, props.actividad.id, { ...respuestas.value })
    enviada.value = true
    $q.notify({ message: 'Encuesta enviada! Gracias por participar.', color: 'positive', icon: 'check_circle', timeout: 3000 })
  } catch (err) {
    $q.notify({ message: err?.message || 'Error al enviar encuesta', color: 'negative', timeout: 3000 })
  }
}

watch(() => props.actividad.id, () => {
  respuestas.value = {}
  enviada.value = false
})
</script>
