export const ACTIVITY_INTERACTION = {
  tarea: {
    modo_interaccion: 'entrega',
    regla_completado: 'entrega_enviada',
    requiere_entrega: true,
    accion_label: 'Subir tarea',
    accion_icon: 'upload_file',
    accion_tooltip: 'Adjuntar o escribir la entrega',
    estado_realizado: 'entregada',
    grupo: 'Tareas',
  },
  cuestionario: {
    modo_interaccion: 'intento_sistema',
    regla_completado: 'intento_finalizado',
    requiere_entrega: false,
    accion_label: 'Iniciar cuestionario',
    accion_icon: 'quiz',
    accion_tooltip: 'Resolver dentro del sistema',
    estado_realizado: 'realizada',
    grupo: 'Cuestionarios',
  },
  foro: {
    modo_interaccion: 'participacion',
    regla_completado: 'hilo_o_respuesta',
    requiere_entrega: false,
    accion_label: 'Participar',
    accion_icon: 'forum',
    accion_tooltip: 'Crear un hilo o responder en el foro',
    estado_realizado: 'realizada',
    grupo: 'Foros',
  },
  encuesta: {
    modo_interaccion: 'respuesta_sistema',
    regla_completado: 'encuesta_enviada',
    requiere_entrega: false,
    accion_label: 'Responder encuesta',
    accion_icon: 'poll',
    accion_tooltip: 'Responder dentro del sistema',
    estado_realizado: 'realizada',
    grupo: 'Encuestas',
  },
  h5p: {
    modo_interaccion: 'interactivo',
    regla_completado: 'interaccion_completada',
    requiere_entrega: false,
    accion_label: 'Abrir interactivo',
    accion_icon: 'extension',
    accion_tooltip: 'Trabajar el contenido interactivo',
    estado_realizado: 'realizada',
    grupo: 'Interactivos',
  },
  leccion: {
    modo_interaccion: 'lectura',
    regla_completado: 'marcar_vista',
    requiere_entrega: false,
    accion_label: 'Marcar como vista',
    accion_icon: 'visibility',
    accion_tooltip: 'Leer y confirmar avance',
    estado_realizado: 'realizada',
    grupo: 'Lecciones',
  },
}

const trackedTypes = Object.keys(ACTIVITY_INTERACTION)
const doneStates = ['entregado', 'entregada', 'calificado', 'calificada', 'completado', 'realizada']

export function getActivityModel(actividad = {}) {
  const base = ACTIVITY_INTERACTION[actividad.tipo] || {
    modo_interaccion: 'recurso',
    regla_completado: 'consulta',
    requiere_entrega: false,
    accion_label: 'Abrir recurso',
    accion_icon: 'open_in_new',
    accion_tooltip: 'Ver recurso',
    estado_realizado: 'realizada',
    grupo: 'Recursos',
  }

  return {
    ...base,
    tipo: actividad.tipo || 'recurso',
    calificable: Boolean(actividad.tiene_nota),
    fecha_limite: getActivityDueDate(actividad),
    puntuacion: Number(actividad.nota_maxima || 0),
  }
}

export function withActivityModel(actividad = {}) {
  const modelo = getActivityModel(actividad)
  return {
    ...actividad,
    modo_interaccion: modelo.modo_interaccion,
    regla_completado: modelo.regla_completado,
    requiere_entrega: modelo.requiere_entrega,
    accion_label: modelo.accion_label,
    accion_icon: modelo.accion_icon,
    accion_tooltip: modelo.accion_tooltip,
    fechaLimite: modelo.fecha_limite,
    puntuacion: modelo.puntuacion,
  }
}

export function getActivityDueDate(actividad = {}) {
  return actividad.config?.fecha_limite || actividad.config?.fecha_entrega || actividad.config?.fecha_cierre || null
}

export function isTrackedActivity(actividad = {}) {
  if (!trackedTypes.includes(actividad.tipo)) return false
  if (actividad.tipo === 'leccion') return actividad.config?.seguimiento_requerido !== false
  return actividad.config?.seguimiento_requerido !== false
}

export function isOverdue(fecha) {
  if (!fecha) return false
  return new Date(fecha) < new Date()
}

export function isDoneState(estado) {
  return doneStates.includes(estado)
}

function forumParticipation(hilos = [], estudianteId) {
  return hilos.some(
    (hilo) =>
      hilo.autorId === estudianteId ||
      (hilo.respuestas || []).some((respuesta) => respuesta.autorId === estudianteId),
  )
}

export function getStudentActivityState({
  actividad,
  estudianteId,
  entregas = [],
  hilosForo = {},
  respuestasEncuestas = {},
  progresoEstudiante = {},
} = {}) {
  if (!actividad || !estudianteId) return 'pendiente'

  const entrega = entregas.find((item) => item.estudiante_id === estudianteId && item.actividad_id === actividad.id)
  const fechaLimite = getActivityDueDate(actividad)

  if (actividad.tipo === 'foro') {
    const hilos = hilosForo[actividad.id] || actividad.config?.hilos || []
    if (forumParticipation(hilos, estudianteId) || isDoneState(entrega?.estado)) return entrega?.estado === 'calificado' ? 'calificada' : 'realizada'
    return isOverdue(fechaLimite) ? 'vencida' : 'pendiente'
  }

  if (actividad.tipo === 'encuesta') {
    const key = `${estudianteId}-${actividad.id}`
    if (respuestasEncuestas[key] || isDoneState(entrega?.estado)) return 'realizada'
    return isOverdue(fechaLimite) ? 'vencida' : 'pendiente'
  }

  if (actividad.tipo === 'leccion' || actividad.tipo === 'h5p') {
    if (progresoEstudiante[estudianteId]?.[actividad.id] === 'completado' || isDoneState(entrega?.estado)) return 'realizada'
    return isOverdue(fechaLimite) ? 'vencida' : 'pendiente'
  }

  if (actividad.tipo === 'cuestionario') {
    if (entrega?.estado === 'calificado') return 'calificada'
    if (isDoneState(entrega?.estado)) return 'realizada'
    return isOverdue(fechaLimite) ? 'vencida' : 'pendiente'
  }

  if (actividad.tipo === 'tarea') {
    if (entrega?.estado === 'calificado') return 'calificada'
    if (isDoneState(entrega?.estado)) return 'entregada'
    return isOverdue(fechaLimite) ? 'vencida' : 'pendiente'
  }

  return isDoneState(entrega?.estado) ? 'realizada' : 'pendiente'
}

export function getCourseCounters({ curso, actividades = [], estudianteId, entregas, hilosForo, respuestasEncuestas, progresoEstudiante } = {}) {
  const seccionIds = curso?.secciones?.map((seccion) => seccion.id) || []
  const tracked = actividades.filter((actividad) => seccionIds.includes(actividad.seccion_id) && isTrackedActivity(actividad))
  const realizadas = tracked.filter((actividad) => isDoneState(getStudentActivityState({ actividad, estudianteId, entregas, hilosForo, respuestasEncuestas, progresoEstudiante }))).length
  const vencidas = tracked.filter((actividad) => getStudentActivityState({ actividad, estudianteId, entregas, hilosForo, respuestasEncuestas, progresoEstudiante }) === 'vencida').length
  return {
    total: tracked.length,
    realizadas,
    pendientes: Math.max(tracked.length - realizadas, 0),
    vencidas,
    labelRealizadas: `${realizadas}/${tracked.length}`,
    labelPendientes: `${Math.max(tracked.length - realizadas, 0)}/${tracked.length}`,
  }
}
