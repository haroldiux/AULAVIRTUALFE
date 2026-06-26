import { defineStore } from 'pinia'
import { cursoService } from 'src/services/cursoService.js'

function normalizarCurso(c) {
  return {
    ...c,
    secciones: Array.isArray(c.secciones)
      ? c.secciones.map((s) => ({ ...s, bloques: Array.isArray(s.bloques) ? s.bloques : [] }))
      : [],
    docente: c.docente || { id: c.docente_id, nombre: '' },
    total_estudiantes: c.total_estudiantes ?? 0,
    config: c.config || null,
  }
}

export const useCursosStore = defineStore('cursos', {
  state: () => ({
    cursos: [],
    cargados: false,
    cargando: false,
  }),

  getters: {
    getCursoById: (state) => (id) => state.cursos.find((c) => c.id === id),
    publicados: (state) => state.cursos.filter((c) => c.estado === 'publicado'),
    borradores: (state) => state.cursos.filter((c) => c.estado === 'borrador'),
  },

  actions: {
    async cargarCursos() {
      if (this.cargados || this.cargando) return
      this.cargando = true
      try {
        const res = await cursoService.listar()
        const lista = Array.isArray(res?.data) ? res.data : (res?.data?.data || [])
        this.cursos = lista.map(normalizarCurso)
        this.cargados = true
      } catch (err) {
        console.error('[cursos] Error al cargar:', err)
      } finally {
        this.cargando = false
      }
    },

    async cargarCurso(id) {
      try {
        const res = await cursoService.obtener(id)
        const curso = normalizarCurso(res.data)
        const idx = this.cursos.findIndex((c) => c.id === id)
        if (idx !== -1) {
          this.cursos[idx] = curso
        } else {
          this.cursos.push(curso)
        }
        return curso
      } catch (err) {
        console.error('[cursos] Error al cargar curso:', err)
        throw err
      }
    },

    async crearCurso(curso) {
      const res = await cursoService.crear(curso)
      const nuevo = normalizarCurso(res.data)
      this.cursos.push(nuevo)
      return nuevo.id
    },

    async actualizarCurso(id, datos) {
      const res = await cursoService.actualizar(id, datos)
      const actualizado = normalizarCurso(res.data)
      const idx = this.cursos.findIndex((c) => c.id === id)
      if (idx !== -1) {
        this.cursos[idx] = { ...this.cursos[idx], ...actualizado }
      }
    },

    async archivarCurso(id) {
      await cursoService.archivar(id)
      const idx = this.cursos.findIndex((c) => c.id === id)
      if (idx !== -1) {
        this.cursos[idx].estado = 'archivado'
      }
    },

    async publicarCurso(id) {
      const res = await cursoService.publicar(id)
      const actualizado = normalizarCurso(res.data)
      const idx = this.cursos.findIndex((c) => c.id === id)
      if (idx !== -1) {
        this.cursos[idx] = { ...this.cursos[idx], ...actualizado }
      }
    },

    getCursosPorDocente(docenteId) {
      return this.cursos.filter((c) => c.docente_id === docenteId)
    },

    // --- Secciones ---
    async agregarSeccion(cursoId, datos) {
      const res = await cursoService.agregarSeccion(cursoId, datos)
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (curso && res.data) {
        const seccion = { ...res.data, bloques: res.data.bloques || [] }
        curso.secciones.push(seccion)
      }
      return res.data
    },

    async actualizarSeccion(cursoId, seccionId, datos) {
      const res = await cursoService.actualizarSeccion(cursoId, seccionId, datos)
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (curso) {
        const sec = curso.secciones.find((s) => s.id === seccionId)
        if (sec) Object.assign(sec, res.data || datos)
      }
    },

    async eliminarSeccion(cursoId, seccionId) {
      await cursoService.eliminarSeccion(cursoId, seccionId)
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (curso) {
        curso.secciones = curso.secciones.filter((s) => s.id !== seccionId)
      }
    },

    async reordenarSecciones(cursoId, seccionIds) {
      await cursoService.reordenarSecciones(cursoId, seccionIds)
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (curso) {
        curso.secciones.sort((a, b) => seccionIds.indexOf(a.id) - seccionIds.indexOf(b.id))
      }
    },

    // --- Bloques de Tema (mock local, hasta integración backend) ---

    agregarBloque(cursoId, seccionId, titulo) {
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (!curso) return null
      const seccion = curso.secciones.find((s) => s.id === seccionId)
      if (!seccion) return null
      if (!Array.isArray(seccion.bloques)) seccion.bloques = []
      const nuevoBloque = {
        id: Date.now(),
        titulo: titulo.trim(),
        orden: seccion.bloques.length + 1,
      }
      seccion.bloques.push(nuevoBloque)
      return nuevoBloque
    },

    actualizarBloque(cursoId, seccionId, bloqueId, titulo) {
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (!curso) return
      const seccion = curso.secciones.find((s) => s.id === seccionId)
      if (!seccion) return
      const bloque = (seccion.bloques || []).find((b) => b.id === bloqueId)
      if (bloque) bloque.titulo = titulo.trim()
    },

    eliminarBloque(cursoId, seccionId, bloqueId) {
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (!curso) return
      const seccion = curso.secciones.find((s) => s.id === seccionId)
      if (!seccion) return
      seccion.bloques = (seccion.bloques || []).filter((b) => b.id !== bloqueId)
    },

    reordenarBloques(cursoId, seccionId, bloqueIds) {
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (!curso) return
      const seccion = curso.secciones.find((s) => s.id === seccionId)
      if (!seccion || !Array.isArray(seccion.bloques)) return
      seccion.bloques.sort((a, b) => bloqueIds.indexOf(a.id) - bloqueIds.indexOf(b.id))
      seccion.bloques.forEach((b, i) => { b.orden = i + 1 })
    },

    /**
     * Replica toda la estructura de bloques de una sección a otras secciones.
     * Solo copia los títulos — sin actividades.
     */
    replicarEstructuraSeccion(cursoId, seccionOrigenId, seccionDestinoIds) {
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (!curso) return
      const origen = curso.secciones.find((s) => s.id === seccionOrigenId)
      if (!origen) return
      const bloquesOrigen = origen.bloques || []

      for (const destId of seccionDestinoIds) {
        const destino = curso.secciones.find((s) => s.id === destId)
        if (!destino) continue
        if (!Array.isArray(destino.bloques)) destino.bloques = []
        const offset = destino.bloques.length
        bloquesOrigen.forEach((b, i) => {
          destino.bloques.push({
            id: Date.now() + Math.random(),
            titulo: b.titulo,
            orden: offset + i + 1,
          })
        })
      }
    },

    /**
     * Replica un bloque individual a otras secciones.
     * Solo copia el título — sin actividades.
     */
    replicarBloque(cursoId, seccionOrigenId, bloqueId, seccionDestinoIds) {
      const curso = this.cursos.find((c) => c.id === cursoId)
      if (!curso) return
      const origen = curso.secciones.find((s) => s.id === seccionOrigenId)
      if (!origen) return
      const bloque = (origen.bloques || []).find((b) => b.id === bloqueId)
      if (!bloque) return

      for (const destId of seccionDestinoIds) {
        const destino = curso.secciones.find((s) => s.id === destId)
        if (!destino) continue
        if (!Array.isArray(destino.bloques)) destino.bloques = []
        destino.bloques.push({
          id: Date.now() + Math.random(),
          titulo: bloque.titulo,
          orden: destino.bloques.length + 1,
        })
      }
    },
  },
})
