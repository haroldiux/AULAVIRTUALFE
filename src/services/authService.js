import api from './api.js'

export const authService = {
  async loginLocal(email, password) {
    return api.post('/auth/login', { email, password })
  },

  async loginSso(sisaToken) {
    return api.post('/auth/login', { sisa_token: sisaToken })
  },

  async me() {
    return api.get('/auth/me')
  },

  async logout(token = null) {
    if (token) {
      return api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    return api.post('/auth/logout')
  },
}
