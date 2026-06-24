import api from './api.js'

export const actividadService = {
  async listarPorSeccion(seccionId) {
    return api.get(`/secciones/${seccionId}/actividades`)
  },

  async obtener(id) {
    return api.get(`/actividades/${id}`)
  },

  async crear(seccionId, datos) {
    return api.post(`/secciones/${seccionId}/actividades`, datos)
  },

  async actualizar(id, datos) {
    return api.put(`/actividades/${id}`, datos)
  },

  async eliminar(id) {
    return api.delete(`/actividades/${id}`)
  },

  async reordenar(seccionId, ordenIds) {
    return api.put(`/secciones/${seccionId}/actividades/reordenar`, { orden: ordenIds })
  },
}
