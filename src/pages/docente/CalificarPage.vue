<template>
  <q-page class="av-dashboard-page">
    <AppSkeleton v-if="cargando" variant="table" :count="6" :columns="5" />

    <template v-else>
      <TaPageHeader title="Libro de Calificaciones" data-tour="teacher-grades-header">
        <template #actions>
          <TaButton variant="primary" icon="download" label="Exportar CSV" @click="exportarCsv" />
          <TaButton variant="outline" icon="picture_as_pdf" label="Exportar PDF" @click="exportarPdf" />
          <TaButton variant="secondary" icon="sync" label="Sincronizar Notas" :loading="sincronizandoNotas" @click="sincronizar" />
        </template>
      </TaPageHeader>
      <p class="q-mb-lg q-mt-sm" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ curso?.nombre }} — {{ curso?.codigo }}</p>

      <q-banner v-if="contextoSeguimiento" rounded class="seguimiento-banner q-mb-md">
        <template #avatar><q-icon name="person_search" color="primary" /></template>
        <div class="text-weight-medium">Abierto desde una alerta de seguimiento</div>
        <div class="text-caption" :class="$q.dark.isActive ? 'text-indigo-2' : 'text-indigo-9'">Revisa la actividad y el estudiante seleccionado.</div>
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
            <q-badge color="positive" text-color="white" class="q-pa-sm q-px-md q-mr-sm">
              Promedio general: {{ promedioGeneral }} pts
            </q-badge>
            <q-badge color="warning" text-color="white" class="q-pa-sm q-px-md q-mr-sm">
              {{ pendientesCalificar }} pendientes de calificar
            </q-badge>
            <q-badge color="info" text-color="white" class="q-pa-sm q-px-md">
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
                    <q-badge v-if="getNota(est.id, act.id).fuente === 'auto'" class="auto-badge" dense size="xs">Auto</q-badge>
                    <q-btn flat dense round size="sm" icon="edit" color="grey-6" aria-label="Editar calificacion" @click="abrirCalificar(est, act)">
                      <q-tooltip>Editar calificacion</q-tooltip>
                    </q-btn>
                  </template>
                  <template v-else-if="estaEntregado(est.id, act.id)">
                    <q-badge class="entregado-badge q-mb-xs" size="sm">Entregado</q-badge>
                    <div>
                      <q-btn flat round color="orange" icon="grade" size="sm" aria-label="Calificar entrega" @click="abrirCalificar(est, act)">
                        <q-tooltip>Calificar entrega</q-tooltip>
                      </q-btn>
                    </div>
                  </template>
                  <template v-else>
                    <q-badge class="empty-badge" size="sm">—</q-badge>
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
      <q-card class="calificar-dialog">
        <q-card-section>
          <div class="text-h6">Calificar: {{ estudianteCalificando?.nombre }}</div>
          <div class="text-caption text-grey-7">{{ actividadCalificando?.titulo }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="guardarCalificacion">
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-4">
                <q-input
                  v-model.number="formCalificar.nota"
                  label="Nota"
                  outlined
                  type="number"
                  :min="0"
                  :max="actividadCalificando?.nota_maxima"
                  :rules="[
                    (val) => (val !== null && val !== '') || 'Ingresa una nota',
                    (val) => val >= 0 || 'La nota no puede ser negativa',
                    (val) => val <= (actividadCalificando?.nota_maxima || 100) || `Maximo ${actividadCalificando?.nota_maxima} pts`,
                  ]"
                  class="text-center"
                  input-style="font-size: 2em; text-align: center"
                />
              </div>
              <div class="col-4 text-center">
                <div class="calificar-label">Nota Maxima</div>
                <div class="text-h5 q-mt-sm av-text-primary">{{ actividadCalificando?.nota_maxima }}</div>
              </div>
              <div class="col-4 text-center">
                <div class="calificar-label">Resultado</div>
                <div class="text-h5 q-mt-sm" :class="colorNota(porcentajeActual)">{{ formCalificar.nota || 0 }}/{{ actividadCalificando?.nota_maxima || 0 }}</div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <q-input
              v-model="formCalificar.retroalimentacion"
              label="Retroalimentacion"
              outlined
              type="textarea"
              rows="3"
              placeholder="Comentarios para el estudiante..."
              class="q-mb-md"
            />

            <q-separator class="q-my-md" />

            <div class="text-subtitle2 q-mb-sm av-text-primary">Rubrica Rapida</div>
            <RubricaEditor v-if="actividadCalificando" :actividad="actividadCalificando" v-model="rubricaPuntaje" @update:total="formCalificar.nota = $event" />

            <q-card-actions align="right" class="q-px-none q-pt-md">
              <TaButton variant="ghost" label="Cancelar" v-close-popup />
              <TaButton type="submit" variant="primary" label="Guardar Calificacion" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
      </q-dialog>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Bar as BarChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useCursosStore } from 'src/stores/cursos'
import { useAuthStore } from 'src/stores/auth'
import { calificacionService } from 'src/services/calificacionService.js'
import { integracionService } from 'src/services/integracionService.js'
import RubricaEditor from 'src/components/calificaciones/RubricaEditor.vue'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import { useStaggerCards } from 'src/composables/useAnimations'
import { useLoadingState } from 'src/composables/useLoadingState'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)
useStaggerCards('.card-item')

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const cursosStore = useCursosStore()
const auth = useAuthStore()
const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 600 })

const cursoSeleccionado = ref(Number(route.query.curso) || 1)
const contextoSeguimiento = computed(() => Boolean(route.query.estudiante || route.query.actividad))

const cursosDocente = computed(() =>
  cursosStore.cursos.filter((c) => c.docente_id === auth.usuario?.id).map((c) => ({ label: `${c.codigo} — ${c.nombre}`, value: c.id }))
)

const libro = ref({ curso: {}, actividades: [], estudiantes: [], promedio_general: null, pendientes_calificar: 0 })
const cargandoLibro = ref(false)

async function cargarLibro(cursoId) {
  cargandoLibro.value = true
  try {
    const res = await calificacionService.libroCurso(cursoId)
    libro.value = res.data || { curso: {}, actividades: [], estudiantes: [], promedio_general: null, pendientes_calificar: 0 }
  } catch {
    libro.value = { curso: {}, actividades: [], estudiantes: [], promedio_general: null, pendientes_calificar: 0 }
  } finally {
    cargandoLibro.value = false
  }
}

const curso = computed(() => cursosStore.getCursoById(cursoSeleccionado.value))
const actividadesCurso = computed(() => libro.value.actividades || [])
const estudiantes = computed(() => libro.value.estudiantes || [])

function getNota(estudianteId, actividadId) {
  const est = estudiantes.value.find((e) => e.id === estudianteId)
  if (!est || !est.notas) return null
  const nota = est.notas[actividadId]
  if (!nota) return null
  if (nota.nota !== null && nota.nota !== undefined) {
    return {
      nota: nota.nota,
      porcentaje: nota.porcentaje || 0,
      retro: nota.retroalimentacion,
      fuente: nota.pendiente_calificar ? 'auto' : 'manual',
    }
  }
  return null
}

function estaEntregado(estudianteId, actividadId) {
  const est = estudiantes.value.find((e) => e.id === estudianteId)
  if (!est || !est.notas) return false
  const nota = est.notas[actividadId]
  return nota && nota.pendiente_calificar
}

function promedioEstudiante(estudianteId) {
  const est = estudiantes.value.find((e) => e.id === estudianteId)
  return est?.promedio || 0
}

const promedioGeneral = computed(() => libro.value.promedio_general || 0)
const pendientesCalificar = computed(() => libro.value.pendientes_calificar || 0)

const entregasRealizadas = computed(() => {
  let count = 0
  estudiantes.value.forEach((e) => {
    actividadesCurso.value.forEach((a) => {
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
  const notaExistente = getNota(est.id, act.id)
  formCalificar.value = {
    nota: notaExistente?.nota ?? 0,
    retroalimentacion: notaExistente?.retro ?? '',
  }
  rubricaPuntaje.value = 0
  dialogoCalificar.value = true
}

async function guardarCalificacion() {
  const estId = estudianteCalificando.value.id
  const actId = actividadCalificando.value.id
  try {
    // Buscar la entrega del estudiante para esta actividad
    const est = estudiantes.value.find((e) => e.id === estId)
    const entregaInfo = est?.notas?.[actId]

    if (entregaInfo && entregaInfo.pendiente_calificar) {
      // Hay entrega sin calificar — necesitamos el entregaId
      // Como no tenemos el entregaId directo en el libro, usamos el endpoint de calificar por entrega
      // Buscamos la entrega via API
      const { default: api } = await import('src/services/api.js')
      const res = await api.get('/entregas', { params: { actividad_id: actId, estudiante_id: estId } })
      const entrega = res.data?.[0]
      if (entrega) {
        await calificacionService.calificar(entrega.id, {
          nota: formCalificar.value.nota,
          retroalimentacion: formCalificar.value.retroalimentacion,
        })
      }
    } else {
      // No hay entrega o ya está calificada — crear entrega fantasma y calificar, o actualizar
      const { default: api } = await import('src/services/api.js')
      const res = await api.get('/entregas', { params: { actividad_id: actId, estudiante_id: estId } })
      const entrega = res.data?.[0]
      if (entrega) {
        await calificacionService.calificar(entrega.id, {
          nota: formCalificar.value.nota,
          retroalimentacion: formCalificar.value.retroalimentacion,
        })
      } else {
        // Crear entrega fantasma y calificar
        const entregaRes = await api.post('/entregas', {
          actividad_id: actId,
          contenido: { texto: 'Calificacion directa del docente', archivos: [] },
        })
        await calificacionService.calificar(entregaRes.data.id, {
          nota: formCalificar.value.nota,
          retroalimentacion: formCalificar.value.retroalimentacion,
        })
      }
    }

    dialogoCalificar.value = false
    $q.notify({ message: 'Calificacion guardada', color: 'positive', timeout: 1500 })
    await cargarLibro(cursoSeleccionado.value)
  } catch (err) {
    $q.notify({ message: err?.message || 'Error al guardar calificacion', color: 'negative', timeout: 3000 })
  }
}

// Graficos
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
  const labels = actividadesCurso.value.map((a) => a.titulo.slice(0, 20))
  const data = actividadesCurso.value.map((a) => {
    const notas = estudiantes.value.map((e) => getNota(e.id, a.id)).filter(Boolean)
    if (!notas.length) return 0
    return Math.round(notas.reduce((s, n) => s + n.porcentaje, 0) / notas.length)
  })
  return { labels, datasets: [{ label: 'Promedio (%)', data, backgroundColor: '#6B3FA0', borderRadius: 6 }] }
})

// Exportar CSV
function exportarCsv() {
  const cid = curso.value?.id
  if (!cid) return
  const actCalif = actividadesCurso.value
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

const sincronizandoNotas = ref(false)

async function sincronizar() {
  if (!cursoSeleccionado.value) return
  sincronizandoNotas.value = true
  try {
    const res = await integracionService.sincronizarNotas(cursoSeleccionado.value)
    const data = res.data?.data || res.data
    $q.notify({
      message: `Sincronización de notas completada: ${data.notas_enviadas} notas enviadas al Sistema de Notas Centralizado.`,
      color: 'positive',
      icon: 'check_circle',
      timeout: 3000
    })
    await cargarLibro(cursoSeleccionado.value)
  } catch (err) {
    console.error('[Calificar] Error al sincronizar notas:', err)
    $q.notify({
      message: 'Error al sincronizar notas con el sistema central',
      color: 'negative',
      timeout: 3000
    })
  } finally {
    sincronizandoNotas.value = false
  }
}

function limpiarContexto() {
  router.replace({ path: '/docente/calificar', query: { curso: cursoSeleccionado.value } })
}

function labelTipo(t) { const m = { leccion: 'Lec', tarea: 'Tar', foro: 'For', cuestionario: 'Quiz', encuesta: 'Enc', h5p: 'H5P' }; return m[t] ?? t }
function colorTipo(t) { const m = { leccion: 'indigo', tarea: 'orange', foro: 'teal', cuestionario: 'purple', encuesta: 'green', h5p: 'pink' }; return m[t] ?? 'grey' }
function colorNota(p) { if (p >= 80) return 'text-green'; if (p >= 60) return 'text-primary'; if (p >= 40) return 'text-orange'; return 'text-negative' }

watch(cursoSeleccionado, (newId) => {
  cargarLibro(newId)
})

watch(
  () => [route.query.curso, route.query.estudiante, route.query.actividad],
  async ([cursoId, estudianteId, actividadId]) => {
    if (cursoId) {
      cursoSeleccionado.value = Number(cursoId)
      await cargarLibro(Number(cursoId))
    }
    if (!estudianteId || !actividadId) return
    await nextTick()
    const estudiante = estudiantes.value.find((item) => item.id === Number(estudianteId))
    const actividad = actividadesCurso.value.find((item) => item.id === Number(actividadId))
    if (estudiante && actividad) abrirCalificar(estudiante, actividad)
  },
  { immediate: true }
)

onMounted(async () => {
  await cargarLibro(cursoSeleccionado.value)
  finalizarCarga()
})
</script>

<style scoped>
.seguimiento-banner {
  background: var(--gradient-unitepc-soft);
  border: 1px solid var(--ta-border-card);
  color: var(--ta-text-primary);
}
.calificar-label {
  font-size: 12px;
  color: var(--ta-text-secondary);
  margin-bottom: 4px;
}
.calificar-dialog {
  width: min(750px, 92vw);
  max-width: 750px;
}
.entregado-badge {
  background: rgba(var(--accent-rgb), 0.14);
  color: var(--ta-info);
  border: 1px solid rgba(var(--accent-rgb), 0.22);
}
.body--dark .entregado-badge {
  background: rgba(var(--accent-rgb), 0.18);
  color: var(--ta-text-primary);
  border-color: rgba(var(--accent-rgb), 0.28);
}
.empty-badge {
  background: rgba(148, 163, 184, 0.18);
  color: var(--ta-text-secondary);
}
.body--dark .empty-badge {
  background: rgba(148, 163, 184, 0.22);
  color: var(--ta-text-secondary);
}
.auto-badge {
  background: rgba(var(--accent-rgb), 0.14);
  color: var(--ta-info);
  border: 1px solid rgba(var(--accent-rgb), 0.22);
}
.body--dark .auto-badge {
  background: rgba(var(--accent-rgb), 0.18);
  color: var(--ta-text-primary);
  border-color: rgba(var(--accent-rgb), 0.28);
}
.body--dark .seguimiento-banner {
  background: rgba(var(--primary-rgb), 0.14);
  border-color: rgba(var(--primary-rgb), 0.22);
}
.table-scroll {
  overflow-x: auto;
  border: 1px solid var(--ta-border-table);
  border-radius: 14px;
}
.calificaciones-tabla {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9em;
  border-radius: 14px;
  overflow: hidden;
}
.calificaciones-tabla th,
.calificaciones-tabla td {
  padding: 12px 16px;
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
  background-color: rgba(var(--primary-rgb), 0.04);
}
.body--dark .calificaciones-tabla tbody tr:hover td {
  background-color: rgba(var(--accent-rgb), 0.07);
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
  min-width: 100px;
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
