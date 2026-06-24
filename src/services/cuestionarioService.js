import api from './api.js'

export const cuestionarioService = {
  async intentos(actividadId) {
    return api.get(`/actividades/${actividadId}/cuestionario/intentos`)
  },

  async intentar(actividadId, respuestas) {
    return api.post(`/actividades/${actividadId}/cuestionario/intentar`, { respuestas })
  },
}
