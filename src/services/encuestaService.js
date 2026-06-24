import api from './api.js'

export const encuestaService = {
  async miRespuesta(actividadId) {
    return api.get(`/actividades/${actividadId}/encuesta/respuesta`)
  },

  async responder(actividadId, respuestas) {
    return api.post(`/actividades/${actividadId}/encuesta/responder`, { respuestas })
  },

  async resultados(actividadId) {
    return api.get(`/actividades/${actividadId}/encuesta/resultados`)
  },
}
