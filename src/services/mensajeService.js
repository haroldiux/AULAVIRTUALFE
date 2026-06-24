import api from './api.js'

export const mensajeService = {
  async obtenerContactos() {
    return api.get('/mensajes/contactos')
  },

  async listarConversaciones() {
    return api.get('/mensajes/conversaciones')
  },

  async obtenerMensajes(conversacionId) {
    return api.get(`/mensajes/conversaciones/${conversacionId}`)
  },

  async enviar(conversacionId, contenido, adjuntos = null) {
    return api.post(`/mensajes/conversaciones/${conversacionId}/mensajes`, { contenido, adjuntos })
  },

  async crearConversacion(usuarioId, mensaje, cursoId = null, asunto = null) {
    return api.post('/mensajes/conversaciones', { usuario_id: usuarioId, mensaje, curso_id: cursoId, asunto })
  },

  async marcarLeido(conversacionId) {
    return api.put(`/mensajes/conversaciones/${conversacionId}/leer`)
  },
}
