import api from './api.js'

export const cursoService = {
  async listar(filtros = {}) {
    return api.get('/cursos', { params: filtros })
  },

  async obtener(id) {
    return api.get(`/cursos/${id}`)
  },

  async crear(datos) {
    return api.post('/cursos', datos)
  },

  async actualizar(id, datos) {
    return api.put(`/cursos/${id}`, datos)
  },

  async publicar(id) {
    return api.put(`/cursos/${id}/publicar`)
  },

  async archivar(id) {
    return api.delete(`/cursos/${id}`)
  },

  // --- Secciones ---
  async agregarSeccion(cursoId, datos) {
    return api.post(`/cursos/${cursoId}/secciones`, datos)
  },

  async actualizarSeccion(cursoId, seccionId, datos) {
    return api.put(`/cursos/${cursoId}/secciones/${seccionId}`, datos)
  },

  async eliminarSeccion(cursoId, seccionId) {
    return api.delete(`/cursos/${cursoId}/secciones/${seccionId}`)
  },

  async reordenarSecciones(cursoId, seccionIds) {
    return api.put(`/cursos/${cursoId}/secciones/reordenar`, { orden: seccionIds })
  },

  // --- SISA: fallback local (sin backend Fase D) ---
  async generarDesdeSisa() {
    await delay(1500)
    return {
      data: { curso_id: null, secciones_creadas: 3, actividades_base: 6, mensaje: 'Curso generado (fallback local)' },
    }
  },

  async getAsignaturasSisa() {
    await delay(300)
    return {
      data: [
        { codigo: 'SIS-401', nombre: 'Programacion Avanzada', pac_disponible: true },
        { codigo: 'SIS-305', nombre: 'Base de Datos II', pac_disponible: true },
        { codigo: 'MAT-201', nombre: 'Calculo I', pac_disponible: false },
      ],
    }
  },
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)) }
