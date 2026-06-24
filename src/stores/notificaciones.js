import { defineStore } from 'pinia'
import { notificacionService } from 'src/services/notificacionService.js'

export const useNotificacionesStore = defineStore('notificaciones', {
  state: () => ({
    notificaciones: [],
    cargadas: false,
  }),

  getters: {
    noLeidas: (state) => state.notificaciones.filter((n) => !n.leida),
    cantidadNoLeidas: (state) => state.notificaciones.filter((n) => !n.leida).length,
    todasOrdenadas: (state) => [...state.notificaciones].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  },

  actions: {
    async inicializar() {
      if (this.cargadas) return
      await this.cargar()
    },

    async cargar() {
      try {
        const res = await notificacionService.listar()
        this.notificaciones = res.data || []
        this.cargadas = true
      } catch {
        this.notificaciones = []
      }
    },

    async agregar(notif) {
      try {
        const res = await notificacionService.crear(notif)
        this.notificaciones.unshift(res.data)
        return res.data
      } catch {
        return null
      }
    },

    async marcarLeida(id) {
      await notificacionService.marcarLeida(id)
      const n = this.notificaciones.find((n) => n.id === id)
      if (n) n.leida = true
    },

    async marcarTodasLeidas() {
      await notificacionService.marcarTodasLeidas()
      this.notificaciones.forEach((n) => (n.leida = true))
    },

    async eliminar(id) {
      await notificacionService.eliminar(id)
      const idx = this.notificaciones.findIndex((n) => n.id === id)
      if (idx !== -1) this.notificaciones.splice(idx, 1)
    },
  },
})
