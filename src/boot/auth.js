import { useAuthStore } from 'src/stores/auth'

export default async () => {
  const path = window.location.pathname
  if (path !== '/' && path !== '' && path !== '/index.html') {
    const hash = window.location.hash || '#' + path
    window.location.href = window.location.origin + '/' + hash + window.location.search
    return
  }

  const auth = useAuthStore()
  await auth.inicializar()
}

