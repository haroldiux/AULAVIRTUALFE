<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Observatorio Academico">
      <template #actions>
        <TaButton variant="outline" icon="download" label="Exportar informe" @click="exportarInforme" />
        <TaButton variant="primary" icon="campaign" label="Emitir alertas" @click="emitirAlertas" />
      </template>
    </TaPageHeader>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="kpi in kpis" :key="kpi.label" class="col-6 col-lg-3">
        <TaKpiCard class="card-item" :icon="kpi.icon" :icon-color="kpi.color" :label="kpi.label" :value="kpi.value" :trend="kpi.trend" />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <TaCard title="Mapa de riesgo por curso" subtitle="Rendimiento, cobertura de contenidos y calificacion pendiente" :padding="false" class="card-item q-mb-lg">
          <q-table :rows="cursosFiltrados" :columns="columns" row-key="id" flat bordered :pagination="{ rowsPerPage: 6 }">
            <template #top-right>
              <q-input v-model="busqueda" dense outlined placeholder="Buscar curso o docente...">
                <template #prepend><q-icon name="search" /></template>
              </q-input>
            </template>
            <template #body-cell-riesgo="props">
              <q-td :props="props">
                <q-badge :color="colorRiesgo(props.row.riesgo)" text-color="white">{{ labelRiesgo(props.row.riesgo) }}</q-badge>
              </q-td>
            </template>
            <template #body-cell-cobertura="props">
              <q-td :props="props">
                <q-linear-progress :value="ratio(props.row.cobertura, props.row.coberturaTotal)" rounded size="8px" color="teal" style="width: 110px" />
                <span class="text-caption q-ml-sm">{{ props.row.coberturaLabel }}</span>
              </q-td>
            </template>
            <template #body-cell-acciones="props">
              <q-td :props="props">
                <q-btn flat round dense icon="visibility" color="primary" @click="abrirDetalle(props.row)" />
                <q-btn flat round dense icon="mail" color="teal" @click="contactarDocente(props.row)" />
              </q-td>
            </template>
          </q-table>
        </TaCard>

        <TaCard title="Seguimiento a docentes" subtitle="Cumplimiento de contenido, respuesta y evaluacion" :padding="false" class="card-item">
          <q-list separator>
            <q-item v-for="docente in observatorio.docentes" :key="docente.id" class="av-list-item q-py-md">
              <q-item-section avatar><q-avatar size="46px"><img :src="docente.avatar" /></q-avatar></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ docente.nombre }}</q-item-label>
                <q-item-label caption>{{ docente.cursos }} cursos · {{ docente.pendientesDocente }} entregas por revisar</q-item-label>
                <q-linear-progress class="q-mt-sm" :value="ratio(docente.cumplimiento, docente.cumplimientoTotal)" rounded color="primary" size="7px" />
              </q-item-section>
              <q-item-section side>
                <div class="text-weight-bold text-primary">{{ docente.cumplimiento }}/{{ docente.cumplimientoTotal }}</div>
                <div class="text-caption text-grey">Cobertura</div>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>
      </div>

      <div class="col-12 col-xl-4">
        <DashboardChartCard title="Riesgo academico" subtitle="Cursos por nivel de atencion" icon="donut_large" height="280px" class="q-mb-lg card-item">
          <DoughnutChart :data="riesgoChart" :options="doughnutOptions" />
        </DashboardChartCard>
        <DashboardChartCard title="Cobertura de contenidos" subtitle="Actividades creadas por curso" icon="bar_chart" height="280px" class="card-item">
          <BarChart :data="coberturaChart" :options="barOptions" />
        </DashboardChartCard>
      </div>
    </div>

    <q-dialog v-model="dialogDetalle">
      <q-card class="director-dialog">
        <q-card-section>
          <div class="text-h6">{{ cursoSeleccionado?.nombre }}</div>
          <div class="text-caption text-grey">{{ cursoSeleccionado?.codigo }} · {{ cursoSeleccionado?.docente }}</div>
        </q-card-section>
        <q-card-section>
          <div class="detail-grid">
            <div><span>Rendimiento</span><strong>{{ cursoSeleccionado?.promedio }} pts</strong></div>
            <div><span>Cobertura</span><strong>{{ cursoSeleccionado?.coberturaLabel }}</strong></div>
            <div><span>Por calificar</span><strong>{{ cursoSeleccionado?.pendientesDocente }}</strong></div>
            <div><span>Ultima actividad</span><strong>{{ cursoSeleccionado?.ultimaActividadDias }}d</strong></div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cerrar" v-close-popup />
          <TaButton variant="primary" icon="assessment" label="Ver reportes" to="/director/reportes" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useSuiteRolesStore } from 'src/stores/suiteRoles'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'
import DashboardChartCard from 'src/components/dashboard/DashboardChartCard.vue'
import { useStaggerCards } from 'src/composables/useAnimations'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const $q = useQuasar()
const suite = useSuiteRolesStore()
const busqueda = ref('')
const dialogDetalle = ref(false)
const cursoSeleccionado = ref(null)
const observatorio = computed(() => suite.observatorioDirector())

const columns = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Curso', field: 'nombre', align: 'left', sortable: true },
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left' },
  { name: 'promedio', label: 'Prom.', field: 'promedio', align: 'center', sortable: true },
  { name: 'cobertura', label: 'Cobertura', field: 'cobertura', align: 'left', sortable: true },
  { name: 'riesgo', label: 'Riesgo', field: 'riesgo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const cursosFiltrados = computed(() => {
  const term = busqueda.value.trim().toLowerCase()
  return observatorio.value.cursos.filter((curso) => !term || [curso.nombre, curso.codigo, curso.docente].some((value) => value.toLowerCase().includes(term)))
})
const kpis = computed(() => [
  { label: 'Cursos observados', value: observatorio.value.cursos.length, icon: 'school', color: '#6B3FA0', trend: 0 },
  { label: 'Riesgo alto', value: observatorio.value.cursos.filter((c) => c.riesgo === 'alto').length, icon: 'warning', color: '#ef4444', trend: -2 },
  { label: 'Docentes', value: observatorio.value.docentes.length, icon: 'groups', color: '#0D9488', trend: 1 },
  { label: 'Pendientes docente', value: observatorio.value.cursos.reduce((sum, curso) => sum + curso.pendientesDocente, 0), icon: 'rate_review', color: '#F59E0B', trend: -5 },
])

const chartText = computed(() => ($q.dark.isActive ? '#e2e8f0' : '#475569'))
const barOptions = computed(() => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: chartText.value }, grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0, color: chartText.value } } } }))
const doughnutOptions = computed(() => ({ responsive: true, maintainAspectRatio: false, cutout: '66%', plugins: { legend: { position: 'bottom', labels: { color: chartText.value, usePointStyle: true, boxWidth: 8 } } } }))
const riesgoChart = computed(() => {
  const counts = { alto: 0, medio: 0, estable: 0 }
  observatorio.value.cursos.forEach((curso) => { counts[curso.riesgo]++ })
  return { labels: ['Alto', 'Medio', 'Estable'], datasets: [{ data: [counts.alto, counts.medio, counts.estable], backgroundColor: ['#ef4444', '#F59E0B', '#0D9488'], borderWidth: 0 }] }
})
const coberturaChart = computed(() => ({ labels: observatorio.value.cursos.map((curso) => curso.codigo), datasets: [{ data: observatorio.value.cursos.map((curso) => curso.cobertura), backgroundColor: '#6B3FA0', borderRadius: 8 }] }))

function ratio(actual, total) { return total > 0 ? actual / total : 0 }
function colorRiesgo(riesgo) { return { alto: 'negative', medio: 'orange', estable: 'teal' }[riesgo] || 'grey' }
function labelRiesgo(riesgo) { return { alto: 'Alto', medio: 'Medio', estable: 'Estable' }[riesgo] || riesgo }
function abrirDetalle(curso) { cursoSeleccionado.value = curso; dialogDetalle.value = true }
function contactarDocente(curso) { suite.registrarAccion('director', `Contacto enviado a ${curso.docente}`); $q.notify({ message: `Mensaje enviado a ${curso.docente}`, color: 'positive', icon: 'mail' }) }
function exportarInforme() { $q.notify({ message: 'Informe academico exportado (mock)', color: 'positive', icon: 'download' }) }
function emitirAlertas() { $q.notify({ message: 'Alertas institucionales emitidas a docentes con riesgo', color: 'info', icon: 'campaign' }) }

useStaggerCards('.card-item')
</script>

<style scoped>
.director-dialog { width: min(620px, 92vw); border-radius: 20px; }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.detail-grid div { border: 1px solid var(--ta-border-card); border-radius: 12px; padding: 14px; display: grid; gap: 4px; }
.detail-grid span { color: var(--ta-text-secondary); font-size: 0.78rem; }
.detail-grid strong { font-size: 1.4rem; color: var(--ta-primary); }
@media (max-width: 600px) { .detail-grid { grid-template-columns: 1fr; } }
</style>
