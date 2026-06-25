<template>
  <AppSkeleton v-if="cargando" variant="dashboard" />

  <DashboardShell
    v-else
    title="Operacion del sistema"
    subtitle="Controla sincronizaciones, usuarios cacheados, estado de cursos y salud de integraciones externas."
    eyebrow="Administracion"
    icon="admin_panel_settings"
    :meta="fechaHoy"
  >
    <template #actions>
      <q-btn unelevated no-caps color="primary" text-color="white" icon="sync" label="Forzar sync" class="shadow-2" @click="notifySync" />
      <q-btn outline no-caps color="primary" icon="settings" label="Configuracion" to="/admin/configuracion" />
    </template>

    <template #aside>
      <div class="av-hero-panel">
        <div class="text-caption text-weight-bold uppercase">Salud API</div>
        <div class="text-h3 text-weight-bold q-mt-xs">{{ sincOk }}/{{ sincOk + sincError }}</div>
        <div class="text-caption" style="opacity: 0.82">Conexiones operativas</div>
        <q-linear-progress class="q-mt-md" :value="sincOk / (sincOk + sincError)" color="secondary" track-color="rgba(255,255,255,0.2)" rounded size="10px" />
      </div>
    </template>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-lg-3">
        <TaKpiCard icon="library_books" icon-color="var(--gradient-unitepc)" label="Cursos" :value="totalCursos" class="card-item" />
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <TaKpiCard 
          icon="people" 
          icon-color="var(--gradient-unitepc-reverse)" 
          label="Usuarios" 
          :value="totalUsuarios" 
          class="card-item cursor-pointer" 
          @click="router.push('/admin/usuarios')"
        />
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
          <AppEmptyState
            v-if="!accionesCursos.length"
            icon="folder_off"
            title="Sin acciones disponibles"
            message="No hay acciones de gestion configuradas."
          />
          <q-list v-else separator>
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
          <AppEmptyState
            v-if="!usuarios.length"
            icon="person_off"
            title="Sin usuarios cacheados"
            message="No hay cuentas sincronizadas para mostrar."
          />
          <q-list v-else separator>
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
          <AppEmptyState
            v-if="!apis.length"
            icon="cloud_off"
            title="Sin conexiones configuradas"
            message="No hay integraciones externas registradas."
          />
          <q-list v-else separator>
            <q-item v-for="api in apis" :key="api.name" class="av-list-item q-py-md">
              <q-item-section avatar>
                <q-avatar :color="api.online ? 'positive' : 'negative'" text-color="white" size="42px">
                  <q-icon :name="api.online ? 'check_circle' : 'error'" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ api.name }}</q-item-label>
                <q-item-label caption>{{ api.url }} - {{ api.status }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="api.online ? 'positive' : 'negative'" text-color="white">{{ api.online ? 'Online' : 'Offline' }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>

        <TaCard title="Logs de sincronizacion" subtitle="Ultimos eventos de integracion" :padding="false" class="card-item">
          <AppEmptyState
            v-if="!logs.length"
            icon="history"
            title="Sin logs de sincronizacion"
            message="No hay eventos de integracion recientes."
          />
          <q-list v-else separator>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCursosStore } from 'src/stores/cursos'
import { integracionService } from 'src/services/integracionService.js'
import { adminUsuarioService } from 'src/services/adminUsuarioService.js'
import { Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import DashboardShell from 'src/components/dashboard/DashboardShell.vue'
import DashboardChartCard from 'src/components/dashboard/DashboardChartCard.vue'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'
import { useStaggerCards } from 'src/composables/useAnimations'
import { useLoadingState } from 'src/composables/useLoadingState'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)
useStaggerCards('.card-item')

const $q = useQuasar()
const router = useRouter()
const cursosStore = useCursosStore()
const fechaHoy = new Date().toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })
const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 700 })

const totalCursos = computed(() => (cursosStore.cursos || []).length)
const totalUsuarios = ref(0)
const usuarios = ref([])
const logs = ref([
  { id: 1, mensaje: 'Sincronización manual de asignaturas SISA', fecha: 'Hoy, 10:30 AM', color: 'positive', icon: 'sync' },
  { id: 2, mensaje: 'Conexión verificada con la API de Estudiantes', fecha: 'Ayer, 04:15 PM', color: 'info', icon: 'check_circle' },
  { id: 3, mensaje: 'Sincronización de notas a SISA completada', fecha: 'Ayer, 09:00 AM', color: 'positive', icon: 'done_all' }
])
const datosIntegraciones = ref({ integraciones: [], politica_aprobacion: { minimo: 60 }, sisa_stub: true })

const chartDataUsuarios = computed(() => {
  const roles = { estudiante: 0, docente: 0, director: 0, admin: 0 }
  usuarios.value.forEach((u) => {
    if (roles[u.rol] !== undefined) {
      roles[u.rol]++
    }
  })
  return {
    labels: ['Estudiantes', 'Docentes', 'Directores', 'Admins'],
    datasets: [{
      data: [roles.estudiante, roles.docente, roles.director, roles.admin],
      backgroundColor: ['#0D9488', '#6B3FA0', '#f59e0b', '#ef4444'],
    }],
  }
})

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

const chartDataCursos = computed(() => {
  const estados = { publicado: 0, borrador: 0, archivado: 0 }
  const lista = cursosStore.cursos || []
  lista.forEach((c) => {
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

const apis = computed(() =>
  (datosIntegraciones.value.integraciones || []).map((i) => ({
    name: `API ${i.nombre}`,
    url: i.id === 'sisa' ? 'https://sisa.unitepc.edu/api' : i.id === 'estudiantes' ? 'https://estudiantes.unitepc.edu/api' : 'https://notas.unitepc.edu/api',
    status: i.estado === 'online' ? 'Conectado' : 'Desconectado',
    online: i.estado === 'online',
    ultimoSync: i.ultimo_sync,
    ultimoMensaje: i.ultimo_mensaje,
    stub: i.stub,
  }))
)

const sincOk = computed(() => apis.value.filter((a) => a.online).length)
const sincError = computed(() => apis.value.filter((a) => !a.online).length)

const accionesCursos = computed(() => [
  { label: 'Todos los cursos', caption: `${totalCursos.value} registros`, icon: 'list', color: 'primary' },
  { label: 'Archivar cursos', caption: 'Gestionar cursos inactivos o cerrados', icon: 'archive', color: 'grey' },
  { label: 'Duplicar curso', caption: 'Preparar estructura para nueva gestion', icon: 'content_copy', color: 'teal' },
])

async function notifySync() {
  $q.loading.show({ message: 'Sincronizando integraciones...' })
  try {
    await integracionService.estado()
    $q.notify({ message: 'Estado de integraciones actualizado', color: 'positive', icon: 'sync', timeout: 2200 })
  } catch {
    $q.notify({ message: 'Error al sincronizar', color: 'negative', timeout: 3000 })
  } finally {
    $q.loading.hide()
  }
}

function labelRol(r) {
  const m = { docente: 'Docente', estudiante: 'Estudiante', director: 'Director', admin: 'Admin' }
  return m[r] ?? r
}

function colorRol(r) {
  const m = { docente: 'purple', estudiante: 'teal', director: 'orange', admin: 'negative' }
  return m[r] ?? 'grey'
}

onMounted(async () => {
  try {
    const res = await integracionService.estado()
    datosIntegraciones.value = res.data || datosIntegraciones.value
  } catch {
    // ignorar
  }
  try {
    const userRes = await adminUsuarioService.listar({ per_page: 9999 })
    usuarios.value = userRes.data?.data || userRes.data || []
    totalUsuarios.value = usuarios.value.length
  } catch (err) {
    console.error(err)
  }
  finalizarCarga()
})
</script>
