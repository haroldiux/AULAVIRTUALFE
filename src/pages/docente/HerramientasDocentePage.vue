<template>
  <q-page class="av-dashboard-page">
    <AppSkeleton v-if="cargando" variant="dashboard" />

    <template v-else>
      <TaPageHeader title="Centro Inteligente Docente" data-tour="teacher-tools-header">
        <template #actions>
          <TaButton variant="secondary" icon="refresh" label="Actualizar analisis" @click="actualizarAnalisis" />
          <TaButton variant="primary" icon="campaign" label="Notificar alertas" @click="notificarAlertas" />
        </template>
      </TaPageHeader>

      <div class="row q-col-gutter-md q-mb-lg" data-tour="teacher-tools-kpis">
      <div v-for="kpi in kpis" :key="kpi.label" class="col-6 col-lg-3">
        <TaKpiCard
          class="card-item"
          :icon="kpi.icon"
          :icon-color="kpi.color"
          :label="kpi.label"
          :value="kpi.value"
          :trend="kpi.trend"
        />
      </div>
    </div>

    <TaCard :padding="false" class="tools-shell">
      <q-tabs
        v-model="tab"
        align="left"
        active-color="primary"
        indicator-color="primary"
        class="tools-tabs"
        outside-arrows
        mobile-arrows
        no-caps
        data-tour="teacher-tools-tabs"
      >
        <q-tab name="alertas" icon="warning_amber" label="Alertas" />
        <q-tab name="estudio" icon="add_task" label="Crear actividad" />
        <q-tab name="asistente" icon="auto_fix_high" label="Asistente" />
        <q-tab name="agenda" icon="event_note" label="Agenda" />
        <q-tab name="automatizaciones" icon="auto_mode" label="Automatizaciones" />
        <q-tab name="banco" icon="inventory_2" label="Banco Docente" />
        <q-tab name="analitica" icon="monitoring" label="Analitica" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated class="tools-panels" data-tour="teacher-tools-content">
        <q-tab-panel name="alertas" class="q-pa-md q-pa-lg-md">
          <div class="section-toolbar">
            <div>
              <div class="text-h6 text-weight-bold">Seguimiento prioritario</div>
              <div class="text-caption text-grey">Senales combinadas de rendimiento, actividad y participacion.</div>
            </div>
            <div class="row q-gutter-sm">
              <q-select v-model="filtroCurso" :options="opcionesCurso" label="Curso" outlined dense emit-value map-options clearable style="min-width: 210px" />
              <q-select v-model="filtroSeveridad" :options="opcionesSeveridad" label="Prioridad" outlined dense emit-value map-options clearable style="min-width: 150px" />
            </div>
          </div>

          <div class="risk-list">
            <article v-for="alerta in alertasFiltradas" :key="alerta.id" class="risk-row">
              <div class="risk-row__signal" :class="`risk-row__signal--${alerta.severidad}`"></div>
              <q-avatar size="46px"><img :src="alerta.estudiante.avatar" /></q-avatar>
              <div class="risk-row__identity">
                <div class="text-weight-bold">{{ alerta.estudiante.nombre }}</div>
                <div class="text-caption text-grey">{{ alerta.cursoCodigo }} · {{ alerta.curso }}</div>
                <div class="row q-gutter-xs q-mt-sm">
                  <q-chip v-for="factor in alerta.factores" :key="factor" dense class="risk-chip" size="sm">
                    {{ factor }}
                  </q-chip>
                </div>
              </div>
              <div class="risk-metric">
                <strong :class="colorPromedio(alerta.promedio)">{{ alerta.promedio }} pts</strong>
                <span>Rendimiento</span>
              </div>
              <div class="risk-metric">
                <strong>{{ alerta.participacionLabel }}</strong>
                <span>Realizadas</span>
              </div>
              <q-badge :color="colorSeveridad(alerta.severidad)" class="q-pa-sm">{{ labelSeveridad(alerta.severidad) }}</q-badge>
              <div class="row no-wrap q-gutter-xs">
                <q-btn flat round icon="chat" color="teal" aria-label="Enviar mensaje" @click="contactarEstudiante(alerta)">
                  <q-tooltip>Enviar mensaje</q-tooltip>
                </q-btn>
                <q-btn flat round icon="grade" color="primary" aria-label="Abrir calificaciones" @click="abrirCalificaciones(alerta)">
                  <q-tooltip>Abrir calificaciones</q-tooltip>
                </q-btn>
              </div>
            </article>
            <AppEmptyState
              v-if="!alertasFiltradas.length"
              icon="verified"
              title="Sin alertas con estos filtros"
              message="No hay estudiantes que requieran seguimiento en esta vista."
            />
          </div>
        </q-tab-panel>

        <q-tab-panel name="estudio" class="q-pa-md q-pa-lg-md">
          <div class="section-toolbar">
            <div>
              <div class="text-h6 text-weight-bold">Estudio de actividades</div>
              <div class="text-caption text-grey">Crea una actividad completa, reutiliza bancos y revisa exactamente lo que vera el estudiante.</div>
            </div>
            <q-badge color="teal" class="q-pa-sm">{{ herramientas.creacionesGuiadas.length }} creadas en esta sesion</q-badge>
          </div>
          <ActividadGuiadaWizard @created="tab = 'agenda'" />
        </q-tab-panel>

        <q-tab-panel name="asistente" class="q-pa-md q-pa-lg-md">
          <div class="section-toolbar">
            <div>
              <div class="text-h6 text-weight-bold">Asistente de creacion</div>
              <div class="text-caption text-grey">Genera temas, actividades y estructuras listas para editar en el builder.</div>
            </div>
            <TaButton variant="primary" icon="auto_fix_high" label="Generar estructura" @click="generarEstructura" />
          </div>

          <div class="assistant-layout">
            <TaCard title="Entrada rapida" subtitle="Define la intencion pedagogica" class="assistant-card">
              <q-select v-model="asistente.cursoId" :options="opcionesCurso" label="Curso" outlined emit-value map-options class="q-mb-md" />
              <q-select v-model="asistente.tipo" :options="opcionesAsistente" label="Tipo de herramienta" outlined emit-value map-options class="q-mb-md" />
              <q-input v-model="asistente.tema" label="Tema o unidad" outlined class="q-mb-md" />
              <q-input v-model="asistente.objetivo" label="Objetivo de aprendizaje" outlined type="textarea" rows="3" />
              <div class="row q-gutter-sm q-mt-md">
                <q-chip dense color="primary" text-color="white">Plantilla editable</q-chip>
                <q-chip dense color="teal" text-color="white">Compatible SISA</q-chip>
                <q-chip dense color="orange" text-color="white">Mock funcional</q-chip>
              </div>
            </TaCard>

            <div class="assistant-tools">
              <div v-for="tool in suite.herramientasContenido" :key="tool.id" class="assistant-tool" :class="{ 'assistant-tool--active': asistente.tipo === tool.id }" @click="asistente.tipo = tool.id">
                <q-avatar :color="tool.color" text-color="white" :icon="tool.icon" size="46px" />
                <div>
                  <div class="text-weight-bold">{{ tool.nombre }}</div>
                  <div class="text-caption text-grey">{{ tool.descripcion }}</div>
                </div>
              </div>
            </div>

            <TaCard title="Previsualizacion" subtitle="Estructura sugerida antes de crear" :padding="false" class="assistant-preview">
              <q-list separator>
                <q-item v-for="paso in pasosSugeridos" :key="paso.titulo" class="av-list-item q-py-md">
                  <q-item-section avatar><q-icon :name="paso.icon" :color="paso.color" /></q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ paso.titulo }}</q-item-label>
                    <q-item-label caption>{{ paso.descripcion }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </TaCard>
          </div>
        </q-tab-panel>

        <q-tab-panel name="agenda" class="q-pa-md q-pa-lg-md">
          <div class="section-toolbar">
            <div>
              <div class="text-h6 text-weight-bold">Agenda academica</div>
              <div class="text-caption text-grey">Fechas de entrega y actividades que necesitan atencion.</div>
            </div>
            <div class="row q-gutter-sm">
              <q-select v-model="agendaCurso" :options="opcionesCurso" label="Curso" outlined dense emit-value map-options clearable style="min-width: 210px" />
              <q-select v-model="agendaEstado" :options="opcionesAgenda" label="Estado" outlined dense emit-value map-options clearable style="min-width: 160px" />
            </div>
          </div>

          <div class="agenda-layout">
            <div class="agenda-summary">
              <div class="agenda-date">
                <span>{{ fechaActual.dia }}</span>
                <strong>{{ fechaActual.mes }}</strong>
                <small>{{ fechaActual.anio }}</small>
              </div>
              <div class="agenda-summary__body">
                <div class="text-subtitle1 text-weight-bold">Panorama de fechas</div>
                <div class="text-caption text-grey q-mb-md">Organiza revisiones y ajusta fechas desde una sola vista.</div>
                <div class="agenda-count"><strong>{{ agendaVencidas }}</strong><span>vencidas</span></div>
                <div class="agenda-count"><strong>{{ agendaProximas }}</strong><span>proximas</span></div>
                <div class="agenda-count"><strong>{{ agendaProgramadas }}</strong><span>programadas</span></div>
              </div>
            </div>

            <div class="agenda-list">
              <q-list separator>
                <q-item v-for="item in agendaFiltrada" :key="item.id" class="agenda-item q-py-md">
                  <q-item-section avatar>
                    <q-avatar :color="colorAgenda(item.estadoAgenda)" text-color="white" size="44px">
                      <q-icon :name="iconoTipo(item.tipo)" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ item.titulo }}</q-item-label>
                    <q-item-label caption>{{ item.cursoCodigo }} · {{ item.curso }}</q-item-label>
                    <q-item-label caption class="q-mt-xs">{{ formatoFecha(item.fecha) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="colorAgenda(item.estadoAgenda)" class="q-mb-sm">{{ labelAgenda(item) }}</q-badge>
                    <div class="row no-wrap">
                      <q-btn flat round dense icon="edit_calendar" color="primary" aria-label="Reprogramar" @click="reprogramar(item)">
                        <q-tooltip>Reprogramar</q-tooltip>
                      </q-btn>
                      <q-btn flat round dense icon="edit" color="grey-7" aria-label="Editar actividad" @click="abrirBuilder(item)">
                        <q-tooltip>Editar actividad</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="automatizaciones" class="q-pa-md q-pa-lg-md">
          <div class="section-toolbar">
            <div>
              <div class="text-h6 text-weight-bold">Automatizaciones docentes</div>
              <div class="text-caption text-grey">Reglas simples para intervenir a tiempo sin perder seguimiento humano.</div>
            </div>
            <TaButton variant="primary" icon="add" label="Nueva regla" @click="nuevaRegla" />
          </div>

          <div class="row q-col-gutter-md">
            <div v-for="regla in herramientas.reglas" :key="regla.id" class="col-12 col-md-6 col-xl-4">
              <div class="automation-card">
                <div class="row items-start justify-between no-wrap">
                  <q-avatar color="primary" text-color="white" icon="auto_mode" size="46px" />
                  <q-toggle :model-value="regla.activa" color="teal" @update:model-value="herramientas.toggleRegla(regla.id)" />
                </div>
                <div class="text-subtitle1 text-weight-bold q-mt-md">{{ regla.nombre }}</div>
                <div class="text-body2 text-grey q-mt-xs automation-description">{{ regla.descripcion }}</div>
                <q-separator class="q-my-md" />
                <div class="automation-meta"><q-icon name="notifications_active" /> {{ regla.canal }}</div>
                <div class="automation-meta"><q-icon name="history" /> {{ regla.ultimaEjecucion ? formatoFechaHora(regla.ultimaEjecucion) : 'Nunca ejecutada' }}</div>
                <div class="row q-gutter-sm q-mt-md">
                  <TaButton variant="outline" icon="visibility" label="Vista previa" @click="previsualizarRegla(regla)" />
                  <q-btn flat round icon="play_arrow" color="teal" aria-label="Ejecutar ahora" :disable="!regla.activa" @click="ejecutarRegla(regla)">
                    <q-tooltip>Ejecutar ahora</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="banco" class="q-pa-md q-pa-lg-md">
          <div class="section-toolbar">
            <div>
              <div class="text-h6 text-weight-bold">Banco Docente</div>
              <div class="text-caption text-grey">Reutiliza actividades, rubricas y preguntas entre tus cursos.</div>
            </div>
            <div class="filter-bar">
              <q-btn-toggle
                v-model="bancoCategoria"
                no-caps
                flat
                toggle-color="primary"
                text-color="primary"
                :options="opcionesBanco"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div v-for="plantilla in plantillasFiltradas" :key="plantilla.id" class="col-12 col-md-6">
              <div class="template-row">
                <q-avatar :color="colorTipo(plantilla.tipo)" text-color="white" :icon="iconoTipo(plantilla.tipo)" size="50px" />
                <div class="template-row__body">
                  <div class="row items-start justify-between no-wrap q-gutter-md">
                    <div>
                      <div class="text-subtitle1 text-weight-bold">{{ plantilla.nombre }}</div>
                      <div class="text-caption text-grey">{{ labelCategoria(plantilla.categoria) }} · usada {{ plantilla.uso }} veces</div>
                    </div>
                    <q-btn flat round icon="content_copy" color="primary" aria-label="Usar plantilla" @click="abrirCopiarPlantilla(plantilla)">
                      <q-tooltip>Usar plantilla</q-tooltip>
                    </q-btn>
                  </div>
                  <div class="text-body2 q-mt-sm">{{ plantilla.descripcion }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="analitica" class="q-pa-md q-pa-lg-md">
          <div class="section-toolbar">
            <div>
              <div class="text-h6 text-weight-bold">Analitica docente</div>
              <div class="text-caption text-grey">Lectura operativa del rendimiento y la estructura de tus cursos.</div>
            </div>
            <q-badge color="teal" class="q-pa-sm">Datos mock actualizados</q-badge>
          </div>

          <div class="row q-col-gutter-lg">
            <div class="col-12 col-lg-7">
              <DashboardChartCard title="Distribucion de rendimiento" subtitle="Estudiantes agrupados por promedio" icon="bar_chart" height="300px">
                <BarChart :data="chartRendimiento" :options="barOptions" />
              </DashboardChartCard>
            </div>
            <div class="col-12 col-lg-5">
              <DashboardChartCard title="Tipos de actividad" subtitle="Composicion de tus cursos" icon="donut_large" height="300px">
                <DoughnutChart :data="chartTipos" :options="doughnutOptions" />
              </DashboardChartCard>
            </div>
            <div class="col-12">
              <div class="course-progress-grid">
                <div v-for="curso in analitica.cursos" :key="curso.id" class="course-progress">
                  <div class="row items-center justify-between">
                    <div>
                      <div class="text-weight-bold">{{ curso.nombre }}</div>
                      <div class="text-caption text-grey">{{ curso.codigo }}</div>
                    </div>
                    <strong class="text-primary">{{ curso.progreso }}/{{ curso.progresoTotal }}</strong>
                  </div>
                  <q-linear-progress :value="ratio(curso.progreso, curso.progresoTotal)" color="teal" rounded size="8px" class="q-mt-md" />
                  <div class="row justify-end q-mt-sm">
                    <q-btn flat dense no-caps icon-right="chevron_right" label="Revisar curso" color="primary" @click="router.push(`/docente/curso/${curso.id}/builder`)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </TaCard>

    <q-dialog v-model="dialogRegla">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">Vista previa de automatizacion</div>
          <div class="text-caption text-grey">{{ reglaSeleccionada?.nombre }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">{{ destinatariosRegla.length }} destinatarios detectados</div>
          <q-list bordered separator class="rounded-borders">
            <q-item v-for="alerta in destinatariosRegla.slice(0, 6)" :key="alerta.id">
              <q-item-section avatar><q-avatar size="36px"><img :src="alerta.estudiante.avatar" /></q-avatar></q-item-section>
              <q-item-section>
                <q-item-label>{{ alerta.estudiante.nombre }}</q-item-label>
                <q-item-label caption>{{ alerta.cursoCodigo }} · {{ alerta.factores.join(', ') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cerrar" v-close-popup />
          <TaButton variant="primary" icon="send" label="Ejecutar ahora" @click="ejecutarRegla(reglaSeleccionada)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogCopiar">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">Usar plantilla</div>
          <div class="text-caption text-grey">{{ plantillaSeleccionada?.nombre }}</div>
        </q-card-section>
        <q-card-section>
          <q-select v-model="cursoDestino" :options="opcionesCurso" label="Curso destino" outlined emit-value map-options class="q-mb-md" />
          <q-select v-model="seccionDestino" :options="opcionesSeccionDestino" label="Seccion destino" outlined emit-value map-options :disable="!cursoDestino" />
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
          <TaButton variant="primary" icon="content_copy" label="Copiar al curso" :disable="!seccionDestino" @click="copiarPlantilla" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    </template>
  </q-page>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Bar as BarChart, Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useAuthStore } from 'src/stores/auth'
import { useCursosStore } from 'src/stores/cursos'
import { useActividadesStore } from 'src/stores/actividades'
import { useHerramientasDocenteStore } from 'src/stores/herramientasDocente'
import { useNotificacionesStore } from 'src/stores/notificaciones'
import { useSuiteRolesStore } from 'src/stores/suiteRoles'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'
import DashboardChartCard from 'src/components/dashboard/DashboardChartCard.vue'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import ActividadGuiadaWizard from 'src/components/docente/ActividadGuiadaWizard.vue'
import { useStaggerCards } from 'src/composables/useAnimations'
import { useLoadingState } from 'src/composables/useLoadingState'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()
const herramientas = useHerramientasDocenteStore()
const notificaciones = useNotificacionesStore()
const suite = useSuiteRolesStore()
const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 600 })

const tab = ref(route.query.tab || 'alertas')
const filtroCurso = ref(null)
const filtroSeveridad = ref(null)
const agendaCurso = ref(null)
const agendaEstado = ref(null)
const bancoCategoria = ref('todos')
const dialogRegla = ref(false)
const dialogCopiar = ref(false)
const reglaSeleccionada = ref(null)
const plantillaSeleccionada = ref(null)
const cursoDestino = ref(null)
const seccionDestino = ref(null)
const asistente = ref({ cursoId: null, tipo: 'tema-guiado', tema: 'Nueva unidad', objetivo: 'Comprender y aplicar los conceptos clave del tema.' })

const cursosDocente = computed(() => cursosStore.cursos.filter((curso) => curso.docente_id === auth.usuario?.id))
const alertas = computed(() => herramientas.alertasPorDocente(auth.usuario?.id))
const agenda = computed(() => herramientas.agendaPorDocente(auth.usuario?.id))
const analitica = computed(() => herramientas.analiticaPorDocente(auth.usuario?.id))
const alertasCriticas = computed(() => alertas.value.filter((alerta) => alerta.severidad === 'critica').length)

const opcionesCurso = computed(() => cursosDocente.value.map((curso) => ({ label: `${curso.codigo} · ${curso.nombre}`, value: curso.id })))
const opcionesSeveridad = [
  { label: 'Critica', value: 'critica' },
  { label: 'Alta', value: 'alta' },
  { label: 'Media', value: 'media' },
]
const opcionesAgenda = [
  { label: 'Vencidas', value: 'vencida' },
  { label: 'Proximas', value: 'proxima' },
  { label: 'Programadas', value: 'programada' },
]
const opcionesBanco = [
  { label: 'Todos', value: 'todos' },
  { label: 'Actividades', value: 'actividad' },
  { label: 'Rubricas', value: 'rubrica' },
  { label: 'Preguntas', value: 'preguntas' },
]
const opcionesAsistente = computed(() => suite.herramientasContenido.map((item) => ({ label: item.nombre, value: item.id })))

const kpis = computed(() => [
  { label: 'Alertas criticas', value: alertasCriticas.value, icon: 'crisis_alert', color: '#ef4444', trend: -6 },
  { label: 'Requieren seguimiento', value: alertas.value.length, icon: 'person_search', color: '#F59E0B', trend: 4 },
  { label: 'Fechas vencidas', value: agendaVencidas.value, icon: 'event_busy', color: '#6B3FA0', trend: -3 },
  { label: 'Reglas activas', value: herramientas.reglas.filter((regla) => regla.activa).length, icon: 'auto_mode', color: '#0D9488', trend: 1 },
])

const alertasFiltradas = computed(() => alertas.value.filter((alerta) =>
  (!filtroCurso.value || alerta.cursoId === filtroCurso.value) &&
  (!filtroSeveridad.value || alerta.severidad === filtroSeveridad.value)
))
const agendaFiltrada = computed(() => agenda.value.filter((item) =>
  (!agendaCurso.value || item.cursoId === agendaCurso.value) &&
  (!agendaEstado.value || item.estadoAgenda === agendaEstado.value)
))
const agendaVencidas = computed(() => agenda.value.filter((item) => item.estadoAgenda === 'vencida').length)
const agendaProximas = computed(() => agenda.value.filter((item) => item.estadoAgenda === 'proxima').length)
const agendaProgramadas = computed(() => agenda.value.filter((item) => item.estadoAgenda === 'programada').length)
const plantillasFiltradas = computed(() => herramientas.plantillas.filter((plantilla) => bancoCategoria.value === 'todos' || plantilla.categoria === bancoCategoria.value))
const opcionesSeccionDestino = computed(() => {
  const curso = cursosStore.getCursoById(cursoDestino.value)
  return curso?.secciones?.map((seccion) => ({ label: seccion.titulo, value: seccion.id })) || []
})
const destinatariosRegla = computed(() => {
  if (!reglaSeleccionada.value) return []
  if (reglaSeleccionada.value.condicion === 'inactividad') return alertas.value.filter((alerta) => alerta.inactividad >= reglaSeleccionada.value.umbral)
  if (reglaSeleccionada.value.condicion === 'promedio') return alertas.value.filter((alerta) => alerta.promedio < reglaSeleccionada.value.umbral)
  return alertas.value.filter((alerta) => alerta.pendientes >= reglaSeleccionada.value.umbral)
})
const fechaActual = computed(() => {
  const hoy = new Date()
  return {
    dia: hoy.toLocaleDateString('es-BO', { day: '2-digit' }),
    mes: hoy.toLocaleDateString('es-BO', { month: 'short' }).replace('.', '').toUpperCase(),
    anio: hoy.getFullYear(),
  }
})
const pasosSugeridos = computed(() => {
  const tool = suite.herramientasContenido.find((item) => item.id === asistente.value.tipo)
  const tema = asistente.value.tema || 'Tema'
  const base = [
    { titulo: `Introduccion: ${tema}`, descripcion: asistente.value.objetivo || 'Presentacion del objetivo de aprendizaje.', icon: 'article', color: 'indigo' },
    { titulo: 'Actividad de practica', descripcion: 'Entrega o participacion breve para aplicar lo aprendido.', icon: 'assignment', color: 'orange' },
    { titulo: 'Cierre y evidencia', descripcion: 'Retroalimentacion, rubrica o comprobacion de logro.', icon: 'fact_check', color: 'teal' },
  ]
  if (tool?.id === 'proyecto-grupal') base.splice(1, 0, { titulo: 'Roles de equipo', descripcion: 'Distribucion de responsabilidades y entregables por hito.', icon: 'groups', color: 'teal' })
  if (tool?.id === 'glosario') base.splice(1, 0, { titulo: 'Terminos colaborativos', descripcion: 'Definiciones revisadas por pares y validadas por docente.', icon: 'menu_book', color: 'purple' })
  if (tool?.id === 'video-interactivo') base.splice(1, 0, { titulo: 'Pausas de comprobacion', descripcion: 'Preguntas durante el video para medir comprension.', icon: 'quiz', color: 'purple' })
  return base
})

const chartText = computed(() => ($q.dark.isActive ? '#e2e8f0' : '#475569'))
const barOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { ticks: { color: chartText.value }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: chartText.value } } },
}))
const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '66%',
  plugins: { legend: { position: 'bottom', labels: { color: chartText.value, usePointStyle: true, boxWidth: 8 } } },
}))
const chartRendimiento = computed(() => ({
  labels: ['0-39 pts', '40-59 pts', '60-79 pts', '80-100 pts'],
  datasets: [{ data: analitica.value.rangos, backgroundColor: ['#ef4444', '#F59E0B', '#6B3FA0', '#0D9488'], borderRadius: 8 }],
}))
const chartTipos = computed(() => ({
  labels: Object.keys(analitica.value.tipos).map(labelTipo),
  datasets: [{ data: Object.values(analitica.value.tipos), backgroundColor: ['#6B3FA0', '#0D9488', '#F59E0B', '#10b981', '#e11d48', '#0ea5e9'], borderWidth: 0 }],
}))

watch(tab, (value) => router.replace({ query: { ...route.query, tab: value } }))
watch(cursoDestino, () => { seccionDestino.value = null })

function actualizarAnalisis() {
  $q.loading.show({ message: 'Actualizando indicadores...' })
  setTimeout(() => {
    $q.loading.hide()
    $q.notify({ message: 'Analisis docente actualizado', color: 'positive', icon: 'verified', timeout: 1600 })
  }, 700)
}

function notificarAlertas() {
  alertas.value.slice(0, 5).forEach((alerta) => notificaciones.agregar({
    icon: 'support_agent',
    color: 'teal',
    titulo: `Seguimiento enviado a ${alerta.estudiante.nombre}`,
    descripcion: alerta.factores.join(' · '),
    curso: alerta.curso,
  }))
  $q.notify({ message: `Se prepararon ${Math.min(alertas.value.length, 5)} notificaciones de seguimiento`, color: 'teal', icon: 'campaign' })
}

function contactarEstudiante(alerta) {
  notificaciones.agregar({ icon: 'chat', color: 'teal', titulo: `Mensaje enviado a ${alerta.estudiante.nombre}`, descripcion: 'Invitacion a revisar pendientes y solicitar apoyo.', curso: alerta.curso })
  $q.notify({ message: `Mensaje enviado a ${alerta.estudiante.nombre}`, color: 'positive', icon: 'send' })
}

function abrirCalificaciones(alerta) {
  router.push({ path: '/docente/calificar', query: { curso: alerta.cursoId, actividad: alerta.actividadId, estudiante: alerta.estudiante.id } })
}

function abrirBuilder(item) {
  router.push({ path: `/docente/curso/${item.cursoId}/builder`, query: { actividad: item.id } })
}

function reprogramar(item) {
  $q.notify({ message: `Reprogramacion preparada para "${item.titulo}" (mock)`, color: 'info', icon: 'edit_calendar' })
}

function nuevaRegla() {
  $q.notify({ message: 'Editor de nueva automatizacion disponible en la fase backend', color: 'info', icon: 'auto_mode' })
}

function generarEstructura() {
  const curso = cursosStore.getCursoById(asistente.value.cursoId || cursosDocente.value[0]?.id)
  if (!curso?.secciones?.length) {
    $q.notify({ message: 'Selecciona un curso con secciones disponibles', color: 'warning', icon: 'warning' })
    return
  }
  const seccionId = curso.secciones[0].id
  const ordenBase = actividadesStore.actividades.filter((actividad) => actividad.seccion_id === seccionId).length + 1
  pasosSugeridos.value.forEach((paso, index) => {
    actividadesStore.agregarActividad({
      seccion_id: seccionId,
      tipo: index === 1 ? 'tarea' : 'leccion',
      titulo: paso.titulo,
      descripcion: paso.descripcion,
      orden: ordenBase + index,
      tiene_nota: index === 1,
      nota_maxima: index === 1 ? 100 : 0,
      peso: index === 1 ? 1 : 0,
      config: { contenido_html: paso.descripcion, instrucciones: paso.descripcion },
    })
  })
  suite.registrarAccion('docente', `Estructura generada en ${curso.codigo}`)
  $q.notify({ message: `Estructura creada en ${curso.nombre}`, color: 'positive', icon: 'auto_fix_high' })
}

function previsualizarRegla(regla) {
  reglaSeleccionada.value = regla
  dialogRegla.value = true
}

function ejecutarRegla(regla) {
  if (!regla) return
  reglaSeleccionada.value = regla
  herramientas.ejecutarRegla(regla.id, destinatariosRegla.value.length)
  dialogRegla.value = false
  $q.notify({ message: `${regla.nombre}: ${destinatariosRegla.value.length} destinatarios procesados`, color: 'positive', icon: 'play_circle' })
}

function abrirCopiarPlantilla(plantilla) {
  plantillaSeleccionada.value = plantilla
  cursoDestino.value = cursosDocente.value[0]?.id || null
  dialogCopiar.value = true
}

function copiarPlantilla() {
  const plantilla = plantillaSeleccionada.value
  if (!plantilla || !seccionDestino.value) return
  const orden = actividadesStore.actividades.filter((actividad) => actividad.seccion_id === seccionDestino.value).length + 1
  if (plantilla.categoria === 'actividad') {
    actividadesStore.agregarActividad({ ...plantilla.datos, seccion_id: seccionDestino.value, orden })
  } else if (plantilla.categoria === 'rubrica') {
    actividadesStore.agregarActividad({
      seccion_id: seccionDestino.value,
      orden,
      tipo: 'tarea',
      titulo: `Actividad con ${plantilla.nombre}`,
      descripcion: plantilla.descripcion,
      tiene_nota: true,
      nota_maxima: 100,
      peso: 1,
      config: { instrucciones: 'Completa la actividad siguiendo los criterios de la rubrica.', rubrica_id: plantilla.id, rubrica: plantilla.datos, seguimiento_requerido: true },
    })
  } else if (plantilla.categoria === 'preguntas') {
    actividadesStore.agregarActividad({
      seccion_id: seccionDestino.value,
      orden,
      tipo: 'cuestionario',
      titulo: plantilla.nombre,
      descripcion: plantilla.descripcion,
      tiene_nota: true,
      nota_maxima: (plantilla.datos.preguntas || []).reduce((sum, pregunta) => sum + Number(pregunta.puntaje || 0), 0) || 100,
      peso: 1,
      config: { preguntas: plantilla.datos.preguntas || [], banco_preguntas_id: plantilla.id, intentos_maximos: 1, seguimiento_requerido: true },
    })
  }
  herramientas.registrarUsoPlantilla(plantilla.id)
  dialogCopiar.value = false
  $q.notify({ message: `"${plantilla.nombre}" copiada al curso`, color: 'positive', icon: 'content_copy' })
}

function formatoFecha(fecha) { return new Date(fecha).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' }) }
function formatoFechaHora(fecha) { return new Date(fecha).toLocaleString('es-BO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
function colorPromedio(valor) { if (valor >= 80) return 'text-positive'; if (valor >= 60) return 'text-primary'; if (valor >= 40) return 'text-orange'; return 'text-negative' }
function ratio(actual, total) { return total > 0 ? actual / total : 0 }
function colorSeveridad(valor) { return { critica: 'negative', alta: 'orange', media: 'primary' }[valor] || 'grey' }
function labelSeveridad(valor) { return { critica: 'Critica', alta: 'Alta', media: 'Media' }[valor] || valor }
function colorAgenda(valor) { return { vencida: 'negative', proxima: 'orange', programada: 'teal' }[valor] || 'grey' }
function labelAgenda(item) { if (item.estadoAgenda === 'vencida') return `Vencida hace ${Math.abs(item.diferenciaDias)}d`; if (item.estadoAgenda === 'proxima') return `En ${item.diferenciaDias}d`; return 'Programada' }
function iconoTipo(tipo) { return { tarea: 'assignment', foro: 'forum', cuestionario: 'quiz', leccion: 'article', encuesta: 'poll', h5p: 'extension', rubrica: 'fact_check' }[tipo] || 'inventory_2' }
function colorTipo(tipo) { return { tarea: 'orange', foro: 'teal', cuestionario: 'purple', leccion: 'indigo', encuesta: 'green', h5p: 'pink', rubrica: 'primary' }[tipo] || 'blue-grey' }
function labelTipo(tipo) { return { tarea: 'Tareas', foro: 'Foros', cuestionario: 'Cuestionarios', leccion: 'Lecciones', encuesta: 'Encuestas', h5p: 'H5P' }[tipo] || tipo }
function labelCategoria(categoria) { return { actividad: 'Actividad', rubrica: 'Rubrica', preguntas: 'Banco de preguntas' }[categoria] || categoria }

useStaggerCards('.card-item')

onMounted(() => {
  finalizarCarga()
})
</script>

<style scoped>
.tools-shell:hover { transform: none; }
.tools-tabs {
  min-height: 58px;
  color: var(--ta-text-secondary);
  background: var(--ta-bg-card);
  border-bottom: 1px solid var(--ta-border-card);
}
.tools-panels { background: transparent; color: var(--ta-text-primary); min-height: 580px; }
.section-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
.filter-bar {
  display: inline-flex;
  padding: 4px;
  background: var(--ta-bg-card);
  border: 1px solid var(--ta-border-card);
  border-radius: 999px;
}
.risk-list { border: 1px solid var(--ta-border-card); border-radius: 16px; overflow: hidden; background: var(--ta-bg-card); }
.risk-row {
  display: grid;
  grid-template-columns: 5px 46px minmax(240px, 1fr) 90px 100px auto auto;
  align-items: center;
  gap: 14px;
  padding: 14px 16px 14px 0;
  border-bottom: 1px solid var(--ta-border-card);
  transition: background-color 0.2s ease;
}
.risk-row:last-child { border-bottom: 0; }
.risk-row:hover { background: rgba(var(--primary-rgb), 0.04); }
.body--dark .risk-row:hover { background: rgba(255, 255, 255, 0.03); }
.risk-row__signal { align-self: stretch; border-radius: 0 6px 6px 0; background: #6B3FA0; }
.risk-row__signal--critica { background: #ef4444; }
.risk-row__signal--alta { background: #F59E0B; }
.risk-chip {
  background: rgba(var(--primary-rgb), 0.08);
  color: var(--ta-primary);
  border: 1px solid rgba(var(--primary-rgb), 0.16);
}
.body--dark .risk-chip {
  background: rgba(var(--primary-rgb), 0.14);
  color: var(--ta-text-primary);
  border-color: rgba(var(--primary-rgb), 0.24);
}
.risk-metric { display: grid; text-align: center; }
.risk-metric strong { font-size: 1.05rem; color: var(--ta-text-primary); }
.risk-metric span { color: var(--ta-text-secondary); font-size: 0.7rem; }
.agenda-layout { display: grid; grid-template-columns: minmax(230px, 0.34fr) minmax(0, 1fr); gap: 20px; }
.agenda-summary { border: 1px solid var(--ta-border-card); border-radius: 16px; overflow: hidden; align-self: start; background: var(--ta-bg-card); box-shadow: var(--shadow-card); }
.agenda-date { display: grid; justify-items: center; padding: 24px; background: var(--gradient-unitepc); color: white; }
.agenda-date span { font-size: 3rem; font-weight: 800; line-height: 1; }
.agenda-date strong { font-size: 1.2rem; margin-top: 8px; }
.agenda-date small { opacity: 0.75; }
.agenda-summary__body { padding: 18px; }
.agenda-count { display: flex; align-items: baseline; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--ta-border-card); }
.agenda-count strong { font-size: 1.25rem; color: var(--ta-primary); }
.agenda-count span { color: var(--ta-text-secondary); font-size: 0.8rem; }
.agenda-count:last-child { border-bottom: 0; }
.agenda-list { border: 1px solid var(--ta-border-card); border-radius: 16px; overflow: hidden; background: var(--ta-bg-card); }
.agenda-item { transition: background-color 0.2s ease; }
.agenda-item:hover { background: rgba(var(--primary-rgb), 0.04); }
.body--dark .agenda-item:hover { background: rgba(255, 255, 255, 0.03); }
.automation-card, .template-row, .course-progress {
  height: 100%;
  border: 1px solid var(--ta-border-card);
  border-radius: 16px;
  padding: 18px;
  background: var(--ta-bg-card);
  box-shadow: var(--shadow-card);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.automation-card:hover, .template-row:hover, .course-progress:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: rgba(var(--primary-rgb), 0.22);
}
.automation-description { min-height: 42px; color: var(--ta-text-secondary); }
.automation-meta { display: flex; align-items: center; gap: 8px; margin-top: 8px; color: var(--ta-text-secondary); font-size: 0.78rem; }
.template-row { display: flex; gap: 16px; }
.template-row__body { flex: 1; min-width: 0; }
.course-progress-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.dialog-card { width: min(620px, 92vw); border-radius: 20px; }
.assistant-layout { display: grid; grid-template-columns: minmax(260px, 0.85fr) minmax(260px, 1fr) minmax(260px, 0.9fr); gap: 16px; align-items: start; }
.assistant-card:hover, .assistant-preview:hover { transform: none; }
.assistant-tools { display: grid; gap: 12px; }
.assistant-tool {
  display: flex;
  gap: 14px;
  align-items: center;
  border: 1px solid var(--ta-border-card);
  border-radius: 14px;
  padding: 14px;
  background: var(--ta-bg-card);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.assistant-tool:hover, .assistant-tool--active {
  transform: translateY(-2px);
  border-color: var(--ta-primary);
  box-shadow: var(--shadow-card);
}
.body--dark .assistant-tool:hover, .body--dark .assistant-tool--active {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}
@media (max-width: 1100px) {
  .risk-row { grid-template-columns: 5px 46px minmax(200px, 1fr) auto auto; }
  .risk-metric { display: none; }
}
@media (max-width: 700px) {
  .section-toolbar { align-items: stretch; flex-direction: column; }
  .section-toolbar > .row { display: grid; }
  .risk-row { grid-template-columns: 5px 40px minmax(0, 1fr) auto; padding-right: 10px; gap: 10px; }
  .risk-row > .q-badge { display: none; }
  .risk-row > .row { grid-column: 3 / -1; justify-self: end; }
  .risk-row__identity .row { display: none; }
  .agenda-layout, .course-progress-grid { grid-template-columns: 1fr; }
  .assistant-layout { grid-template-columns: 1fr; }
  .agenda-summary { display: grid; grid-template-columns: 120px 1fr; }
  .agenda-date { padding: 18px; }
}
</style>
