import api from './api.js'
import { cursos as mockCursos } from 'src/mock/index.js'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

function delay(ms) { return new Promise((r) => setTimeout(r, ms)) }

export const cursoService = {
  async listar(filtros = {}) {
    if (USE_MOCK) {
      await delay(200)
      let lista = [...mockCursos]
      if (filtros.estado) lista = lista.filter((c) => c.estado === filtros.estado)
      if (filtros.docente_id) lista = lista.filter((c) => c.docente_id === filtros.docente_id)
      return { data: lista }
    }
    return api.get('/cursos', { params: filtros })
  },

  async obtener(id) {
    if (USE_MOCK) {
      await delay(150)
      const curso = mockCursos.find((c) => c.id === id)
      if (!curso) throw { error: true, message: 'Curso no encontrado', status: 404 }
      return { data: { ...curso } }
    }
    return api.get(`/cursos/${id}`)
  },

  async crear(datos) {
    if (USE_MOCK) {
      await delay(300)
      const nuevo = { id: Date.now(), ...datos, estado: 'borrador' }
      mockCursos.push(nuevo)
      return { data: nuevo }
    }
    return api.post('/cursos', datos)
  },

  async actualizar(id, datos) {
    if (USE_MOCK) {
      await delay(200)
      const idx = mockCursos.findIndex((c) => c.id === id)
      if (idx === -1) throw { error: true, message: 'Curso no encontrado' }
      Object.assign(mockCursos[idx], datos)
      return { data: mockCursos[idx] }
    }
    return api.put(`/cursos/${id}`, datos)
  },

  async publicar(id) {
    if (USE_MOCK) {
      const idx = mockCursos.findIndex((c) => c.id === id)
      if (idx !== -1) mockCursos[idx].estado = 'publicado'
      return { data: mockCursos[idx] }
    }
    return api.put(`/cursos/${id}/publicar`)
  },

  async archivar(id) {
    if (USE_MOCK) {
      const idx = mockCursos.findIndex((c) => c.id === id)
      if (idx !== -1) mockCursos[idx].estado = 'archivado'
      return { message: 'Curso archivado' }
    }
    return api.delete(`/cursos/${id}`)
  },

  async agregarSeccion(cursoId, datos) {
    if (USE_MOCK) {
      const curso = mockCursos.find((c) => c.id === cursoId)
      if (!curso) throw { error: true, message: 'Curso no encontrado' }
      const maxId = curso.secciones.reduce((m, s) => Math.max(m, s.id), 0)
      const nueva = { id: maxId + 1, ...datos, orden: curso.secciones.length + 1, visible: true }
      curso.secciones.push(nueva)
      return { data: nueva }
    }
    return api.post(`/cursos/${cursoId}/secciones`, datos)
  },

  async actualizarSeccion(seccionId, datos) {
    if (USE_MOCK) {
      for (const curso of mockCursos) {
        const sec = curso.secciones.find((s) => s.id === seccionId)
        if (sec) { Object.assign(sec, datos); return { data: sec } }
      }
      throw { error: true, message: 'Seccion no encontrada' }
    }
    return api.put(`/secciones/${seccionId}`, datos)
  },

  async eliminarSeccion(seccionId) {
    if (USE_MOCK) {
      for (const curso of mockCursos) {
        curso.secciones = curso.secciones.filter((s) => s.id !== seccionId)
      }
      return { message: 'Seccion eliminada' }
    }
    return api.delete(`/secciones/${seccionId}`)
  },

  async generarDesdeSisa(codigo, gestion) {
    if (USE_MOCK) {
      await delay(1500)
      // El mock genera secciones aleatorias simulando el PAC
      return {
        data: { curso_id: null, secciones_creadas: 3, actividades_base: 6, mensaje: 'Curso generado (mock)' },
      }
    }
    return api.post('/sisa/generar-curso', { sisa_codigo: codigo, gestion })
  },

  async getAsignaturasSisa(docenteId, gestion) {
    if (USE_MOCK) {
      await delay(300)
      return {
        data: [
          { codigo: 'SIS-401', nombre: 'Programacion Avanzada', pac_disponible: true },
          { codigo: 'SIS-305', nombre: 'Base de Datos II', pac_disponible: true },
          { codigo: 'COM-201', nombre: 'Marketing Digital', pac_disponible: false },
        ],
      }
    }
    return api.get('/sisa/asignaturas-disponibles', { params: { docente_id: docenteId, gestion } })
  },
}
