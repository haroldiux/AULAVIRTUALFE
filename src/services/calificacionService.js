import api from './api.js'
import { calificaciones as mockCalificaciones } from 'src/mock/index.js'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

function delay(ms) { return new Promise((r) => setTimeout(r, ms)) }

export const calificacionService = {
  async libroCurso(cursoId, estudianteId = null) {
    if (USE_MOCK) {
      await delay(300)
      const notas = mockCalificaciones[cursoId] || {}
      const estudiantes = Object.keys(notas).map((eid) => ({
        id: Number(eid),
        notas: Object.entries(notas[eid] || {}).map(([aid, n]) => ({
          actividad_id: Number(aid),
          ...n,
        })),
        promedio: calcularPromedio(notas[eid] || {}),
      }))
      return {
        data: {
          estudiantes: estudianteId ? estudiantes.filter((e) => e.id === estudianteId) : estudiantes,
          promedio_general: Math.round(estudiantes.reduce((s, e) => s + e.promedio, 0) / (estudiantes.length || 1)),
          pendientes_calificar: Math.floor(Math.random() * 20),
        },
      }
    }
    return api.get(`/cursos/${cursoId}/calificaciones`, { params: { estudiante_id: estudianteId } })
  },

  async calificar(entregaId, datos) {
    if (USE_MOCK) {
      await delay(200)
      return { data: { id: Date.now(), ...datos } }
    }
    return api.post(`/entregas/${entregaId}/calificar`, datos)
  },

  async actualizar(id, datos) {
    if (USE_MOCK) {
      return { data: { id, ...datos } }
    }
    return api.put(`/calificaciones/${id}`, datos)
  },

  async sincronizar(cursoCodigo, gestion, notas) {
    if (USE_MOCK) {
      await delay(1500)
      return { data: { enviadas: notas.length, fallidas: 0, mensaje: 'Sincronizacion completada (mock)' } }
    }
    return api.post('/sync/enviar-notas', { curso_codigo: cursoCodigo, gestion, notas })
  },
}

function calcularPromedio(notasObj) {
  const valores = Object.values(notasObj || {}).filter((n) => n.porcentaje > 0)
  if (!valores.length) return 0
  return Math.round(valores.reduce((s, n) => s + n.porcentaje, 0) / valores.length)
}
