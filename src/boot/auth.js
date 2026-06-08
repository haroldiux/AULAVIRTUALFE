import { useAuthStore } from 'src/stores/auth'

export default () => {
  const auth = useAuthStore()
  auth.inicializar()
}
