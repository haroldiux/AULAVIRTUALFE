<template>
  <div>
    <!-- Barra de control flotante que indica que el modo inspector está activo -->
    <Teleport to="body">
      <transition name="fade-slide">
        <div v-if="modelValue && !modalOpen" class="ayuda-inspector-bar shadow-5">
          <div class="row items-center no-wrap q-gutter-md">
            <q-avatar size="32px" color="primary" text-color="white" class="animate-pulse">
              <q-icon name="explore" size="20px" />
            </q-avatar>
            <div class="col">
              <div class="text-subtitle2 text-weight-bold text-white row items-center">
                <span class="text-turquoise q-mr-sm">🔎</span> Lupa de Ayuda Activa
              </div>
              <div class="text-caption text-grey-3 lt-sm">Toca un elemento resaltado para ver la ayuda.</div>
              <div class="text-caption text-grey-3 gt-xs">Mueve el cursor y haz clic sobre cualquier elemento con brillo turquesa para ver su explicación.</div>
            </div>
            <div class="row q-gutter-sm items-center">
              <q-chip dense outline color="grey-3" text-color="white" class="gt-xs text-xs">
                ESC para salir
              </q-chip>
              <q-btn
                unelevated
                dense
                no-caps
                color="negative"
                label="Salir"
                icon="close"
                class="q-px-sm rounded-borders text-caption text-weight-bold"
                @click="desactivarInspector"
              />
            </div>
          </div>
        </div>
      </transition>

      <!-- Tooltip flotante al lado del cursor -->
      <div
        v-if="modelValue && hoveredTarget && !modalOpen"
        class="ayuda-cursor-tooltip shadow-4"
        :style="tooltipStyle"
      >
        <q-icon name="help_outline" size="14px" color="turquoise" class="q-mr-xs" />
        <span>Explicar: <strong>{{ hoveredTitle }}</strong></span>
      </div>

      <!-- Diálogo modal premium de explicación -->
      <q-dialog v-model="modalOpen" persistent @hide="onModalHide" class="ayuda-modal">
        <q-card class="ayuda-card relative-position overflow-hidden">
          <!-- Efecto de fondo sutil turquesa/morado -->
          <div class="ayuda-card__glow" />

          <q-card-section class="row items-center q-pb-none relative-position">
            <q-avatar color="primary-light" text-color="primary" class="q-mr-md">
              <q-icon name="tips_and_updates" size="28px" class="text-primary-gradient" />
            </q-avatar>
            <div class="col">
              <div class="text-caption text-primary text-weight-bolder uppercase tracking-widest" style="font-size: 0.7rem">Ayuda Contextual</div>
              <div class="text-h6 text-weight-bolder text-strong q-mt-xs">{{ activeHelp.title }}</div>
            </div>
            <q-btn flat round dense icon="close" color="grey-6" @click="cerrarModal(false)">
              <q-tooltip>Cerrar</q-tooltip>
            </q-btn>
          </q-card-section>

          <q-card-section class="q-py-md text-body1 text-soft relative-position" style="line-height: 1.6;">
            <p>{{ activeHelp.text }}</p>

            <!-- Tip / Consejo destacado -->
            <div v-if="activeHelp.tip" class="ayuda-tip-box q-pa-sm q-mt-md rounded-borders">
              <div class="row no-wrap items-start">
                <q-icon name="lightbulb" color="amber-8" size="sm" class="q-mr-sm q-mt-xs" />
                <div>
                  <div class="text-subtitle2 text-amber-9 font-weight-bold">Sugerencia práctica</div>
                  <div class="text-caption text-amber-9" style="line-height: 1.4;">{{ activeHelp.tip }}</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md q-gutter-sm border-top relative-position">
            <q-btn
              flat
              no-caps
              color="grey-7"
              label="Salir de la Lupa"
              @click="cerrarModal(true)"
            />
            <q-btn
              unelevated
              no-caps
              color="primary"
              label="Seguir explorando"
              icon="explore"
              class="q-px-md text-weight-bold"
              @click="cerrarModal(false)"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const modalOpen = ref(false)
const hoveredTarget = ref(null)
const hoveredTitle = ref('')
const mouseX = ref(0)
const mouseY = ref(0)

const activeHelp = ref({
  title: '',
  text: '',
  tip: ''
})

// Registro de ayuda por selectores por defecto
const helpRegistry = [
  {
    selector: '[data-tour="brand"]',
    title: 'Identidad UNITEPC',
    text: 'Identifica que te encuentras en el Aula Virtual de la UNITEPC. Al hacer clic te orienta en el sistema.',
    tip: 'El diseño responde a los colores institucionales y mantiene tu sesión activa.'
  },
  {
    selector: '[data-tour="sidebar"]',
    title: 'Menú de Navegación Lateral',
    text: 'Permite moverte entre las diferentes secciones disponibles para tu rol actual (Dashboard, Cursos, Calificaciones, Herramientas, etc.).',
    tip: 'En pantallas pequeñas, puedes colapsar el menú para maximizar el espacio de trabajo.'
  },
  {
    selector: '[data-tour="global-search"]',
    title: 'Buscador Inteligente',
    text: 'Busca rápidamente cursos, actividades o comandos dentro del Aula Virtual sin navegar manualmente.',
    tip: 'Puedes presionar Ctrl+K o ⌘K para abrirlo directamente en cualquier momento.'
  },
  {
    selector: '[data-tour="notifications"]',
    title: 'Panel de Notificaciones',
    text: 'Muestra avisos en tiempo real sobre entregas pendientes, mensajes nuevos o actualizaciones de tus materias.',
    tip: 'Usa el botón de la doble marca de verificación en la esquina superior para marcar todas como leídas a la vez.'
  },
  {
    selector: '[data-tour="tutorial-button"]',
    title: 'Botón de Tutoriales y Ayuda',
    text: 'Abre este menú de ayuda interactiva. Permite iniciar la guía paso a paso o activar el inspector de lupa.',
    tip: 'Si olvidas cómo usar una sección, la lupa es la forma más rápida de obtener una respuesta directa.'
  },
  {
    selector: '[data-tour="profile"]',
    title: 'Perfil y Configuración de Usuario',
    text: 'Accede a tu avatar, información de perfil, estadísticas semanales de actividad y la opción de cerrar sesión.',
    tip: 'Aquí puedes ver un gráfico con tu tiempo de conexión e interactuar con instructores recomendados.'
  },
  {
    selector: '.block-palette',
    title: 'Paleta de Bloques de Construcción',
    text: 'Tu biblioteca de recursos y actividades del curso. Desde aquí puedes arrastrar elementos como Lecciones, Foros, Tareas, Evaluaciones y contenido H5P hacia el lienzo central.',
    tip: 'Los bloques están agrupados en Actividades (calificables o de aprendizaje), Contenido informativo y Elementos Estructurales.'
  },
  {
    selector: '.builder-canvas',
    title: 'Lienzo de Diseño (Canvas)',
    text: 'El área visual interactiva donde construyes la secuencia de tu materia. Puedes organizar el contenido en secciones y arrastrar bloques entre ellas de forma dinámica.',
    tip: 'Los bloques se pueden reordenar en cualquier momento y los cambios se reflejan al instante en la estructura del curso.'
  },
  {
    selector: '.canvas-seccion',
    title: 'Sección Académica (Módulo)',
    text: 'Representa una unidad temática, semana o tema del curso. Agrupa y organiza las actividades y recursos que tus estudiantes verán.',
    tip: 'Usa el icono del lápiz a la derecha para renombrar la sección o el botón rojo de basura para eliminarla.'
  },
  {
    selector: '.canvas-bloque',
    title: 'Bloque Académico',
    text: 'Representa una actividad interactiva o recurso dentro de una sección. Puedes editar sus parámetros como la fecha de entrega, descripción o nota máxima presionando el botón "Editar".',
    tip: 'Los bloques tienen colores y etiquetas visuales para identificar su tipo (ej. Naranja para Tareas, Rosa para H5P).'
  },
  {
    selector: '.drag-handle, .bloque-drag',
    title: 'Tirador de Arrastre (Drag Handle)',
    text: 'Permite reordenar el elemento dentro del lienzo. Haz clic sostenido sobre este tirador de puntos y arrastra el elemento arriba o abajo.',
    tip: 'Puedes arrastrar bloques fuera de su sección original y soltarlos en otra sección del canvas de forma fluida.'
  },
  {
    selector: '[data-tour="teacher-builder-mode"]',
    title: 'Selector de Modo de Edición',
    text: 'Permite cambiar la vista de construcción del curso. Puedes elegir "Estructura Simple" (lista ordenada clásica) o "Canvas" (interfaz gráfica de arrastrar y soltar).',
    tip: 'El modo Canvas es ideal para estructurar visualmente la materia, mientras que la vista simple es rápida para hacer ediciones rápidas.'
  },
  {
    selector: '[data-tour="teacher-builder-header"]',
    title: 'Cabecera de Edición de Curso',
    text: 'Desde aquí puedes gestionar el estado de publicación de tu curso, previsualizar la vista del estudiante o sincronizar los alumnos inscritos.',
    tip: 'Consejo: El botón "Previsualizar" te permite ver el curso tal como lo experimentaría un alumno.'
  },
  {
    selector: '[data-tour="teacher-builder-structure"]',
    title: 'Estructura Simple del Curso',
    text: 'Organiza los contenidos del curso en formato de lista secuencial. Te permite añadir secciones, actividades o recursos de forma ágil.',
    tip: 'Consejo: Puedes cambiar al modo Canvas en cualquier momento si prefieres una edición gráfica de arrastrar y soltar.'
  },
  {
    selector: '[data-tour="teacher-courses-header"]',
    title: 'Mis Cursos Asignados',
    text: 'Panel de gestión para los docentes. Aquí visualizas todas las materias que tienes asignadas en la gestión actual y accedes a sus respectivas herramientas de edición.',
    tip: 'Consejo: Cada tarjeta de curso muestra indicadores rápidos del avance y número de estudiantes.'
  },
  {
    selector: '[data-tour="teacher-courses-list"]',
    title: 'Lista de Materias',
    text: 'Muestra las tarjetas con información resumida de cada materia, incluyendo si está publicada o en borrador.',
    tip: 'Haz clic en "Builder" para ingresar al diseñador o en "Calificaciones" para ver las notas.'
  },
  {
    selector: '[data-tour="teacher-course-actions"]',
    title: 'Acciones de Curso',
    text: 'Botones de acceso rápido para editar la estructura del curso (Builder) o gestionar las calificaciones directamente.',
    tip: 'El botón de Builder abre la interfaz interactiva de diseño de lecciones.'
  },
  {
    selector: '[data-tour="teacher-grades-header"]',
    title: 'Libro de Calificaciones',
    text: 'Permite visualizar, registrar y exportar las notas de los estudiantes de manera centralizada. Puedes sincronizar las notas directamente con el sistema académico.',
    tip: 'Usa el botón de exportación para descargar la planilla en formato Excel o CSV.'
  },
  {
    selector: '[data-tour="teacher-grades-summary"]',
    title: 'Resumen de Calificaciones',
    text: 'Filtros y estadísticas rápidas sobre el promedio del curso, porcentaje de aprobación y tareas pendientes por calificar.',
    tip: 'Selecciona el curso deseado en el selector para cargar sus respectivas notas.'
  },
  {
    selector: '[data-tour="teacher-grades-table"]',
    title: 'Matriz de Calificaciones',
    text: 'Tabla interactiva donde cada fila es un estudiante y cada columna representa una actividad calificada del curso.',
    tip: 'Las notas se pueden ingresar o modificar haciendo doble clic sobre las celdas.'
  },
  {
    selector: '[data-tour="teacher-grades-charts"]',
    title: 'Distribución de Rendimiento',
    text: 'Gráficos analíticos que comparan el desempeño general de los alumnos e identifican las actividades con menor promedio.',
    tip: 'Útil para detectar si un tema específico causó dificultades generalizadas en el curso.'
  },
  {
    selector: '[data-tour="teacher-tools-header"]',
    title: 'Centro Inteligente Docente',
    text: 'Sección con utilidades de analítica predictiva, automatizaciones, alertas de riesgo académico y banco de preguntas de la UNITEPC.',
    tip: 'Aquí puedes configurar notificaciones automáticas para estudiantes con bajo rendimiento.'
  },
  {
    selector: '[data-tour="teacher-tools-kpis"]',
    title: 'KPIs de Apoyo Académico',
    text: 'Resumen con alertas críticas de estudiantes en riesgo de abandono o reprobación, y tareas acumuladas sin revisar.',
    tip: 'Presta atención a la tarjeta de estudiantes en riesgo para realizar tutorías preventivas.'
  },
  {
    selector: '[data-tour="teacher-tools-tabs"]',
    title: 'Módulos Docentes',
    text: 'Pestañas para alternar entre Alertas, Agenda, Reglas de Automatización, Banco de Preguntas SISA y Analíticas Avanzadas.',
    tip: 'El banco SISA te permite importar reactivos de exámenes directamente a tus evaluaciones.'
  },
  {
    selector: '[data-tour="teacher-tools-content"]',
    title: 'Panel de Control',
    text: 'Espacio interactivo donde realizas las configuraciones específicas del módulo seleccionado.',
    tip: 'En la sección de automatizaciones puedes crear una regla con pocos clics.'
  },
  {
    selector: '[data-tour="student-courses-header"]',
    title: 'Tus Cursos Matriculados',
    text: 'Sección donde el estudiante visualiza todas las asignaturas inscritas en el periodo académico vigente.',
    tip: 'Consejo: Las barras de progreso en cada tarjeta te ayudan a saber cuánto te falta para terminar.'
  },
  {
    selector: '[data-tour="student-courses-list"]',
    title: 'Materias en Curso',
    text: 'Muestra las asignaturas con su respectivo docente, periodo y un resumen de las lecciones completadas.',
    tip: 'Haz clic en "Entrar al curso" para abrir los contenidos.'
  },
  {
    selector: '[data-tour="student-course-progress"]',
    title: 'Avance del Curso',
    text: 'Indica el porcentaje de actividades completadas y lecciones leídas dentro de la materia.',
    tip: 'Recuerda que algunas actividades requieren revisión manual del docente antes de marcarse como completadas.'
  },
  {
    selector: '[data-tour="student-course-header"]',
    title: 'Cabecera de la Materia',
    text: 'Muestra el nombre de la asignatura abierta y la ruta de navegación para regresar al listado general.',
    tip: 'Desde aquí puedes ver la información del docente y el programa analítico.'
  },
  {
    selector: '[data-tour="student-course-sidebar"]',
    title: 'Índice de Contenidos',
    text: 'Menú lateral interactivo que muestra las secciones, temas, lecciones y tareas pendientes de la materia.',
    tip: 'Los iconos verdes indican que el recurso ya fue completado.'
  },
  {
    selector: '[data-tour="student-course-content"]',
    title: 'Visor de Contenido y Actividades',
    text: 'Área principal donde interactúas con las lecturas, reproduces videos, realizas cuestionarios y entregas tus tareas.',
    tip: 'Asegúrate de leer bien las rúbricas y criterios de evaluación antes de subir tus entregas.'
  },
  {
    selector: '[data-tour="student-notes-header"]',
    title: 'Planilla de Notas del Estudiante',
    text: 'Muestra un reporte oficial y consolidado de tus calificaciones obtenidas a lo largo del periodo actual.',
    tip: 'Puedes ver el desglose por categorías: formativas teóricas, formativas prácticas y exámenes.'
  },
  {
    selector: '[data-tour="student-notes-kpis"]',
    title: 'Resumen de Rendimiento',
    text: 'KPIs con tu promedio general actual, porcentaje de tareas entregadas y estado de aprobación de tus materias.',
    tip: 'El promedio mínimo de aprobación general en la UNITEPC es de 51 puntos.'
  },
  {
    selector: '[data-tour="student-notes-course"]',
    title: 'Notas por Materia',
    text: 'Agrupación detallada de notas para cada asignatura. Te permite ver el promedio específico de cada materia.',
    tip: 'Haz clic en el acordeón para ver las notas individuales de cada lección o tarea.'
  },
  {
    selector: '[data-tour="student-notes-table"]',
    title: 'Detalle de Tareas y Cuestionarios',
    text: 'Listado exhaustivo que detalla la nota obtenida, la nota máxima y la retroalimentación del docente para cada actividad.',
    tip: 'Revisa siempre las observaciones de tus docentes para mejorar en tus siguientes entregas.'
  },
  {
    selector: '[data-tour="student-notes-distribution"]',
    title: 'Distribución de Logros',
    text: 'Gráficos comparativos que muestran tus materias aprobadas frente a las que requieren refuerzo académico.',
    tip: 'Te ayuda a balancear el tiempo de estudio asignando más horas a las materias de menor promedio.'
  },
  {
    selector: '[data-tour="director-tracking-header"]',
    title: 'Seguimiento Académico Institucional',
    text: 'Panel de monitoreo para Directores de Carrera. Permite supervisar el avance de sílabos y el nivel de interacción en las aulas virtuales.',
    tip: 'Permite filtrar por docente, materia o nivel de riesgo académico.'
  },
  {
    selector: '[data-tour="director-tracking-table"]',
    title: 'Reporte Operativo de Aulas',
    text: 'Matriz de control que lista los cursos, docentes asignados, porcentaje de avance real y número de alumnos en riesgo.',
    tip: 'Puedes presionar sobre un docente para enviarle un recordatorio de actualización de contenidos.'
  },
  {
    selector: '[data-tour="director-reports-header"]',
    title: 'Reportería Directiva y Acreditación',
    text: 'Módulo de estadísticas agregadas diseñado para auditorías internas, procesos de acreditación y toma de decisiones de la facultad.',
    tip: 'Los reportes cumplen con los estándares exigidos por el Ministerio de Educación.'
  },
  {
    selector: '[data-tour="director-reports-kpis"]',
    title: 'Indicadores Globales de Facultad',
    text: 'Muestra la tasa de aprobación institucional, índice de retención de alumnos y participación global en el LMS.',
    tip: 'Los datos se actualizan en tiempo real conforme los docentes publican calificaciones.'
  },
  {
    selector: '[data-tour="director-reports-charts"]',
    title: 'Distribución de Calificaciones de Carrera',
    text: 'Gráficos de campana y barras que analizan la distribución de notas en los diferentes niveles de la carrera.',
    tip: 'Ayuda a identificar si existe alguna asignatura con una desviación inusual de reprobados.'
  },
  {
    selector: '[data-tour="admin-course-management"]',
    title: 'Consola de Gestión de Cursos',
    text: 'Herramienta administrativa para crear, migrar o archivar materias del LMS. Permite asignar docentes y configurar periodos lectivos.',
    tip: 'Desde aquí puedes clonar estructuras de cursos aprobadas en gestiones anteriores.'
  },
  {
    selector: '[data-tour="admin-integrations"]',
    title: 'Integraciones del Sistema',
    text: 'Monitoreo de conexiones y sincronizaciones con la base de datos central SISA de la UNITEPC, pasarelas de correo y logs operativos.',
    tip: 'Revisa el estado de la API SISA si notas demoras en la matriculación de alumnos.'
  },
  {
    selector: '[data-tour="chart-card"]',
    title: 'Módulo de Analítica y Gráficos',
    text: 'Muestra resúmenes visuales del rendimiento académico, avance de la materia y distribución de notas o entregas.',
    tip: 'Pasa el cursor sobre las barras o líneas para ver detalles y números específicos en los puntos de datos.'
  },
  {
    selector: '[data-tour="kpi-card"]',
    title: 'Indicador Clave (KPI)',
    text: 'Tarjeta de resumen con números destacados sobre materias matriculadas, pendientes por calificar, promedio global o alertas del curso.',
    tip: 'El color turquesa/verde indica que el valor es saludable, mientras que el rojo o naranja señala ítems urgentes que requieren atención.'
  }
]

// Estilos del tooltip flotante respecto al ratón
const tooltipStyle = computed(() => {
  return {
    left: `${mouseX.value + 15}px`,
    top: `${mouseY.value + 15}px`
  }
})

// Observador para activar/desactivar escuchas globales
watch(() => props.modelValue, (val) => {
  if (val) {
    activarEscuchas()
  } else {
    desactivarEscuchas()
  }
})

function desactivarInspector() {
  emit('update:modelValue', false)
}

function activarEscuchas() {
  document.body.classList.add('ayuda-inspector-active')
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('mouseover', onMouseOver, { passive: true })
  window.addEventListener('click', onClick, { capture: true })
  window.addEventListener('keydown', onKeyDown)
}

function desactivarEscuchas() {
  document.body.classList.remove('ayuda-inspector-active')
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseover', onMouseOver)
  window.removeEventListener('click', onClick, { capture: true })
  window.removeEventListener('keydown', onKeyDown)
  limpiarResaltado()
}

onBeforeUnmount(() => {
  desactivarEscuchas()
})

// Control del cursor
function onMouseMove(e) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

// Búsqueda del elemento con ayuda (recursivo hacia padres)
function findHelpTarget(el) {
  if (!el || el === document.body || el === document.documentElement) return null
  
  // 1. Si tiene data-help y no está vacío, es válido
  if (el.hasAttribute && el.hasAttribute('data-help') && el.getAttribute('data-help').trim() !== '') {
    return el
  }
  
  // 2. Si coincide con algún selector del registro de ayuda predefinido
  for (const item of helpRegistry) {
    if (el.matches && el.matches(item.selector)) {
      if (item.text && item.text.trim() !== '') {
        return el
      }
    }
  }
  
  // 3. Subir recursivamente
  if (el.parentElement) {
    return findHelpTarget(el.parentElement)
  }
  return null
}

function onMouseOver(e) {
  if (modalOpen.value) return
  
  const target = findHelpTarget(e.target)
  if (target) {
    if (hoveredTarget.value !== target) {
      limpiarResaltado()
      hoveredTarget.value = target
      target.classList.add('ayuda-highlight')
      
      // Obtener título para el tooltip
      if (target.hasAttribute('data-help-title')) {
        hoveredTitle.value = target.getAttribute('data-help-title')
      } else if (target.hasAttribute('data-help')) {
        hoveredTitle.value = 'Detalle'
      } else {
        // Encontrar en el registro
        const item = helpRegistry.find(r => target.matches(r.selector))
        hoveredTitle.value = item ? item.title : 'Elemento'
      }
    }
  } else {
    limpiarResaltado()
  }
}

function limpiarResaltado() {
  if (hoveredTarget.value) {
    hoveredTarget.value.classList.remove('ayuda-highlight')
    hoveredTarget.value = null
  }
}

// Click del inspector
function onClick(e) {
  if (!props.modelValue || modalOpen.value) return
  
  const target = findHelpTarget(e.target)
  if (target) {
    // Detener la acción normal del elemento
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    // Obtener datos
    let title = ''
    let text = ''
    let tip = ''
    
    if (target.hasAttribute('data-help')) {
      title = target.getAttribute('data-help-title') || 'Ayuda Contextual'
      text = target.getAttribute('data-help')
      tip = target.getAttribute('data-help-tip') || ''
    } else {
      const item = helpRegistry.find(r => target.matches(r.selector))
      if (item) {
        title = item.title
        text = item.text
        tip = item.tip || ''
      }
    }
    
    activeHelp.value = { title, text, tip }
    
    // Quitar el resaltado inmediatamente para evitar sobreposición con el modal
    limpiarResaltado()
    
    // Pausar cursor y resaltado
    document.body.classList.remove('ayuda-inspector-active')
    
    // Abrir Modal
    modalOpen.value = true
  }
}

function onKeyDown(e) {
  if (e.key === 'Escape') {
    if (modalOpen.value) {
      cerrarModal(false)
    } else {
      desactivarInspector()
    }
  }
}

function cerrarModal(salirCompletamente = false) {
  modalOpen.value = false
  if (salirCompletamente) {
    desactivarInspector()
  } else {
    // Restaurar cursor de lupa
    if (props.modelValue) {
      document.body.classList.add('ayuda-inspector-active')
    }
  }
}

function onModalHide() {
  // Asegurar que si cierran el modal tocando fuera, volvemos a evaluar el cursor
  if (props.modelValue && !modalOpen.value) {
    document.body.classList.add('ayuda-inspector-active')
  }
}
</script>

<style scoped>
/* Controles de barra flotante */
.ayuda-inspector-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(13, 148, 136, 0.4);
  border-radius: 16px;
  padding: 12px 18px;
  z-index: 99998;
  max-width: 90vw;
  width: 580px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.text-turquoise {
  color: var(--brand-unitepc-turquoise);
}

/* Tooltip flotante al lado de la lupa */
.ayuda-cursor-tooltip {
  position: fixed;
  pointer-events: none;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid var(--brand-unitepc-turquoise);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  z-index: 999999;
  white-space: nowrap;
  transition: opacity 0.15s ease;
}

/* Diálogo de ayuda */
.ayuda-card {
  width: 480px;
  max-width: 90vw;
  border-radius: 24px;
  border: 1px solid var(--ta-border-card);
  background: var(--ta-bg-card);
  color: var(--text-strong) !important;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}

.ayuda-card__glow {
  position: absolute;
  top: -120px;
  right: -120px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, rgba(107, 63, 160, 0.05) 50%, transparent 100%);
  pointer-events: none;
}

.text-soft {
  color: var(--text-soft) !important;
}

.text-strong {
  color: var(--text-strong) !important;
}

.ayuda-tip-box {
  background: rgba(245, 158, 11, 0.08);
  border-left: 4px solid #f59e0b;
}

:global(.body--dark) .ayuda-tip-box {
  background: rgba(245, 158, 11, 0.16) !important;
}

.text-amber-9 {
  color: #b45309 !important; /* Ámbar oscuro y contrastado en modo claro */
}

:global(.body--dark) .text-amber-9 {
  color: #fbbf24 !important; /* Ámbar brillante en modo oscuro */
}

.primary-light {
  background: rgba(var(--primary-rgb), 0.1);
}

.text-primary-gradient {
  color: var(--ta-primary);
}


/* Animaciones */
@keyframes slideUp {
  from {
    transform: translate(-50%, 40px);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  transform: translate(-50%, 40px);
  opacity: 0;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(13, 148, 136, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(13, 148, 136, 0);
  }
}
</style>
