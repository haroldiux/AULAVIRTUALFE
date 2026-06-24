<template>
  <q-page class="av-dashboard-page">
    <AppSkeleton v-if="cargando" variant="dashboard" />

    <template v-else>
      <TaPageHeader title="Reportes" data-tour="director-reports-header" />

      <div class="row q-col-gutter-md q-mb-md" data-tour="director-reports-kpis">
        <div class="col-12 col-md-4">
          <TaCard custom-class="card-item text-center report-kpi report-kpi--purple">
            <q-icon name="school" size="48px" color="primary" />
            <div class="text-h6 q-mt-sm text-weight-bold">Cumplimiento Docente</div>
            <p class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ cursosActivos }} cursos activos · {{ cursosInactivos }} sin actividad reciente</p>
          </TaCard>
        </div>
        <div class="col-12 col-md-4">
          <TaCard custom-class="card-item text-center report-kpi report-kpi--teal">
            <q-icon name="trending_up" size="48px" color="teal" />
            <div class="text-h6 q-mt-sm text-weight-bold">Rendimiento Estudiantil</div>
            <p class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Promedio general: {{ promedioGeneral }}%</p>
          </TaCard>
        </div>
        <div class="col-12 col-md-4">
          <TaCard custom-class="card-item text-center report-kpi report-kpi--orange">
            <q-icon name="warning" size="48px" color="orange" />
            <div class="text-h6 q-mt-sm text-weight-bold">Alertas</div>
            <p class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ alertasCount }} cursos con entregas sin calificar</p>
          </TaCard>
        </div>
      </div>

    <div class="row q-col-gutter-md q-mb-md" data-tour="director-reports-charts">
      <div class="col-12 col-md-6">
        <TaCard title="Promedio por Curso" class="card-item">
          <BarChart v-if="chartDataCursos.labels.length" :data="chartDataCursos" :options="chartOptionsBar" :style="{ height: '260px' }" />
          <AppEmptyState
            v-else
            icon="bar_chart"
            title="Sin datos de cursos"
            message="No hay cursos disponibles para mostrar el promedio."
          />
        </TaCard>
      </div>
      <div class="col-12 col-md-6">
        <TaCard title="Distribucion de Estudiantes por Rango" class="card-item">
          <DoughnutChart v-if="chartDataRangos.labels.length" :data="chartDataRangos" :options="chartOptionsDoughnut" :style="{ height: '260px' }" />
          <AppEmptyState
            v-else
            icon="donut_large"
            title="Sin datos de rangos"
            message="No hay estudiantes con calificaciones registradas."
          />
        </TaCard>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12">
        <TaCard title="Cursos sin Actividad Reciente" class="card-item">
          <q-list separator>
            <q-item v-for="curso in cursosInactivosList" :key="curso.id" class="av-list-item q-py-md">
              <q-item-section avatar>
                <q-avatar color="warning" text-color="white" size="44px">
                  <q-icon name="warning" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ curso.nombre }} <span class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">({{ curso.codigo }})</span></q-item-label>
                <q-item-label caption>{{ curso.docente }} · {{ curso.ultimaActividad }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="warning" text-color="white" class="q-px-sm">Inactivo</q-badge>
              </q-item-section>
            </q-item>
            <AppEmptyState
              v-if="cursosInactivosList.length === 0"
              icon="check_circle"
              title="Todos los cursos estan activos"
              message="No hay cursos sin actividad reciente en este periodo."
            />
          </q-list>
        </TaCard>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md" data-tour="director-reports-export">
      <div class="col-12">
        <TaCard class="card-item">
          <template #header>
            <div class="row items-center q-gutter-sm">
              <q-icon name="download" color="primary" />
              <span class="text-subtitle1 text-weight-bold">Exportar Reportes</span>
              <q-badge color="teal" class="q-ml-auto q-pa-xs">CSV · UTF-8</q-badge>
            </div>
          </template>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="export-card">
                <q-icon name="school" size="36px" color="primary" />
                <div class="text-subtitle2 text-weight-bold q-mt-sm">Rendimiento Estudiantil</div>
                <div class="text-caption text-grey q-mb-md">Promedios por curso, secciones y estudiantes</div>
                <TaButton
                  variant="primary"
                  icon="download"
                  label="Exportar"
                  :loading="exportando.rendimiento"
                  @click="exportarReporte('rendimiento')"
                />
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="export-card">
                <q-icon name="groups" size="36px" color="teal" />
                <div class="text-subtitle2 text-weight-bold q-mt-sm">Asistencia y Actividad</div>
                <div class="text-caption text-grey q-mb-md">Entregas, participacion y accesos por periodo</div>
                <TaButton
                  variant="secondary"
                  icon="download"
                  label="Exportar"
                  :loading="exportando.actividad"
                  @click="exportarReporte('actividad')"
                />
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="export-card">
                <q-icon name="inventory_2" size="36px" color="orange" />
                <div class="text-subtitle2 text-weight-bold q-mt-sm">Banco Docente</div>
                <div class="text-caption text-grey q-mb-md">Plantillas institucionales y contadores de uso</div>
                <TaButton
                  variant="outline"
                  icon="download"
                  label="Exportar"
                  :loading="exportando.banco"
                  @click="exportarReporte('banco-docente')"
                />
              </div>
            </div>
          </div>
        </TaCard>
      </div>
    </div>
    </template>
  </q-page>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useCursosStore } from 'src/stores/cursos'
import { useActividadesStore } from 'src/stores/actividades'
import { calificaciones as mockCalificaciones, matriculas as mockMatriculas, usuarios as mockUsuarios } from 'src/mock/index.js'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import { useStaggerCards } from 'src/composables/useAnimations'
import { useLoadingState } from 'src/composables/useLoadingState'
import api from 'src/services/api.js'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)
useStaggerCards('.card-item')

const $q = useQuasar()
const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()
const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 700 })
const exportando = reactive({ rendimiento: false, actividad: false, 'banco-docente': false })

const cursos = computed(() => cursosStore.cursos)
const cursosActivos = computed(() => cursos.value.filter((c) => c.estado === 'publicado').length)
const cursosInactivos = computed(() => cursos.value.filter((c) => c.estado !== 'publicado').length)

function promedioCurso(cursoId) {
  const califs = mockCalificaciones[cursoId]
  if (!califs) return 0
  const estudiantes = Object.keys(califs)
  if (!estudiantes.length) return 0
  const promedios = estudiantes.map((eid) => {
    const notas = Object.values(califs[eid]).filter(Boolean)
    if (!notas.length) return 0
    return notas.reduce((s, n) => s + (n.porcentaje || 0), 0) / notas.length
  })
  return Math.round(promedios.reduce((s, p) => s + p, 0) / promedios.length)
}

const promedioGeneral = computed(() => {
  const vals = cursos.value.map((c) => promedioCurso(c.id)).filter((p) => p > 0)
  if (!vals.length) return 0
  return Math.round(vals.reduce((s, p) => s + p, 0) / vals.length)
})

const alertasCount = computed(() => {
  let count = 0
  cursos.value.forEach((curso) => {
    const seccionIds = curso.secciones.map((s) => s.id)
    const acts = actividadesStore.actividades.filter((a) => seccionIds.includes(a.seccion_id) && a.tiene_nota)
    const mats = mockMatriculas.filter((m) => m.curso_id === curso.id && m.estado === 'activo')
    mats.forEach((m) => {
      acts.forEach((a) => {
        const entregado = actividadesStore.entregas.some(
          (e) => e.estudiante_id === m.estudiante_id && e.actividad_id === a.id
        )
        const nota = mockCalificaciones[curso.id]?.[m.estudiante_id]?.[a.id]
        if (entregado && !nota) count++
      })
    })
  })
  return count
})

const chartOptionsBar = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, max: 100 } },
}

const chartOptionsDoughnut = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
}

const chartDataCursos = computed(() => {
  return {
    labels: cursos.value.map((c) => c.nombre),
    datasets: [{
      label: 'Promedio (%)',
      data: cursos.value.map((c) => promedioCurso(c.id)),
      backgroundColor: ['#6B3FA0', '#14b8a6', '#f59e0b', '#7c3aed'],
      borderRadius: 6,
    }],
  }
})

const chartDataRangos = computed(() => {
  const rangos = { aprobado: 0, regular: 0, reprobado: 0 }
  cursos.value.forEach((c) => {
    const califs = mockCalificaciones[c.id]
    if (!califs) return
    Object.keys(califs).forEach((eid) => {
      const notas = Object.values(califs[eid]).filter(Boolean)
      if (!notas.length) return
      const prom = notas.reduce((s, n) => s + (n.porcentaje || 0), 0) / notas.length
      if (prom >= 60) rangos.aprobado++
      else if (prom >= 40) rangos.regular++
      else rangos.reprobado++
    })
  })
  return {
    labels: ['Aprobado (>=60%)', 'Regular (40-59%)', 'Reprobado (<40%)'],
    datasets: [{
      data: [rangos.aprobado, rangos.regular, rangos.reprobado],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
    }],
  }
})

const cursosInactivosList = computed(() => {
  return cursos.value
    .filter((c) => c.estado !== 'publicado')
    .map((c) => {
      const docente = mockUsuarios.find((u) => u.id === c.docente_id)
      return {
        id: c.id,
        nombre: c.nombre,
        codigo: c.codigo,
        docente: docente?.nombre || 'Sin docente',
        ultimaActividad: 'Sin actividad registrada',
      }
    })
})

async function exportarReporte(tipo) {
  exportando[tipo] = true
  try {
    const res = await api.get(`/reportes/${tipo}`, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-${tipo}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    $q.notify({ message: `Reporte "${tipo}" exportado exitosamente`, color: 'positive', icon: 'download' })
  } catch {
    // Fallback: exportar datos locales como CSV
    exportarCSVLocal(tipo)
  } finally {
    exportando[tipo] = false
  }
}

function exportarCSVLocal(tipo) {
  let filas = []
  if (tipo === 'rendimiento') {
    filas = [['Curso', 'Codigo', 'Promedio (%)']]
    cursos.value.forEach((c) => filas.push([c.nombre, c.codigo, promedioCurso(c.id)]))
  } else if (tipo === 'actividad') {
    filas = [['Curso', 'Codigo', 'Estado']]
    cursos.value.forEach((c) => filas.push([c.nombre, c.codigo, c.estado]))
  } else {
    filas = [['Tipo', 'Cursos Activos', 'Cursos Inactivos']]
    filas.push(['Resumen', cursosActivos.value, cursosInactivos.value])
  }
  const bom = '\uFEFF'
  const csvContent = bom + filas.map((fila) => fila.join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `reporte-${tipo}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
  $q.notify({ message: `Reporte exportado (modo local)`, color: 'info', icon: 'download' })
}

onMounted(() => {
  finalizarCarga()
})
</script>

<style scoped>
.report-kpi {
  position: relative;
  overflow: hidden;
}
.report-kpi::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.08;
  pointer-events: none;
}
.report-kpi--purple::before { background: linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%); }
.report-kpi--teal::before { background: linear-gradient(135deg, #0D9488 0%, #6B3FA0 100%); }
.report-kpi--orange::before { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); }
.export-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
  border: 1px solid var(--ta-border-card);
  border-radius: 16px;
  background: var(--ta-bg-card);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  height: 100%;
}
.export-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: rgba(var(--primary-rgb), 0.22);
}
</style>
