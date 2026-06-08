import { defineStore } from 'pinia'

export const useNotificacionesStore = defineStore('notificaciones', {
  state: () => ({
    notificaciones: [],
    cargadas: false,
  }),

  getters: {
    noLeidas: (state) => state.notificaciones.filter((n) => !n.leida),
    cantidadNoLeidas: (state) => state.noLeidas.length,
    todasOrdenadas: (state) => [...state.notificaciones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
  },

  actions: {
    inicializar() {
      if (this.cargadas) return
      const guardadas = localStorage.getItem('lms_notificaciones')
      if (guardadas) {
        try { this.notificaciones = JSON.parse(guardadas) } catch { this.notificaciones = [] }
      }
      this.cargadas = true
    },

    persistir() {
      localStorage.setItem('lms_notificaciones', JSON.stringify(this.notificaciones))
    },

    agregar(notif) {
      this.notificaciones.unshift({
        id: Date.now(),
        fecha: new Date().toISOString(),
        leida: false,
        ...notif,
      })
      this.persistir()
    },

    marcarLeida(id) {
      const n = this.notificaciones.find((x) => x.id === id)
      if (n) {
        n.leida = true
        this.persistir()
      }
    },

    marcarTodasLeidas() {
      this.notificaciones.forEach((n) => { n.leida = true })
      this.persistir()
    },

    eliminar(id) {
      this.notificaciones = this.notificaciones.filter((n) => n.id !== id)
      this.persistir()
    },

    generarIniciales() {
      if (this.notificaciones.length > 0) return
      const ahora = new Date()
      const min = (m) => new Date(ahora.getTime() - m * 60000).toISOString()

      this.notificaciones = [
        { id: 1, fecha: min(5), leida: false, icon: 'assignment_turned_in', color: 'green', titulo: 'Juan Perez entrego Tarea 1', descripcion: 'Diagrama de Clases — Programacion Avanzada', curso: 'Programacion Avanzada' },
        { id: 2, fecha: min(30), leida: false, icon: 'forum', color: 'teal', titulo: 'Nueva respuesta en el foro', descripcion: 'Dra. Maria Rios respondio en "Factory vs Abstract"', curso: 'Programacion Avanzada' },
        { id: 3, fecha: min(60), leida: false, icon: 'grade', color: 'primary', titulo: 'Tu tarea fue calificada', descripcion: 'Foro Debate — 18/20 puntos', curso: 'Programacion Avanzada' },
        { id: 4, fecha: min(120), leida: true, icon: 'event', color: 'orange', titulo: 'Recordatorio: fecha limite', descripcion: 'Tarea 1 vence en 2 dias', curso: 'Programacion Avanzada' },
        { id: 5, fecha: min(180), leida: true, icon: 'campaign', color: 'purple', titulo: 'Nuevo material disponible', descripcion: 'Lectura - Patrones Creacionales publicada', curso: 'Programacion Avanzada' },
        { id: 6, fecha: min(240), leida: true, icon: 'school', color: 'indigo', titulo: 'Curso publicado', descripcion: 'El docente publico Base de Datos II', curso: 'Base de Datos II' },
      ]
      this.persistir()
      this.cargadas = true
    },
  },
})
