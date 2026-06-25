import { defineStore } from 'pinia'
import { authService } from 'src/services/authService.js'

const ROL_REDIRECT = {
  docente: '/docente/cursos',
  estudiante: '/estudiante/cursos',
  director: '/director/dashboard',
  admin: '/admin/gestion',
}

const TOKEN_KEY = 'auth_token'
const USUARIO_KEY = 'auth_usuario'

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
    async inicializar() {
      const token = localStorage.getItem(TOKEN_KEY)
      const stored = localStorage.getItem(USUARIO_KEY)
      if (token && stored) {
        try {
          this.usuario = JSON.parse(stored)
          this.token = token
        } catch {
          this.limpiarSesion()
        }
      }
      this.initialized = true
    },

    async login(email, password) {
      const { data } = await authService.loginLocal(email, password)
      this.setSesion(data)
      return data
    },

    async loginSso(sisaToken) {
      const { data } = await authService.loginSso(sisaToken)
      this.setSesion(data)
      return data
    },

    setSesion(data) {
      this.usuario = data.usuario
      this.token = data.token
      localStorage.setItem(TOKEN_KEY, this.token)
      localStorage.setItem(USUARIO_KEY, JSON.stringify(this.usuario))
    },

    async logout() {
      const token = this.token
      this.limpiarSesion()
      if (token) {
        authService.logout(token).catch(() => {})
      }
    },

    limpiarSesion() {
      this.usuario = null
      this.token = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USUARIO_KEY)
    },
  },
})
