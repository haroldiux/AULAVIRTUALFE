import api from './api.js'

export const archivoService = {
  async subir(archivo, carpeta = 'general') {
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('carpeta', carpeta)
    return api.post('/archivos/subir', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async obtenerUrl(ruta) {
    return api.get(`/archivos/${ruta}`)
  },
}
