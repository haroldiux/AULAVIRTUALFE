import api from './api.js'

export const entregaService = {
  async listar(filtros = {}) {
    return api.get('/entregas', { params: filtros })
  },

  async misEntregas() {
    return api.get('/entregas/mias')
  },

  async obtener(id) {
    return api.get(`/entregas/${id}`)
  },

  async crear(actividadId, contenido) {
    return api.post('/entregas', { actividad_id: actividadId, contenido })
  },

  async actualizar(id, datos) {
    return api.put(`/entregas/${id}`, datos)
  },
}
