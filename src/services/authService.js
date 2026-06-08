import api from './api.js'
import { usuarios as mockUsuarios } from 'src/mock/index.js'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

export const authService = {
  async login(sisaToken) {
    if (USE_MOCK) {
      await delay(300)
      const user = mockUsuarios.find((u) => u.id === sisaToken)
      if (!user) throw { error: true, message: 'Usuario no encontrado' }
      return { usuario: { ...user }, token: 'mock-token-' + user.id }
    }
    return api.post('/auth/login', { sisa_token: sisaToken })
  },

  async logout() {
    if (USE_MOCK) return { message: 'Sesion cerrada' }
    return api.post('/auth/logout')
  },

  async me() {
    if (USE_MOCK) {
      const stored = localStorage.getItem('auth_usuario')
      if (!stored) throw { error: true, message: 'No autenticado' }
      return { usuario: JSON.parse(stored) }
    }
    return api.get('/auth/me')
  },
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
