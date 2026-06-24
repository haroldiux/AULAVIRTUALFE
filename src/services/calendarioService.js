import api from './api.js'

export const calendarioService = {
  async listar(filtros = {}) {
    return api.get('/calendario', { params: filtros })
  },

  async crear(datos) {
    return api.post('/calendario/eventos', datos)
  },

  async actualizar(id, datos) {
    return api.put(`/calendario/eventos/${id}`, datos)
  },

  async eliminar(id) {
    return api.delete(`/calendario/eventos/${id}`)
  },
}
