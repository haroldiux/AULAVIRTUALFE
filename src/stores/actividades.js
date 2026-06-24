import { defineStore } from 'pinia'
import { actividadService } from 'src/services/actividadService.js'
import { foroService } from 'src/services/foroService.js'
import { encuestaService } from 'src/services/encuestaService.js'
import { cuestionarioService } from 'src/services/cuestionarioService.js'
import { entregaService } from 'src/services/entregaService.js'
import { matriculas as mockMatriculas, usuarios as mockUsuarios } from 'src/mock/index.js'
import { getActivityDueDate, getCourseCounters, getStudentActivityState, isDoneState, isTrackedActivity, withActivityModel } from 'src/utils/activityModel'

export const useActividadesStore = defineStore('actividades', {
  state: () => ({
    actividades: [],
    entregas: [],
    hilosForo: {},
    respuestasEncuestas: {},
    progresoEstudiante: {},
    cargadas: false,
  }),

  getters: {
    getActividadById: (state) => (id) => state.actividades.find((a) => a.id === id),
    getActividadesPorSeccion: (state) => (seccionId) =>
      state.actividades.filter((a) => a.seccion_id === seccionId).sort((a, b) => (a.orden || 0) - (b.orden || 0)),

    getCursosMatriculados: () => (estudianteId) => {
      return mockMatriculas
        .filter((m) => m.estudiante_id === estudianteId)
        .map((m) => m.curso_id)
    },

    getDocenteDeCurso: () => () => {
      return mockUsuarios.find((u) => u.rol === 'docente' && u.id === 1) || null
    },

    getPendientesPorEstudiante(state) {
      return (estudianteId) => {
        const pendientes = []
        for (const act of state.actividades) {
          if (!isTrackedActivity(act)) continue
          const estado = this.getEstadoActividadEstudiante(estudianteId, act)
          if (!isDoneState(estado)) {
            pendientes.push({ ...act, estado_estudiante: estado })
          }
        }
        return pendientes
      }
    },

    getTotalPendientes() {
      return (estudianteId) => this.getPendientesPorEstudiante(estudianteId).length
    },

    getProximasFechasLimite() {
      return (estudianteId, limite = 5) =>
        this.getPendientesPorEstudiante(estudianteId)
          .filter((a) => getActivityDueDate(a))
          .sort((a, b) => new Date(getActivityDueDate(a)) - new Date(getActivityDueDate(b)))
          .slice(0, limite)
    },

    getModeloActividad: () => (actividad) => withActivityModel(actividad),

    getEstadoActividadEstudiante: (state) => (estudianteId, actividad) => {
      return getStudentActivityState({
        actividad,
        entregas: state.entregas.filter((e) => e.estudiante_id === estudianteId && e.actividad_id === actividad.id),
        hilosForo: state.hilosForo[actividad.id] || [],
        respuestasEncuestas: state.respuestasEncuestas,
        progresoEstudiante: state.progresoEstudiante[estudianteId] || {},
        estudianteId,
      })
    },

    getContadoresCursoEstudiante() {
      return (estudianteId, curso) => {
        const actividadesCurso = curso?.secciones?.flatMap((s) => s.actividades || []) || []
        return getCourseCounters({
          actividades: actividadesCurso,
          entregas: this.entregas.filter((e) => e.estudiante_id === estudianteId),
          hilosForo: this.hilosForo,
          respuestasEncuestas: this.respuestasEncuestas,
          progresoEstudiante: this.progresoEstudiante[estudianteId] || {},
          estudianteId,
        })
      }
    },
  },

  actions: {
    cargarDesdeCursos(cursos) {
      const todas = []
      for (const curso of cursos) {
        for (const seccion of curso.secciones || []) {
          for (const act of seccion.actividades || []) {
            todas.push(act)
          }
        }
      }
      this.actividades = todas
      this.cargadas = true
    },

    async cargarActividadesSeccion(seccionId) {
      try {
        const res = await actividadService.listarPorSeccion(seccionId)
        const nuevas = res.data || []
        this.actividades = this.actividades.filter((a) => a.seccion_id !== seccionId)
        this.actividades.push(...nuevas)
      } catch {
        console.error('[actividades] Error al cargar seccion')
      }
    },

    async agregarActividad(seccionId, datos) {
      const res = await actividadService.crear(seccionId, datos)
      this.actividades.push(res.data)
      return res.data.id
    },

    async actualizarActividad(id, datos) {
      const res = await actividadService.actualizar(id, datos)
      const idx = this.actividades.findIndex((a) => a.id === id)
      if (idx !== -1) Object.assign(this.actividades[idx], datos, res?.data || {})
    },

    async eliminarActividad(id) {
      await actividadService.eliminar(id)
      const idx = this.actividades.findIndex((a) => a.id === id)
      if (idx !== -1) this.actividades.splice(idx, 1)
    },

    async reordenarActividades(seccionId, ids) {
      await actividadService.reordenar(seccionId, ids)
      ids.forEach((id, idx) => {
        const act = this.actividades.find((a) => a.id === id && a.seccion_id === seccionId)
        if (act) act.orden = idx + 1
      })
    },

    // ========== ENTREGAS (API real — Fase C) ==========
    async cargarEntregas(filtros = {}) {
      try {
        const res = await entregaService.listar(filtros)
        this.entregas = res.data || []
      } catch {
        // ignorar
      }
    },

    async cargarMisEntregas() {
      try {
        const res = await entregaService.misEntregas()
        this.entregas = res.data || []
      } catch {
        // ignorar
      }
    },

    async crearEntrega(estudianteId, actividadId, contenido) {
      const contenidoObj = typeof contenido === 'string'
        ? { texto: contenido, archivos: [] }
        : contenido
      const res = await entregaService.crear(actividadId, contenidoObj)
      this.entregas.push(res.data)
      return res.data.id
    },

    getEntrega(estudianteId, actividadId) {
      return this.entregas.find(
        (e) => e.estudiante_id === estudianteId && e.actividad_id === actividadId
      )
    },

    // ========== FOROS (API real) ==========
    async cargarHilosForo(actividadId) {
      try {
        const res = await foroService.listarHilos(actividadId)
        this.hilosForo[actividadId] = res.data || []
      } catch {
        console.error('[foro] Error al cargar hilos')
        this.hilosForo[actividadId] = []
      }
      return this.hilosForo[actividadId]
    },

    getHilosForo(actividadId) {
      return this.hilosForo[actividadId] || []
    },

    async crearHiloForo(actividadId, hilo) {
      const res = await foroService.crearHilo(actividadId, hilo)
      if (!this.hilosForo[actividadId]) this.hilosForo[actividadId] = []
      this.hilosForo[actividadId].unshift(res.data)
      return res.data
    },

    async crearRespuestaForo(actividadId, hiloId, respuesta) {
      const res = await foroService.crearRespuesta(hiloId, respuesta)
      const hilo = (this.hilosForo[actividadId] || []).find((h) => h.id === hiloId)
      if (hilo) {
        if (!hilo.respuestas) hilo.respuestas = []
        hilo.respuestas.push(res.data)
      }
      return res.data
    },

    // ========== ENCUESTAS (API real) ==========
    async cargarMiRespuestaEncuesta(actividadId) {
      try {
        const res = await encuestaService.miRespuesta(actividadId)
        return res.data
      } catch {
        return { respondida: false }
      }
    },

    async guardarRespuestaEncuesta(estudianteId, actividadId, respuestas) {
      const res = await encuestaService.responder(actividadId, respuestas)
      const key = `${estudianteId}-${actividadId}`
      this.respuestasEncuestas[key] = { respuestas, fecha: res.data?.fecha }
      if (!this.progresoEstudiante[estudianteId]) this.progresoEstudiante[estudianteId] = {}
      this.progresoEstudiante[estudianteId][actividadId] = 'completado'
      return res.data
    },

    tieneRespuestaEncuesta(estudianteId, actividadId) {
      const key = `${estudianteId}-${actividadId}`
      return !!this.respuestasEncuestas[key]
    },

    getRespuestaEncuesta(estudianteId, actividadId) {
      const key = `${estudianteId}-${actividadId}`
      return this.respuestasEncuestas[key] || null
    },

    // ========== CUESTIONARIOS (API real) ==========
    async cargarIntentosCuestionario(actividadId) {
      try {
        const res = await cuestionarioService.intentos(actividadId)
        return res.data
      } catch {
        return { intentos: [], intentos_realizados: 0, intentos_maximos: 1, mejor_nota: null }
      }
    },

    async guardarResultadoCuestionario(estudianteId, actividadId, respuestas) {
      const res = await cuestionarioService.intentar(actividadId, respuestas)
      if (!this.progresoEstudiante[estudianteId]) this.progresoEstudiante[estudianteId] = {}
      this.progresoEstudiante[estudianteId][actividadId] = 'completado'
      return res.data
    },

    // ========== LECCIONES (mock local hasta Fase C) ==========
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
