import api from './api.js'

export const notificacionService = {
  async listar() {
    return api.get('/notificaciones')
  },

  async crear(data) {
    return api.post('/notificaciones', data)
  },

  async marcarLeida(id) {
    return api.put(`/notificaciones/${id}/leer`)
  },

  async marcarTodasLeidas() {
    return api.put('/notificaciones/leer-todas')
  },

  async eliminar(id) {
    return api.delete(`/notificaciones/${id}`)
  },
}
