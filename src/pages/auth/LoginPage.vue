<template>
  <q-layout>
    <TaLoadingScreen :visible="cargando" message="Iniciando sesion..." />
    <q-page-container>
      <q-page class="relative flex flex-center min-h-screen login-bg">
        <!-- Fondo -->
        <div class="absolute inset-0 login-bg-gradient" />
        <div class="absolute inset-0 login-bg-overlay" />

        <!-- Particulas -->
        <div class="login-particles">
          <div v-for="i in 6" :key="i" class="login-particle" :style="particleStyle(i)" />
        </div>

        <div class="relative z-10 w-full max-w-sm mx-4">
          <!-- Logo -->
          <div class="text-center mb-10">
            <div class="login-logo mx-auto mb-5">
              <q-icon name="school" size="32px" color="white" />
            </div>
            <h1 class="text-4xl font-black text-white tracking-tight mb-1">Aula Virtual</h1>
            <p class="text-white/50 text-xs font-medium tracking-wider uppercase">UNITEPC — Plataforma LMS</p>
          </div>

          <!-- Card -->
          <div class="login-card">
            <!-- SSO -->
            <button class="login-btn-sso" @click="loginSSO">
              <q-icon name="shield" size="20px" />
              <span>Ingresar via SSO UNITEPC</span>
            </button>

            <div class="login-divider">
              <span>o</span>
            </div>

            <!-- Fallback -->
            <div class="space-y-3">
              <input
                v-model="credenciales.username"
                type="text"
                placeholder="Usuario"
                class="login-input"
                @keyup.enter="loginFallback"
              />
              <input
                v-model="credenciales.password"
                type="password"
                placeholder="Contrasena"
                class="login-input"
                @keyup.enter="loginFallback"
              />
              <button class="login-btn-submit" @click="loginFallback">
                Ingresar
              </button>
            </div>
          </div>

          <!-- Links -->
          <div class="text-center mt-6 space-y-2">
            <router-link to="/dev-access" class="login-link">
              <q-icon name="construction" size="14px" class="q-mr-xs" />
              Accesos de desarrollo
            </router-link>
            <p class="text-white/20 text-xs">Prototipo funcional — Fase E5</p>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import TaLoadingScreen from 'src/components/tailadmin/TaLoadingScreen.vue'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const cargando = ref(false)

const credenciales = reactive({ username: '', password: '' })

// Mapa de credenciales simples para fallback
const USUARIOS_FALLBACK = {
  docente: { username: 'docente', password: 'docente', id: 1 },
  estudiante: { username: 'estudiante', password: 'estudiante', id: 100 },
  director: { username: 'director', password: 'director', id: 200 },
  admin: { username: 'admin', password: 'admin', id: 300 },
}

function particleStyle(i) {
  const positions = [
    { top: '10%', left: '15%', size: '120px', delay: '0s', duration: '8s' },
    { top: '60%', left: '80%', size: '80px', delay: '2s', duration: '10s' },
    { top: '30%', left: '70%', size: '60px', delay: '4s', duration: '12s' },
    { top: '80%', left: '20%', size: '100px', delay: '1s', duration: '9s' },
    { top: '15%', left: '85%', size: '50px', delay: '3s', duration: '11s' },
    { top: '70%', left: '40%', size: '90px', delay: '5s', duration: '7s' },
  ]
  const p = positions[i - 1] || positions[0]
  return { top: p.top, left: p.left, width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.duration }
}

function loginSSO() {
  cargando.value = true
  $q.notify({ message: 'Redirigiendo a SSO UNITEPC...', color: 'info', timeout: 2000 })

  // TODO: Implementar flujo SSO real cuando el backend este listo
  // Por ahora: simular delay y mostrar mensaje
  setTimeout(() => {
    cargando.value = false
    $q.notify({
      message: 'El servicio SSO aun no esta disponible. Usa el acceso alternativo.',
      color: 'warning',
      timeout: 4000,
    })
  }, 2000)
}

function loginFallback() {
  const { username, password } = credenciales
  if (!username || !password) {
    $q.notify({ message: 'Ingresa usuario y contrasena', color: 'negative', timeout: 2000 })
    return
  }

  // Buscar usuario por credenciales
  const entrada = Object.values(USUARIOS_FALLBACK).find(
    (u) => u.username === username.toLowerCase().trim() && u.password === password
  )

  if (!entrada) {
    $q.notify({ message: 'Usuario o contrasena incorrectos', color: 'negative', timeout: 2000 })
    return
  }

  cargando.value = true
  setTimeout(() => {
    auth.login(entrada.id)
    router.push(auth.redirectPath)
  }, 1500)
}
</script>

<style scoped>
/* Fondo */
.login-bg { background: #0f0f23; }
.login-bg-gradient {
  background:
    radial-gradient(circle at 18% 20%, rgba(255,255,255,0.22) 0%, transparent 28%),
    radial-gradient(circle at 82% 18%, rgba(255,255,255,0.16) 0%, transparent 24%),
    linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%);
  opacity: 0.94;
}
.login-bg-overlay {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.09) 0%, transparent 40%);
}

/* Particulas */
.login-particles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.login-particle {
  position: absolute; border-radius: 50%; background: rgba(255,255,255,0.03);
  filter: blur(40px); animation: floatParticle linear infinite;
}
@keyframes floatParticle {
  0%,100% { transform: translate(0,0) scale(1); }
  25% { transform: translate(20px,-30px) scale(1.1); }
  50% { transform: translate(-10px,20px) scale(0.9); }
  75% { transform: translate(30px,10px) scale(1.05); }
}

/* Logo */
.login-logo {
  width: 72px; height: 72px; border-radius: 20px;
  background: linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 32px rgba(13,148,136,0.28);
  animation: logoFloat 4s ease-in-out infinite;
}
@keyframes logoFloat {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* Card */
.login-card {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.14);
}

/* Boton SSO */
.login-btn-sso {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%);
  color: white;
  font-size: 14px; font-weight: 700;
  border: none; cursor: pointer;
  box-shadow: 0 4px 14px rgba(13,148,136,0.32);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.login-btn-sso:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(13,148,136,0.42);
}
.login-btn-sso:active {
  transform: scale(0.98);
}

/* Divider */
.login-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 20px 0;
  color: rgba(255,255,255,0.3);
  font-size: 12px;
}
.login-divider::before,
.login-divider::after {
  content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1);
}

/* Inputs */
.login-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.16);
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}
.login-input::placeholder { color: rgba(255,255,255,0.35); }
.login-input:focus {
  border-color: rgba(13,148,136,0.62);
  box-shadow: 0 0 0 3px rgba(13,148,136,0.18);
  background: rgba(255,255,255,0.14);
}

/* Boton submit */
.login-btn-submit {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255,255,255,0.94);
  color: #5A2E8C;
  font-size: 14px; font-weight: 600;
  border: 1px solid rgba(255,255,255,0.28);
  cursor: pointer;
  transition: all 0.2s ease;
}
.login-btn-submit:hover {
  background: rgba(255,255,255,1);
  border-color: rgba(255,255,255,0.40);
}
.login-btn-submit:active {
  transform: scale(0.98);
}

/* Links */
.login-link {
  display: inline-flex; align-items: center;
  color: rgba(255,255,255,0.72);
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s ease;
}
.login-link:hover { color: rgba(255,255,255,0.92); }

/* Utilidades */
.space-y-2 > * + * { margin-top: 8px; }
.space-y-3 > * + * { margin-top: 12px; }
</style>
