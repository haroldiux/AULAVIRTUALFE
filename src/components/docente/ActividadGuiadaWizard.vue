<template>
  <div class="activity-studio">
    <div class="studio-form">
      <q-form @submit.prevent="crearActividad" greedy>
      <q-banner v-if="!opcionesCurso.length" rounded class="bg-warning text-black q-mb-md">
        <template #avatar><q-icon name="warning" /></template>
        No tienes cursos asignados. Crea un curso antes de continuar.
      </q-banner>
      <q-stepper v-model="paso" flat animated color="primary" class="studio-stepper">
        <q-step :name="1" title="Ubicacion" icon="folder_open" :done="paso > 1">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select v-model="form.cursoId" :options="opcionesCurso" label="Curso" outlined emit-value map-options :rules="[val => !!val || 'Selecciona un curso']" @update:model-value="form.seccionId = null" />
            </div>
            <div class="col-12 col-md-6">
              <q-select v-model="form.seccionId" :options="opcionesSeccion" label="Unidad o seccion" outlined emit-value map-options :disable="!form.cursoId" :rules="[val => !!val || 'Selecciona una unidad o seccion']" />
            </div>
          </div>
          <q-stepper-navigation><TaButton variant="primary" label="Continuar" icon="arrow_forward" :disable="!form.seccionId" @click="paso = 2" /></q-stepper-navigation>
        </q-step>

        <q-step :name="2" title="Actividad" icon="add_task" :done="paso > 2">
          <div class="activity-types">
            <button
              v-for="tipo in tipos"
              :key="tipo.value"
              type="button"
              class="activity-type"
              :class="{ 'activity-type--active': form.tipo === tipo.value }"
              @click="form.tipo = tipo.value"
            >
              <q-avatar :color="tipo.color" text-color="white" :icon="tipo.icon" size="42px" />
              <span><strong>{{ tipo.label }}</strong><small>{{ tipo.descripcion }}</small></span>
            </button>
          </div>
          <q-input v-model="form.titulo" label="Titulo claro para el estudiante" outlined class="q-mt-md" :rules="[val => !!val?.trim() || 'El titulo es obligatorio']" />
          <q-input v-model="form.objetivo" label="Objetivo de aprendizaje" outlined type="textarea" rows="2" class="q-mt-md" />
          <q-stepper-navigation class="row q-gutter-sm">
            <TaButton variant="ghost" label="Atras" icon="arrow_back" @click="paso = 1" />
            <TaButton variant="primary" label="Configurar" icon="tune" :disable="!form.titulo.trim()" @click="paso = 3" />
          </q-stepper-navigation>
        </q-step>

        <q-step :name="3" title="Configuracion" icon="tune" :done="paso > 3">
          <q-banner rounded class="interaction-banner q-mb-md">
            <template #avatar><q-icon :name="modelo.accion_icon" color="primary" /></template>
            <strong>{{ modelo.accion_label }}</strong>
            <div class="text-caption">{{ modelo.accion_tooltip }} · Se completa mediante {{ labelRegla(modelo.regla_completado) }}.</div>
          </q-banner>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.fecha" label="Fecha limite" outlined type="datetime-local" />
            </div>
            <div class="col-12 col-md-3">
              <q-toggle v-model="form.calificable" label="Calificable" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model.number="form.puntos" label="Puntos" outlined type="number" min="0" :disable="!form.calificable" />
            </div>
          </div>

          <q-input v-model="form.instrucciones" label="Instrucciones para el estudiante" outlined type="textarea" rows="3" class="q-mt-md" />

          <div class="row q-col-gutter-md q-mt-xs">
            <div v-if="form.tipo === 'cuestionario'" class="col-12 col-md-6">
              <q-select v-model="form.bancoPreguntasId" :options="opcionesPreguntas" label="Banco de preguntas" outlined emit-value map-options clearable />
            </div>
            <div v-if="['tarea', 'foro'].includes(form.tipo)" class="col-12 col-md-6">
              <q-select v-model="form.rubricaId" :options="opcionesRubricas" label="Rubrica reutilizable" outlined emit-value map-options clearable />
            </div>
            <div v-if="form.tipo === 'cuestionario'" class="col-12 col-md-3">
              <q-input v-model.number="form.intentos" label="Intentos" outlined type="number" min="1" />
            </div>
            <div v-if="form.tipo === 'foro'" class="col-12 col-md-3">
              <q-input v-model.number="form.participaciones" label="Participaciones requeridas" outlined type="number" min="1" />
            </div>
          </div>

          <q-stepper-navigation class="row q-gutter-sm">
            <TaButton variant="ghost" label="Atras" icon="arrow_back" @click="paso = 2" />
            <TaButton variant="primary" label="Previsualizar" icon="visibility" @click="paso = 4" />
          </q-stepper-navigation>
        </q-step>

        <q-step :name="4" title="Vista estudiante" icon="visibility">
          <div class="student-preview">
            <div class="student-preview__header">
              <q-avatar :color="tipoActivo.color" text-color="white" :icon="tipoActivo.icon" size="48px" />
              <div>
                <div class="text-h6 text-weight-bold">{{ form.titulo }}</div>
                <div class="text-caption text-grey">{{ cursoSeleccionado?.codigo }} · {{ seccionSeleccionada?.titulo }}</div>
              </div>
            </div>
            <p class="q-mt-md q-mb-sm">{{ form.objetivo }}</p>
            <div class="student-preview__meta">
              <q-chip dense :icon="modelo.accion_icon" color="primary" text-color="white">{{ modelo.accion_label }}</q-chip>
              <q-chip dense icon="event" color="grey-2" text-color="grey-9">{{ form.fecha ? formatoFecha(form.fecha) : 'Sin fecha limite' }}</q-chip>
              <q-chip v-if="form.calificable" dense icon="grade" color="teal" text-color="white">{{ form.puntos }} pts</q-chip>
            </div>
            <div class="student-preview__instructions">{{ form.instrucciones || 'El docente agregara instrucciones antes de publicar.' }}</div>
            <q-btn unelevated no-caps :icon="modelo.accion_icon" :label="modelo.accion_label" color="primary" class="q-mt-md" />
          </div>
          <q-stepper-navigation class="row q-gutter-sm">
            <TaButton variant="ghost" label="Atras" icon="arrow_back" @click="paso = 3" />
            <TaButton variant="primary" label="Crear actividad" icon="add_task" type="submit" />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
      </q-form>
    </div>

    <aside class="studio-summary">
      <div class="text-subtitle1 text-weight-bold">Resumen</div>
      <div class="text-caption text-grey q-mb-md">La configuracion cambia segun el tipo de actividad.</div>
      <div class="summary-row"><span>Interaccion</span><strong>{{ labelInteraccion(modelo.modo_interaccion) }}</strong></div>
      <div class="summary-row"><span>Completado</span><strong>{{ labelRegla(modelo.regla_completado) }}</strong></div>
      <div class="summary-row"><span>Entrega de archivo</span><strong>{{ modelo.requiere_entrega ? 'Si' : 'No' }}</strong></div>
      <div class="summary-row"><span>Calificacion</span><strong>{{ form.calificable ? `${form.puntos} pts` : 'Sin nota' }}</strong></div>
      <q-separator class="q-my-md" />
      <div class="text-caption text-grey">El estudiante nunca vera “Subir tarea” en cuestionarios, foros, encuestas, lecciones o interactivos.</div>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useCursosStore } from 'src/stores/cursos'
import { useActividadesStore } from 'src/stores/actividades'
import { useHerramientasDocenteStore } from 'src/stores/herramientasDocente'
import { getActivityModel } from 'src/utils/activityModel'
import TaButton from 'src/components/tailadmin/TaButton.vue'

const emit = defineEmits(['created'])
const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()
const herramientas = useHerramientasDocenteStore()

const paso = ref(1)
const form = ref(nuevoForm())

const tipos = [
  { value: 'tarea', label: 'Tarea', icon: 'assignment', color: 'orange', descripcion: 'Archivo, texto o enlace' },
  { value: 'cuestionario', label: 'Cuestionario', icon: 'quiz', color: 'purple', descripcion: 'Intento dentro del sistema' },
  { value: 'foro', label: 'Foro', icon: 'forum', color: 'teal', descripcion: 'Participacion y debate' },
  { value: 'encuesta', label: 'Encuesta', icon: 'poll', color: 'green', descripcion: 'Respuesta dentro del sistema' },
  { value: 'h5p', label: 'Interactivo', icon: 'extension', color: 'pink', descripcion: 'Contenido H5P' },
  { value: 'leccion', label: 'Leccion', icon: 'article', color: 'indigo', descripcion: 'Lectura y confirmacion' },
]

function nuevoForm() {
  return {
    cursoId: null,
    seccionId: null,
    tipo: 'tarea',
    titulo: '',
    objetivo: '',
    instrucciones: '',
    fecha: '',
    calificable: true,
    puntos: 100,
    intentos: 1,
    participaciones: 1,
    bancoPreguntasId: null,
    rubricaId: null,
  }
}

const cursosDocente = computed(() => cursosStore.cursos.filter((curso) => curso.docente_id === auth.usuario?.id))
const opcionesCurso = computed(() => cursosDocente.value.map((curso) => ({ label: `${curso.codigo} · ${curso.nombre}`, value: curso.id })))
const cursoSeleccionado = computed(() => cursosStore.getCursoById(form.value.cursoId))
const opcionesSeccion = computed(() => cursoSeleccionado.value?.secciones?.map((seccion) => ({ label: seccion.titulo, value: seccion.id })) || [])
const seccionSeleccionada = computed(() => cursoSeleccionado.value?.secciones?.find((seccion) => seccion.id === form.value.seccionId))
const tipoActivo = computed(() => tipos.find((tipo) => tipo.value === form.value.tipo) || tipos[0])
const modelo = computed(() => getActivityModel({ tipo: form.value.tipo, tiene_nota: form.value.calificable, nota_maxima: form.value.puntos, config: {} }))
const opcionesPreguntas = computed(() => herramientas.plantillas.filter((item) => item.categoria === 'preguntas').map((item) => ({ label: item.nombre, value: item.id })))
const opcionesRubricas = computed(() => herramientas.plantillas.filter((item) => item.categoria === 'rubrica').map((item) => ({ label: item.nombre, value: item.id })))

watch(() => form.value.tipo, (tipo) => {
  form.value.calificable = !['encuesta', 'leccion'].includes(tipo)
  form.value.puntos = form.value.calificable ? 100 : 0
  form.value.bancoPreguntasId = null
  form.value.rubricaId = null
})

function crearActividad() {
  if (!form.value.seccionId || !form.value.titulo.trim()) return
  const config = {
    instrucciones: form.value.instrucciones,
    seguimiento_requerido: true,
    modo_interaccion: modelo.value.modo_interaccion,
    regla_completado: modelo.value.regla_completado,
    fecha_limite: form.value.fecha || null,
    fecha_entrega: form.value.tipo === 'tarea' ? form.value.fecha || null : null,
    fecha_cierre: ['cuestionario', 'foro', 'encuesta'].includes(form.value.tipo) ? form.value.fecha || null : null,
    intentos_maximos: form.value.tipo === 'cuestionario' ? form.value.intentos : undefined,
    participaciones_requeridas: form.value.tipo === 'foro' ? form.value.participaciones : undefined,
    banco_preguntas_id: form.value.bancoPreguntasId,
    rubrica_id: form.value.rubricaId,
    rubrica: rubricaSeleccionada(),
    preguntas: form.value.tipo === 'cuestionario' ? preguntasSeleccionadas() : undefined,
    contenido_html: form.value.tipo === 'leccion' ? form.value.instrucciones : undefined,
    demo_content_path: form.value.tipo === 'h5p' ? '/h5p/contents/demo-1' : undefined,
  }
  const orden = actividadesStore.actividades.filter((actividad) => actividad.seccion_id === form.value.seccionId).length + 1
  const actividadId = actividadesStore.agregarActividad({
    seccion_id: form.value.seccionId,
    tipo: form.value.tipo,
    titulo: form.value.titulo.trim(),
    descripcion: form.value.objetivo.trim(),
    orden,
    tiene_nota: form.value.calificable,
    nota_maxima: form.value.calificable ? form.value.puntos : 0,
    peso: form.value.calificable ? 1 : 0,
    config,
  })
  herramientas.registrarCreacionGuiada({ actividadId, cursoId: form.value.cursoId, tipo: form.value.tipo })
  $q.notify({ message: 'Actividad creada y lista para revisar', color: 'positive', icon: 'add_task' })
  emit('created', { actividadId, cursoId: form.value.cursoId })
  router.push({ path: `/docente/curso/${form.value.cursoId}/builder`, query: { actividad: actividadId } })
}

function preguntasSeleccionadas() {
  const banco = herramientas.plantillas.find((item) => item.id === form.value.bancoPreguntasId)
  return banco?.datos?.preguntas || []
}

function rubricaSeleccionada() {
  const rubrica = herramientas.plantillas.find((item) => item.id === form.value.rubricaId)
  return rubrica?.datos || null
}

function formatoFecha(fecha) { return new Date(fecha).toLocaleString('es-BO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
function labelInteraccion(valor) { return { entrega: 'Entrega', intento_sistema: 'Intento en sistema', participacion: 'Participacion', respuesta_sistema: 'Respuesta en sistema', interactivo: 'Interaccion', lectura: 'Lectura' }[valor] || valor }
function labelRegla(valor) { return { entrega_enviada: 'enviar la tarea', intento_finalizado: 'finalizar el intento', hilo_o_respuesta: 'participar en el foro', encuesta_enviada: 'responder la encuesta', interaccion_completada: 'completar el interactivo', marcar_vista: 'marcar como vista' }[valor] || valor }
</script>

<style scoped>
.activity-studio { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 18px; align-items: start; }
.studio-form, .studio-summary { border: 1px solid var(--ta-border-card); border-radius: 12px; background: var(--ta-bg-card); }
.studio-stepper { background: transparent; }
.studio-summary { padding: 18px; position: sticky; top: 16px; }
.activity-types { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.activity-type { display: flex; gap: 10px; align-items: center; min-height: 72px; padding: 10px; border: 1px solid var(--ta-border-card); border-radius: 10px; background: transparent; color: var(--ta-text-primary); text-align: left; cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease; }
.activity-type:hover, .activity-type--active { transform: translateY(-2px); border-color: var(--ta-primary); }
.activity-type span { display: grid; min-width: 0; }
.activity-type small { color: var(--ta-text-secondary); }
.interaction-banner { background: rgba(var(--primary-rgb), 0.08); color: var(--ta-text-primary); }
.student-preview { max-width: 680px; border: 1px solid var(--ta-border-card); border-radius: 12px; padding: 20px; background: var(--ta-bg-card); }
.student-preview__header { display: flex; align-items: center; gap: 12px; }
.student-preview__meta { display: flex; flex-wrap: wrap; gap: 8px; }
.student-preview__instructions { margin-top: 14px; border-left: 3px solid var(--ta-primary); padding: 10px 12px; color: var(--ta-text-secondary); background: rgba(var(--primary-rgb), 0.05); }
.summary-row { display: grid; gap: 2px; padding: 10px 0; border-bottom: 1px solid var(--ta-border-card); }
.summary-row span { color: var(--ta-text-secondary); font-size: 0.75rem; }
@media (max-width: 1000px) { .activity-studio { grid-template-columns: 1fr; } .studio-summary { position: static; } }
@media (max-width: 700px) { .activity-types { grid-template-columns: 1fr 1fr; } }
</style>
