<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Libro de Calificaciones" data-tour="teacher-grades-header">
      <template #actions>
        <TaButton variant="primary" icon="download" label="Exportar CSV" @click="exportarCsv" />
        <TaButton variant="outline" icon="picture_as_pdf" label="Exportar PDF" @click="exportarPdf" />
        <TaButton variant="secondary" icon="sync" label="Sincronizar Notas" @click="sincronizar" />
      </template>
    </TaPageHeader>
    <p class="text-grey-7 q-mb-lg q-mt-sm">{{ curso?.nombre }} — {{ curso?.codigo }}</p>

    <q-banner v-if="contextoSeguimiento" rounded class="bg-purple-1 text-primary q-mb-md">
      <template #avatar><q-icon name="person_search" color="primary" /></template>
      Abierto desde una alerta de seguimiento. Revisa la actividad y el estudiante seleccionado.
      <template #action>
        <q-btn flat dense no-caps color="primary" label="Limpiar contexto" @click="limpiarContexto" />
      </template>
    </q-banner>

    <TaCard>
      <q-card-section>
        <div class="row items-center q-mb-md" data-tour="teacher-grades-summary">
          <div class="col">
            <q-select v-model="cursoSeleccionado" :options="cursosDocente" label="Curso" outlined dense style="max-width: 350px" map-options emit-value />
          </div>
          <div class="col-auto">
            <q-badge color="green" text-color="white" class="q-pa-sm q-mr-sm">
              Promedio general: {{ promedioGeneral }} pts
            </q-badge>
            <q-badge color="orange" text-color="white" class="q-pa-sm q-mr-sm">
              {{ pendientesCalificar }} pendientes de calificar
            </q-badge>
            <q-badge color="blue" text-color="white" class="q-pa-sm">
              {{ entregasRealizadas }} entregas realizadas
            </q-badge>
          </div>
        </div>

        <div class="table-scroll" data-tour="teacher-grades-table">
          <table class="calificaciones-tabla">
            <thead>
              <tr>
                <th class="sticky-col">Estudiante</th>
                <th v-for="act in actividadesCurso" :key="act.id" class="act-header">
                  <div class="text-caption text-weight-medium">{{ act.titulo }}</div>
                  <div class="text-caption text-grey-6">
                    <q-badge :color="colorTipo(act.tipo)" text-color="white" dense>
                      {{ labelTipo(act.tipo) }}
                    </q-badge>
                    <span v-if="act.tiene_nota"> {{ act.nota_maxima }}pts</span>
                  </div>
                </th>
                <th class="text-right">Promedio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="est in estudiantes" :key="est.id">
                <td class="sticky-col">
                  <div class="row items-center no-wrap">
                    <q-avatar size="28px" class="q-mr-sm">
                      <img :src="est.avatar" />
                    </q-avatar>
                    <div>
                      <div class="text-body2">{{ est.nombre }}</div>
                      <div class="text-caption text-grey-6">{{ est.email }}</div>
                    </div>
                  </div>
                </td>
                <td v-for="act in actividadesCurso" :key="act.id" class="text-center celda-nota">
                  <template v-if="getNota(est.id, act.id)">
                    <span class="text-body2 text-weight-medium" :class="colorNota(getNota(est.id, act.id).porcentaje)">
                      {{ getNota(est.id, act.id).nota }}
                    </span>
                    <div class="text-caption text-grey-6">de {{ act.nota_maxima }} pts</div>
                    <q-badge v-if="getNota(est.id, act.id).fuente === 'auto'" color="blue-2" text-color="blue-9" dense size="xs">Auto</q-badge>
                    <q-btn flat dense round size="sm" icon="edit" color="grey-6" @click="abrirCalificar(est, act)">
                      <q-tooltip>Editar calificacion</q-tooltip>
                    </q-btn>
                  </template>
                  <template v-else-if="estaEntregado(est.id, act.id)">
                    <q-badge color="orange-2" text-color="orange-9" class="q-mb-xs" size="sm">Entregado</q-badge>
                    <div>
                      <q-btn flat round color="orange" icon="grade" size="sm" @click="abrirCalificar(est, act)">
                        <q-tooltip>Calificar entrega</q-tooltip>
                      </q-btn>
                    </div>
                  </template>
                  <template v-else>
                    <q-badge color="grey-3" text-color="grey-7" size="sm">—</q-badge>
                  </template>
                </td>
                <td class="text-center text-weight-medium" :class="colorNota(promedioEstudiante(est.id))">
                  {{ promedioEstudiante(est.id) }} pts
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </q-card-section>
    </TaCard>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md q-mt-md" data-tour="teacher-grades-charts">
      <div class="col-12 col-md-6">
        <TaCard title="Distribucion de Notas (Promedios)" class="card-item">
          <BarChart v-if="chartDataDistribucion.labels.length" :data="chartDataDistribucion" :options="chartOptionsBar" :style="{ height: '260px' }" />
        </TaCard>
      </div>
      <div class="col-12 col-md-6">
        <TaCard title="Promedio por Actividad" class="card-item">
          <BarChart v-if="chartDataActividades.labels.length" :data="chartDataActividades" :options="chartOptionsBar" :style="{ height: '260px' }" />
        </TaCard>
      </div>
    </div>

    <q-dialog v-model="dialogoCalificar" persistent>
      <q-card style="min-width: 600px; max-width: 750px">
        <q-card-section>
          <div class="text-h6">Calificar: {{ estudianteCalificando?.nombre }}</div>
          <div class="text-caption text-grey-7">{{ actividadCalificando?.titulo }}</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-4 text-center">
              <div class="text-caption text-grey-7">Nota</div>
              <q-input v-model.number="formCalificar.nota" outlined type="number" :max="actividadCalificando?.nota_maxima" class="text-center" input-style="font-size: 2em; text-align: center" />
            </div>
            <div class="col-4 text-center">
              <div class="text-caption text-grey-7">Nota Maxima</div>
              <div class="text-h5 q-mt-sm">{{ actividadCalificando?.nota_maxima }}</div>
            </div>
            <div class="col-4 text-center">
              <div class="text-caption text-grey-7">Resultado</div>
              <div class="text-h5 q-mt-sm" :class="colorNota(porcentajeActual)">{{ formCalificar.nota || 0 }}/{{ actividadCalificando?.nota_maxima || 0 }}</div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-sm">Retroalimentacion</div>
          <q-input v-model="formCalificar.retroalimentacion" outlined type="textarea" rows="3" placeholder="Comentarios para el estudiante..." />

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-sm">Rubrica Rapida</div>
          <RubricaEditor v-if="actividadCalificando" :actividad="actividadCalificando" v-model="rubricaPuntaje" @update:total="formCalificar.nota = $event" />
        </q-card-section>

        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
          <TaButton variant="primary" label="Guardar Calificacion" @click="guardarCalificacion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Bar as BarChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useCursosStore } from 'src/stores/cursos'
import { useActividadesStore } from 'src/stores/actividades'
import { useAuthStore } from 'src/stores/auth'
import { usuarios as mockUsuarios, matriculas as mockMatriculas, calificaciones as mockCalificaciones } from 'src/mock/index.js'
import RubricaEditor from 'src/components/calificaciones/RubricaEditor.vue'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import { useStaggerCards } from 'src/composables/useAnimations'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)
useStaggerCards('.card-item')

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()
const auth = useAuthStore()

const cursoSeleccionado = ref(Number(route.query.curso) || 1)
const contextoSeguimiento = computed(() => Boolean(route.query.estudiante || route.query.actividad))

const cursosDocente = computed(() =>
  cursosStore.cursos.filter((c) => c.docente_id === auth.usuario?.id).map((c) => ({ label: `${c.codigo} — ${c.nombre}`, value: c.id }))
)

const curso = computed(() => cursosStore.getCursoById(cursoSeleccionado.value))

const actividadesCurso = computed(() => {
  if (!curso.value) return []
  const seccionIds = curso.value.secciones.map((s) => s.id)
  return actividadesStore.actividades.filter((a) => seccionIds.includes(a.seccion_id))
})

const estudiantes = computed(() => {
  if (!curso.value) return []
  const matriculados = mockMatriculas.filter((m) => m.curso_id === curso.value.id && m.estado === 'activo')
  return matriculados.map((m) => mockUsuarios.find((u) => u.id === m.estudiante_id)).filter(Boolean)
})

// Notas locales mutables (parten del mock)
const notasLocales = ref(JSON.parse(JSON.stringify(mockCalificaciones)))

// Combinar notas locales + entregas auto-calificadas del store
function getNota(estudianteId, actividadId) {
  const cid = curso.value?.id
  if (!cid) return null

  // 1. Priorizar nota manual del docente
  const manual = notasLocales.value[cid]?.[estudianteId]?.[actividadId]
  if (manual) return { ...manual, fuente: 'manual' }

  // 2. Buscar entrega auto-calificada del store
  const entrega = actividadesStore.entregas.find(
    (e) => e.estudiante_id === estudianteId && e.actividad_id === actividadId && e.estado === 'calificado'
  )
  if (entrega && entrega.nota !== undefined && entrega.nota !== null) {
    const act = actividadesCurso.value.find((a) => a.id === actividadId)
    const max = act?.nota_maxima || 100
    return {
      nota: entrega.nota,
      porcentaje: Math.round((entrega.nota / max) * 100),
      retro: entrega.retroalimentacion || 'Calificacion automatica',
      fuente: 'auto',
    }
  }

  return null
}

function estaEntregado(estudianteId, actividadId) {
  return actividadesStore.entregas.some(
    (e) => e.estudiante_id === estudianteId && e.actividad_id === actividadId && e.estado === 'entregado'
  )
}

function promedioEstudiante(estudianteId) {
  const actCalif = actividadesCurso.value.filter((a) => a.tiene_nota)
  const notas = actCalif.map((a) => getNota(estudianteId, a.id)).filter(Boolean)
  if (!notas.length) return 0
  return Math.round(notas.reduce((s, n) => s + n.porcentaje, 0) / notas.length)
}

const promedioGeneral = computed(() => {
  const promedios = estudiantes.value.map((e) => promedioEstudiante(e.id)).filter((p) => p > 0)
  if (!promedios.length) return 0
  return Math.round(promedios.reduce((s, p) => s + p, 0) / promedios.length)
})

const pendientesCalificar = computed(() => {
  let count = 0
  estudiantes.value.forEach((e) => {
    actividadesCurso.value.filter((a) => a.tiene_nota).forEach((a) => {
      const nota = getNota(e.id, a.id)
      const entregado = estaEntregado(e.id, a.id)
      if (!nota && entregado) count++
    })
  })
  return count
})

const entregasRealizadas = computed(() => {
  let count = 0
  estudiantes.value.forEach((e) => {
    actividadesCurso.value.filter((a) => a.tiene_nota).forEach((a) => {
      if (getNota(e.id, a.id) || estaEntregado(e.id, a.id)) count++
    })
  })
  return count
})

// Dialogo de calificacion
const dialogoCalificar = ref(false)
const estudianteCalificando = ref(null)
const actividadCalificando = ref(null)
const formCalificar = ref({ nota: 0, retroalimentacion: '' })
const rubricaPuntaje = ref(0)

const porcentajeActual = computed(() => {
  const max = actividadCalificando.value?.nota_maxima || 100
  return Math.round((formCalificar.value.nota / max) * 100)
})

function abrirCalificar(est, act) {
  estudianteCalificando.value = est
  actividadCalificando.value = act
  const notaExistente = notasLocales.value[curso.value?.id]?.[est.id]?.[act.id]
  formCalificar.value = {
    nota: notaExistente?.nota ?? 0,
    retroalimentacion: notaExistente?.retro ?? '',
  }
  rubricaPuntaje.value = 0
  dialogoCalificar.value = true
}

function guardarCalificacion() {
  const cid = curso.value.id
  const estId = estudianteCalificando.value.id
  const actId = actividadCalificando.value.id
  if (!notasLocales.value[cid]) notasLocales.value[cid] = {}
  if (!notasLocales.value[cid][estId]) notasLocales.value[cid][estId] = {}
  notasLocales.value[cid][estId][actId] = {
    nota: formCalificar.value.nota,
    porcentaje: porcentajeActual.value,
    retro: formCalificar.value.retroalimentacion,
  }
  dialogoCalificar.value = false
  $q.notify({ message: 'Calificacion guardada', color: 'positive', timeout: 1500 })
}

// Gráficos
const chartOptionsBar = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, max: 100 } },
}

const chartDataDistribucion = computed(() => {
  const rangos = { '0-39': 0, '40-59': 0, '60-79': 0, '80-100': 0 }
  estudiantes.value.forEach((e) => {
    const p = promedioEstudiante(e.id)
    if (p < 40) rangos['0-39']++
    else if (p < 60) rangos['40-59']++
    else if (p < 80) rangos['60-79']++
    else rangos['80-100']++
  })
  return {
    labels: ['0-39%', '40-59%', '60-79%', '80-100%'],
    datasets: [{
      label: 'Estudiantes',
      data: [rangos['0-39'], rangos['40-59'], rangos['60-79'], rangos['80-100']],
      backgroundColor: ['#ef4444', '#f59e0b', '#6B3FA0', '#10b981'],
      borderRadius: 6,
    }],
  }
})

const chartDataActividades = computed(() => {
  const actCalif = actividadesCurso.value.filter((a) => a.tiene_nota)
  const labels = actCalif.map((a) => a.titulo.slice(0, 20))
  const data = actCalif.map((a) => {
    const notas = estudiantes.value.map((e) => getNota(e.id, a.id)).filter(Boolean)
    if (!notas.length) return 0
    return Math.round(notas.reduce((s, n) => s + n.porcentaje, 0) / notas.length)
  })
  return {
    labels,
    datasets: [{
      label: 'Promedio (%)',
      data,
      backgroundColor: '#6B3FA0',
      borderRadius: 6,
    }],
  }
})

// Exportar CSV real
function exportarCsv() {
  const cid = curso.value?.id
  if (!cid) return
  const actCalif = actividadesCurso.value.filter((a) => a.tiene_nota)
  const headers = ['Estudiante', 'Email', ...actCalif.map((a) => a.titulo), 'Promedio']
  const rows = estudiantes.value.map((est) => {
    const notas = actCalif.map((a) => {
      const n = getNota(est.id, a.id)
      return n ? n.nota : ''
    })
    return [est.nombre, est.email, ...notas, promedioEstudiante(est.id)]
  })

  const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `calificaciones_${curso.value.codigo}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  $q.notify({ message: 'CSV descargado', color: 'positive', timeout: 1500 })
}

function exportarPdf() {
  $q.notify({ message: 'Exportando a PDF (mock)...', color: 'info', timeout: 2000 })
}

function sincronizar() {
  $q.notify({ message: 'Sincronizando con sistema externo (mock)...', color: 'info', timeout: 2000 })
}

function limpiarContexto() {
  router.replace({ path: '/docente/calificar', query: { curso: cursoSeleccionado.value } })
}

function labelTipo(t) { const m = { leccion: 'Lec', tarea: 'Tar', foro: 'For', cuestionario: 'Quiz', encuesta: 'Enc', h5p: 'H5P' }; return m[t] ?? t }
function colorTipo(t) { const m = { leccion: 'indigo', tarea: 'orange', foro: 'teal', cuestionario: 'purple', encuesta: 'green', h5p: 'pink' }; return m[t] ?? 'grey' }
function colorNota(p) { if (p >= 80) return 'text-green'; if (p >= 60) return 'text-primary'; if (p >= 40) return 'text-orange'; return 'text-negative' }

watch(cursoSeleccionado, () => {
  // recalcular si cambia de curso
})

watch(
  () => [route.query.curso, route.query.estudiante, route.query.actividad],
  async ([cursoId, estudianteId, actividadId]) => {
    if (cursoId) cursoSeleccionado.value = Number(cursoId)
    if (!estudianteId || !actividadId) return
    await nextTick()
    const estudiante = estudiantes.value.find((item) => item.id === Number(estudianteId))
    const actividad = actividadesCurso.value.find((item) => item.id === Number(actividadId))
    if (estudiante && actividad) abrirCalificar(estudiante, actividad)
  },
  { immediate: true }
)
</script>

<style scoped>
.table-scroll {
  overflow-x: auto;
}
.calificaciones-tabla {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9em;
  border-radius: 12px;
  overflow: hidden;
}
.calificaciones-tabla th,
.calificaciones-tabla td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--ta-border-table);
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

/* Light mode table header */
.calificaciones-tabla thead th {
  background: var(--ta-bg-page);
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
  color: var(--ta-text-secondary);
}

/* Dark mode table header */
.body--dark .calificaciones-tabla thead th {
  background: var(--ta-bg-card);
  color: var(--ta-text-secondary);
}

/* Row hover */
.calificaciones-tabla tbody tr:hover td {
  background-color: rgba(var(--primary-rgb), 0.03);
}
.body--dark .calificaciones-tabla tbody tr:hover td {
  background-color: rgba(var(--accent-rgb), 0.05);
}

/* Sticky column */
.sticky-col {
  position: sticky;
  left: 0;
  background: var(--ta-bg-card);
  z-index: 2;
  min-width: 200px;
  border-right: 1px solid var(--ta-border-table);
  color: var(--ta-text-primary);
}

/* Sticky column header */
thead .sticky-col {
  z-index: 3;
}

/* Dark mode general borders and cells */
.body--dark .calificaciones-tabla td {
  color: var(--ta-text-primary);
}

.celda-nota {
  min-width: 90px;
}

/* Activity headers: allow wrapping */
.act-header {
  min-width: 120px;
  max-width: 160px;
  vertical-align: top;
  text-align: center;
  white-space: normal;
}
</style>
