<template>
  <Teleport to="body">
    <div v-if="modelValue" ref="overlayRef" class="app-tour">
      <div
        v-if="targetRect"
        ref="spotlightRef"
        class="app-tour__spotlight"
        :style="spotlightStyle"
      />

      <div ref="panelRef" class="app-tour__panel" :style="panelStyle">
        <div class="app-tour__header">
          <q-chip dense color="primary" text-color="white" icon="tips_and_updates">
            Tutorial
          </q-chip>
          <q-btn flat round dense icon="close" aria-label="Cerrar tutorial" @click="closeTour">
            <q-tooltip>Cerrar tutorial</q-tooltip>
          </q-btn>
        </div>

        <div class="app-tour__step-count">Paso {{ activeStepNumber }} de {{ availableSteps.length }}</div>
        <h2 class="app-tour__title">{{ activeStep.title }}</h2>
        <p class="app-tour__copy">{{ activeStep.copy }}</p>

        <div class="app-tour__dots" aria-hidden="true">
          <span
            v-for="(_, idx) in availableSteps"
            :key="idx"
            :class="['app-tour__dot', { 'app-tour__dot--active': idx === currentIndex }]"
          />
        </div>

        <div class="app-tour__actions">
          <q-btn flat no-caps color="grey-7" label="Saltar" @click="closeTour" />
          <div class="q-gutter-sm">
            <q-btn
              flat
              round
              icon="chevron_left"
              :disable="currentIndex === 0"
              @click="goToStep(currentIndex - 1)"
            >
              <q-tooltip>Anterior</q-tooltip>
            </q-btn>
            <q-btn
              unelevated
              no-caps
              color="primary"
              :icon-right="isLastStep ? 'check' : 'chevron_right'"
              :label="isLastStep ? 'Finalizar' : 'Siguiente'"
              @click="isLastStep ? closeTour() : goToStep(currentIndex + 1)"
            />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import anime from 'animejs'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const route = useRoute()

const overlayRef = ref(null)
const spotlightRef = ref(null)
const panelRef = ref(null)
const currentIndex = ref(0)
const targetRect = ref(null)

const layoutStartSteps = [
  {
    selector: '[data-tour="brand"]',
    title: 'Identidad y contexto',
    copy: 'Aqui confirmas que estas dentro de Aula Virtual UNITEPC. Desde cualquier rol, esta zona te mantiene orientado.',
  },
  {
    selector: '[data-tour="sidebar"]',
    title: 'Navegacion por rol',
    copy: 'El menu cambia segun tu perfil. Usa estos accesos para moverte entre dashboard, cursos, notas, calificaciones o reportes.',
  },
  {
    selector: '[data-tour="global-search"]',
    title: 'Busqueda rapida',
    copy: 'Este buscador esta pensado para encontrar cursos, comandos o secciones frecuentes sin navegar manualmente.',
  },
]

const layoutEndSteps = [
  {
    selector: '[data-tour="notifications"]',
    title: 'Notificaciones',
    copy: 'Desde aqui puedes revisar avisos importantes y marcar novedades como leidas.',
  },
  {
    selector: '[data-tour="profile"]',
    title: 'Perfil y actividad',
    copy: 'El menu de usuario agrupa tu perfil, actividad reciente, configuracion rapida y cierre de sesion.',
  },
  {
    selector: '[data-tour="tutorial-button"]',
    title: 'Volver al tutorial',
    copy: 'Cuando quieras repasar el sistema, presiona este boton para abrir la guia interactiva otra vez.',
  },
]

const roleDashboardSteps = {
  estudiante: [
    {
      selector: '[data-tour="dashboard-hero"]',
      title: 'Panel del estudiante',
      copy: 'Aqui ves tu avance academico, pendientes y accesos rapidos para continuar tus materias.',
    },
    {
      selector: '[data-tour="kpi-card"]',
      title: 'Indicadores personales',
      copy: 'Estas tarjetas resumen cursos, actividades completadas, promedio y materias aprobadas.',
    },
    {
      selector: '[data-tour="chart-card"]',
      title: 'Progreso visual',
      copy: 'Los graficos te ayudan a entender avance por curso y distribucion de actividades.',
    },
  ],
  docente: [
    {
      selector: '[data-tour="dashboard-hero"]',
      title: 'Centro docente',
      copy: 'Desde este resumen priorizas entregas, cursos activos y acciones de gestion academica.',
    },
    {
      selector: '[data-tour="kpi-card"]',
      title: 'Pulso de tus cursos',
      copy: 'Los indicadores muestran estudiantes, pendientes, avance y alertas que requieren atencion.',
    },
    {
      selector: '[data-tour="chart-card"]',
      title: 'Analitica docente',
      copy: 'Los graficos comparan rendimiento por curso y composicion de actividades publicadas.',
    },
    {
      selector: '[data-tour="teacher-dashboard-submissions"]',
      title: 'Entregas por revisar',
      copy: 'Aqui aparecen los ultimos envios para abrir el libro de calificaciones sin perder contexto.',
    },
  ],
  director: [
    {
      selector: '[data-tour="dashboard-hero"]',
      title: 'Vista directiva',
      copy: 'Este panel resume salud academica, riesgos y acciones de seguimiento institucional.',
    },
    {
      selector: '[data-tour="kpi-card"]',
      title: 'Indicadores institucionales',
      copy: 'Usa estos datos para detectar cursos en riesgo, promedios y participacion global.',
    },
    {
      selector: '[data-tour="chart-card"]',
      title: 'Lectura comparativa',
      copy: 'Los graficos ayudan a comparar avance por curso y distribucion de resultados.',
    },
  ],
  admin: [
    {
      selector: '[data-tour="dashboard-hero"]',
      title: 'Gestion administrativa',
      copy: 'Este resumen concentra integraciones, cursos, usuarios y estado operativo del sistema.',
    },
    {
      selector: '[data-tour="kpi-card"]',
      title: 'Estado del sistema',
      copy: 'Los indicadores muestran volumen de datos, sincronizaciones y puntos de mantenimiento.',
    },
    {
      selector: '[data-tour="admin-integrations"]',
      title: 'Integraciones',
      copy: 'Revisa aqui conexiones previstas como SISA, correo, almacenamiento y servicios externos.',
    },
  ],
}

const routeStepGroups = [
  {
    role: 'estudiante',
    match: (path) => path.endsWith('/estudiante/cursos'),
    steps: [
      {
        selector: '[data-tour="student-courses-header"]',
        title: 'Tus cursos',
        copy: 'Esta vista agrupa las materias matriculadas de la gestion actual.',
      },
      {
        selector: '[data-tour="student-courses-list"]',
        title: 'Tarjetas de curso',
        copy: 'Cada tarjeta abre el curso y muestra descripcion, actividades y progreso.',
      },
      {
        selector: '[data-tour="student-course-progress"]',
        title: 'Progreso por materia',
        copy: 'La barra indica cuanto has avanzado para priorizar donde continuar.',
      },
    ],
  },
  {
    role: 'estudiante',
    match: (path) => path.includes('/estudiante/curso/'),
    steps: [
      {
        selector: '[data-tour="student-course-header"]',
        title: 'Vista del curso',
        copy: 'Aqui confirmas la materia abierta y vuelves al listado cuando lo necesites.',
      },
      {
        selector: '[data-tour="student-course-sidebar"]',
        title: 'Mapa del curso',
        copy: 'El panel lateral muestra secciones, pendientes y progreso dentro de la materia.',
      },
      {
        selector: '[data-tour="student-course-content"]',
        title: 'Contenido y actividades',
        copy: 'Selecciona una actividad para ver instrucciones, responder o revisar recursos.',
      },
    ],
  },
  {
    role: 'estudiante',
    match: (path) => path.endsWith('/estudiante/notas'),
    steps: [
      {
        selector: '[data-tour="student-notes-header"]',
        title: 'Calificaciones del estudiante',
        copy: 'Esta vista resume tu rendimiento publicado por los docentes.',
      },
      {
        selector: '[data-tour="student-notes-kpis"]',
        title: 'Resumen de notas',
        copy: 'Los indicadores muestran cursos, actividades completadas, promedio general y materias aprobadas.',
      },
      {
        selector: '[data-tour="student-notes-course"]',
        title: 'Promedio por curso',
        copy: 'Cada bloque agrupa las notas de una materia y el promedio calculado para ese curso.',
      },
      {
        selector: '[data-tour="student-notes-table"]',
        title: 'Detalle de actividades',
        copy: 'Aqui revisas actividad, tipo, nota maxima, porcentaje y estado de aprobacion.',
      },
      {
        selector: '[data-tour="student-notes-distribution"]',
        title: 'Distribucion',
        copy: 'Este resumen separa aprobadas, reprobadas y total para leer rapidamente tu situacion.',
      },
    ],
  },
  {
    role: 'docente',
    match: (path) => path.endsWith('/docente/cursos'),
    steps: [
      {
        selector: '[data-tour="teacher-courses-header"]',
        title: 'Gestion de cursos',
        copy: 'Desde aqui creas cursos y accedes al builder de cada materia.',
      },
      {
        selector: '[data-tour="teacher-courses-list"]',
        title: 'Cursos asignados',
        copy: 'Cada tarjeta muestra estado, estudiantes, actividades y avance de la materia.',
      },
      {
        selector: '[data-tour="teacher-course-actions"]',
        title: 'Acciones del curso',
        copy: 'Usa estos accesos para editar estructura o previsualizar la experiencia del estudiante.',
      },
    ],
  },
  {
    role: 'docente',
    match: (path) => path.endsWith('/docente/calificar'),
    steps: [
      {
        selector: '[data-tour="teacher-grades-header"]',
        title: 'Libro de calificaciones',
        copy: 'Esta vista permite revisar notas, exportar reportes y sincronizar resultados.',
      },
      {
        selector: '[data-tour="teacher-grades-summary"]',
        title: 'Resumen del curso',
        copy: 'Selecciona el curso y revisa promedio, pendientes y entregas realizadas.',
      },
      {
        selector: '[data-tour="teacher-grades-table"]',
        title: 'Matriz de notas',
        copy: 'Cada fila es un estudiante y cada columna una actividad calificable.',
      },
      {
        selector: '[data-tour="teacher-grades-charts"]',
        title: 'Graficos de notas',
        copy: 'Estos graficos comparan rangos de promedio y desempeno por actividad.',
      },
    ],
  },
  {
    role: 'docente',
    match: (path) => path.includes('/docente/curso/') && path.endsWith('/builder'),
    steps: [
      {
        selector: '[data-tour="teacher-builder-header"]',
        title: 'Builder de curso',
        copy: 'Aqui publicas, previsualizas y administras la estructura academica del curso.',
      },
      {
        selector: '[data-tour="teacher-builder-mode"]',
        title: 'Modo de edicion',
        copy: 'Cambia entre edicion simple y canvas para organizar contenidos segun tu flujo de trabajo.',
      },
      {
        selector: '[data-tour="teacher-builder-structure"]',
        title: 'Estructura del curso',
        copy: 'Agrega secciones y actividades, reordena contenido y edita bloques existentes.',
      },
      {
        selector: '[data-tour="teacher-builder-canvas"]',
        title: 'Canvas interactivo',
        copy: 'En modo canvas puedes combinar bloques de contenido y actividades con una vista mas visual.',
      },
    ],
  },
  {
    role: 'docente',
    match: (path) => path.endsWith('/docente/herramientas'),
    steps: [
      {
        selector: '[data-tour="teacher-tools-header"]',
        title: 'Centro inteligente docente',
        copy: 'Esta vista concentra analisis, alertas y automatizaciones de apoyo docente.',
      },
      {
        selector: '[data-tour="teacher-tools-kpis"]',
        title: 'Senales clave',
        copy: 'Los indicadores resumen riesgos, tareas y oportunidades de intervencion.',
      },
      {
        selector: '[data-tour="teacher-tools-tabs"]',
        title: 'Modulos de herramienta',
        copy: 'Cambia entre alertas, agenda, automatizaciones, banco docente y analitica.',
      },
      {
        selector: '[data-tour="teacher-tools-content"]',
        title: 'Trabajo contextual',
        copy: 'Cada pestaña muestra filtros, listas y acciones relacionadas con su modulo.',
      },
    ],
  },
  {
    role: 'director',
    match: (path) => path.endsWith('/director/seguimiento'),
    steps: [
      {
        selector: '[data-tour="director-tracking-header"]',
        title: 'Seguimiento de cursos',
        copy: 'Aqui revisas el estado operativo de cursos y docentes asignados.',
      },
      {
        selector: '[data-tour="director-tracking-table"]',
        title: 'Tabla de seguimiento',
        copy: 'Usa la tabla para detectar cursos con bajo avance o actividad pendiente.',
      },
    ],
  },
  {
    role: 'director',
    match: (path) => path.endsWith('/director/reportes'),
    steps: [
      {
        selector: '[data-tour="director-reports-header"]',
        title: 'Reportes academicos',
        copy: 'Esta vista resume metricas y graficos para decisiones de direccion.',
      },
      {
        selector: '[data-tour="director-reports-kpis"]',
        title: 'Indicadores de reporte',
        copy: 'Revisa promedios, aprobacion y riesgos principales de la gestion.',
      },
      {
        selector: '[data-tour="director-reports-charts"]',
        title: 'Graficos directivos',
        copy: 'Compara rendimiento por curso y distribucion de estudiantes por rango.',
      },
    ],
  },
  {
    role: 'admin',
    match: (path) => path.endsWith('/admin/gestion'),
    steps: [
      {
        selector: '[data-tour="dashboard-hero"]',
        title: 'Gestion administrativa',
        copy: 'Este panel concentra estado operativo, usuarios, cursos e integraciones.',
      },
      {
        selector: '[data-tour="kpi-card"]',
        title: 'Indicadores del sistema',
        copy: 'Usa estos datos para revisar volumen, sincronizacion y salud general de la plataforma.',
      },
      {
        selector: '[data-tour="admin-course-management"]',
        title: 'Gestion de cursos',
        copy: 'Aqui se administran acciones frecuentes sobre cursos y procesos academicos.',
      },
      {
        selector: '[data-tour="admin-integrations"]',
        title: 'Integraciones externas',
        copy: 'Revisa el estado de conexiones previstas y logs de sincronizacion.',
      },
    ],
  },
]

const availableSteps = computed(() => {
  const path = route.path || ''
  const role = getRouteRole(path)
  const viewGroup = routeStepGroups.find((group) => group.role === role && group.match(path))

  if (path.includes('/dashboard')) {
    return [
      ...(roleDashboardSteps[role] ?? roleDashboardSteps.estudiante),
      layoutStartSteps[1],
      ...layoutEndSteps.slice(-1),
    ]
  }

  if (viewGroup) {
    return [
      ...viewGroup.steps,
      layoutStartSteps[1],
      ...layoutEndSteps.slice(-1),
    ]
  }

  return [...layoutStartSteps, ...layoutEndSteps]
})

const activeStep = computed(() => availableSteps.value[currentIndex.value] ?? availableSteps.value[0])
const activeStepNumber = computed(() => currentIndex.value + 1)
const isLastStep = computed(() => currentIndex.value === availableSteps.value.length - 1)

const spotlightStyle = computed(() => {
  if (!targetRect.value) return {}
  return {
    width: `${targetRect.value.width}px`,
    height: `${targetRect.value.height}px`,
    left: `${targetRect.value.left}px`,
    top: `${targetRect.value.top}px`,
  }
})

const panelStyle = computed(() => {
  if (!targetRect.value) return {}
  const gap = 18
  const panelWidth = 360
  const panelHeight = panelRef.value?.offsetHeight || 320
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const rightSpace = viewportWidth - targetRect.value.right
  const preferRight = rightSpace >= panelWidth + gap
  const left = preferRight
    ? targetRect.value.right + gap
    : Math.min(Math.max(16, targetRect.value.left), viewportWidth - panelWidth - 16)
  const top = preferRight
    ? Math.min(Math.max(16, targetRect.value.top), viewportHeight - panelHeight - 16)
    : getStackedPanelTop(targetRect.value, panelHeight, viewportHeight, gap)

  return {
    width: `${Math.min(panelWidth, viewportWidth - 32)}px`,
    left: `${left}px`,
    top: `${top}px`,
  }
})

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible) return
    currentIndex.value = 0
    await nextTick()
    await refreshTarget()
    animateOpen()
    window.addEventListener('resize', refreshTarget)
    window.addEventListener('scroll', refreshTarget, true)
  }
)

watch(
  () => route.path,
  async () => {
    if (!props.modelValue) return
    currentIndex.value = 0
    await refreshTarget()
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', refreshTarget)
  window.removeEventListener('scroll', refreshTarget, true)
})

async function goToStep(index) {
  if (index < 0 || index >= availableSteps.value.length) return
  currentIndex.value = index
  await refreshTarget()
  animateStep()
}

async function refreshTarget() {
  await nextTick()
  const step = activeStep.value
  const target = findBestTarget(step.selector)

  if (!target) {
    const nextAvailable = availableSteps.value.findIndex((item, idx) => idx > currentIndex.value && findBestTarget(item.selector))
    if (nextAvailable !== -1) {
      currentIndex.value = nextAvailable
      return refreshTarget()
    }
    targetRect.value = null
    return
  }

  const rect = target.getBoundingClientRect()
  const isOutOfView = rect.width <= 0 || rect.height <= 0 || rect.top < 12 || rect.bottom > window.innerHeight - 12 || rect.left < 12 || rect.right > window.innerWidth - 12
  if (isOutOfView) {
    target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
  }
  window.setTimeout(() => {
    const nextRect = target.getBoundingClientRect()
    const padding = 10
    targetRect.value = {
      top: Math.max(8, nextRect.top - padding),
      left: Math.max(8, nextRect.left - padding),
      right: Math.min(window.innerWidth - 8, nextRect.right + padding),
      bottom: Math.min(window.innerHeight - 8, nextRect.bottom + padding),
      width: Math.min(window.innerWidth - 16, nextRect.width + padding * 2),
      height: Math.min(window.innerHeight - 16, nextRect.height + padding * 2),
    }
  }, 180)
}

function findBestTarget(selector) {
  const candidates = Array.from(document.querySelectorAll(selector))
  if (!candidates.length) return null

  const visible = candidates
    .map((el) => {
      const rect = el.getBoundingClientRect()
      const style = window.getComputedStyle(el)
      if (
        rect.width <= 0 ||
        rect.height <= 0 ||
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        Number.parseFloat(style.opacity || '1') === 0
      ) {
        return null
      }

      const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0))
      const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0))
      const visibleArea = visibleWidth * visibleHeight
      if (visibleArea <= 0) return null

      return { el, score: visibleArea }
    })
    .filter(Boolean)

  if (!visible.length) return candidates[0]
  visible.sort((a, b) => b.score - a.score)
  return visible[0].el
}

function getRouteRole(path) {
  if (path.startsWith('/docente')) return 'docente'
  if (path.startsWith('/director')) return 'director'
  if (path.startsWith('/admin')) return 'admin'
  return 'estudiante'
}

function getStackedPanelTop(rect, panelHeight, viewportHeight, gap) {
  const below = rect.bottom + gap
  if (below + panelHeight <= viewportHeight - 16) return below

  const above = rect.top - panelHeight - gap
  if (above >= 16) return above

  return Math.max(16, viewportHeight - panelHeight - 16)
}

function animateOpen() {
  anime({
    targets: overlayRef.value,
    opacity: [0, 1],
    duration: 220,
    easing: 'easeOutCubic',
  })
  animateStep()
}

function animateStep() {
  anime.remove([spotlightRef.value, panelRef.value])
  anime({
    targets: spotlightRef.value,
    scale: [0.96, 1],
    opacity: [0.7, 1],
    duration: 420,
    easing: 'easeOutElastic(1, .7)',
  })
  anime({
    targets: panelRef.value,
    translateY: [10, 0],
    opacity: [0, 1],
    duration: 260,
    easing: 'easeOutCubic',
  })
}

function closeTour() {
  window.removeEventListener('resize', refreshTarget)
  window.removeEventListener('scroll', refreshTarget, true)
  emit('update:modelValue', false)
}
</script>
