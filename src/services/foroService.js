import api from './api.js'

export const foroService = {
  async listarHilos(actividadId) {
    return api.get(`/actividades/${actividadId}/foro/hilos`)
  },

  async crearHilo(actividadId, { titulo, contenido, anonimo = false }) {
    return api.post(`/actividades/${actividadId}/foro/hilos`, { titulo, contenido, anonimo })
  },

  async crearRespuesta(hiloId, { contenido, anonimo = false }) {
    return api.post(`/foros/hilos/${hiloId}/respuestas`, { contenido, anonimo })
  },

  async eliminarHilo(hiloId) {
    return api.delete(`/foros/hilos/${hiloId}`)
  },
}
