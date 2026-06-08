<template>
  <q-page class="av-dashboard-page">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el label="Mis Cursos" to="/docente/cursos" />
      <q-breadcrumbs-el label="Builder" :to="`/docente/curso/${curso?.id}/builder`" />
      <q-breadcrumbs-el label="Previsualizar" />
    </q-breadcrumbs>

    <!-- Banner de preview -->
    <q-banner class="q-mb-lg rounded-lg" :class="$q.dark.isActive ? 'bg-indigo-10 text-indigo-2' : 'bg-indigo-1 text-indigo-10'">
      <template #avatar>
        <q-icon name="visibility" color="primary" />
      </template>
      <div class="text-weight-bold">Modo Previsualizacion</div>
      <div class="text-caption">Estas viendo como se vera el curso para los estudiantes.</div>
      <template #action>
        <q-btn flat color="primary" label="Volver al Builder" :to="`/docente/curso/${curso?.id}/builder`" />
      </template>
    </q-banner>

    <div v-if="curso">
      <div class="row q-col-gutter-md">
        <!-- Sidebar -->
        <div class="col-12 col-md-3">
          <q-card flat class="content-card sidebar-sticky" :class="$q.dark.isActive ? 'content-card--dark' : 'content-card--light'">
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium">{{ curso.nombre }}</div>
              <div class="text-caption text-grey">{{ curso.codigo }}</div>
            </q-card-section>
            <q-separator />
            <q-list dense>
              <q-item
                v-for="seccion in curso.secciones"
                :key="seccion.id"
                clickable
                v-ripple
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
              <div class="text-caption text-grey q-mb-xs">Actividades realizadas</div>
              <q-linear-progress :value="ratio(realizadasSimuladas, totalActividades)" color="primary" size="10px" rounded />
              <div class="text-caption text-right text-grey q-mt-xs">{{ realizadasSimuladas }}/{{ totalActividades }}</div>
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
            <q-card flat class="content-card q-mb-md" :class="$q.dark.isActive ? 'content-card--dark' : 'content-card--light'">
              <q-card-section>
                <div class="text-h6">{{ seccionActiva.titulo }}</div>
                <p class="text-grey q-mb-none">{{ seccionActiva.descripcion }}</p>
              </q-card-section>
            </q-card>

            <div class="q-mt-sm">
              <q-card
                v-for="act in actividadesSeccion"
                :key="act.id"
                flat
                class="q-mt-sm cursor-pointer actividad-card"
                :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'"
                style="border: 1px solid"
                :style="{ borderColor: $q.dark.isActive ? '#2e3a47' : '#e2e8f0' }"
                @click="abrirActividad(act)"
              >
                <q-card-section horizontal>
                  <q-card-section class="flex flex-center q-pa-md">
                    <q-icon :name="iconoTipo(act.tipo)" :color="colorTipo(act.tipo)" size="md" />
                  </q-card-section>
                  <q-card-section>
                    <div class="text-subtitle2 text-weight-medium">{{ act.titulo }}</div>
                    <div class="text-caption text-grey">{{ act.descripcion }}</div>
                    <div class="q-mt-sm">
                      <q-badge :color="colorTipo(act.tipo)" text-color="white" class="q-mr-sm">
                        {{ labelTipo(act.tipo) }}
                      </q-badge>
                      <q-badge v-if="act.tiene_nota" color="grey-4" text-color="grey-8">
                        {{ act.nota_maxima }} pts
                      </q-badge>
                      <q-badge v-else color="grey-3" text-color="grey-7">Sin nota</q-badge>
                      <q-badge color="grey-2" text-color="grey-8" class="q-ml-sm">
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

            <div v-if="actividadesSeccion.length === 0" class="text-center q-pa-xl text-grey">
              <q-icon name="inbox" size="48px" color="grey-4" />
              <p>No hay actividades en esta seccion.</p>
            </div>
          </template>

          <div v-else class="flex flex-center q-pa-xl">
            <div class="text-center text-grey">
              <q-icon name="touch_app" size="64px" color="grey-4" />
              <p class="q-mt-md">Selecciona una seccion del menu lateral para ver sus actividades.</p>
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
import { ref, computed, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
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

const seccionActiva = ref(null)
const actividadSeleccionada = ref(null)

const curso = computed(() => cursosStore.getCursoById(Number(route.params.id)))

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
.sidebar-sticky {
  position: sticky;
  top: 16px;
}
.actividad-card {
  border-radius: 8px;
  transition: all 0.15s;
}
.actividad-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.body--dark .actividad-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.content-card {
  border-radius: 12px;
  border: 1px solid var(--ta-border-card);
  overflow: hidden;
}
</style>
