<template>
  <q-layout>
    <TaLoadingScreen :visible="cargando" message="Iniciando sesion..." />
    <q-page-container>
      <q-page class="relative flex flex-center min-h-screen dev-bg">
        <!-- Fondo -->
        <div class="absolute inset-0 dev-bg-gradient" />

        <div class="relative z-10 w-full max-w-2xl mx-4">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="dev-logo mx-auto mb-4">
              <q-icon name="construction" size="28px" color="white" />
            </div>
            <h1 class="text-3xl font-black text-white mb-1">Accesos de Desarrollo</h1>
            <p class="text-white/55 text-sm">Selecciona un perfil para probar la aplicacion</p>
          </div>

          <!-- Grid de roles -->
          <div class="row q-col-gutter-md">
            <div v-for="(rol, nombre) in roles" :key="nombre" class="col-12 col-sm-6">
              <div class="dev-rol-card" :class="{ 'dev-rol-card--active': expandido[nombre] }">
                <!-- Header del rol -->
                <button class="dev-rol-header" :aria-expanded="expandido[nombre]" :aria-label="`Perfil ${rol.label}`" @click="toggleRol(nombre)">
                  <div class="flex items-center gap-3">
                    <div class="dev-rol-icon" :class="`bg-${rol.color}`">
                      <q-icon :name="rol.icon" size="20px" :color="rol.iconColor" />
                    </div>
                    <div class="text-left">
                      <div class="dev-rol-name">{{ rol.label }}</div>
                      <div class="dev-rol-count">{{ rol.usuarios.length }} usuarios</div>
                    </div>
                  </div>
                  <q-icon
                    :name="expandido[nombre] ? 'expand_less' : 'expand_more'"
                    size="20px"
                    class="text-white/30 transition-transform"
                    :class="{ 'rotate-180': expandido[nombre] }"
                  />
                </button>

                <!-- Lista de usuarios -->
                <Transition name="slide">
                  <div v-show="expandido[nombre]" class="dev-users-list">
                    <button
                      v-for="user in rol.usuarios"
                      :key="user.id"
                      class="dev-user-btn"
                      :aria-label="`Ingresar como ${user.nombre}`"
                      @click="doLogin(user)"
                    >
                      <img :src="user.avatar" class="dev-user-avatar" />
                      <div class="dev-user-info">
                        <div class="dev-user-name">{{ user.nombre }}</div>
                        <div class="dev-user-email">{{ user.email }}</div>
                      </div>
                      <q-icon name="login" size="16px" class="text-white/30" />
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <!-- Volver -->
          <div class="text-center mt-8">
            <router-link to="/login" class="dev-link">
              <q-icon name="arrow_back" size="14px" class="q-mr-xs" />
              Volver al login
            </router-link>
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

const expandido = reactive({
  docente: false,
  estudiante: false,
  director: false,
  admin: false,
})

// Usuarios del seeder del backend (password: clave-aula-2026)
const DEV_PASSWORD = 'clave-aula-2026'
const USUARIOS_SEEDER = [
  { id: 1, nombre: 'Dr. Carlos Mendoza', email: 'carlos.mendoza@unitepc.edu', rol: 'docente', avatar: 'https://i.pravatar.cc/100?img=12' },
  { id: 2, nombre: 'Ing. Lucia Fernandez', email: 'lucia.fernandez@unitepc.edu', rol: 'docente', avatar: 'https://i.pravatar.cc/100?img=45' },
  { id: 3, nombre: 'Lic. Roberto Suarez', email: 'roberto.suarez@unitepc.edu', rol: 'director', avatar: 'https://i.pravatar.cc/100?img=33' },
  { id: 4, nombre: 'Administrador UNITEPC', email: 'admin@unitepc.edu', rol: 'admin', avatar: 'https://i.pravatar.cc/100?img=68' },
  { id: 5, nombre: 'Ana Vargas', email: 'ana.vargas@estudiante.unitepc.edu', rol: 'estudiante', avatar: 'https://i.pravatar.cc/100?img=5' },
  { id: 6, nombre: 'Bruno Calle', email: 'bruno.calle@estudiante.unitepc.edu', rol: 'estudiante', avatar: 'https://i.pravatar.cc/100?img=15' },
  { id: 7, nombre: 'Camila Paz', email: 'camila.paz@estudiante.unitepc.edu', rol: 'estudiante', avatar: 'https://i.pravatar.cc/100?img=25' },
  { id: 8, nombre: 'Diego Rojas', email: 'diego.rojas@estudiante.unitepc.edu', rol: 'estudiante', avatar: 'https://i.pravatar.cc/100?img=13' },
  { id: 9, nombre: 'Eliana Quispe', email: 'eliana.quispe@estudiante.unitepc.edu', rol: 'estudiante', avatar: 'https://i.pravatar.cc/100?img=32' },
  { id: 10, nombre: 'Felix Mamani', email: 'felix.mamani@estudiante.unitepc.edu', rol: 'estudiante', avatar: 'https://i.pravatar.cc/100?img=51' },
]

const roles = {
  docente: { label: 'Docentes', icon: 'school', color: 'primary', iconColor: 'white', usuarios: USUARIOS_SEEDER.filter((u) => u.rol === 'docente') },
  estudiante: { label: 'Estudiantes', icon: 'person', color: 'secondary', iconColor: 'white', usuarios: USUARIOS_SEEDER.filter((u) => u.rol === 'estudiante') },
  director: { label: 'Directores', icon: 'supervisor_account', color: 'white', iconColor: 'primary', usuarios: USUARIOS_SEEDER.filter((u) => u.rol === 'director') },
  admin: { label: 'Administradores', icon: 'admin_panel_settings', color: 'white', iconColor: 'secondary', usuarios: USUARIOS_SEEDER.filter((u) => u.rol === 'admin') },
}

function toggleRol(nombre) {
  expandido[nombre] = !expandido[nombre]
}

async function doLogin(user) {
  cargando.value = true
  try {
    await auth.login(user.email, DEV_PASSWORD)
    $q.notify({ message: `Bienvenido, ${auth.userName}`, color: 'positive', timeout: 1500 })
    await router.push(auth.redirectPath)
  } catch (err) {
    $q.notify({ message: err?.message || 'No se pudo iniciar sesion', color: 'negative', timeout: 3000 })
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
/* Fondo */
.dev-bg { background: #0b1121; }
.dev-bg-gradient {
  background:
    radial-gradient(circle at 18% 18%, rgba(255,255,255,0.16) 0%, transparent 22%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.10) 0%, transparent 20%),
    linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%);
  opacity: 0.94;
}

/* Logo */
.dev-logo {
  width: 60px; height: 60px; border-radius: 16px;
  background: linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.24);
}

/* Card de rol */
.dev-rol-card {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 18px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}
.dev-rol-card:hover {
  background: rgba(255,255,255,0.10);
  border-color: rgba(255,255,255,0.26);
  box-shadow: 0 16px 34px rgba(0,0,0,0.28);
}

/* Header del rol */
.dev-rol-header {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
}
.dev-rol-header:hover {
  background: rgba(255,255,255,0.06);
}

.dev-rol-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.dev-rol-icon--white {
  background: rgba(255,255,255,0.92);
}

.dev-rol-icon--gradient {
  background: linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%);
}

.dev-rol-name {
  font-size: 15px; font-weight: 600;
  color: rgba(255,255,255,0.9);
}
.dev-rol-count {
  font-size: 12px;
  color: rgba(255,255,255,0.52);
}

/* Lista de usuarios */
.dev-users-list {
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dev-user-btn {
  width: 100%;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid transparent;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}
.dev-user-btn:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.12);
  transform: translateX(4px);
}

.dev-user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.15);
  flex-shrink: 0;
}

.dev-user-info { flex: 1; min-width: 0; }
.dev-user-name {
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.9);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dev-user-email {
  font-size: 11px;
  color: rgba(255,255,255,0.52);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* Link volver */
.dev-link {
  display: inline-flex; align-items: center;
  color: rgba(255,255,255,0.55);
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s ease;
}
.dev-link:hover { color: rgba(255,255,255,0.85); }

/* Transiciones */
.slide-enter-active { transition: all 0.3s ease-out; }
.slide-leave-active { transition: all 0.2s ease-in; }
.slide-enter-from,
.slide-leave-to {
  opacity: 0; max-height: 0; overflow: hidden;
}

.rotate-180 { transform: rotate(180deg); }
</style>
