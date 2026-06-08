import { defineStore } from 'pinia'
import { cursos as mockCursos } from 'src/mock/index.js'

/**
 * MODO DE USO:
 * - Sin VITE_API_BASE_URL (prototipo): usa mock data directo
 * - Con VITE_API_BASE_URL (backend disponible): importa y usa cursoService
 *
 * Para migrar a API real, descomentar y reemplazar acciones con llamadas a:
 *   import { cursoService } from 'src/services/cursoService'
 *   async crearCurso(curso) { const { data } = await cursoService.crear(curso); this.cursos.push(data); }
 */

export const useCursosStore = defineStore('cursos', {
  state: () => ({
    cursos: [...mockCursos],
  }),

  getters: {
    getCursoById: (state) => (id) => state.cursos.find((c) => c.id === id),
    publicados: (state) => state.cursos.filter((c) => c.estado === 'publicado'),
    borradores: (state) => state.cursos.filter((c) => c.estado === 'borrador'),
  },

  actions: {
    crearCurso(curso) {
      const id = Math.max(0, ...this.cursos.map((c) => c.id)) + 1
      this.cursos.push({ ...curso, id })
      return id
    },

    actualizarCurso(id, datos) {
      const idx = this.cursos.findIndex((c) => c.id === id)
      if (idx !== -1) Object.assign(this.cursos[idx], datos)
    },

    archivarCurso(id) {
      const idx = this.cursos.findIndex((c) => c.id === id)
      if (idx !== -1) this.cursos[idx].estado = 'archivado'
    },

    getCursosPorDocente(docenteId) {
      return this.cursos.filter((c) => c.docente_id === docenteId)
    },

    agregarSeccion(cursoId, datos) {
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (!curso) return
      const maxId = curso.secciones.reduce((m, s) => Math.max(m, s.id), 0)
      curso.secciones.push({
        id: maxId + 1,
        titulo: datos.titulo || 'Nueva Seccion',
        descripcion: datos.descripcion || '',
        orden: curso.secciones.length + 1,
        visible: true,
      })
    },

    actualizarSeccion(cursoId, seccionId, datos) {
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (!curso) return
      const seccion = curso.secciones.find((s) => s.id === seccionId)
      if (seccion) Object.assign(seccion, datos)
    },

    eliminarSeccion(cursoId, seccionId) {
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (!curso) return
      curso.secciones = curso.secciones.filter((s) => s.id !== seccionId)
    },
  },
})
