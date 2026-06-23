<template>
  <AppSkeleton v-if="cargando" variant="dashboard" />

  <DashboardShell
    v-else
    title="Mi Aula Virtual"
    subtitle="Continua tus cursos, revisa entregas pendientes y mantente al dia con las proximas fechas."
    eyebrow="Estudiante"
    icon="school"
    :meta="fechaHoy"
  >
    <template #actions>
      <q-btn unelevated no-caps color="primary" text-color="white" icon="library_books" label="Mis cursos" to="/estudiante/cursos" />
      <q-btn flat no-caps color="primary" icon="task_alt" label="Pendientes" to="/estudiante/centro" />
      <q-btn outline no-caps color="primary" icon="grade" label="Mis notas" to="/estudiante/notas" />
    </template>

    <template #aside>
      <div class="av-hero-panel">
        <div class="text-caption text-weight-bold uppercase">Actividades</div>
        <div class="text-h3 text-weight-bold q-mt-xs">{{ resumenActividades.labelRealizadas }}</div>
        <div class="text-caption" style="opacity: 0.82">{{ resumenActividades.labelPendientes }} pendientes</div>
        <q-linear-progress
          class="q-mt-md"
          :value="ratio(resumenActividades.realizadas, resumenActividades.total)"
          size="10px"
          rounded
          color="secondary"
          track-color="white"
        />
      </div>
    </template>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-lg-3 card-item" v-for="metric in metrics" :key="metric.label">
        <TaKpiCard
          :icon="metric.icon"
          :icon-color="metric.color"
          :label="metric.label"
          :value="metric.value"
          :trend="metric.trend"
        />
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-lg-8">
        <DashboardChartCard
          title="Actividades realizadas por curso"
          subtitle="Conteo de actividades completadas frente al total"
          icon="stacked_bar_chart"
          height="300px"
        >
          <BarChart :data="courseProgressChart" :options="barOptions" />
        </DashboardChartCard>
      </div>
      <div class="col-12 col-lg-4">
        <DashboardChartCard
          title="Tipo de pendientes"
          subtitle="Distribucion actual de actividades"
          icon="donut_large"
          icon-color="var(--gradient-unitepc-reverse)"
          height="300px"
        >
          <DoughnutChart v-if="pendingTypeChart.labels.length" :data="pendingTypeChart" :options="doughnutOptions" />
          <AppEmptyState
            v-else
            icon="check_circle"
            title="Todo al dia"
            message="No hay actividades pendientes para graficar."
          />
        </DashboardChartCard>
      </div>
    </div>

    <div class="row items-center q-mb-md q-col-gutter-md">
      <div class="col-12 col-md">
        <q-input
          v-model="search"
          dense
          outlined
          debounce="150"
          placeholder="Buscar cursos, docentes o codigos..."
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-auto">
        <div class="filter-bar">
          <q-btn-toggle
            v-model="courseFilter"
            flat
            no-caps
            rounded
            color="primary"
            toggle-color="primary"
            text-color="primary"
            :options="courseFilterOptions"
          />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <div class="av-section-heading">
          <div>
            <h2 class="av-section-heading__title">Continuar aprendiendo</h2>
            <p class="av-section-heading__subtitle">{{ filteredCourses.length }} curso(s) visibles</p>
          </div>
          <q-btn flat dense no-caps label="Ver todo" to="/estudiante/cursos" color="primary" icon-right="arrow_forward" />
        </div>

        <div v-if="filteredCourses.length" class="row q-col-gutter-lg">
          <div class="col-12 col-md-6 col-lg-4 card-item" v-for="course in filteredCourses" :key="course.id">
            <q-card class="av-course-card cursor-pointer" flat @click="router.push(`/estudiante/curso/${course.id}`)">
              <q-img :src="courseImage(course)" height="158px">
                <div class="absolute-top-left q-ma-sm">
                  <q-chip dense square color="white" text-color="primary" class="text-caption text-weight-bold">
                    {{ course.codigo }}
                  </q-chip>
                </div>
              </q-img>
              <q-card-section>
                <div class="text-body1 text-weight-bold line-clamp-2">{{ course.nombre }}</div>
                <div class="row items-center q-gutter-sm q-mt-sm">
                  <q-avatar size="26px"><img :src="courseDocente(course)?.avatar || ''" /></q-avatar>
                  <span class="text-caption text-grey">{{ courseDocente(course)?.nombre || 'Docente asignado' }}</span>
                </div>
                <div class="q-mt-md">
                  <div class="row items-center justify-between q-mb-xs">
                    <span class="text-caption text-weight-bold">Progreso</span>
                    <span class="text-caption text-weight-bold text-primary">{{ cursoContadores(course).labelRealizadas }}</span>
                  </div>
                  <q-linear-progress
                    :value="ratio(cursoContadores(course).realizadas, cursoContadores(course).total)"
                    rounded
                    size="8px"
                    color="primary"
                    :track-color="$q.dark.isActive ? 'grey-8' : 'grey-3'"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <AppEmptyState
          v-else
          icon="manage_search"
          title="No se encontraron cursos"
          message="Ajusta la busqueda o cambia el filtro de progreso."
        />
      </div>

      <div class="col-12 col-xl-4">
        <TaCard title="Pendientes priorizados" subtitle="Actividades ordenadas por fecha" :padding="false" class="q-mb-lg card-item">
          <q-list separator>
            <template v-if="pendingFlat.length">
              <q-item
                v-for="act in pendingFlat"
                :key="act.id + '-' + act.cursoId"
                clickable
                v-ripple
                class="av-list-item q-py-md"
                @click="irAActividad(act, act.cursoId)"
              >
                <q-item-section avatar>
                  <q-avatar :color="badgeColorActividad(act.tipo)" text-color="white" size="42px">
                    <q-icon :name="iconoActividad(act.tipo)" size="20px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 text-weight-bold">{{ act.titulo }}</q-item-label>
                  <q-item-label caption>{{ act.cursoCodigo }} - {{ act.seccionTitulo }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-caption text-weight-bold" :class="urgenciaClase(act.fechaLimite)">
                    {{ formatoFechaLimite(act.fechaLimite) }}
                  </div>
                </q-item-section>
              </q-item>
            </template>
            <AppEmptyState
              v-else
              icon="task_alt"
              title="Sin pendientes"
              message="No tienes actividades por entregar."
            />
          </q-list>
        </TaCard>

        <TaCard title="Docentes activos" subtitle="Referentes de tus cursos" :padding="false" class="card-item">
          <q-list separator>
            <q-item v-for="instructor in misInstructores" :key="instructor.id + '-' + instructor.cursoId" class="av-list-item q-py-md">
              <q-item-section avatar>
                <q-avatar size="42px"><img :src="instructor.avatar" /></q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2 text-weight-bold">{{ instructor.name }}</q-item-label>
                <q-item-label caption lines="1">{{ instructor.course }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip dense color="teal" text-color="white">Docente</q-chip>
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
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useAuthStore } from 'src/stores/auth'
import { useActividadesStore } from 'src/stores/actividades'
import { useStaggerCards } from 'src/composables/useAnimations'
import { useLoadingState } from 'src/composables/useLoadingState'
import DashboardShell from 'src/components/dashboard/DashboardShell.vue'
import DashboardChartCard from 'src/components/dashboard/DashboardChartCard.vue'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const actividadesStore = useActividadesStore()
const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 700 })

const search = ref('')
const courseFilter = ref('todos')
const fechaHoy = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })

const courseFilterOptions = [
  { label: 'Todos', value: 'todos' },
  { label: 'En riesgo', value: 'riesgo' },
  { label: 'Avanzados', value: 'avanzados' },
]

const estudianteId = computed(() => auth.usuario?.id ?? null)

const misCursos = computed(() => {
  if (!estudianteId.value) return []
  return actividadesStore.getCursosMatriculados(estudianteId.value)
})

const filteredCourses = computed(() => {
  const term = search.value.trim().toLowerCase()
  return misCursos.value.filter((course) => {
    const docente = courseDocente(course)
    const matchesSearch = !term || [course.nombre, course.codigo, docente?.nombre].some((value) => (value || '').toLowerCase().includes(term))
    const contadores = cursoContadores(course)
    const matchesFilter =
      courseFilter.value === 'todos' ||
      (courseFilter.value === 'riesgo' && contadores.pendientes > contadores.realizadas) ||
      (courseFilter.value === 'avanzados' && contadores.realizadas >= contadores.pendientes)
    return matchesSearch && matchesFilter
  })
})

function courseDocente(curso) {
  return actividadesStore.getDocenteDeCurso(curso.id)
}

function cursoContadores(curso) {
  if (!estudianteId.value) return { total: 0, realizadas: 0, pendientes: 0, labelRealizadas: '0/0', labelPendientes: '0/0' }
  return actividadesStore.getContadoresCursoEstudiante(estudianteId.value, curso)
}

function ratio(actual, total) {
  return total > 0 ? actual / total : 0
}

function courseImage(curso) {
  const imgs = {
    1: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    2: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80',
    3: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=600&q=80',
  }
  return imgs[curso.id] || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80'
}

const misInstructores = computed(() => {
  const list = []
  misCursos.value.forEach((curso) => {
    const doc = courseDocente(curso)
    if (doc && !list.some((i) => i.id === doc.id && i.cursoId === curso.id)) {
      list.push({
        id: doc.id,
        name: doc.nombre,
        email: doc.email,
        avatar: doc.avatar,
        course: curso.nombre,
        cursoId: curso.id,
      })
    }
  })
  return list
})

const pendientesAgrupados = computed(() => {
  if (!estudianteId.value) return []
  return actividadesStore.getPendientesPorEstudiante(estudianteId.value)
})

const pendingFlat = computed(() => {
  const actividades = []
  pendientesAgrupados.value.forEach((grupo) => {
    grupo.secciones.forEach((sec) => {
      sec.actividades.forEach((act) => {
        actividades.push({
          ...act,
          cursoId: grupo.curso.id,
          cursoCodigo: grupo.curso.codigo,
          cursoNombre: grupo.curso.nombre,
          seccionTitulo: sec.seccion.titulo,
        })
      })
    })
  })
  return actividades
    .sort((a, b) => new Date(a.fechaLimite || '2999-01-01') - new Date(b.fechaLimite || '2999-01-01'))
    .slice(0, 6)
})

const resumenActividades = computed(() => {
  const total = misCursos.value.reduce((sum, curso) => sum + cursoContadores(curso).total, 0)
  const realizadas = misCursos.value.reduce((sum, curso) => sum + cursoContadores(curso).realizadas, 0)
  const pendientes = Math.max(total - realizadas, 0)
  return {
    total,
    realizadas,
    pendientes,
    labelRealizadas: `${realizadas}/${total}`,
    labelPendientes: `${pendientes}/${total}`,
  }
})

const metrics = computed(() => [
  { label: 'Realizadas', value: resumenActividades.value.labelRealizadas, icon: 'task_alt', color: 'var(--gradient-unitepc)', trend: 0 },
  { label: 'Pendientes', value: resumenActividades.value.labelPendientes, icon: 'assignment_late', color: 'var(--gradient-unitepc-reverse)', trend: -5 },
  { label: 'Cursos activos', value: String(misCursos.value.length), icon: 'local_library', color: 'linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%)', trend: 0 },
  { label: 'Docentes', value: String(misInstructores.value.length), icon: 'groups', color: 'linear-gradient(135deg, #0D9488 0%, #6B3FA0 100%)', trend: 4 },
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
  cutout: '68%',
  plugins: {
    legend: { position: 'bottom', labels: { color: chartTextColor.value, usePointStyle: true, boxWidth: 8 } },
  },
}))

const courseProgressChart = computed(() => ({
  labels: misCursos.value.map((course) => course.codigo),
  datasets: [{
    label: 'Realizadas',
    data: misCursos.value.map((course) => cursoContadores(course).realizadas),
    backgroundColor: ['#6B3FA0', '#0D9488', '#A78BFA', '#14B8A6'],
    borderRadius: 12,
    maxBarThickness: 48,
  }],
}))

const pendingTypeChart = computed(() => {
  const totals = {}
  pendingFlat.value.forEach((act) => {
    totals[act.tipo] = (totals[act.tipo] || 0) + 1
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

function iconoActividad(tipo) {
  const map = { tarea: 'assignment', foro: 'forum', cuestionario: 'quiz', encuesta: 'poll', leccion: 'menu_book', h5p: 'extension' }
  return map[tipo] || 'assignment'
}

function badgeColorActividad(tipo) {
  const map = { tarea: 'primary', foro: 'secondary', cuestionario: 'primary', encuesta: 'secondary', leccion: 'primary', h5p: 'secondary' }
  return map[tipo] || 'grey-7'
}

function labelTipo(tipo) {
  const map = { tarea: 'Tareas', foro: 'Foros', cuestionario: 'Cuestionarios', encuesta: 'Encuestas', leccion: 'Lecciones', h5p: 'H5P' }
  return map[tipo] || tipo
}

function formatoFechaLimite(fechaStr) {
  if (!fechaStr) return 'Sin fecha'
  const fecha = new Date(fechaStr)
  const hoy = new Date()
  const dias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24))
  if (dias < 0) return `Vencio hace ${Math.abs(dias)} dias`
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence manana'
  return `Vence en ${dias} dias`
}

function urgenciaClase(fechaStr) {
  if (!fechaStr) return 'text-grey'
  const dias = Math.ceil((new Date(fechaStr) - new Date()) / (1000 * 60 * 60 * 24))
  if (dias < 0) return 'text-negative'
  if (dias <= 3) return 'text-warning'
  return 'text-positive'
}

function irAActividad(actividad, cursoId) {
  router.push(`/estudiante/curso/${cursoId}?actividad=${actividad.id}`)
}

useStaggerCards('.card-item')

onMounted(() => {
  finalizarCarga()
})
</script>

<style scoped>
.search-input :deep(.q-field__control) {
  border-radius: 16px;
  background: var(--ta-bg-card);
  border: 1px solid var(--ta-border-card);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.search-input :deep(.q-field__control:focus-within) {
  border-color: rgba(var(--primary-rgb), 0.4);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.08);
}
.filter-bar {
  display: inline-flex;
  padding: 4px;
  background: var(--ta-bg-card);
  border: 1px solid var(--ta-border-card);
  border-radius: 999px;
  box-shadow: var(--shadow-card);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
