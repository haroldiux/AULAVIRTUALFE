<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Curso" :breadcrumbs="['Mis Cursos', curso?.nombre ?? 'Curso']" data-tour="student-course-header" />

    <div v-if="curso">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-3">
          <TaCard :padding="false" :shadow="false" customClass="sidebar-sticky" data-tour="student-course-sidebar">
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium">{{ curso.nombre }}</div>
              <div class="text-caption text-grey-7">{{ curso.codigo }}</div>
            </q-card-section>

            <q-separator />

            <q-list dense>
              <q-item
                v-for="seccion in curso.secciones"
                :key="seccion.id"
                clickable
                v-ripple
                :active="seccionActiva?.id === seccion.id && !actividadSeleccionada"
                active-class="text-primary bg-primary-light"
                @click="seleccionarSeccion(seccion)"
              >
                <q-item-section avatar>
                  <q-icon name="folder" size="xs" :color="seccionActiva?.id === seccion.id ? 'primary' : 'grey-6'" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2">{{ seccion.titulo }}</q-item-label>
                  <q-item-label caption>{{ getActividadesCount(seccion.id) }} actividades</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <q-separator />

            <q-card-section>
              <div class="text-caption text-grey-7 q-mb-xs">Actividades realizadas</div>
              <q-linear-progress :value="ratio(contadoresCurso.realizadas, contadoresCurso.total)" color="green" size="10px" rounded />
              <div class="text-caption text-right text-grey-6 q-mt-xs">{{ contadoresCurso.labelRealizadas }}</div>
            </q-card-section>

            <q-separator />

            <!-- Pendientes del curso -->
            <q-card-section class="q-pa-none">
              <div class="text-caption text-weight-bold uppercase tracking-widest text-grey q-px-md q-py-sm">
                Pendientes
                <q-badge v-if="pendientesMostrados.length" color="negative" text-color="white" dense class="q-ml-xs">{{ pendientesMostrados.length }}</q-badge>
              </div>
              <q-list dense separator>
                <q-item v-if="pendientesMostrados.length === 0" class="text-center q-py-sm text-grey">
                  <q-item-section>
                    <q-icon name="check_circle" size="24px" color="positive" />
                    <div class="text-caption">Sin pendientes</div>
                  </q-item-section>
                </q-item>
                <q-item
                  v-for="act in pendientesMostrados"
                  :key="act.id"
                  clickable
                  v-ripple
                  class="q-px-md"
                  @click="abrirActividadPorId(act.id)"
                >
                  <q-item-section avatar style="min-width: 0">
                    <q-icon :name="iconoTipo(act.tipo)" :color="colorTipo(act.tipo)" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-caption text-weight-medium line-clamp-1">{{ act.titulo }}</q-item-label>
                    <q-item-label caption>
                      <span :class="urgenciaClase(act.config?.fecha_limite || act.config?.fecha_entrega)">{{ formatoFechaLimite(act.config?.fecha_limite || act.config?.fecha_entrega) }}</span>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="colorTipo(act.tipo)" text-color="white" dense size="xs">{{ labelTipo(act.tipo) }}</q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </TaCard>
        </div>

        <div class="col-12 col-md-9" data-tour="student-course-content">
          <template v-if="actividadSeleccionada">
            <component
              :is="componenteActividad"
              :actividad="actividadSeleccionada"
              @volver="actividadSeleccionada = null"
              @h5p-completed="onH5pCompleted"
            />
          </template>

          <template v-else-if="seccionActiva">
            <TaCard :padding="false" :shadow="false">
              <q-card-section>
                <div class="text-h6">{{ seccionActiva.titulo }}</div>
                <p class="text-grey-7 q-mb-none">{{ seccionActiva.descripcion }}</p>
              </q-card-section>
            </TaCard>

            <div class="q-mt-sm">
              <q-card
                v-for="act in actividadesSeccion"
                :key="act.id"
                flat
                bordered
                class="q-mt-sm cursor-pointer actividad-card card-item"
                :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'"
                @click="abrirActividad(act)"
              >
                <q-card-section horizontal>
                  <q-card-section class="flex flex-center q-pa-md">
                    <q-icon :name="iconoTipo(act.tipo)" :color="colorTipo(act.tipo)" size="md" />
                  </q-card-section>
                  <q-card-section>
                    <div class="text-subtitle2 text-weight-medium">{{ act.titulo }}</div>
                    <div class="text-caption text-grey-6">{{ act.descripcion }}</div>
                    <div class="q-mt-sm">
                      <q-badge :color="colorTipo(act.tipo)" text-color="white" class="q-mr-sm">
                        {{ labelTipo(act.tipo) }}
                      </q-badge>
                      <q-badge v-if="act.tiene_nota" color="grey-4" text-color="grey-8">
                        {{ act.nota_maxima }} pts
                      </q-badge>
                      <q-badge v-else color="grey-3" text-color="grey-7">Sin nota</q-badge>
                      <q-badge
                        :color="colorEstado(getEstadoActividad(act))"
                        text-color="white"
                        class="q-ml-sm"
                        size="xs"
                      >
                        {{ labelEstado(getEstadoActividad(act)) }}
                      </q-badge>
                      <q-badge color="grey-2" text-color="grey-8" class="q-ml-sm" size="xs">
                        {{ actividadesStore.getModeloActividad(act).accion_label }}
                      </q-badge>
                    </div>
                  </q-card-section>
                  <q-card-section class="flex flex-center">
                    <q-icon name="chevron_right" color="grey-5" size="sm" />
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>

            <div v-if="actividadesSeccion.length === 0" class="text-center q-pa-xl text-grey-6">
              <q-icon name="inbox" size="48px" color="grey-4" />
              <p>No hay actividades en esta seccion.</p>
            </div>
          </template>

          <div v-else class="flex flex-center q-pa-xl">
            <div class="text-center text-grey-6">
              <q-icon name="touch_app" size="64px" color="grey-4" />
              <p class="q-mt-md">Selecciona una seccion del menu lateral para ver sus actividades.</p>
              <p class="text-caption">Tambien puedes hacer click en una actividad para acceder a su contenido.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, markRaw, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useCursosStore } from 'src/stores/cursos'
import { useActividadesStore } from 'src/stores/actividades'
import { useAuthStore } from 'src/stores/auth'
import { calificaciones as mockCalificaciones } from 'src/mock/index.js'
import { useStaggerCards, useReflectionHover } from 'src/composables/useAnimations'
import ActividadLeccion from 'src/components/actividades/ActividadLeccion.vue'
import ActividadTarea from 'src/components/actividades/ActividadTarea.vue'
import ActividadForo from 'src/components/actividades/ActividadForo.vue'
import ActividadCuestionario from 'src/components/actividades/ActividadCuestionario.vue'
import ActividadEncuesta from 'src/components/actividades/ActividadEncuesta.vue'
import ActividadH5P from 'src/components/actividades/ActividadH5P.vue'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'

const route = useRoute()
const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()
const auth = useAuthStore()

const seccionActiva = ref(null)
const actividadSeleccionada = ref(null)

const curso = computed(() => cursosStore.getCursoById(Number(route.params.id)))
const estudianteId = computed(() => auth.usuario?.id ?? null)

const actividadesSeccion = computed(() => {
  if (!seccionActiva.value) return []
  return actividadesStore.actividades
    .filter((a) => a.seccion_id === seccionActiva.value.id)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
})

// Actividades pendientes del estudiante logueado en este curso
const pendientesCurso = computed(() => {
  if (!estudianteId.value || !curso.value) return []
  const agrupado = actividadesStore.getPendientesPorEstudiante(estudianteId.value)
  const miCurso = agrupado.find((c) => c.curso.id === curso.value.id)
  if (!miCurso) return []
  return miCurso.secciones.flatMap((s) => s.actividades)
})

// Si hay seccion activa, mostrar solo pendientes de esa seccion; sino todos
const pendientesMostrados = computed(() => {
  if (!seccionActiva.value) return pendientesCurso.value
  return pendientesCurso.value.filter((a) => a.seccion_id === seccionActiva.value.id)
})

const contadoresCurso = computed(() => {
  if (!estudianteId.value || !curso.value) return { total: 0, realizadas: 0, pendientes: 0, labelRealizadas: '0/0' }
  return actividadesStore.getContadoresCursoEstudiante(estudianteId.value, curso.value)
})

function getEstadoActividad(act) {
  if (!estudianteId.value) return 'pendiente'
  return actividadesStore.getEstadoActividadEstudiante(estudianteId.value, act)
}

const mapaComponentes = {
  leccion: markRaw(ActividadLeccion),
  tarea: markRaw(ActividadTarea),
  foro: markRaw(ActividadForo),
  cuestionario: markRaw(ActividadCuestionario),
  encuesta: markRaw(ActividadEncuesta),
  h5p: markRaw(ActividadH5P),
}

const componenteActividad = computed(() => {
  if (!actividadSeleccionada.value) return null
  return mapaComponentes[actividadSeleccionada.value.tipo] || null
})

function getActividadesCount(seccionId) {
  return actividadesStore.actividades.filter((a) => a.seccion_id === seccionId).length
}

function ratio(actual, total) {
  return total > 0 ? actual / total : 0
}

function seleccionarSeccion(seccion) {
  seccionActiva.value = seccion
  actividadSeleccionada.value = null
}

function abrirActividad(act) {
  actividadSeleccionada.value = act
}

function abrirActividadPorId(actividadId) {
  const act = actividadesStore.actividades.find((a) => a.id === actividadId)
  if (!act) return
  // Encontrar la seccion a la que pertenece
  const seccion = curso.value?.secciones.find((s) => s.id === act.seccion_id)
  if (seccion) {
    seccionActiva.value = seccion
    nextTick(() => {
      actividadSeleccionada.value = act
    })
  }
}

function onH5pCompleted({ raw, max, notaFinal }) {
  if (!estudianteId.value || !actividadSeleccionada.value) return
  const actId = actividadSeleccionada.value.id
  const cursoId = curso.value?.id
  if (!cursoId) return
  // Crear entrega via store
  actividadesStore.crearEntrega(
    estudianteId.value,
    actId,
    JSON.stringify({ texto: `H5P completado. Puntuacion: ${raw}/${max}`, archivos: [] })
  )
  actividadesStore.marcarActividadRealizada(estudianteId.value, actId)
  // Guardar calificacion en mock
  if (!mockCalificaciones[cursoId]) mockCalificaciones[cursoId] = {}
  if (!mockCalificaciones[cursoId][estudianteId.value]) mockCalificaciones[cursoId][estudianteId.value] = {}
  mockCalificaciones[cursoId][estudianteId.value][actId] = {
    nota: notaFinal,
    porcentaje: Math.round((notaFinal / (actividadSeleccionada.value.nota_maxima || 100)) * 100),
    retro: 'Calificacion automatica por H5P',
  }
}

function colorEstado(estado) {
  const m = { pendiente: 'orange', vencida: 'negative', entregado: 'green', entregada: 'green', calificado: 'blue', calificada: 'blue', completado: 'indigo', realizada: 'teal' }
  return m[estado] || 'grey'
}

function labelEstado(estado) {
  const m = { pendiente: 'Pendiente', vencida: 'Vencida', entregado: 'Entregado', entregada: 'Entregada', calificado: 'Calificado', calificada: 'Calificada', completado: 'Completado', realizada: 'Realizada' }
  return m[estado] || estado
}

function labelTipo(tipo) {
  const m = { leccion: 'Leccion', tarea: 'Tarea', foro: 'Foro', cuestionario: 'Cuestionario', encuesta: 'Encuesta', h5p: 'Contenido H5P' }
  return m[tipo] ?? tipo
}

function iconoTipo(tipo) {
  const m = { leccion: 'article', tarea: 'assignment', foro: 'forum', cuestionario: 'quiz', encuesta: 'poll', h5p: 'extension' }
  return m[tipo] ?? 'help'
}

function colorTipo(tipo) {
  const m = { leccion: 'indigo', tarea: 'orange', foro: 'teal', cuestionario: 'purple', encuesta: 'green', h5p: 'pink' }
  return m[tipo] ?? 'grey'
}

function formatoFechaLimite(fechaStr) {
  if (!fechaStr) return 'Sin fecha limite'
  const fecha = new Date(fechaStr)
  const hoy = new Date()
  const diff = fecha - hoy
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (dias < 0) return `Vencio hace ${Math.abs(dias)} dias`
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence manana'
  return `Vence en ${dias} dias`
}

function urgenciaClase(fechaStr) {
  if (!fechaStr) return 'text-grey'
  const fecha = new Date(fechaStr)
  const hoy = new Date()
  const diff = fecha - hoy
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (dias < 0) return 'text-negative'
  if (dias <= 3) return 'text-warning'
  return 'text-positive'
}

// Abrir actividad automaticamente si viene por query param
function abrirActividadDesdeQuery() {
  const actId = Number(route.query.actividad)
  if (!actId || !curso.value) return
  const act = actividadesStore.actividades.find((a) => a.id === actId)
  if (!act) return
  // Verificar que pertenezca a este curso
  const seccion = curso.value.secciones.find((s) => s.id === act.seccion_id)
  if (!seccion) return
  seccionActiva.value = seccion
  nextTick(() => {
    actividadSeleccionada.value = act
  })
}

onMounted(() => {
  abrirActividadDesdeQuery()
})

watch(() => route.query.actividad, () => {
  abrirActividadDesdeQuery()
})

useStaggerCards('.card-item')
useReflectionHover('.actividad-card')
</script>

<style scoped>
.sidebar-sticky {
  position: sticky;
  top: 16px;
}
.actividad-card {
  border-radius: 16px;
  border: 1px solid var(--ta-border-card);
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.actividad-card:hover {
  box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.12);
  transform: translateY(-3px);
  border-color: rgba(var(--primary-rgb), 0.4);
}
.body--dark .actividad-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  border-color: rgba(129, 140, 248, 0.4);
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
