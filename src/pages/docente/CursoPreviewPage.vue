<template>
  <q-page class="av-dashboard-page">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el label="Mis Cursos" to="/docente/cursos" />
      <q-breadcrumbs-el label="Builder" :to="`/docente/curso/${curso?.id}/builder`" />
      <q-breadcrumbs-el label="Previsualizar" />
    </q-breadcrumbs>

    <AppSkeleton v-if="cargando" variant="list" :count="5" />

    <template v-else>
      <!-- Banner de preview -->
      <div class="preview-hero q-mb-lg">
        <div class="preview-hero__content">
          <div class="preview-hero__eyebrow">Vista previa del curso</div>
          <div class="text-h5 text-weight-bold">{{ curso.nombre }}</div>
          <div class="text-caption preview-hero__caption">Estas viendo como se vera el curso para los estudiantes.</div>
        </div>
        <div class="preview-hero__action">
          <TaButton variant="light" icon="arrow_back" label="Volver al Builder" :to="`/docente/curso/${curso?.id}/builder`" />
        </div>
      </div>

      <div v-if="curso">
      <div class="row q-col-gutter-md">
        <!-- Sidebar -->
        <div class="col-12 col-md-3">
          <q-card flat class="content-card sidebar-sticky">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">{{ curso.nombre }}</div>
              <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ curso.codigo }}</div>
            </q-card-section>
            <q-separator />
            <q-list dense class="q-py-sm">
              <q-item
                v-for="seccion in curso.secciones"
                :key="seccion.id"
                clickable
                v-ripple
                class="sidebar-item q-mx-sm q-mb-xs"
                :active="seccionActiva?.id === seccion.id && !actividadSeleccionada"
                :active-class="$q.dark.isActive ? 'bg-indigo-9 text-indigo-2' : 'bg-indigo-1 text-primary'"
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
              <div class="text-caption q-mb-xs" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Actividades realizadas</div>
              <q-linear-progress :value="ratio(realizadasSimuladas, totalActividades)" color="primary" size="10px" rounded />
              <div class="text-caption text-right q-mt-xs" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ realizadasSimuladas }}/{{ totalActividades }}</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Content -->
        <div class="col-12 col-md-9">
          <template v-if="actividadSeleccionada">
            <component
              :is="componenteActividad"
              :actividad="actividadSeleccionada"
              @volver="actividadSeleccionada = null"
            />
          </template>

          <template v-else-if="seccionActiva">
            <q-card flat class="content-card q-mb-md">
              <q-card-section>
                <div class="text-h6 text-weight-bold">{{ seccionActiva.titulo }}</div>
                <p class="q-mb-none" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ seccionActiva.descripcion }}</p>
              </q-card-section>
            </q-card>

            <div class="q-mt-sm">
              <q-card
                v-for="act in actividadesSeccion"
                :key="act.id"
                flat
                class="q-mt-md cursor-pointer actividad-card"
                @click="abrirActividad(act)"
              >
                <q-card-section horizontal>
                  <q-card-section class="flex flex-center q-pa-md">
                    <div class="actividad-card__icon">
                      <q-icon :name="iconoTipo(act.tipo)" :color="colorTipo(act.tipo)" size="md" />
                    </div>
                  </q-card-section>
                  <q-card-section>
                    <div class="text-subtitle2 text-weight-bold">{{ act.titulo }}</div>
                    <div class="text-caption line-clamp-2" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ act.descripcion }}</div>
                    <div class="q-mt-sm row q-gutter-xs">
                      <q-badge :color="colorTipo(act.tipo)" text-color="white">{{ labelTipo(act.tipo) }}</q-badge>
                      <q-badge v-if="act.tiene_nota" class="score-badge" text-color="white">{{ act.nota_maxima }} pts</q-badge>
                      <q-badge v-else class="score-badge score-badge--empty" text-color="white">Sin nota</q-badge>
                      <q-badge class="action-badge" text-color="white">{{ actividadesStore.getModeloActividad(act).accion_label }}</q-badge>
                    </div>
                  </q-card-section>
                  <q-card-section class="flex flex-center">
                    <q-icon name="chevron_right" :color="$q.dark.isActive ? 'grey-6' : 'grey-5'" size="sm" />
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>

            <AppEmptyState
              v-if="actividadesSeccion.length === 0"
              icon="inbox"
              title="Sin actividades"
              message="No hay actividades en esta seccion."
            />
          </template>

          <div v-else class="flex flex-center q-pa-xl">
            <AppEmptyState
              icon="touch_app"
              title="Explora el curso"
              message="Selecciona una seccion del menu lateral para ver sus actividades."
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-center q-pa-xl">
      <div class="text-center" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
        <q-icon name="error_outline" size="48px" :color="$q.dark.isActive ? 'grey-6' : 'grey-4'" />
        <p class="q-mt-md">Curso no encontrado.</p>
      </div>
    </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, markRaw, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import { useLoadingState } from 'src/composables/useLoadingState'
import { useCursosStore } from 'src/stores/cursos'
import { useActividadesStore } from 'src/stores/actividades'
import ActividadLeccion from 'src/components/actividades/ActividadLeccion.vue'
import ActividadTarea from 'src/components/actividades/ActividadTarea.vue'
import ActividadForo from 'src/components/actividades/ActividadForo.vue'
import ActividadCuestionario from 'src/components/actividades/ActividadCuestionario.vue'
import ActividadEncuesta from 'src/components/actividades/ActividadEncuesta.vue'
import ActividadH5P from 'src/components/actividades/ActividadH5P.vue'

const $q = useQuasar()
const route = useRoute()
const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()
const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 600 })

const seccionActiva = ref(null)
const actividadSeleccionada = ref(null)

const curso = computed(() => cursosStore.getCursoById(Number(route.params.id)))

onMounted(() => {
  finalizarCarga()
})

const actividadesSeccion = computed(() => {
  if (!seccionActiva.value) return []
  return actividadesStore.actividades
    .filter((a) => a.seccion_id === seccionActiva.value.id)
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
})

const totalActividades = computed(() => {
  if (!curso.value) return 0
  return actividadesStore.actividades.filter((actividad) => curso.value.secciones.some((seccion) => seccion.id === actividad.seccion_id)).length
})
const realizadasSimuladas = computed(() => Math.min(Math.ceil(totalActividades.value / 3), totalActividades.value))

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

function seleccionarSeccion(seccion) {
  seccionActiva.value = seccion
  actividadSeleccionada.value = null
}

function abrirActividad(act) {
  actividadSeleccionada.value = act
}

function ratio(actual, total) {
  return total > 0 ? actual / total : 0
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
</script>

<style scoped>
.preview-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 26px;
  border-radius: 22px;
  background: var(--gradient-unitepc-panel);
  box-shadow: 0 18px 40px rgba(38, 24, 60, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.16);
  color: #ffffff;
  position: relative;
  overflow: hidden;
}
.preview-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.22), transparent 32%),
              linear-gradient(120deg, rgba(255, 255, 255, 0.12), transparent 44%, rgba(255, 255, 255, 0.06) 74%, transparent);
  pointer-events: none;
}
.preview-hero__content,
.preview-hero__action { position: relative; z-index: 1; }
.preview-hero__eyebrow {
  width: fit-content;
  margin-bottom: 8px;
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
}
.preview-hero__caption { color: rgba(255, 255, 255, 0.84); }
.sidebar-sticky {
  position: sticky;
  top: 16px;
}
.sidebar-item {
  border-radius: 12px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.sidebar-item:hover {
  transform: translateX(2px);
}
.actividad-card {
  border-radius: 16px;
  border: 1px solid var(--ta-border-card);
  background: var(--ta-bg-card);
  box-shadow: var(--shadow-card);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.actividad-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: rgba(var(--primary-rgb), 0.22);
}
.actividad-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(var(--primary-rgb), 0.10);
}
.body--dark .actividad-card__icon {
  background: rgba(var(--primary-rgb), 0.18);
}
.score-badge {
  background: rgba(var(--primary-rgb), 0.12);
  color: var(--ta-primary);
  font-weight: 600;
}
.body--dark .score-badge {
  background: rgba(var(--primary-rgb), 0.2);
  color: var(--ta-text-primary);
}
.score-badge--empty {
  background: rgba(148, 163, 184, 0.2);
  color: var(--ta-text-secondary);
}
.action-badge {
  background: rgba(13, 148, 136, 0.12);
  color: var(--ta-info);
  font-weight: 600;
}
.body--dark .action-badge {
  background: rgba(13, 148, 136, 0.2);
  color: var(--ta-text-primary);
}
.content-card {
  border-radius: 18px;
  border: 1px solid var(--ta-border-card);
  background: var(--ta-bg-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}
@media (max-width: 700px) {
  .preview-hero { flex-direction: column; align-items: flex-start; }
}
</style>
