<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Centro de Pendientes">
      <template #actions>
        <TaButton variant="outline" icon="task_alt" label="Plan semanal" @click="crearPlan" />
        <TaButton variant="primary" icon="event_note" label="Mi semana" @click="filtro = 'semana'" />
      </template>
    </TaPageHeader>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="kpi in kpis" :key="kpi.label" class="col-6 col-lg-3">
        <TaKpiCard class="card-item" :icon="kpi.icon" :icon-color="kpi.color" :label="kpi.label" :value="kpi.value" :trend="kpi.trend" />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-xl-8">
        <TaCard title="Pendientes inteligentes" subtitle="Ordenados por urgencia, curso y estado" :padding="false" class="card-item q-mb-lg">
          <div class="student-toolbar">
            <q-input v-model="busqueda" dense outlined placeholder="Buscar actividad o curso..." class="student-search">
              <template #prepend><q-icon name="search" /></template>
            </q-input>
            <q-btn-toggle
              v-model="filtro"
              unelevated
              no-caps
              rounded
              color="primary"
              toggle-color="primary"
              text-color="primary"
              :options="filtrosPendientes"
            />
          </div>
          <q-list separator>
            <q-item v-for="item in pendientesFiltrados" :key="item.id" class="av-list-item q-py-md" clickable v-ripple @click="abrirActividad(item)">
              <q-item-section avatar>
                <q-avatar :color="colorTipo(item.tipo)" text-color="white" size="44px">
                  <q-icon :name="iconoTipo(item.tipo)" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ item.titulo }}</q-item-label>
                <q-item-label caption>{{ item.codigo }} · {{ item.curso }}</q-item-label>
                <div class="q-mt-sm">
                  <q-chip dense :color="colorUrgencia(item)" text-color="white">{{ labelUrgencia(item) }}</q-chip>
                  <q-chip dense color="grey-2" text-color="grey-8">{{ labelTipo(item.tipo) }}</q-chip>
                </div>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  :icon="item.accion_icon"
                  :color="colorTipo(item.tipo)"
                  @click.stop="ejecutarAccion(item)"
                >
                  <q-tooltip>{{ item.accion_tooltip }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
            <DashboardEmptyState v-if="!pendientesFiltrados.length" icon="task_alt" title="Sin pendientes en esta vista" message="Cambia el filtro o continua con tus cursos activos." />
          </q-list>
        </TaCard>

        <TaCard title="Historial de entregas" subtitle="Seguimiento de trabajos enviados y calificados" :padding="false" class="card-item">
          <q-list separator>
            <q-item v-for="entrega in centro.entregas.slice(0, 8)" :key="entrega.id" class="av-list-item q-py-md">
              <q-item-section avatar><q-icon :name="iconoTipo(entrega.tipo)" :color="colorTipo(entrega.tipo)" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ entrega.titulo }}</q-item-label>
                <q-item-label caption>{{ entrega.codigo }} · {{ labelEstado(entrega.estado) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="entrega.nota !== null ? 'green' : 'blue'" text-color="white">
                  {{ entrega.nota !== null ? `${entrega.nota}/${entrega.notaMaxima || 'pts'}` : 'En revision' }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>
      </div>

      <div class="col-12 col-xl-4">
        <TaCard title="Metas de aprendizaje" subtitle="Progreso personal de la semana" class="card-item q-mb-lg">
          <div v-for="meta in centro.metas" :key="meta.id" class="goal-row">
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-body2 text-weight-bold">{{ meta.nombre }}</span>
              <span class="text-caption text-primary">{{ meta.actual }}/{{ meta.total }}</span>
            </div>
            <q-linear-progress :value="ratio(meta.actual, meta.total)" rounded color="teal" size="8px" />
          </div>
        </TaCard>

        <TaCard title="Cursos en foco" subtitle="Actividades realizadas, pendientes y docente" :padding="false" class="card-item q-mb-lg">
          <q-list separator>
            <q-item v-for="curso in centro.cursos" :key="curso.id" clickable v-ripple class="av-list-item q-py-md" @click="router.push(`/estudiante/curso/${curso.id}`)">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">{{ curso.codigo.slice(0, 2) }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ curso.nombre }}</q-item-label>
                <q-item-label caption>{{ curso.docente }}</q-item-label>
                <div class="course-counter q-mt-sm">
                  <span>{{ curso.contadores.labelRealizadas }} realizadas</span>
                  <span>{{ curso.contadores.labelPendientes }} pendientes</span>
                </div>
                <q-linear-progress class="q-mt-sm" :value="ratio(curso.contadores.realizadas, curso.contadores.total)" color="primary" rounded size="7px" />
              </q-item-section>
              <q-item-section side>
                <div class="text-weight-bold text-primary">{{ curso.contadores.labelRealizadas }}</div>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>

        <TaCard title="Mi semana" subtitle="Lo mas urgente por resolver" :padding="false" class="card-item">
          <q-list separator>
            <q-item v-for="item in semanaPrioritaria" :key="`week-${item.id}`" clickable v-ripple class="av-list-item q-py-md" @click="abrirActividad(item)">
              <q-item-section avatar><q-icon :name="item.accion_icon" :color="colorTipo(item.tipo)" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ item.titulo }}</q-item-label>
                <q-item-label caption>{{ item.codigo }} · {{ item.accion_label }}</q-item-label>
              </q-item-section>
              <q-item-section side><q-badge :color="colorUrgencia(item)">{{ labelUrgencia(item) }}</q-badge></q-item-section>
            </q-item>
            <DashboardEmptyState v-if="!semanaPrioritaria.length" icon="event_available" title="Semana ordenada" message="No hay pendientes cercanos." />
          </q-list>
        </TaCard>
      </div>
    </div>

    <q-dialog v-model="dialogEntrega">
      <q-card class="student-dialog">
        <q-card-section>
          <div class="text-h6">Entrega de tarea</div>
          <div class="text-caption text-grey">{{ entregaSeleccionada?.titulo || 'Selecciona una actividad pendiente' }}</div>
        </q-card-section>
        <q-card-section>
          <q-select v-model="actividadDestino" :options="opcionesTareasPendientes" label="Tarea" outlined emit-value map-options class="q-mb-md" />
          <q-input v-model="textoEntrega" label="Comentario de entrega" type="textarea" rows="4" outlined />
          <q-file v-model="archivoEntrega" label="Adjuntar archivo" outlined class="q-mt-md" use-chips />
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
          <TaButton variant="primary" icon="send" label="Enviar entrega" :disable="!actividadDestino" @click="enviarEntrega" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useSuiteRolesStore } from 'src/stores/suiteRoles'
import { useActividadesStore } from 'src/stores/actividades'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'
import DashboardEmptyState from 'src/components/dashboard/DashboardEmptyState.vue'
import { useStaggerCards } from 'src/composables/useAnimations'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const suite = useSuiteRolesStore()
const actividadesStore = useActividadesStore()

const busqueda = ref('')
const filtro = ref('todos')
const dialogEntrega = ref(false)
const entregaSeleccionada = ref(null)
const actividadDestino = ref(null)
const textoEntrega = ref('')
const archivoEntrega = ref(null)

const centro = computed(() => suite.centroEstudiante(auth.usuario?.id))
const filtrosPendientes = [
  { label: 'Todos', value: 'todos' },
  { label: 'Tareas', value: 'tareas' },
  { label: 'Sistema', value: 'sistema' },
  { label: 'Vencidos', value: 'vencidos' },
  { label: 'Esta semana', value: 'semana' },
]

const pendientesFiltrados = computed(() => {
  const term = busqueda.value.trim().toLowerCase()
  return centro.value.pendientes.filter((item) => {
    const dias = diasRestantes(item.fecha)
    const matchTerm = !term || [item.titulo, item.curso, item.codigo].some((value) => value.toLowerCase().includes(term))
    const matchFiltro = filtro.value === 'todos' ||
      (filtro.value === 'tareas' && item.requiere_entrega) ||
      (filtro.value === 'sistema' && !item.requiere_entrega) ||
      (filtro.value === 'vencidos' && dias < 0) ||
      (filtro.value === 'semana' && dias >= 0 && dias <= 7)
    return matchTerm && matchFiltro
  })
})

const tareasPendientes = computed(() => centro.value.pendientes.filter((item) => item.requiere_entrega))
const opcionesTareasPendientes = computed(() => tareasPendientes.value.map((item) => ({ label: `${item.codigo} · ${item.titulo}`, value: item.actividadId })))
const semanaPrioritaria = computed(() => centro.value.pendientes.filter((item) => {
  const dias = diasRestantes(item.fecha)
  return dias >= 0 && dias <= 7
}).slice(0, 5))
const kpis = computed(() => [
  { label: 'Realizadas', value: centro.value.resumen.labelRealizadas, icon: 'task_alt', color: '#0D9488', trend: 0 },
  { label: 'Pendientes', value: centro.value.resumen.labelPendientes, icon: 'assignment_late', color: '#F59E0B', trend: -4 },
  { label: 'Tareas para entregar', value: `${tareasPendientes.value.length}/${centro.value.pendientes.length}`, icon: 'upload_file', color: '#6B3FA0', trend: 0 },
  { label: 'Cursos activos', value: centro.value.cursos.length, icon: 'school', color: '#6B3FA0', trend: 0 },
])

function diasRestantes(fecha) {
  if (!fecha) return 999
  return Math.ceil((new Date(fecha) - new Date()) / 86400000)
}
function colorUrgencia(item) { const dias = diasRestantes(item.fecha); if (dias < 0) return 'negative'; if (dias <= 3) return 'orange'; return 'teal' }
function labelUrgencia(item) { const dias = diasRestantes(item.fecha); if (!item.fecha) return 'Sin fecha'; if (dias < 0) return `Vencido hace ${Math.abs(dias)}d`; if (dias === 0) return 'Vence hoy'; return `En ${dias}d` }
function iconoTipo(tipo) { return { tarea: 'assignment', foro: 'forum', cuestionario: 'quiz', encuesta: 'poll', h5p: 'extension', leccion: 'article' }[tipo] || 'task' }
function colorTipo(tipo) { return { tarea: 'orange', foro: 'teal', cuestionario: 'purple', encuesta: 'green', h5p: 'pink', leccion: 'indigo' }[tipo] || 'grey' }
function labelTipo(tipo) { return { tarea: 'Tarea', foro: 'Foro', cuestionario: 'Quiz', encuesta: 'Encuesta', h5p: 'H5P', leccion: 'Leccion' }[tipo] || tipo }
function labelEstado(estado) { return { pendiente: 'Pendiente', vencida: 'Vencida', entregada: 'Entregada', entregado: 'Entregada', calificada: 'Calificada', calificado: 'Calificada', realizada: 'Realizada' }[estado] || estado }
function ratio(actual, total) { return total > 0 ? actual / total : 0 }
function abrirActividad(item) { router.push(`/estudiante/curso/${item.cursoId}?actividad=${item.actividadId}`) }
function prepararEntrega(item) { entregaSeleccionada.value = item; actividadDestino.value = item.actividadId; dialogEntrega.value = true }
function ejecutarAccion(item) {
  if (item.requiere_entrega) prepararEntrega(item)
  else abrirActividad(item)
}
function crearPlan() { $q.notify({ message: 'Plan semanal generado con tus pendientes prioritarios (mock)', color: 'positive', icon: 'task_alt' }) }
function enviarEntrega() {
  actividadesStore.crearEntrega(auth.usuario.id, actividadDestino.value, JSON.stringify({ texto: textoEntrega.value, archivo: archivoEntrega.value?.name || null }))
  suite.registrarAccion('estudiante', `Entrega enviada para actividad ${actividadDestino.value}`)
  dialogEntrega.value = false
  textoEntrega.value = ''
  archivoEntrega.value = null
  $q.notify({ message: 'Entrega enviada correctamente', color: 'positive', icon: 'send' })
}

useStaggerCards('.card-item')
</script>

<style scoped>
.student-toolbar { display: flex; gap: 12px; align-items: center; padding: 16px; border-bottom: 1px solid var(--ta-border-card); }
.student-search { flex: 1; min-width: 220px; }
.goal-row + .goal-row { margin-top: 18px; }
.student-dialog { width: min(620px, 92vw); border-radius: 20px; }
.course-counter { display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.75rem; color: var(--ta-text-secondary); }
@media (max-width: 720px) { .student-toolbar { flex-direction: column; align-items: stretch; } }
</style>
