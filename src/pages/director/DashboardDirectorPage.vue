<template>
  <AppSkeleton v-if="cargando" variant="dashboard" :kpis="6" />

  <DashboardShell
    v-else
    title="Panel academico"
    subtitle="Supervisa avance por carrera, cursos con riesgo y alertas operativas de la gestion."
    eyebrow="Direccion academica"
    icon="insights"
    :meta="fechaHoy"
  >
    <template #actions>
      <q-select
        v-model="carreraSeleccionada"
        :options="opcionesCarrera"
        outlined
        dense
        :bg-color="$q.dark.isActive ? 'grey-9' : 'white'"
        :input-style="{ color: $q.dark.isActive ? '#F1F5F9' : '#1E293B' }"
        color="primary"
        label="Carrera"
        map-options
        emit-value
        style="min-width: 240px"
      />
      <q-btn flat no-caps color="primary" icon="insights" label="Observatorio" to="/director/observatorio" />
      <q-btn outline no-caps color="primary" icon="assessment" label="Reportes" to="/director/reportes" />
    </template>

    <template #aside>
      <div class="av-hero-panel">
        <div class="text-caption text-weight-bold uppercase">Alertas activas</div>
        <div class="text-h3 text-weight-bold q-mt-xs">{{ alertas.length }}</div>
        <div class="text-caption" style="opacity: 0.82">Requieren seguimiento esta semana</div>
        <q-linear-progress class="q-mt-md" :value="0.72" color="secondary" track-color="white" rounded size="10px" />
      </div>
    </template>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="kpi in kpis" :key="kpi.label" class="col-6 col-sm-4 col-lg-2">
        <TaKpiCard
          :icon="kpi.icon"
          :icon-color="kpi.iconColor"
          :label="kpi.label"
          :value="kpi.valor"
          class="card-item"
        />
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-lg-8">
        <DashboardChartCard title="Rendimiento por curso" subtitle="Promedio de avance por materia" icon="bar_chart" height="310px">
          <BarChart :data="chartDataRendimiento" :options="chartOptions" />
        </DashboardChartCard>
      </div>
      <div class="col-12 col-lg-4">
        <DashboardChartCard title="Distribucion de cursos" subtitle="Estado de publicacion y cierre" icon="donut_large" icon-color="var(--gradient-unitepc-reverse)" height="310px">
          <DoughnutChart :data="chartDataDistribucion" :options="doughnutOptions" />
        </DashboardChartCard>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-lg-7">
        <TaCard title="Cursos por estado" subtitle="Materias con avance y docentes asignados" :padding="false" class="card-item">
          <q-list separator>
            <q-item v-for="curso in cursosEstado" :key="curso.id" clickable v-ripple class="av-list-item q-py-md">
              <q-item-section avatar>
                <q-avatar :color="curso.estado === 'publicado' ? 'secondary' : 'primary'" text-color="white" size="44px">
                  <q-icon name="library_books" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ curso.nombre }}</q-item-label>
                <q-item-label caption>{{ curso.codigo }} - {{ curso.docente }} - {{ curso.estudiantes }} estudiantes</q-item-label>
                <q-linear-progress class="q-mt-sm" :value="curso.avance / 100" size="7px" :color="curso.avance > 50 ? 'secondary' : 'primary'" rounded track-color="grey-3" />
              </q-item-section>
              <q-item-section side>
                <q-badge :color="curso.estado === 'publicado' ? 'secondary' : 'primary'">
                  {{ curso.estado === 'publicado' ? 'Publicado' : 'Borrador' }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>
      </div>

      <div class="col-12 col-lg-5">
        <TaCard title="Alertas academicas" subtitle="Cursos y procesos que necesitan intervencion" :padding="false" class="card-item">
          <q-list separator>
            <q-item v-for="alerta in alertas" :key="alerta.id" class="av-list-item q-py-md">
              <q-item-section avatar>
                <q-avatar :color="alerta.color" text-color="white" size="44px">
                  <q-icon :name="alerta.icon" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2 text-weight-bold">{{ alerta.titulo }}</q-item-label>
                <q-item-label caption>{{ alerta.descripcion }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="alerta.color" text-color="white" :label="alerta.etiqueta" />
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>
      </div>
    </div>
  </DashboardShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import DashboardShell from 'src/components/dashboard/DashboardShell.vue'
import DashboardChartCard from 'src/components/dashboard/DashboardChartCard.vue'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'
import { useStaggerCards } from 'src/composables/useAnimations'
import { useLoadingState } from 'src/composables/useLoadingState'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const $q = useQuasar()
const fechaHoy = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })
const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 700 })

const carreraSeleccionada = ref(1)
const opcionesCarrera = [
  { label: 'Ingenieria de Sistemas', value: 1 },
  { label: 'Ingenieria Comercial', value: 2 },
]

const kpis = [
  { label: 'Cursos activos', valor: 2, icon: 'school', iconColor: 'var(--gradient-unitepc)' },
  { label: 'Docentes', valor: 2, icon: 'person', iconColor: 'var(--gradient-unitepc-reverse)' },
  { label: 'Estudiantes', valor: 90, icon: 'groups', iconColor: 'linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%)' },
  { label: 'Promedio', valor: '62%', icon: 'trending_up', iconColor: 'linear-gradient(135deg, #0D9488 0%, #6B3FA0 100%)' },
  { label: 'Alertas', valor: 3, icon: 'warning', iconColor: 'linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%)' },
  { label: 'Aprobacion', valor: '78%', icon: 'verified', iconColor: 'linear-gradient(135deg, #0D9488 0%, #6B3FA0 100%)' },
]

const chartTextColor = computed(() => ($q.dark.isActive ? '#e2e8f0' : '#475569'))
const chartGridColor = computed(() => ($q.dark.isActive ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: chartTextColor.value }, grid: { display: false } },
    y: { beginAtZero: true, max: 100, ticks: { color: chartTextColor.value }, grid: { color: chartGridColor.value } },
  },
}))

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '66%',
  plugins: { legend: { position: 'bottom', labels: { color: chartTextColor.value, usePointStyle: true, boxWidth: 8 } } },
}))

const chartDataRendimiento = {
  labels: ['Prog. Avanzada', 'Base Datos II', 'Marketing Digital'],
  datasets: [{
    label: 'Avance (%)',
    data: [68, 45, 0],
    backgroundColor: ['#6B3FA0', '#0D9488', '#A78BFA'],
    borderRadius: 12,
  }],
}

const chartDataDistribucion = {
  labels: ['Activos', 'Borrador', 'Archivados', 'Finalizados'],
  datasets: [{
    data: [2, 1, 0, 0],
    backgroundColor: ['#0D9488', '#6B3FA0', '#E5E7EB', '#A78BFA'],
    borderWidth: 0,
  }],
}

const cursosEstado = [
  { id: 1, nombre: 'Programacion Avanzada', codigo: 'SIS-401', estado: 'publicado', docente: 'Dr. Carlos Mendoza', estudiantes: 35, avance: 68 },
  { id: 2, nombre: 'Base de Datos II', codigo: 'SIS-305', estado: 'publicado', docente: 'Dr. Carlos Mendoza', estudiantes: 30, avance: 45 },
  { id: 3, nombre: 'Marketing Digital', codigo: 'COM-201', estado: 'borrador', docente: 'Dra. Maria Rios', estudiantes: 25, avance: 0 },
]

const alertas = [
  { id: 1, icon: 'warning', color: 'red', titulo: 'Marketing Digital sin actividad', descripcion: '15 dias sin actualizacion', etiqueta: 'Urgente' },
  { id: 2, icon: 'error', color: 'orange', titulo: '23 entregas sin calificar', descripcion: 'Base de Datos II acumula pendientes', etiqueta: 'Atencion' },
  { id: 3, icon: 'info', color: 'blue', titulo: 'Finalizacion proxima', descripcion: 'Programacion Avanzada al 95%', etiqueta: 'Info' },
]

useStaggerCards('.card-item')

onMounted(() => {
  finalizarCarga()
})
</script>
