import api from './api.js'

export const calificacionService = {
  async libroCurso(cursoId) {
    return api.get(`/cursos/${cursoId}/calificaciones`)
  },

  async calificar(entregaId, datos) {
    return api.post(`/entregas/${entregaId}/calificar`, datos)
  },

  async actualizar(id, datos) {
    return api.put(`/calificaciones/${id}`, datos)
  },

  async misNotas() {
    return api.get('/mis-notas')
  },
}
