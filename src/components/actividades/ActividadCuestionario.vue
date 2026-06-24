<template>
  <div class="q-pa-md">
    <template v-if="fase === 'inicio'">
      <div class="text-h5 q-mb-md">{{ actividad.titulo }}</div>
      <p class="text-grey-7">{{ actividad.descripcion }}</p>

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 text-weight-medium q-mb-sm">Instrucciones</div>
          <q-list dense>
            <q-item>
              <q-item-section avatar><q-icon name="timer" color="orange" /></q-item-section>
              <q-item-section>
                <q-item-label>Tiempo limite: {{ actividad.config?.tiempo_limite_minutos || 20 }} minutos</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="replay" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label>Intentos maximos: {{ actividad.config?.intentos_maximos || 1 }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="quiz" color="purple" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ preguntas.length }} preguntas</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="actividad.tiene_nota">
              <q-item-section avatar><q-icon name="grade" color="green" /></q-item-section>
              <q-item-section>
                <q-item-label>Puntaje maximo: {{ actividad.nota_maxima }} puntos</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-banner rounded class="bg-orange-1 text-orange-8 q-mb-md">
        <template #avatar><q-icon name="warning" color="orange" /></template>
        Una vez iniciado, no podras pausar el temporizador. Asegurate de tener una conexion estable.
      </q-banner>

      <q-card v-if="resultadoPrevio" flat bordered class="q-mb-md bg-blue-1">
        <q-card-section>
          <div class="text-subtitle2 text-weight-medium q-mb-xs">Resultado Previo</div>
          <div class="text-body2">Nota: <strong>{{ resultadoPrevio.nota }}</strong>/{{ actividad.nota_maxima }}</div>
          <div class="text-caption text-grey-7">Intentos usados: {{ intentosUsados }} de {{ intentosMaximos }}</div>
        </q-card-section>
      </q-card>

      <q-banner v-if="!puedeIntentar" rounded class="bg-grey-2 text-grey-8 q-mb-md">
        <template #avatar><q-icon name="block" color="grey" /></template>
        Has alcanzado el numero maximo de intentos permitidos.
      </q-banner>

      <div class="text-center">
        <q-btn color="primary" size="lg" icon="play_arrow" label="Iniciar Cuestionario" @click="iniciar" :disable="!puedeIntentar" />
      </div>
    </template>

    <q-form v-if="fase === 'activo'" ref="quizForm" @submit.prevent="finalizar" greedy>
      <div class="row items-center q-mb-lg">
        <div class="col">
          <div class="text-h6">{{ actividad.titulo }}</div>
        </div>
        <div class="col-auto">
          <q-chip :color="tiempoRestante <= 60 ? 'red' : 'primary'" text-color="white" icon="timer">
            {{ formatoTiempo }}
          </q-chip>
        </div>
      </div>

      <q-linear-progress :value="progresoQuiz" :color="tiempoRestante <= 60 ? 'red' : 'primary'" class="q-mb-md" size="6px" rounded />

      <div class="text-caption text-grey-7 q-mb-md">
        Pregunta {{ preguntaActual + 1 }} de {{ preguntas.length }}
        <span v-if="preguntas[preguntaActual].puntaje"> · {{ preguntas[preguntaActual].puntaje }} pts</span>
      </div>

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ preguntas[preguntaActual].enunciado }}</div>

          <template v-if="preguntas[preguntaActual].tipo === 'opcion_multiple'">
            <q-list>
              <q-item v-for="(opcion, i) in preguntas[preguntaActual].opciones" :key="i" tag="label" v-ripple>
                <q-item-section avatar>
                  <q-radio
                    v-model="respuestas[preguntaActual]"
                    :val="i"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opcion.texto }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </template>

          <template v-else-if="preguntas[preguntaActual].tipo === 'verdadero_falso'">
            <div class="row q-gutter-md">
              <div class="col">
                <q-card
                  :class="{ 'selected-card': respuestas[preguntaActual] === 0 }"
                  class="cursor-pointer vf-card"
                  flat bordered
                  @click="respuestas[preguntaActual] = 0"
                >
                  <q-card-section class="text-center">
                    <q-icon name="check" size="48px" :color="respuestas[preguntaActual] === 0 ? 'green' : 'grey-5'" />
                    <div class="text-h6 q-mt-sm">Verdadero</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col">
                <q-card
                  :class="{ 'selected-card': respuestas[preguntaActual] === 1 }"
                  class="cursor-pointer vf-card"
                  flat bordered
                  @click="respuestas[preguntaActual] = 1"
                >
                  <q-card-section class="text-center">
                    <q-icon name="close" size="48px" :color="respuestas[preguntaActual] === 1 ? 'red' : 'grey-5'" />
                    <div class="text-h6 q-mt-sm">Falso</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </template>

          <template v-else-if="preguntas[preguntaActual].tipo === 'respuesta_corta'">
            <q-input v-model="respuestas[preguntaActual]" label="Tu respuesta" outlined type="textarea" rows="3" />
          </template>
        </q-card-section>
      </q-card>

      <div class="row items-center q-gutter-sm">
        <q-btn flat color="primary" icon="arrow_back" label="Anterior" @click="anteriorPregunta" :disable="preguntaActual === 0" />
        <q-space />
        <q-btn
          v-if="preguntaActual < preguntas.length - 1"
          color="primary"
          icon="arrow_forward"
          label="Siguiente"
          @click="siguientePregunta"
        />
        <q-btn
          v-else
          type="submit"
          color="green"
          icon="send"
          label="Finalizar Cuestionario"
        />
      </div>

      <div class="row q-mt-md q-gutter-xs justify-center">
        <q-btn
          v-for="(p, i) in preguntas"
          :key="i"
          round
          dense
          size="sm"
          :color="respuestas[i] !== undefined ? 'primary' : 'grey-4'"
          :text-color="respuestas[i] !== undefined ? 'white' : 'grey-7'"
          :label="String(i + 1)"
          :aria-label="`Ir a la pregunta ${i + 1}`"
          @click="preguntaActual = i"
        />
      </div>
    </q-form>

    <template v-if="fase === 'resultado'">
      <div class="text-center q-pa-lg">
        <q-icon name="check_circle" :size="'64px'" :color="porcentaje >= 60 ? 'green' : 'red'" />
        <div class="text-h4 q-mt-md" :class="porcentaje >= 60 ? 'text-green' : 'text-red'">
          {{ notaObtenida }}/{{ puntajeMaximo }}
        </div>
        <div class="text-h6" :class="porcentaje >= 60 ? 'text-green' : 'text-red'">
          {{ porcentaje >= 60 ? 'Aprobado' : 'Reprobado' }}
        </div>
        <p class="text-grey-7 q-mt-sm">Cuestionario completado en {{ tiempoUsado }}</p>
        <p class="text-caption text-grey-6">Intentos usados: {{ intentosUsados }} de {{ intentosMaximos }}</p>

        <div class="q-mt-md" v-if="puedeIntentar">
          <q-btn color="primary" icon="replay" label="Intentar de Nuevo" @click="reiniciar" />
        </div>

        <q-separator class="q-my-lg" />

        <div class="text-subtitle1 text-weight-medium q-mb-md">Resumen de Respuestas</div>
        <q-list bordered separator>
          <q-item v-for="(pregunta, i) in preguntas" :key="i">
            <q-item-section avatar>
              <q-icon :name="esCorrecta(i) ? 'check_circle' : 'cancel'" :color="esCorrecta(i) ? 'green' : 'red'" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ pregunta.enunciado }}</q-item-label>
              <q-item-label caption>
                Tu respuesta: {{ textoRespuesta(i, pregunta) }}
                <template v-if="!esCorrecta(i) && pregunta.tipo !== 'respuesta_corta'">
                  · Correcta: {{ textoCorrecta(pregunta) }}
                </template>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="esCorrecta(i) ? 'green' : 'red'">
                {{ esCorrecta(i) ? '+' + (pregunta.puntaje || 0) : '+0' }}
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </template>

    <div class="text-center q-mt-lg" v-if="fase !== 'activo'">
      <q-btn flat color="primary" icon="arrow_back" label="Volver al Curso" @click="$emit('volver')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useActividadesStore } from 'src/stores/actividades.js'
import { useAuthStore } from 'src/stores/auth.js'

const $q = useQuasar()
const props = defineProps({ actividad: { type: Object, required: true } })
defineEmits(['volver'])

const actividadesStore = useActividadesStore()
const authStore = useAuthStore()

const fase = ref('inicio')
const preguntaActual = ref(0)
const respuestas = ref({})
const tiempoRestante = ref((props.actividad.config?.tiempo_limite_minutos || 20) * 60)
const tiempoUsado = ref('')
const notaObtenida = ref(0)
const quizForm = ref(null)
let timer = null

const datosIntentos = ref({ intentos: [], intentos_realizados: 0, intentos_maximos: 1, mejor_nota: null })

const preguntas = computed(() => props.actividad.config?.preguntas || [])

const intentosUsados = computed(() => datosIntentos.value.intentos_realizados || 0)
const intentosMaximos = computed(() => datosIntentos.value.intentos_maximos || props.actividad.config?.intentos_maximos || 1)
const puedeIntentar = computed(() => intentosUsados.value < intentosMaximos.value)

const resultadoPrevio = computed(() => {
  if (!datosIntentos.value.intentos?.length) return null
  return datosIntentos.value.intentos.reduce((mejor, i) => ((i.nota || 0) > (mejor.nota || 0) ? i : mejor), datosIntentos.value.intentos[0])
})

const formatoTiempo = computed(() => {
  const min = Math.floor(tiempoRestante.value / 60)
  const seg = tiempoRestante.value % 60
  return `${min}:${String(seg).padStart(2, '0')}`
})

const progresoQuiz = computed(() => (preguntaActual.value + 1) / preguntas.value.length)

const puntajeMaximo = computed(() => preguntas.value.reduce((s, p) => s + (p.puntaje || 0), 0))

const porcentaje = computed(() => {
  if (!puntajeMaximo.value) return 0
  return Math.round((notaObtenida.value / puntajeMaximo.value) * 100)
})

onMounted(async () => {
  datosIntentos.value = await actividadesStore.cargarIntentosCuestionario(props.actividad.id)
})

function iniciar() {
  fase.value = 'activo'
  timer = setInterval(() => {
    tiempoRestante.value--
    if (tiempoRestante.value <= 0) {
      clearInterval(timer)
      $q.notify({ message: 'Tiempo agotado! El cuestionario se entrega automaticamente.', color: 'warning', timeout: 3000 })
      finalizar()
    }
  }, 1000)
}

function anteriorPregunta() {
  if (preguntaActual.value > 0) preguntaActual.value--
}

function siguientePregunta() {
  if (preguntaActual.value < preguntas.value.length - 1) preguntaActual.value++
}

async function finalizar() {
  if (quizForm.value) {
    const ok = await quizForm.value.validate()
    if (!ok) {
      $q.notify({ message: 'Responde todas las preguntas antes de finalizar.', color: 'negative', icon: 'warning' })
      return
    }
  }
  clearInterval(timer)
  const tiempoTotal = (props.actividad.config?.tiempo_limite_minutos || 20) * 60
  const usado = tiempoTotal - tiempoRestante.value
  tiempoUsado.value = `${Math.floor(usado / 60)}m ${usado % 60}s`

  let nota = 0
  preguntas.value.forEach((p, i) => {
    if (esCorrecta(i)) nota += p.puntaje || 0
  })
  notaObtenida.value = nota
  fase.value = 'resultado'

  if (authStore.usuario) {
    try {
      const resultado = await actividadesStore.guardarResultadoCuestionario(
        authStore.usuario.id,
        props.actividad.id,
        { ...respuestas.value }
      )
      if (resultado) {
        notaObtenida.value = resultado.nota || nota
        datosIntentos.value = await actividadesStore.cargarIntentosCuestionario(props.actividad.id)
      }
    } catch (err) {
      $q.notify({ message: err?.message || 'Error al guardar intento', color: 'negative', timeout: 3000 })
    }
  }
}

function reiniciar() {
  fase.value = 'inicio'
  preguntaActual.value = 0
  respuestas.value = {}
  tiempoRestante.value = (props.actividad.config?.tiempo_limite_minutos || 20) * 60
  tiempoUsado.value = ''
  notaObtenida.value = 0
}

watch(() => props.actividad.id, () => {
  reiniciar()
})

function esCorrecta(i) {
  const pregunta = preguntas.value[i]
  const resp = respuestas.value[i]
  if (resp === undefined) return false
  if (pregunta.tipo === 'opcion_multiple' || pregunta.tipo === 'verdadero_falso') {
    return pregunta.opciones[resp]?.es_correcta === true
  }
  return true
}

function textoRespuesta(i, pregunta) {
  const resp = respuestas.value[i]
  if (resp === undefined) return 'Sin responder'
  if (pregunta.tipo === 'opcion_multiple' || pregunta.tipo === 'verdadero_falso') {
    return pregunta.opciones[resp]?.texto || '-'
  }
  return resp
}

function textoCorrecta(pregunta) {
  if (pregunta.tipo === 'opcion_multiple' || pregunta.tipo === 'verdadero_falso') {
    return pregunta.opciones.find((o) => o.es_correcta)?.texto || '-'
  }
  return '-'
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.vf-card {
  transition: all 0.2s;
}
.vf-card:hover {
  border-color: var(--q-primary);
}
.selected-card {
  border: 2px solid var(--q-primary);
  background: var(--q-primary-light, #e3f2fd);
}
</style>
