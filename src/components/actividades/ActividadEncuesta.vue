<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">{{ actividad.titulo }}</div>
    <p class="text-grey-7">{{ actividad.descripcion }}</p>
    <q-badge color="green" text-color="white" class="q-mb-md">Encuesta {{ actividad.config?.anonima ? 'Anonima' : '' }}</q-badge>

    <q-separator class="q-my-md" />

    <template v-if="!enviada">
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
        <q-btn color="primary" icon="send" label="Enviar Encuesta" @click="enviar" />
      </div>
    </template>

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
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useActividadesStore } from 'src/stores/actividades.js'
import { useAuthStore } from 'src/stores/auth.js'

const $q = useQuasar()
const props = defineProps({ actividad: { type: Object, required: true } })
defineEmits(['volver'])

const actividadesStore = useActividadesStore()
const authStore = useAuthStore()

const respuestas = ref({})

const preguntas = computed(() => props.actividad.config?.preguntas || [])

const enviada = computed(() => {
  if (!authStore.usuario) return false
  return actividadesStore.tieneRespuestaEncuesta(authStore.usuario.id, props.actividad.id)
})

const resultadosMock = {
  0: [14, 10, 8, 5, 3],
  1: [18, 12, 6, 4],
}

function conteoResultado(preguntaIndex, opcionIndex) {
  return resultadosMock[preguntaIndex]?.[opcionIndex] || 0
}

function totalResultado(preguntaIndex) {
  return (resultadosMock[preguntaIndex] || []).reduce((sum, valor) => sum + valor, 0)
}

function ratioResultado(preguntaIndex, opcionIndex) {
  const total = totalResultado(preguntaIndex)
  return total > 0 ? conteoResultado(preguntaIndex, opcionIndex) / total : 0
}

function enviar() {
  if (!authStore.usuario) {
    $q.notify({ message: 'Debes iniciar sesion para enviar la encuesta', color: 'negative', icon: 'warning' })
    return
  }
  actividadesStore.guardarRespuestaEncuesta(authStore.usuario.id, props.actividad.id, { ...respuestas.value })
  $q.notify({ message: 'Encuesta enviada! Gracias por participar.', color: 'positive', icon: 'check_circle', timeout: 3000 })
}

watch(() => props.actividad.id, () => {
  respuestas.value = {}
})
</script>
