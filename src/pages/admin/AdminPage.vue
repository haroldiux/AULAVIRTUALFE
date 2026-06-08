<template>
  <DashboardShell
    title="Operacion del sistema"
    subtitle="Controla sincronizaciones, usuarios cacheados, estado de cursos y salud de integraciones externas."
    eyebrow="Administracion"
    icon="admin_panel_settings"
    :meta="fechaHoy"
  >
    <template #actions>
      <q-btn unelevated no-caps color="primary" text-color="white" icon="sync" label="Forzar sync" @click="notifySync" />
      <q-btn outline no-caps color="primary" icon="settings" label="Configuracion" to="/admin/configuracion" />
    </template>

    <template #aside>
      <div class="av-hero-panel">
        <div class="text-caption text-weight-bold uppercase">Salud API</div>
        <div class="text-h3 text-weight-bold q-mt-xs">{{ sincOk }}/{{ sincOk + sincError }}</div>
        <div class="text-caption" style="opacity: 0.82">Conexiones operativas</div>
        <q-linear-progress class="q-mt-md" :value="sincOk / (sincOk + sincError)" color="secondary" track-color="white" rounded size="10px" />
      </div>
    </template>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-lg-3">
        <TaKpiCard icon="library_books" icon-color="var(--gradient-unitepc)" label="Cursos" :value="totalCursos" class="card-item" />
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <TaKpiCard icon="people" icon-color="var(--gradient-unitepc-reverse)" label="Usuarios" :value="totalUsuarios" class="card-item" />
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <TaKpiCard icon="sync" icon-color="linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%)" label="Sync OK" :value="sincOk" class="card-item" />
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <TaKpiCard icon="error" icon-color="linear-gradient(135deg, #0D9488 0%, #6B3FA0 100%)" label="Sync Error" :value="sincError" class="card-item" />
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-lg-5">
        <DashboardChartCard title="Usuarios por rol" subtitle="Distribucion de perfiles cacheados" icon="groups" height="300px">
          <DoughnutChart :data="chartDataUsuarios" :options="chartOptionsDoughnut" />
        </DashboardChartCard>
      </div>
      <div class="col-12 col-lg-7">
        <DashboardChartCard title="Estado de cursos" subtitle="Publicados, borradores y archivados" icon="bar_chart" height="300px">
          <BarChart :data="chartDataCursos" :options="chartOptionsBar" />
        </DashboardChartCard>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-xl-6">
        <TaCard title="Gestion de cursos" subtitle="Acciones administrativas frecuentes" :padding="false" class="card-item q-mb-lg" data-tour="admin-course-management">
          <q-list separator>
            <q-item v-for="accion in accionesCursos" :key="accion.label" clickable v-ripple class="av-list-item q-py-md">
              <q-item-section avatar><q-icon :name="accion.icon" :color="accion.color" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ accion.label }}</q-item-label>
                <q-item-label caption>{{ accion.caption }}</q-item-label>
              </q-item-section>
              <q-item-section side><q-icon name="chevron_right" color="grey-5" /></q-item-section>
            </q-item>
          </q-list>
        </TaCard>

        <TaCard title="Usuarios cacheados" subtitle="Muestra de cuentas sincronizadas" :padding="false" class="card-item">
          <q-list separator>
            <q-item v-for="user in usuarios.slice(0, 6)" :key="user.id" class="av-list-item q-py-md">
              <q-item-section avatar>
                <q-avatar size="38px"><img :src="user.avatar" /></q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ user.nombre }}</q-item-label>
                <q-item-label caption>{{ user.email }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="colorRol(user.rol)" text-color="white">{{ labelRol(user.rol) }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>
      </div>

      <div class="col-12 col-xl-6">
        <TaCard title="Conexiones API externas" subtitle="Estado de integraciones previstas" :padding="false" class="card-item q-mb-lg" data-tour="admin-integrations">
          <q-list separator>
            <q-item v-for="api in apis" :key="api.name" class="av-list-item q-py-md">
              <q-item-section avatar>
                <q-avatar :color="api.online ? 'green' : 'red'" text-color="white" size="42px">
                  <q-icon :name="api.online ? 'check_circle' : 'error'" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ api.name }}</q-item-label>
                <q-item-label caption>{{ api.url }} - {{ api.status }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="api.online ? 'green' : 'red'" text-color="white">{{ api.online ? 'Online' : 'Offline' }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>

        <TaCard title="Logs de sincronizacion" subtitle="Ultimos eventos de integracion" :padding="false" class="card-item">
          <q-list separator>
            <q-item v-for="log in logs" :key="log.id" class="av-list-item q-py-md">
              <q-item-section avatar>
                <q-avatar :color="log.color" text-color="white" size="38px">
                  <q-icon :name="log.icon" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ log.mensaje }}</q-item-label>
                <q-item-label caption>{{ log.fecha }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>
      </div>
    </div>
  </DashboardShell>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useCursosStore } from 'src/stores/cursos'
import { usuarios as mockUsuarios } from 'src/mock/index.js'
import { Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import DashboardShell from 'src/components/dashboard/DashboardShell.vue'
import DashboardChartCard from 'src/components/dashboard/DashboardChartCard.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'
import { useStaggerCards } from 'src/composables/useAnimations'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)
useStaggerCards('.card-item')

const $q = useQuasar()
const cursosStore = useCursosStore()
const fechaHoy = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })

const totalCursos = computed(() => cursosStore.cursos.length)
const totalUsuarios = mockUsuarios.length
const sincOk = 5
const sincError = 1
const usuarios = mockUsuarios

const chartTextColor = computed(() => ($q.dark.isActive ? '#e2e8f0' : '#475569'))
const chartGridColor = computed(() => ($q.dark.isActive ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'))

const chartOptionsBar = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: chartTextColor.value }, grid: { display: false } },
    y: { beginAtZero: true, ticks: { color: chartTextColor.value }, grid: { color: chartGridColor.value } },
  },
}))

const chartOptionsDoughnut = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '66%',
  plugins: { legend: { position: 'bottom', labels: { color: chartTextColor.value, usePointStyle: true, boxWidth: 8 } } },
}))

const chartDataUsuarios = computed(() => {
  const conteo = {}
  usuarios.forEach((u) => { conteo[u.rol] = (conteo[u.rol] || 0) + 1 })
  return {
    labels: Object.keys(conteo).map((r) => labelRol(r)),
    datasets: [{
      data: Object.values(conteo),
      backgroundColor: ['#6B3FA0', '#0D9488', '#A78BFA', '#14B8A6'],
      borderWidth: 0,
    }],
  }
})

const chartDataCursos = computed(() => {
  const estados = { publicado: 0, borrador: 0, archivado: 0 }
  cursosStore.cursos.forEach((c) => {
    if (c.estado === 'publicado') estados.publicado++
    else if (c.estado === 'borrador') estados.borrador++
    else estados.archivado++
  })
  return {
    labels: ['Publicados', 'Borradores', 'Archivados'],
    datasets: [{
      label: 'Cursos',
      data: [estados.publicado, estados.borrador, estados.archivado],
      backgroundColor: ['#0D9488', '#6B3FA0', '#D1D5DB'],
      borderRadius: 12,
      maxBarThickness: 54,
    }],
  }
})

const accionesCursos = [
  { label: 'Todos los cursos', caption: `${totalCursos.value} registros cacheados`, icon: 'list', color: 'primary' },
  { label: 'Archivar cursos', caption: 'Gestionar cursos inactivos o cerrados', icon: 'archive', color: 'grey' },
  { label: 'Duplicar curso', caption: 'Preparar estructura para nueva gestion', icon: 'content_copy', color: 'teal' },
]

const apis = [
  { name: 'API SISA', url: 'https://sisa.unitech.edu/api', status: 'Conectado', online: true },
  { name: 'API Estudiantes', url: 'https://estudiantes.unitech.edu/api', status: 'Timeout', online: false },
  { name: 'API Notas Centralizadas', url: 'https://notas.unitech.edu/api', status: 'Conectado', online: true },
]

const logs = [
  { id: 1, icon: 'check_circle', color: 'green', mensaje: 'SISA Sync - Exitoso: 3 cursos actualizados', fecha: '2026-06-02 08:00' },
  { id: 2, icon: 'error', color: 'red', mensaje: 'Student Sync - Fallido: Timeout de conexion', fecha: '2026-06-02 08:00' },
  { id: 3, icon: 'check_circle', color: 'green', mensaje: 'Grade Sync - Exitoso: 42 notas enviadas', fecha: '2026-06-01 18:00' },
  { id: 4, icon: 'sync', color: 'orange', mensaje: 'Grade Sync - Parcial: 3 notas pendientes', fecha: '2026-06-01 17:55' },
]

function colorRol(r) {
  const m = { docente: 'primary', estudiante: 'secondary', director: 'primary', admin: 'secondary' }
  return m[r] ?? 'grey'
}

function labelRol(r) {
  const m = { docente: 'Docente', estudiante: 'Estudiante', director: 'Director', admin: 'Admin' }
  return m[r] ?? r
}

function notifySync() {
  $q.notify({ message: 'Mock: sincronizacion administrativa iniciada', color: 'info', icon: 'sync', timeout: 2200 })
}
</script>
