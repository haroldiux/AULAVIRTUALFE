import { ref, onMounted } from 'vue'

/**
 * Composable estandar para estados de carga de paginas.
 * Permite simular un tiempo minimo de carga (util con mocks)
 * y evitar parpadeos cuando los datos llegan muy rapido.
 */
export function useLoadingState(options = {}) {
  const {
    minDuration = 600,
    startOnMount = true,
  } = options

  const isLoading = ref(startOnMount)
  const hasError = ref(false)
  const errorMessage = ref('')

  let startTime = Date.now()

  function start() {
    isLoading.value = true
    hasError.value = false
    errorMessage.value = ''
    startTime = Date.now()
  }

  function stop() {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, minDuration - elapsed)

    if (remaining > 0) {
      setTimeout(() => {
        isLoading.value = false
      }, remaining)
    } else {
      isLoading.value = false
    }
  }

  function setError(message) {
    isLoading.value = false
    hasError.value = true
    errorMessage.value = message
  }

  function reset() {
    start()
  }

  if (startOnMount) {
    onMounted(() => {
      // El stop debe ser llamado explicitamente por la pagina cuando los datos esten listos.
      // Si no se llama, forzamos la finalizacion tras un tiempo razonable para no bloquear UI.
      setTimeout(() => {
        if (isLoading.value) stop()
      }, 8000)
    })
  }

  return {
    isLoading,
    hasError,
    errorMessage,
    start,
    stop,
    reset,
    setError,
  }
}
