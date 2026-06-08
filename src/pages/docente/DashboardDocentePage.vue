<template>
  <DashboardShell
    title="Centro docente"
    subtitle="Monitorea avance, entregas pendientes y acciones prioritarias para tus cursos activos."
    eyebrow="Docente"
    icon="workspace_premium"
    :meta="fechaHoy"
  >
    <template #actions>
      <q-btn unelevated no-caps color="primary" text-color="white" icon="add" label="Nuevo curso" to="/docente/cursos" />
      <q-btn outline no-caps color="primary" icon="grade" label="Calificar" to="/docente/calificar" />
      <q-btn flat no-caps color="primary" icon="auto_awesome" label="Herramientas" to="/docente/herramientas" />
    </template>

    <template #aside>
      <div class="av-hero-panel">
        <div class="text-caption text-weight-bold uppercase">Revision pendiente</div>
        <div class="text-h3 text-weight-bold q-mt-xs">{{ entregasPendientes.length }}</div>
        <div class="text-caption" style="opacity: 0.82">Entregas esperando calificacion</div>
        <q-btn class="q-mt-md full-width" unelevated no-caps color="secondary" text-color="white" icon="rate_review" label="Abrir libro" to="/docente/calificar" />
        <q-btn class="q-mt-sm full-width" flat no-caps color="white" icon="crisis_alert" :label="`${alertasCriticas} alertas criticas`" :to="{ path: '/docente/herramientas', query: { tab: 'alertas' } }" />
      </div>
    </template>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-lg-3" v-for="kpi in kpis" :key="kpi.label">
        <TaKpiCard
          class="card-item"
          :icon="kpi.icon"
          :icon-color="kpi.iconColor"
          :label="kpi.label"
          :value="kpi.valor"
          :trend="kpi.tendencia"
        />
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-lg-8">
        <DashboardChartCard
          title="Contenido por curso"
          subtitle="Actividades creadas frente a la estructura esperada"
          icon="bar_chart"
          height="310px"
        >
          <BarChart v-if="chartDataRendimiento.labels.length" :data="chartDataRendimiento" :options="barOptions" />
          <DashboardEmptyState v-else icon="school" title="Sin cursos asignados" message="Todavia no hay cursos para graficar." />
        </DashboardChartCard>
      </div>
      <div class="col-12 col-lg-4">
        <DashboardChartCard
          title="Actividades"
          subtitle="Composicion de recursos evaluables"
          icon="donut_large"
          icon-color="var(--gradient-unitepc-reverse)"
          height="310px"
        >
          <DoughnutChart v-if="chartDataActividades.labels.length" :data="chartDataActividades" :options="doughnutOptions" />
          <DashboardEmptyState v-else icon="assignment" title="Sin actividades" message="Crea actividades para ver su distribucion." />
        </DashboardChartCard>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <TaCard title="Cursos activos" subtitle="Estado operativo de tus materias" :padding="false" class="card-item q-mb-lg">
          <q-list separator>
            <q-item
              v-for="curso in cursos"
              :key="curso.id"
              clickable
              v-ripple
              class="av-list-item q-py-md"
              @click="router.push(`/docente/curso/${curso.id}/builder`)"
            >
              <q-item-section avatar>
                <q-avatar :color="curso.estado === 'publicado' ? 'secondary' : 'primary'" text-color="white" size="46px">
                  <q-icon name="menu_book" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2 text-weight-bold">{{ curso.nombre }}</q-item-label>
                <q-item-label caption>{{ curso.codigo }} - {{ curso.total_estudiantes }} estudiantes</q-item-label>
                <q-linear-progress
                  class="q-mt-sm"
                  :value="ratio(contenidoCurso(curso), contenidoObjetivo(curso))"
                  :color="contenidoCurso(curso) >= contenidoObjetivo(curso) / 2 ? 'green' : 'orange'"
                  rounded
                  size="7px"
                  track-color="grey-3"
                />
              </q-item-section>
              <q-item-section side>
                <div class="text-h6 text-weight-bold text-primary">
                  {{ contenidoCurso(curso) }}/{{ contenidoObjetivo(curso) }}
                </div>
                <q-badge :color="curso.estado === 'publicado' ? 'secondary' : 'primary'" text-color="white">
                  {{ curso.estado === 'publicado' ? 'Publicado' : 'Borrador' }}
                </q-badge>
              </q-item-section>
            </q-item>
            <DashboardEmptyState v-if="!cursos.length" icon="school" title="Sin cursos" message="No hay cursos asignados para este docente." />
          </q-list>
        </TaCard>
      </div>

      <div class="col-12 col-xl-4">
        <TaCard title="Entregas por revisar" subtitle="Ultimos envios recibidos" :padding="false" class="card-item q-mb-lg" data-tour="teacher-dashboard-submissions">
          <q-list separator>
            <q-item v-for="entrega in entregasPendientes" :key="entrega.id" class="av-list-item q-py-md">
              <q-item-section avatar>
                <q-avatar size="42px"><img :src="entrega.avatar" /></q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2 text-weight-bold">{{ entrega.estudiante }}</q-item-label>
                <q-item-label caption lines="1">{{ entrega.actividad }} - {{ entrega.curso }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip dense :color="badgeColor(entrega.tipo)" text-color="white">{{ entrega.tipo }}</q-chip>
                <div class="text-caption text-grey q-mt-xs">{{ entrega.fecha }}</div>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>

        <TaCard title="Acciones rapidas" subtitle="Flujos frecuentes" :padding="false" class="card-item">
          <q-list>
            <q-item clickable v-ripple to="/docente/cursos" class="av-list-item q-py-md">
              <q-item-section avatar><q-icon name="library_books" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Gestionar cursos</q-item-label>
                <q-item-label caption>Editar contenido, publicar y revisar estructura</q-item-label>
              </q-item-section>
              <q-item-section side><q-icon name="chevron_right" color="grey-5" /></q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/docente/calificar" class="av-list-item q-py-md">
              <q-item-section avatar><q-icon name="grade" color="secondary" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Calificar pendientes</q-item-label>
                <q-item-label caption>{{ entregasPendientes.length }} entregas esperando revision</q-item-label>
              </q-item-section>
              <q-item-section side><q-icon name="chevron_right" color="grey-5" /></q-item-section>
            </q-item>
            <q-item clickable v-ripple :to="{ path: '/docente/herramientas', query: { tab: 'alertas' } }" class="av-list-item q-py-md">
              <q-item-section avatar><q-icon name="auto_awesome" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Centro inteligente</q-item-label>
                <q-item-label caption>{{ alertasCriticas }} alertas criticas y automatizaciones docentes</q-item-label>
              </q-item-section>
              <q-item-section side><q-icon name="chevron_right" color="grey-5" /></q-item-section>
            </q-item>
          </q-list>
        </TaCard>
      </div>
    </div>
  </DashboardShell>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useCursosStore } from 'src/stores/cursos'
import { useAuthStore } from 'src/stores/auth'
import { useHerramientasDocenteStore } from 'src/stores/herramientasDocente'
import { actividades as mockActividades } from 'src/mock/index.js'
import { useStaggerCards } from 'src/composables/useAnimations'
import DashboardShell from 'src/components/dashboard/DashboardShell.vue'
import DashboardChartCard from 'src/components/dashboard/DashboardChartCard.vue'
import DashboardEmptyState from 'src/components/dashboard/DashboardEmptyState.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const $q = useQuasar()
const router = useRouter()
const cursosStore = useCursosStore()
const auth = useAuthStore()
const herramientas = useHerramientasDocenteStore()

const fechaHoy = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })

const cursos = computed(() => cursosStore.cursos.filter((c) => c.docente_id === auth.usuario?.id))
const alertasCriticas = computed(() => herramientas.alertasPorDocente(auth.usuario?.id).filter((alerta) => alerta.severidad === 'critica').length)

const entregasPendientes = [
  { id: 1, estudiante: 'Ana Lucia Vargas', avatar: 'https://i.pravatar.cc/150?img=44', actividad: 'Diagrama de Clases', tipo: 'Tarea', fecha: 'Hace 2h', curso: 'Prog Avanzada' },
  { id: 2, estudiante: 'Juan Perez Flores', avatar: 'https://i.pravatar.cc/150?img=33', actividad: 'Foro Debate', tipo: 'Foro', fecha: 'Ayer', curso: 'Prog Avanzada' },
  { id: 3, estudiante: 'Pedro Choque', avatar: 'https://i.pravatar.cc/150?img=53', actividad: 'Quiz - Procedimientos', tipo: 'Quiz', fecha: 'Ayer', curso: 'BD II' },
  { id: 4, estudiante: 'Ana Lucia Vargas', avatar: 'https://i.pravatar.cc/150?img=44', actividad: 'Consultas SQL', tipo: 'Tarea', fecha: 'Hace 3d', curso: 'BD II' },
]

const contenidoResumen = computed(() => {
  const creadas = cursos.value.reduce((sum, curso) => sum + contenidoCurso(curso), 0)
  const esperadas = cursos.value.reduce((sum, curso) => sum + contenidoObjetivo(curso), 0)
  return `${creadas}/${esperadas}`
})

const kpis = computed(() => [
  { label: 'Cursos activos', valor: cursos.value.filter((c) => c.estado === 'publicado').length, icon: 'school', iconColor: 'var(--gradient-unitepc)', tendencia: 0 },
  { label: 'Estudiantes', valor: cursos.value.reduce((s, c) => s + c.total_estudiantes, 0), icon: 'groups', iconColor: 'var(--gradient-unitepc-reverse)', tendencia: 12 },
  { label: 'Contenido creado', valor: contenidoResumen.value, icon: 'library_add_check', iconColor: 'linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%)', tendencia: 0 },
  { label: 'Pendientes', valor: entregasPendientes.length, icon: 'assignment_late', iconColor: 'linear-gradient(135deg, #0D9488 0%, #6B3FA0 100%)', tendencia: -8 },
])

const chartTextColor = computed(() => ($q.dark.isActive ? '#e2e8f0' : '#475569'))
const chartGridColor = computed(() => ($q.dark.isActive ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'))

const barOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
  scales: {
    x: { ticks: { color: chartTextColor.value }, grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0, color: chartTextColor.value }, grid: { color: chartGridColor.value } },
  },
}))

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '66%',
  plugins: {
    legend: { position: 'bottom', labels: { color: chartTextColor.value, usePointStyle: true, boxWidth: 8 } },
  },
}))

const chartDataRendimiento = computed(() => ({
  labels: cursos.value.map((curso) => curso.codigo),
  datasets: [{
    label: 'Actividades',
    data: cursos.value.map((curso) => contenidoCurso(curso)),
    backgroundColor: ['#6B3FA0', '#0D9488', '#A78BFA', '#14B8A6'],
    borderRadius: 12,
    maxBarThickness: 54,
  }],
}))

const chartDataActividades = computed(() => {
  const seccionIds = new Set(cursos.value.flatMap((curso) => curso.secciones.map((seccion) => seccion.id)))
  const totals = {}
  mockActividades
    .filter((actividad) => seccionIds.has(actividad.seccion_id))
    .forEach((actividad) => {
      totals[actividad.tipo] = (totals[actividad.tipo] || 0) + 1
    })
  return {
    labels: Object.keys(totals).map(labelTipo),
    datasets: [{
      data: Object.values(totals),
      backgroundColor: ['#0D9488', '#6B3FA0', '#A78BFA', '#14B8A6', '#EDE9FE', '#B5F3EA'],
      borderWidth: 0,
    }],
  }
})

function contenidoCurso(curso) {
  return mockActividades.filter((actividad) => curso.secciones.some((seccion) => seccion.id === actividad.seccion_id)).length
}

function contenidoObjetivo(curso) {
  return Math.max(curso.secciones.length * 4, 1)
}

function ratio(actual, total) {
  return total > 0 ? actual / total : 0
}

function badgeColor(t) {
  const m = { Tarea: 'primary', Foro: 'secondary', Quiz: 'primary', Leccion: 'secondary' }
  return m[t] || 'grey'
}

function labelTipo(tipo) {
  const map = { tarea: 'Tareas', foro: 'Foros', cuestionario: 'Cuestionarios', encuesta: 'Encuestas', leccion: 'Lecciones', h5p: 'H5P' }
  return map[tipo] || tipo
}

useStaggerCards('.card-item')
</script>
