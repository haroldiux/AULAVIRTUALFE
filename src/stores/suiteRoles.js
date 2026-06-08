import { defineStore } from 'pinia'
import {
  actividades as mockActividades,
  calificaciones as mockCalificaciones,
  cursos as mockCursos,
  entregasEstudiante as mockEntregas,
  matriculas as mockMatriculas,
  usuarios as mockUsuarios,
} from 'src/mock/index.js'
import { getCourseCounters, getStudentActivityState, isDoneState, isTrackedActivity, withActivityModel } from 'src/utils/activityModel'

const configuracionesIniciales = [
  { id: 'sisa', nombre: 'SISA academico', tipo: 'Integracion', estado: 'online', ultimoSync: '2026-06-08T08:10:00', responsable: 'Admin Sistema' },
  { id: 'estudiantes', nombre: 'Sistema de estudiantes', tipo: 'Integracion', estado: 'degradado', ultimoSync: '2026-06-08T07:40:00', responsable: 'Admin Sistema' },
  { id: 'notas', nombre: 'Notas centralizadas', tipo: 'Integracion', estado: 'online', ultimoSync: '2026-06-07T18:25:00', responsable: 'Admin Sistema' },
  { id: 'notificaciones', nombre: 'Notificaciones academicas', tipo: 'Servicio', estado: 'online', ultimoSync: '2026-06-08T09:00:00', responsable: 'Bienestar academico' },
]

const herramientasContenido = [
  { id: 'tema-guiado', tipo: 'estructural', nombre: 'Tema guiado', descripcion: 'Crea una unidad con objetivo, lectura, tarea y cierre reflexivo.', icon: 'schema', color: 'primary' },
  { id: 'micro-leccion', tipo: 'contenido', nombre: 'Micro-leccion', descripcion: 'Bloque corto con lectura, ejemplo, recurso y comprobacion.', icon: 'article', color: 'indigo' },
  { id: 'proyecto-grupal', tipo: 'actividad', nombre: 'Proyecto grupal', descripcion: 'Entrega colaborativa con hitos, rubrica y roles del equipo.', icon: 'groups', color: 'teal' },
  { id: 'asistencia', tipo: 'actividad', nombre: 'Asistencia participativa', descripcion: 'Registro de asistencia con observaciones y participacion.', icon: 'how_to_reg', color: 'green' },
  { id: 'glosario', tipo: 'contenido', nombre: 'Glosario colaborativo', descripcion: 'Terminos clave construidos por estudiantes y validados por docente.', icon: 'menu_book', color: 'purple' },
  { id: 'video-interactivo', tipo: 'contenido', nombre: 'Video interactivo', descripcion: 'Video con pausas, preguntas y seguimiento de avance.', icon: 'smart_display', color: 'pink' },
]

function docenteDeCurso(curso) {
  return mockUsuarios.find((usuario) => usuario.id === curso.docente_id)
}

function estudiantesCurso(cursoId) {
  const ids = mockMatriculas.filter((m) => m.curso_id === cursoId && m.estado === 'activo').map((m) => m.estudiante_id)
  return mockUsuarios.filter((u) => ids.includes(u.id))
}

function actividadesCurso(curso) {
  const seccionIds = curso.secciones.map((seccion) => seccion.id)
  return mockActividades.filter((actividad) => seccionIds.includes(actividad.seccion_id))
}

function evaluablesForo(cursos) {
  const seccionIds = cursos.flatMap((curso) => curso.secciones.map((seccion) => seccion.id))
  return mockActividades.filter((actividad) => seccionIds.includes(actividad.seccion_id) && actividad.tipo === 'foro')
}

function promedioEstudiante(cursoId, estudianteId) {
  const notas = Object.values(mockCalificaciones[cursoId]?.[estudianteId] || {})
  if (!notas.length) return 0
  return Math.round(notas.reduce((sum, nota) => sum + Number(nota.porcentaje || 0), 0) / notas.length)
}

function estadoActividad(estudianteId, actividad) {
  return getStudentActivityState({
    actividad,
    estudianteId,
    entregas: mockEntregas,
  })
}

function diasSimulados(seed) {
  const valores = [1, 3, 5, 7, 11, 14, 2, 6, 9, 16]
  return valores[seed % valores.length]
}

export const useSuiteRolesStore = defineStore('suiteRoles', {
  state: () => ({
    configuraciones: configuracionesIniciales.map((item) => ({ ...item })),
    herramientasContenido: herramientasContenido.map((item) => ({ ...item })),
    acciones: [],
  }),

  getters: {
    centroEstudiante: () => (estudianteId) => {
      const matriculas = mockMatriculas.filter((m) => m.estudiante_id === estudianteId && m.estado === 'activo')
      const cursos = mockCursos.filter((curso) => matriculas.some((m) => m.curso_id === curso.id))
      const pendientes = []
      const entregas = []
      const tiposPendientes = {}
      const progresoCursos = cursos.map((curso) => {
        const evaluables = actividadesCurso(curso).filter(isTrackedActivity)
        const contadores = getCourseCounters({ curso, actividades: mockActividades, estudianteId, entregas: mockEntregas })
        evaluables.forEach((actividad) => {
          const estado = estadoActividad(estudianteId, actividad)
          const item = {
            ...withActivityModel(actividad),
            id: `${curso.id}-${actividad.id}`,
            cursoId: curso.id,
            curso: curso.nombre,
            codigo: curso.codigo,
            actividadId: actividad.id,
            titulo: actividad.titulo,
            tipo: actividad.tipo,
            fecha: actividad.config?.fecha_limite || actividad.config?.fecha_entrega || actividad.config?.fecha_cierre || null,
            estado,
            nota: mockCalificaciones[curso.id]?.[estudianteId]?.[actividad.id]?.nota ?? null,
            notaMaxima: actividad.nota_maxima || null,
          }
          if (!isDoneState(estado)) {
            pendientes.push(item)
            tiposPendientes[actividad.tipo] = (tiposPendientes[actividad.tipo] || 0) + 1
          }
          else entregas.push(item)
        })
        return {
          id: curso.id,
          codigo: curso.codigo,
          nombre: curso.nombre,
          docente: docenteDeCurso(curso)?.nombre || 'Docente asignado',
          contadores,
          progreso: contadores.labelRealizadas,
          pendientes: contadores.labelPendientes,
          promedio: promedioEstudiante(curso.id, estudianteId),
        }
      })
      const totalRealizadas = progresoCursos.reduce((sum, curso) => sum + curso.contadores.realizadas, 0)
      const totalActividades = progresoCursos.reduce((sum, curso) => sum + curso.contadores.total, 0)
      return {
        cursos: progresoCursos,
        pendientes: pendientes.sort((a, b) => new Date(a.fecha || '2999-01-01') - new Date(b.fecha || '2999-01-01')),
        entregas: entregas.sort((a, b) => new Date(b.fecha || '1900-01-01') - new Date(a.fecha || '1900-01-01')),
        tiposPendientes,
        resumen: {
          realizadas: totalRealizadas,
          total: totalActividades,
          pendientes: Math.max(totalActividades - totalRealizadas, 0),
          labelRealizadas: `${totalRealizadas}/${totalActividades}`,
          labelPendientes: `${Math.max(totalActividades - totalRealizadas, 0)}/${totalActividades}`,
        },
        metas: [
          { id: 'semana', nombre: 'Pendientes esta semana', actual: pendientes.filter((item) => item.fecha && new Date(item.fecha) <= new Date(Date.now() + 7 * 86400000)).length, total: pendientes.length },
          { id: 'actividades', nombre: 'Actividades realizadas', actual: totalRealizadas, total: totalActividades },
          { id: 'participacion', nombre: 'Foros por participar', actual: tiposPendientes.foro || 0, total: evaluablesForo(cursos).length },
        ],
      }
    },

    observatorioDirector: () => () => {
      const cursos = mockCursos.map((curso) => {
        const estudiantes = estudiantesCurso(curso.id)
        const actividades = actividadesCurso(curso)
        const docente = docenteDeCurso(curso)
        const promedio = estudiantes.length
          ? Math.round(estudiantes.reduce((sum, estudiante) => sum + promedioEstudiante(curso.id, estudiante.id), 0) / estudiantes.length)
          : 0
        const pendientesDocente = mockEntregas.filter((entrega) =>
          actividades.some((actividad) => actividad.id === entrega.actividad_id) &&
          entrega.estado === 'entregado' &&
          !mockCalificaciones[curso.id]?.[entrega.estudiante_id]?.[entrega.actividad_id]
        ).length
        const cobertura = curso.secciones.length
          ? Math.min(actividades.length, curso.secciones.length * 4)
          : 0
        const coberturaTotal = curso.secciones.length * 4
        const riesgo = promedio < 55 || pendientesDocente > 8 || cobertura < Math.ceil(coberturaTotal / 2) ? 'alto' : promedio < 70 || pendientesDocente > 4 ? 'medio' : 'estable'
        return {
          id: curso.id,
          codigo: curso.codigo,
          nombre: curso.nombre,
          docente: docente?.nombre || 'Sin docente',
          docenteId: docente?.id,
          estudiantes: estudiantes.length,
          promedio,
          pendientesDocente,
          cobertura,
          coberturaTotal,
          coberturaLabel: `${cobertura}/${coberturaTotal}`,
          avance: `${actividades.filter(isTrackedActivity).length}/${actividades.length || 1}`,
          riesgo,
          ultimaActividadDias: diasSimulados(curso.id + curso.docente_id),
        }
      })
      const docentes = mockUsuarios.filter((usuario) => usuario.rol === 'docente').map((docente) => {
        const cursosDocente = cursos.filter((curso) => curso.docenteId === docente.id)
        return {
          id: docente.id,
          nombre: docente.nombre,
          avatar: docente.avatar,
          cursos: cursosDocente.length,
          promedioCursos: cursosDocente.length ? Math.round(cursosDocente.reduce((sum, curso) => sum + curso.promedio, 0) / cursosDocente.length) : 0,
          pendientesDocente: cursosDocente.reduce((sum, curso) => sum + curso.pendientesDocente, 0),
          cumplimiento: cursosDocente.reduce((sum, curso) => sum + curso.cobertura, 0),
          cumplimientoTotal: cursosDocente.reduce((sum, curso) => sum + curso.coberturaTotal, 0),
        }
      })
      return { cursos, docentes }
    },

    centroAdmin: (state) => () => ({
      configuraciones: state.configuraciones,
      integraciones: state.configuraciones.filter((item) => item.tipo === 'Integracion'),
      servicios: state.configuraciones.filter((item) => item.tipo === 'Servicio'),
      politicas: [
        { id: 'entregas', nombre: 'Tolerancia de entregas tardias', valor: '72 horas', estado: 'activo' },
        { id: 'notas', nombre: 'Publicacion visible de notas', valor: 'Despues de revision docente', estado: 'activo' },
        { id: 'seguimiento', nombre: 'Alertas de riesgo academico', valor: 'Promedio < 60% o inactividad > 7 dias', estado: 'activo' },
        { id: 'tema', nombre: 'Tema visual institucional', valor: 'UNITEPC premium', estado: 'activo' },
      ],
      auditoria: [
        { id: 1, accion: 'Sync SISA completado', detalle: '3 cursos y 46 estudiantes verificados', tipo: 'success', fecha: '2026-06-08 08:10' },
        { id: 2, accion: 'Sistema de estudiantes lento', detalle: 'Respuesta superior a 3 segundos', tipo: 'warning', fecha: '2026-06-08 07:40' },
        { id: 3, accion: 'Notas centralizadas actualizadas', detalle: '42 registros enviados', tipo: 'success', fecha: '2026-06-07 18:25' },
      ],
    }),
  },

  actions: {
    registrarAccion(origen, detalle) {
      this.acciones.unshift({ id: Date.now(), origen, detalle, fecha: new Date().toISOString() })
    },

    toggleConfiguracion(id) {
      const item = this.configuraciones.find((config) => config.id === id)
      if (!item) return
      item.estado = item.estado === 'online' ? 'pausado' : 'online'
      item.ultimoSync = new Date().toISOString()
    },
  },
})
