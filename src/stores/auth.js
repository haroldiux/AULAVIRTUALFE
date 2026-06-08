import { defineStore } from 'pinia'
import { usuarios as mockUsuarios } from 'src/mock/index.js'

const ROL_REDIRECT = {
  docente: '/docente/cursos',
  estudiante: '/estudiante/cursos',
  director: '/director/dashboard',
  admin: '/admin/gestion',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: null,
    token: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => state.usuario !== null,
    userRole: (state) => state.usuario?.rol ?? null,
    userName: (state) => state.usuario?.nombre ?? '',
    userAvatar: (state) => state.usuario?.avatar ?? '',
    isDocente: (state) => state.usuario?.rol === 'docente',
    isEstudiante: (state) => state.usuario?.rol === 'estudiante',
    isDirector: (state) => state.usuario?.rol === 'director',
    isAdmin: (state) => state.usuario?.rol === 'admin',
    redirectPath: (state) => ROL_REDIRECT[state.usuario?.rol] ?? '/login',
  },

  actions: {
    inicializar() {
      const stored = localStorage.getItem('auth_usuario')
      if (stored) {
        try {
          this.usuario = JSON.parse(stored)
          this.token = 'mock-token-ss0-' + this.usuario.id
        } catch {
          this.usuario = null
          this.token = null
        }
      }
      this.initialized = true
    },

    login(usuarioId) {
      const user = mockUsuarios.find((u) => u.id === usuarioId)
      if (!user) return false
      this.usuario = { ...user }
      this.token = 'mock-token-ss0-' + user.id
      localStorage.setItem('auth_usuario', JSON.stringify(this.usuario))
      return true
    },

    logout() {
      this.usuario = null
      this.token = null
      localStorage.removeItem('auth_usuario')
    },

    getMockUsuarios() {
      return mockUsuarios
    },
  },
})
