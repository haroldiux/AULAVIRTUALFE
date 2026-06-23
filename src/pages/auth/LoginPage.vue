<template>
  <q-layout>
    <TaLoadingScreen :visible="cargando" message="Iniciando sesion..." />
    <q-page-container>
      <q-page class="relative flex flex-center min-h-screen login-bg">
        <!-- Fondo -->
        <div class="absolute inset-0 login-bg-gradient" />
        <div class="absolute inset-0 login-bg-overlay" />

        <!-- Blobs -->
        <div class="login-blob login-blob--purple" />
        <div class="login-blob login-blob--teal" />

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
            <h1 class="text-4xl font-black text-white mb-1">Aula Virtual</h1>
            <p class="login-subtitle">UNITEPC — Plataforma LMS</p>
          </div>

          <!-- Card -->
          <div class="login-card">
            <!-- SSO -->
            <button class="login-btn-sso" @click="loginSSO">
              <q-icon name="shield" size="20px" />
              <span>Ingresar via SSO UNITEPC</span>
            </button>

            <div class="login-divider">
              <span>o accede con credenciales</span>
            </div>

            <!-- Fallback -->
            <div class="space-y-3">
              <div class="login-input-wrap">
                <q-icon name="person" size="18px" class="login-input-icon" />
                <input
                  v-model="credenciales.username"
                  type="text"
                  placeholder="Usuario"
                  class="login-input"
                  @keyup.enter="loginFallback"
                />
              </div>
              <div class="login-input-wrap">
                <q-icon name="lock" size="18px" class="login-input-icon" />
                <input
                  v-model="credenciales.password"
                  type="password"
                  placeholder="Contrasena"
                  class="login-input"
                  @keyup.enter="loginFallback"
                />
              </div>
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
            <p class="login-version">Prototipo funcional — Fase E5</p>
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

/* Blobs */
.login-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  opacity: 0.45;
  animation: blobPulse 10s ease-in-out infinite alternate;
}
.login-blob--purple {
  width: 400px; height: 400px;
  top: -120px; left: -120px;
  background: rgba(107, 63, 160, 0.35);
}
.login-blob--teal {
  width: 360px; height: 360px;
  bottom: -100px; right: -100px;
  background: rgba(13, 148, 136, 0.28);
  animation-delay: -5s;
}
@keyframes blobPulse {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.1); opacity: 0.55; }
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
  width: 76px; height: 76px; border-radius: 22px;
  background: linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 14px 40px rgba(13,148,136,0.32);
  animation: logoFloat 4s ease-in-out infinite;
}
@keyframes logoFloat {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Card */
.login-card {
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(26px); -webkit-backdrop-filter: blur(26px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 30px 70px -16px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.16);
}

/* Boton SSO */
.login-btn-sso {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%);
  color: white;
  font-size: 14px; font-weight: 700;
  border: none; cursor: pointer;
  box-shadow: 0 6px 18px rgba(13,148,136,0.32);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.login-btn-sso::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}
.login-btn-sso:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(13,148,136,0.42);
}
.login-btn-sso:hover::before {
  transform: translateX(100%);
}
.login-btn-sso:active {
  transform: scale(0.98);
}

/* Divider */
.login-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 22px 0;
  color: rgba(255,255,255,0.38);
  font-size: 12px;
  font-weight: 500;
}
.login-divider::before,
.login-divider::after {
  content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.12);
}

/* Inputs */
.login-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.login-input-icon {
  position: absolute;
  left: 14px;
  color: rgba(255,255,255,0.45);
  pointer-events: none;
}
.login-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.14);
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}
.login-input::placeholder { color: rgba(255,255,255,0.35); }
.login-input:focus {
  border-color: rgba(13,148,136,0.62);
  box-shadow: 0 0 0 3px rgba(13,148,136,0.18);
  background: rgba(255,255,255,0.12);
}

/* Boton submit */
.login-btn-submit {
  width: 100%;
  padding: 13px;
  border-radius: 12px;
  background: rgba(255,255,255,0.96);
  color: #5A2E8C;
  font-size: 14px; font-weight: 700;
  border: 1px solid rgba(255,255,255,0.32);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
}
.login-btn-submit:hover {
  background: rgba(255,255,255,1);
  border-color: rgba(255,255,255,0.45);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.16);
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
.login-link:hover { color: rgba(255,255,255,0.95); }

/* Utilidades */
.space-y-2 > * + * { margin-top: 8px; }
.space-y-3 > * + * { margin-top: 12px; }

.login-subtitle {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.72);
}

.login-version {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.38);
}
</style>
