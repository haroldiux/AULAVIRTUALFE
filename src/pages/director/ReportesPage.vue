<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Reportes" data-tour="director-reports-header" />

    <div class="row q-col-gutter-md q-mb-md" data-tour="director-reports-kpis">
      <div class="col-12 col-md-4">
        <TaCard custom-class="card-item text-center">
          <q-icon name="school" size="48px" color="primary" />
          <div class="text-h6 q-mt-sm" :class="$q.dark.isActive ? 'text-slate-100' : 'text-slate-800'">Cumplimiento Docente</div>
          <p class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ cursosActivos }} cursos activos · {{ cursosInactivos }} sin actividad reciente</p>
        </TaCard>
      </div>
      <div class="col-12 col-md-4">
        <TaCard custom-class="card-item text-center">
          <q-icon name="trending_up" size="48px" color="teal" />
          <div class="text-h6 q-mt-sm" :class="$q.dark.isActive ? 'text-slate-100' : 'text-slate-800'">Rendimiento Estudiantil</div>
          <p class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Promedio general: {{ promedioGeneral }}%</p>
        </TaCard>
      </div>
      <div class="col-12 col-md-4">
        <TaCard custom-class="card-item text-center">
          <q-icon name="warning" size="48px" color="orange" />
          <div class="text-h6 q-mt-sm" :class="$q.dark.isActive ? 'text-slate-100' : 'text-slate-800'">Alertas</div>
          <p class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ alertasCount }} cursos con entregas sin calificar</p>
        </TaCard>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md" data-tour="director-reports-charts">
      <div class="col-12 col-md-6">
        <TaCard title="Promedio por Curso" class="card-item">
          <BarChart v-if="chartDataCursos.labels.length" :data="chartDataCursos" :options="chartOptionsBar" :style="{ height: '260px' }" />
        </TaCard>
      </div>
      <div class="col-12 col-md-6">
        <TaCard title="Distribucion de Estudiantes por Rango" class="card-item">
          <DoughnutChart v-if="chartDataRangos.labels.length" :data="chartDataRangos" :options="chartOptionsDoughnut" :style="{ height: '260px' }" />
        </TaCard>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12">
        <TaCard title="Cursos sin Actividad Reciente" class="card-item">
          <q-list dense separator>
            <q-item v-for="curso in cursosInactivosList" :key="curso.id">
              <q-item-section avatar>
                <q-icon name="warning" color="orange" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ curso.nombre }} <span class="text-caption text-grey-7">({{ curso.codigo }})</span></q-item-label>
                <q-item-label caption>{{ curso.docente }} · {{ curso.ultimaActividad }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="orange" text-color="white">Inactivo</q-badge>
              </q-item-section>
            </q-item>
            <q-item v-if="cursosInactivosList.length === 0" class="text-center text-grey">
              <q-item-section>
                <q-icon name="check_circle" color="positive" size="24px" />
                <div class="text-caption">Todos los cursos tienen actividad reciente</div>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useCursosStore } from 'src/stores/cursos'
import { useActividadesStore } from 'src/stores/actividades'
import { calificaciones as mockCalificaciones, matriculas as mockMatriculas, usuarios as mockUsuarios } from 'src/mock/index.js'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import { useStaggerCards } from 'src/composables/useAnimations'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)
useStaggerCards('.card-item')

const $q = useQuasar()
const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()

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
</script>
