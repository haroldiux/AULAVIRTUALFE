import api from './api.js'

export const adminUsuarioService = {
  async listar(filtros = {}) {
    return api.get('/admin/usuarios', { params: filtros })
  },

  async crear(datos) {
    return api.post('/admin/usuarios', datos)
  },

  async actualizar(id, datos) {
    return api.put(`/admin/usuarios/${id}`, datos)
  },

  async eliminar(id) {
    return api.delete(`/admin/usuarios/${id}`)
  },

  async importarCsv(file) {
    const formData = new FormData()
    formData.append('csv', file)
    return api.post('/admin/usuarios/importar-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async matricularMasivo(cursoId, data) {
    return api.post(`/cursos/${cursoId}/matricular-masivo`, data)
  },
}
