import api from './api.js'

export const bancoDocenteService = {
  async listar(filtros = {}) {
    return api.get('/banco-docente/plantillas', { params: filtros })
  },

  async crear(datos) {
    return api.post('/banco-docente/plantillas', datos)
  },

  async actualizar(id, datos) {
    return api.put(`/banco-docente/plantillas/${id}`, datos)
  },

  async eliminar(id) {
    return api.delete(`/banco-docente/plantillas/${id}`)
  },

  async usar(id) {
    return api.post(`/banco-docente/plantillas/${id}/usar`)
  },
}
