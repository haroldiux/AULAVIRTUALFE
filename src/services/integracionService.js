import api from './api.js'

export const integracionService = {
  async estado() {
    return api.get('/integraciones/estado')
  },

  async asignaturasSisa(docenteId, gestion) {
    return api.get('/sisa/asignaturas-disponibles', { params: { docente_id: docenteId, gestion } })
  },

  async generarCursoSisa(codigo, gestion, docenteId) {
    return api.post('/sisa/generar-curso', { codigo, gestion, docente_id: docenteId })
  },

  async sincronizarEstudiantes(cursoId) {
    return api.post(`/cursos/${cursoId}/sincronizar-estudiantes`)
  },

  async sincronizarNotas(cursoId) {
    return api.post(`/cursos/${cursoId}/sincronizar-notas`)
  },

  async bancoPreguntasSisa(asignaturaCodigo) {
    return api.get('/sisa/banco-preguntas', { params: { asignatura_codigo: asignaturaCodigo } })
  },
}
