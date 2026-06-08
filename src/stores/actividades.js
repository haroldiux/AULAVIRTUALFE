import { defineStore } from 'pinia'
import { actividades as mockActividades, entregasEstudiante as mockEntregas, cursos as mockCursos, matriculas as mockMatriculas, usuarios as mockUsuarios } from 'src/mock/index.js'
import { getActivityDueDate, getCourseCounters, getStudentActivityState, isDoneState, isTrackedActivity, withActivityModel } from 'src/utils/activityModel'

export const useActividadesStore = defineStore('actividades', {
  state: () => ({
    actividades: [...mockActividades],
    entregas: [...mockEntregas],
    // Hilos de foro por actividad: { [actividadId]: [hilo1, hilo2, ...] }
    hilosForo: {},
    // Respuestas de encuesta: { `${estudianteId}-${actividadId}`: { respuestas, fecha } }
    respuestasEncuestas: {},
    // Progreso de estudiante: { [estudianteId]: { [actividadId]: 'completado' } }
    progresoEstudiante: {},
  }),

  getters: {
    getActividadById: (state) => (id) => state.actividades.find((a) => a.id === id),
    getActividadesPorSeccion: (state) => (seccionId) =>
      state.actividades.filter((a) => a.seccion_id === seccionId),

    // Cursos donde un estudiante está matriculado
    getCursosMatriculados: () => (estudianteId) => {
      const mats = mockMatriculas.filter((m) => m.estudiante_id === estudianteId && m.estado === 'activo')
      return mockCursos.filter((c) => mats.some((m) => m.curso_id === c.id))
    },

    // Docente de un curso
    getDocenteDeCurso: () => (cursoId) => {
      const curso = mockCursos.find((c) => c.id === cursoId)
      if (!curso) return null
      return mockUsuarios.find((u) => u.id === curso.docente_id)
    },

    // Actividades pendientes de un estudiante, agrupadas por curso -> seccion
    getPendientesPorEstudiante: (state) => (estudianteId) => {
      // 1. Cursos del estudiante
      const mats = mockMatriculas.filter((m) => m.estudiante_id === estudianteId && m.estado === 'activo')
      const cursosIds = mats.map((m) => m.curso_id)

      // 2. Actividades de esos cursos que son evaluables (tienen_nota o tienen fecha de entrega)
      const cursosData = mockCursos.filter((c) => cursosIds.includes(c.id))

      const resultado = []

      cursosData.forEach((curso) => {
        const docente = mockUsuarios.find((u) => u.id === curso.docente_id)
        const seccionesMap = []

        curso.secciones.forEach((seccion) => {
          const acts = state.actividades.filter(
            (a) => a.seccion_id === seccion.id && isTrackedActivity(a)
          )

          const actsPendientes = acts.filter((a) => {
            const estado = getStudentActivityState({
              actividad: a,
              estudianteId,
              entregas: state.entregas,
              hilosForo: state.hilosForo,
              respuestasEncuestas: state.respuestasEncuestas,
              progresoEstudiante: state.progresoEstudiante,
            })
            return !isDoneState(estado)
          })

          if (actsPendientes.length > 0) {
            seccionesMap.push({
              seccion,
              actividades: actsPendientes.map((a) => {
                const estado = getStudentActivityState({
                  actividad: a,
                  estudianteId,
                  entregas: state.entregas,
                  hilosForo: state.hilosForo,
                  respuestasEncuestas: state.respuestasEncuestas,
                  progresoEstudiante: state.progresoEstudiante,
                })
                return {
                  ...withActivityModel(a),
                  estado,
                  fechaLimite: getActivityDueDate(a),
                }
              }),
            })
          }
        })

        if (seccionesMap.length > 0) {
          resultado.push({
            curso,
            docente,
            secciones: seccionesMap,
          })
        }
      })

      return resultado
    },

    // Conteo total de pendientes para KPI
    getTotalPendientes: (state) => (estudianteId) => {
      const agrupado = state.getPendientesPorEstudiante(estudianteId)
      return agrupado.reduce((sum, c) => sum + c.secciones.reduce((s2, sec) => s2 + sec.actividades.length, 0), 0)
    },

    // Proximas fechas limite (las más cercanas)
    getProximasFechasLimite: (state) => (estudianteId, limite = 5) => {
      const agrupado = state.getPendientesPorEstudiante(estudianteId)
      const actividadesFlat = []
      agrupado.forEach((c) => {
        c.secciones.forEach((s) => {
          s.actividades.forEach((a) => {
            if (a.fechaLimite) {
              actividadesFlat.push({
                ...a,
                cursoId: c.curso.id,
                cursoNombre: c.curso.nombre,
                cursoCodigo: c.curso.codigo,
                docenteNombre: c.docente?.nombre || '',
                seccionTitulo: s.seccion.titulo,
              })
            }
          })
        })
      })
      return actividadesFlat
        .sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite))
        .slice(0, limite)
    },

    getModeloActividad: () => (actividad) => withActivityModel(actividad),

    getEstadoActividadEstudiante: (state) => (estudianteId, actividad) =>
      getStudentActivityState({
        actividad,
        estudianteId,
        entregas: state.entregas,
        hilosForo: state.hilosForo,
        respuestasEncuestas: state.respuestasEncuestas,
        progresoEstudiante: state.progresoEstudiante,
      }),

    getContadoresCursoEstudiante: (state) => (estudianteId, curso) =>
      getCourseCounters({
        curso,
        estudianteId,
        actividades: state.actividades,
        entregas: state.entregas,
        hilosForo: state.hilosForo,
        respuestasEncuestas: state.respuestasEncuestas,
        progresoEstudiante: state.progresoEstudiante,
      }),
  },

  actions: {
    agregarActividad(actividad) {
      const id = Math.max(0, ...this.actividades.map((a) => a.id)) + 1
      this.actividades.push({ ...actividad, id })
      return id
    },

    actualizarActividad(id, datos) {
      const idx = this.actividades.findIndex((a) => a.id === id)
      if (idx !== -1) Object.assign(this.actividades[idx], datos)
    },

    eliminarActividad(id) {
      const idx = this.actividades.findIndex((a) => a.id === id)
      if (idx !== -1) this.actividades.splice(idx, 1)
    },

    reordenarActividades(seccionId, ids) {
      ids.forEach((id, idx) => {
        const act = this.actividades.find((a) => a.id === id && a.seccion_id === seccionId)
        if (act) act.orden = idx + 1
      })
    },

    // ========== ENTREGAS ==========
    crearEntrega(estudianteId, actividadId, contenido) {
      const id = Math.max(0, ...this.entregas.map((e) => e.id)) + 1
      this.entregas.push({
        id,
        actividad_id: actividadId,
        estudiante_id: estudianteId,
        contenido,
        fecha_entrega: new Date().toISOString(),
        estado: 'entregado',
      })
      return id
    },

    // ========== FOROS ==========
    getHilosForo(actividadId) {
      if (!this.hilosForo[actividadId]) {
        // Inicializar con mock data si existe en la actividad
        const act = this.actividades.find((a) => a.id === actividadId)
        if (act && act.config?.hilos) {
          this.hilosForo[actividadId] = [...act.config.hilos]
        } else {
          this.hilosForo[actividadId] = []
        }
      }
      return this.hilosForo[actividadId]
    },

    crearHiloForo(actividadId, hilo) {
      if (!this.hilosForo[actividadId]) this.hilosForo[actividadId] = []
      this.hilosForo[actividadId].unshift({
        id: Date.now(),
        ...hilo,
        fecha: new Date().toISOString(),
        respuestas: [],
      })
    },

    crearRespuestaForo(actividadId, hiloId, respuesta) {
      const hilos = this.hilosForo[actividadId] || []
      const hilo = hilos.find((h) => h.id === hiloId)
      if (hilo) {
        if (!hilo.respuestas) hilo.respuestas = []
        hilo.respuestas.push({
          id: Date.now(),
          ...respuesta,
          fecha: new Date().toISOString(),
        })
      }
    },

    // ========== ENCUESTAS ==========
    guardarRespuestaEncuesta(estudianteId, actividadId, respuestas) {
      const key = `${estudianteId}-${actividadId}`
      this.respuestasEncuestas[key] = {
        respuestas,
        fecha: new Date().toISOString(),
      }
      if (!this.progresoEstudiante[estudianteId]) this.progresoEstudiante[estudianteId] = {}
      this.progresoEstudiante[estudianteId][actividadId] = 'completado'
    },

    tieneRespuestaEncuesta(estudianteId, actividadId) {
      const key = `${estudianteId}-${actividadId}`
      return !!this.respuestasEncuestas[key]
    },

    getRespuestaEncuesta(estudianteId, actividadId) {
      const key = `${estudianteId}-${actividadId}`
      return this.respuestasEncuestas[key] || null
    },

    // ========== CUESTIONARIOS ==========
    guardarResultadoCuestionario(estudianteId, actividadId, nota, respuestas) {
      const entregaExistente = this.entregas.find((e) => e.estudiante_id === estudianteId && e.actividad_id === actividadId)
      const payload = {
        contenido: JSON.stringify({ respuestas }),
        nota,
        fecha_entrega: new Date().toISOString(),
        estado: 'calificado',
      }
      let id = entregaExistente?.id
      if (entregaExistente) {
        Object.assign(entregaExistente, payload)
      } else {
        id = Math.max(0, ...this.entregas.map((e) => e.id)) + 1
        this.entregas.push({
          id,
          actividad_id: actividadId,
          estudiante_id: estudianteId,
          ...payload,
        })
      }
      // Actualizar progreso
      if (!this.progresoEstudiante[estudianteId]) this.progresoEstudiante[estudianteId] = {}
      this.progresoEstudiante[estudianteId][actividadId] = 'completado'
      return id
    },

    getIntentosCuestionario(estudianteId, actividadId) {
      return this.entregas.filter(
        (e) => e.estudiante_id === estudianteId && e.actividad_id === actividadId
      ).length
    },

    // ========== LECCIONES ==========
    marcarLeccionCompletada(estudianteId, actividadId) {
      if (!this.progresoEstudiante[estudianteId]) this.progresoEstudiante[estudianteId] = {}
      this.progresoEstudiante[estudianteId][actividadId] = 'completado'
    },

    marcarActividadRealizada(estudianteId, actividadId) {
      if (!this.progresoEstudiante[estudianteId]) this.progresoEstudiante[estudianteId] = {}
      this.progresoEstudiante[estudianteId][actividadId] = 'completado'
    },

    esLeccionCompletada(estudianteId, actividadId) {
      return this.progresoEstudiante[estudianteId]?.[actividadId] === 'completado'
    },
  },
})
