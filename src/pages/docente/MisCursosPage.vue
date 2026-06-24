<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Mis Cursos" data-tour="teacher-courses-header">
      <template #actions>
        <TaButton variant="primary" icon="add" label="Nuevo Curso" @click="nuevoCurso = true" />
      </template>
    </TaPageHeader>
    <div class="av-section-heading">
      <div>
        <h2 class="av-section-heading__title">Gestion actual: 1-2026</h2>
        <p class="av-section-heading__subtitle">Administra cursos, estructura academica y publicacion de contenidos.</p>
      </div>
    </div>

    <AppSkeleton v-if="cargando" variant="card-grid" :count="3" />

    <div v-else class="row q-col-gutter-md" data-tour="teacher-courses-list">
      <div v-for="curso in cursos" :key="curso.id" class="col-12 col-md-6 col-lg-4">
        <TaCard class="card-item curso-card cursor-pointer" :padding="false" @click="$router.push(`/docente/curso/${curso.id}/builder`)">
          <q-card-section>
            <div class="row items-start">
              <div class="col">
                <q-badge :color="curso.estado === 'publicado' ? 'positive' : 'warning'" text-color="white" class="q-mb-sm q-px-sm">
                  {{ curso.estado === 'publicado' ? 'Publicado' : 'Borrador' }}
                </q-badge>
                <div class="text-h6 text-weight-bold">{{ curso.nombre }}</div>
                <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ curso.codigo }}</div>
                <div class="text-body2 q-mt-sm line-clamp-2" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">{{ curso.descripcion }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-sm text-center">
              <div class="col-4">
                <div class="text-h6 text-primary text-weight-bold">{{ curso.total_estudiantes }}</div>
                <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">Estudiantes</div>
              </div>
              <div class="col-4">
                <div class="text-h6 text-teal text-weight-bold">{{ curso.total_actividades }}</div>
                <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">Actividades</div>
              </div>
              <div class="col-4">
                <div class="text-h6 text-warning text-weight-bold">{{ actividadesCurso(curso) }}/{{ objetivoContenido(curso) }}</div>
                <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">Contenido</div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <div class="q-pa-md row justify-end q-gutter-sm" data-tour="teacher-course-actions">
        <TaButton variant="ghost" icon="edit" label="Builder" customClass="ta-btn-premium" />
        <TaButton variant="ghost" icon="visibility" label="Previsualizar" customClass="text-grey ta-btn-premium" />
          </div>
        </TaCard>
      </div>

      <div v-if="cursos.length === 0" class="col-12">
        <AppEmptyState
          icon="library_books"
          title="Sin cursos creados"
          message="Genera uno desde SISA o crea uno manualmente."
        >
          <div class="row q-gutter-sm q-mt-md justify-center">
            <TaButton variant="outline" icon="cloud_download" label="Generar desde SISA" @click="crearDesdeSisa" />
            <TaButton variant="primary" icon="edit_note" label="Crear manualmente" @click="crearManual" />
          </div>
        </AppEmptyState>
      </div>
    </div>

    <q-dialog v-model="nuevoCurso">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">Crear Nuevo Curso</div>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-7">Selecciona el modo de creacion:</p>
          <q-list>
            <q-item clickable v-ripple @click="crearDesdeSisa">
              <q-item-section avatar>
                <q-icon name="cloud_download" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Generar desde SISA</q-item-label>
                <q-item-label caption>Importa el PAC desde el sistema SISA</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple @click="crearManual">
              <q-item-section avatar>
                <q-icon name="edit_note" color="teal" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Crear Manualmente</q-item-label>
                <q-item-label caption>Define la estructura desde cero</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cancelar" v-close-popup customClass="text-grey ta-btn-premium" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoSisa" persistent>
      <q-card class="sisa-wizard">
        <q-bar class="bg-primary text-white">
          <div>Generar Curso desde SISA</div>
          <q-space />
          <q-btn dense flat icon="close" aria-label="Cerrar dialogo" v-close-popup />
        </q-bar>
        <q-card-section class="q-pa-lg">
          <div class="text-h5 text-center q-mb-lg">Importar Plan Analítico de Curso (PAC)</div>
          <q-stepper v-model="sisaPaso" vertical color="primary" animated>
            <q-step name="conectar" title="Conectar con SISA" icon="cloud" :done="sisaPaso !== 'conectar'">
              <p class="text-grey-7">El sistema se conectará a la API de SISA para obtener las asignaturas de la gestión actual.</p>
              <q-select 
                v-model="sisaAsignatura" 
                :options="opcionesSisa" 
                label="Seleccionar asignatura en SISA" 
                outlined 
                style="max-width: 450px; margin: 0 auto;"
                :loading="cargandoAsignaturas"
                :option-disable="(opt) => !opt.pac_disponible"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label v-if="!scope.opt.pac_disponible" caption class="text-negative">
                        No tiene PAC disponible en SISA
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-stepper-navigation class="text-center q-mt-md">
                <q-btn color="primary" label="Siguiente" @click="sisaConectar" :disable="!sisaAsignatura" />
              </q-stepper-navigation>
            </q-step>
            <q-step name="mapear" title="Mapear PAC a Curso" icon="compare_arrows" :done="sisaPaso === 'confirmar'">
              <p class="text-grey-7">El sistema mapeará automáticamente la estructura del PAC de <strong>{{ sisaAsignatura?.label }}</strong> a la estructura del curso LMS:</p>
              <q-list bordered separator class="q-mb-md" style="max-width: 500px; margin: 0 auto;">
                <q-item v-for="(map, i) in sisaMapeo" :key="i">
                  <q-item-section avatar><q-icon name="arrow_forward" color="primary" /></q-item-section>
                  <q-item-section>
                    <q-item-label>{{ map.sisa }}</q-item-label>
                    <q-item-label caption>{{ map.lms }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-stepper-navigation class="text-center">
                <q-btn flat color="primary" label="Atrás" @click="sisaPaso = 'conectar'" class="q-mr-sm" />
                <q-btn color="primary" label="Generar Curso" @click="sisaGenerar" :loading="generandoCurso" />
              </q-stepper-navigation>
            </q-step>
            <q-step name="confirmar" title="Curso Generado" icon="check_circle">
              <div class="text-center q-pa-lg">
                <q-icon name="check_circle" size="64px" color="green" />
                <h6 class="text-green q-mt-md">¡Curso generado exitosamente!</h6>
                <p class="text-grey-7">Se han creado {{ sisaSeccionesCreadas }} secciones y {{ sisaActividadesCreadas }} actividades base en el LMS a partir del PAC.</p>
              </div>
              <q-stepper-navigation class="text-center">
                <q-btn color="primary" label="Ir al Builder" @click="irAlBuilder" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCursosStore } from 'src/stores/cursos'
import { useAuthStore } from 'src/stores/auth'
import { useActividadesStore } from 'src/stores/actividades'
import { integracionService } from 'src/services/integracionService.js'
import { useStaggerCards, useReflectionHover, useButtonPress } from 'src/composables/useAnimations'
import { useLoadingState } from 'src/composables/useLoadingState'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'

const $q = useQuasar()
const router = useRouter()
const cursosStore = useCursosStore()
const auth = useAuthStore()
const actividadesStore = useActividadesStore()

const nuevoCurso = ref(false)
const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 600 })

// SISA Wizard State
const dialogoSisa = ref(false)
const cargandoAsignaturas = ref(false)
const opcionesSisa = ref([])
const sisaAsignatura = ref(null)
const sisaPaso = ref('conectar')
const generandoCurso = ref(false)
const sisaSeccionesCreadas = ref(0)
const sisaActividadesCreadas = ref(0)
const nuevoCursoId = ref(null)

const sisaMapeo = [
  { sisa: 'Asignatura', lms: 'Curso' },
  { sisa: 'Unidad I, II, III...', lms: 'Sección' },
  { sisa: 'Temas por unidad', lms: 'Actividades sugeridas' },
  { sisa: 'Logros de aprendizaje', lms: 'Objetivos de la sección' },
  { sisa: 'Cronograma maestro', lms: 'Fechas sugeridas' },
  { sisa: 'Sistema de evaluación', lms: 'Esquema de calificación inicial' },
]

const cursos = computed(() => {
  return cursosStore.cursos.filter((c) => c.docente_id === auth.usuario?.id)
})

function actividadesCurso(curso) {
  return actividadesStore.actividades.filter((actividad) => curso.secciones.some((seccion) => seccion.id === actividad.seccion_id)).length
}

function objetivoContenido(curso) {
  return Math.max(curso.secciones.length * 4, 1)
}

useStaggerCards('.card-item')
useReflectionHover('.curso-card')
useButtonPress('.ta-btn-premium')

onMounted(async () => {
  await cursosStore.cargarCursos()
  finalizarCarga()
})

async function crearDesdeSisa() {
  nuevoCurso.value = false
  dialogoSisa.value = true
  sisaPaso.value = 'conectar'
  sisaAsignatura.value = null
  cargandoAsignaturas.value = true
  try {
    const res = await integracionService.asignaturasSisa(auth.usuario?.id, '1-2026')
    opcionesSisa.value = (res.data?.data || res.data || []).map(a => ({
      label: `${a.codigo} — ${a.nombre} (${a.carrera})`,
      value: a.codigo,
      pac_disponible: a.pac_disponible
    }))
  } catch (err) {
    console.error('[MisCursos] Error al cargar asignaturas SISA:', err)
    $q.notify({ message: 'Error al conectar con SISA', color: 'negative', timeout: 3000 })
  } finally {
    cargandoAsignaturas.value = false
  }
}

function sisaConectar() {
  if (!sisaAsignatura.value) return
  sisaPaso.value = 'mapear'
}

async function sisaGenerar() {
  if (!sisaAsignatura.value) return
  generandoCurso.value = true
  try {
    const res = await integracionService.generarCursoSisa(sisaAsignatura.value.value, '1-2026', auth.usuario?.id)
    const data = res.data?.data || res.data
    sisaSeccionesCreadas.value = data.secciones_creadas || 3
    sisaActividadesCreadas.value = (data.secciones_creadas || 3) * 2
    nuevoCursoId.value = data.curso_id

    // Recargar el curso recién creado en el store
    await cursosStore.cargarCurso(data.curso_id)

    sisaPaso.value = 'confirmar'
    $q.notify({ message: 'Curso generado desde SISA exitosamente', color: 'positive', timeout: 3000 })
  } catch (err) {
    console.error('[MisCursos] Error al generar curso SISA:', err)
    $q.notify({ message: 'Error al generar curso desde SISA', color: 'negative', timeout: 3000 })
  } finally {
    generandoCurso.value = false
  }
}

function irAlBuilder() {
  dialogoSisa.value = false
  if (nuevoCursoId.value) {
    router.push(`/docente/curso/${nuevoCursoId.value}/builder`)
  }
}

function crearManual() {
  nuevoCurso.value = false
  $q.notify({ message: 'Modo manual — disponible en FASE 1', color: 'info', timeout: 2000 })
}
</script>

<style scoped>
.curso-card {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease;
}
.curso-card:hover {
  transform: translateY(-4px);
}
.dialog-card {
  width: min(620px, 92vw);
  border-radius: 20px;
}
.sisa-wizard {
  width: min(700px, 92vw);
  max-width: 700px;
  border-radius: 20px;
}
</style>
