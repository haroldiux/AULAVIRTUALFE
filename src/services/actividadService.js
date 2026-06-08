import api from './api.js'
import { actividades as mockActividades } from 'src/mock/index.js'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

function delay(ms) { return new Promise((r) => setTimeout(r, ms)) }

export const actividadService = {
  async listarPorSeccion(seccionId) {
    if (USE_MOCK) {
      await delay(150)
      const lista = mockActividades
        .filter((a) => a.seccion_id === seccionId)
        .sort((a, b) => (a.orden || 0) - (b.orden || 0))
      return { data: lista }
    }
    return api.get(`/secciones/${seccionId}/actividades`)
  },

  async obtener(id) {
    if (USE_MOCK) {
      const act = mockActividades.find((a) => a.id === id)
      if (!act) throw { error: true, message: 'Actividad no encontrada' }
      return { data: act }
    }
    return api.get(`/actividades/${id}`)
  },

  async crear(seccionId, datos) {
    if (USE_MOCK) {
      await delay(200)
      const id = Math.max(0, ...mockActividades.map((a) => a.id)) + 1
      const nueva = { id, seccion_id: seccionId, ...datos }
      mockActividades.push(nueva)
      return { data: nueva }
    }
    return api.post(`/secciones/${seccionId}/actividades`, datos)
  },

  async actualizar(id, datos) {
    if (USE_MOCK) {
      const idx = mockActividades.findIndex((a) => a.id === id)
      if (idx === -1) throw { error: true, message: 'Actividad no encontrada' }
      Object.assign(mockActividades[idx], datos)
      return { data: mockActividades[idx] }
    }
    return api.put(`/actividades/${id}`, datos)
  },

  async eliminar(id) {
    if (USE_MOCK) {
      const idx = mockActividades.findIndex((a) => a.id === id)
      if (idx !== -1) mockActividades.splice(idx, 1)
      return { message: 'Actividad eliminada' }
    }
    return api.delete(`/actividades/${id}`)
  },

  async reordenar(seccionId, ordenIds) {
    if (USE_MOCK) {
      ordenIds.forEach((id, idx) => {
        const act = mockActividades.find((a) => a.id === id && a.seccion_id === seccionId)
        if (act) act.orden = idx + 1
      })
      return { message: 'Orden actualizado' }
    }
    return api.put(`/secciones/${seccionId}/actividades/reordenar`, { orden: ordenIds })
  },
}
