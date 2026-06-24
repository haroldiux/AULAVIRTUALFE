<template>
  <q-layout view="hHh LpR lFf">
    <!-- Header — Glassmorphism premium -->
    <q-header
      class="app-header"
      height-hint="70"
    >
      <q-toolbar class="app-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="lt-md q-mr-md"
          color="white"
          aria-label="Abrir menu"
          @click="toggleLeftDrawer"
        />

        <!-- Logo UNITEPC -->
        <div class="app-brand" data-tour="brand">
          <div class="app-brand__mark">
            <q-icon name="school" size="22px" color="primary" />
          </div>
          <div class="gt-sm">
            <div class="text-subtitle1 text-weight-bold text-white">UNITEPC</div>
            <div class="text-caption text-weight-bold uppercase app-brand__caption">Aula Virtual</div>
          </div>
        </div>

        <!-- Search bar -->
        <div class="hidden md-block app-search" data-tour="global-search">
          <q-input
            dense
            filled
            placeholder="Buscar o escribir comando..."
            :bg-color="$q.dark.isActive ? 'grey-9' : 'white'"
            :input-style="{ color: $q.dark.isActive ? '#F1F5F9' : '#1E293B' }"
            class="full-width"
          >
            <template #prepend>
              <q-icon name="search" color="grey-5" />
            </template>
            <template #append>
              <q-chip dense size="xs" color="white" text-color="grey-7" class="text-caption">⌘K</q-chip>
            </template>
          </q-input>
        </div>

        <q-space />

        <q-btn
          flat
          round
          dense
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          color="white"
          aria-label="Cambiar tema"
          @click="toggleDark"
          class="q-mr-sm"
        >
          <q-tooltip>{{ $q.dark.isActive ? 'Modo Claro' : 'Modo Oscuro' }}</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="notifications"
          color="white"
          aria-label="Notificaciones"
          @click="toggleNotifPanel"
          class="q-mr-sm"
          data-tour="notifications"
        >
          <q-badge v-if="notifStore.cantidadNoLeidas" floating rounded color="negative">
            {{ notifStore.cantidadNoLeidas }}
          </q-badge>
          <q-tooltip>Notificaciones</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          no-caps
          icon="tips_and_updates"
          label="Tutoriales"
          color="white"
          class="q-mr-sm gt-xs"
          data-tour="tutorial-button"
          @click="startTutorial"
        >
          <q-tooltip>Iniciar guia de uso</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          icon="tips_and_updates"
          color="white"
          class="q-mr-sm lt-sm"
          data-tour="tutorial-button"
          @click="startTutorial"
        >
          <q-tooltip>Iniciar guia de uso</q-tooltip>
        </q-btn>

        <q-btn-dropdown
          flat
          dense
          no-icon-label
          :label="userIniciales"
          dropdown-icon="expand_more"
          color="white"
          class="q-ml-sm text-weight-bold profile-dropdown"
          data-tour="profile"
          @show="animateBars"
        >
          <q-list style="min-width: 320px" class="q-py-md profile-menu">
            <q-item class="column items-center q-pb-md">
              <q-avatar size="76px" class="q-mb-sm shadow-3 profile-avatar">
                <img :src="auth.userAvatar" />
              </q-avatar>
              <div class="text-h6 text-weight-bold text-primary">{{ auth.userName }}</div>
              <div class="text-caption text-grey-6">{{ roleLabel }}</div>
              <div class="text-caption text-secondary text-weight-bold uppercase q-mt-xs">Buenos dias</div>
            </q-item>

            <q-separator spaced />

            <q-item class="justify-center q-gutter-md">
              <q-btn round flat icon="notifications" size="sm" color="grey-6" aria-label="Notificaciones" @click="openNotifFromMenu">
                <q-tooltip>Notificaciones</q-tooltip>
                <q-badge v-if="notifStore.cantidadNoLeidas" floating rounded color="negative" />
              </q-btn>
              <q-btn round flat icon="mail" size="sm" color="grey-6" aria-label="Mensajes" to="/mensajes">
                <q-tooltip>Mensajes</q-tooltip>
              </q-btn>
              <q-btn round flat icon="bookmark" size="sm" color="grey-6" aria-label="Guardados">
                <q-tooltip>Guardados</q-tooltip>
              </q-btn>
              <q-btn round flat icon="settings" size="sm" color="grey-6" aria-label="Configuracion">
                <q-tooltip>Configuracion</q-tooltip>
              </q-btn>
            </q-item>

            <q-separator spaced />

            <q-item-label header class="text-weight-bold text-uppercase text-caption q-px-md text-grey-6">
              Actividad
            </q-item-label>
            <q-item class="q-px-md">
              <div class="full-width flex items-end justify-between" style="height: 100px; gap: 8px">
                <div
                  v-for="(bar, idx) in activityBars"
                  :key="idx"
                  class="flex column items-center justify-end flex-1"
                  style="height: 100%"
                >
                  <div
                    class="bar-chart__bar full-width"
                    :data-height="bar.height"
                    style="height: 0%; background: var(--gradient-unitepc); border-radius: 4px 4px 0 0"
                  />
                  <div class="text-caption text-grey-6 q-mt-xs">{{ bar.label }}</div>
                </div>
              </div>
            </q-item>

            <q-separator spaced />

            <q-item-label header class="text-weight-bold text-uppercase text-caption q-px-md text-grey-6">
              Instructores a seguir
            </q-item-label>
            <q-list dense>
              <q-item
                v-for="instructor in instructorsToFollow"
                :key="instructor.id"
                class="q-px-md"
              >
                <q-item-section avatar>
                  <q-avatar size="38px">
                    <img :src="instructor.avatar" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ instructor.name }}</q-item-label>
                  <q-item-label caption>{{ instructor.subject }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    rounded
                    dense
                    size="sm"
                    :label="instructor.following ? 'Siguiendo' : 'Seguir'"
                    :color="instructor.following ? 'positive' : 'primary'"
                    :outline="instructor.following"
                    @click="instructor.following = !instructor.following"
                    class="text-xs text-weight-bold"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <q-separator spaced />

            <q-item clickable v-close-popup @click="confirmarLogout" class="q-px-md logout-item">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>
              <q-item-section class="text-negative text-weight-medium">Cerrar Sesion</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- Sidebar — usa clases Quasar nativas bg-white / bg-dark -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      class="app-drawer"
    >
      <q-scroll-area class="fit">
        <!-- Menu -->
        <div class="q-px-md q-mt-sm" data-tour="sidebar">
          <div class="text-caption text-weight-bold uppercase tracking-widest text-white q-mb-sm q-px-sm" style="opacity: 0.6">MENU</div>
          <q-list class="q-gutter-y-xs">
            <q-item
              v-for="item in menuItems"
              :key="item.path"
              clickable
              v-ripple
              :to="item.path"
              exact
              class="sidebar-item"
              style="padding: 10px 14px; border-radius: 10px"
              :active-class="$q.dark.isActive ? 'sidebar-item--active-dark' : 'sidebar-item--active'"
            >
              <q-item-section avatar style="min-width: 0; padding-right: 12px">
                <q-icon :name="item.icon" size="20px" />
              </q-item-section>
              <q-item-section class="text-body2 text-weight-medium">{{ item.label }}</q-item-section>
            </q-item>
          </q-list>
        </div>

        <q-separator spaced class="q-mx-md" />

        <q-space class="q-mt-xl" />

        <!-- Footer sidebar -->
        <div class="absolute-bottom q-pa-lg q-gutter-y-xs">
          <q-item clickable v-ripple class="sidebar-item" style="padding: 10px 14px; border-radius: 10px" @click="toggleDark">
            <q-item-section avatar style="min-width: 0; padding-right: 12px">
              <q-icon :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'" size="20px" />
            </q-item-section>
            <q-item-section class="text-body2 text-weight-medium">{{ $q.dark.isActive ? 'Modo Claro' : 'Modo Oscuro' }}</q-item-section>
          </q-item>
          <q-item clickable v-ripple class="sidebar-item" style="padding: 10px 14px; border-radius: 10px" @click="confirmarLogout">
            <q-item-section avatar style="min-width: 0; padding-right: 12px">
              <q-icon name="logout" size="20px" color="negative" />
            </q-item-section>
            <q-item-section class="text-body2 text-weight-medium text-negative">Cerrar Sesion</q-item-section>
          </q-item>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Contenido — fondo Quasar nativo + transicion de pagina -->
    <q-page-container class="app-page-container">
      <router-view v-slot="{ Component }">
        <transition
          mode="out-in"
          @enter="onPageEnter"
          @leave="onPageLeave"
        >
          <component :is="Component" :key="router.currentRoute.value.fullPath" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Panel de Notificaciones -->
    <q-drawer v-model="notifPanel" side="right" bordered :width="360" overlay behavior="mobile" class="notif-drawer">
      <div class="row items-center q-pa-md app-notif-header">
        <div class="col text-subtitle1 text-weight-bold">Notificaciones</div>
        <div class="col-auto q-gutter-sm">
          <q-btn flat round dense icon="done_all" aria-label="Marcar todas leidas" @click="notifStore.marcarTodasLeidas()">
            <q-tooltip>Marcar todas leidas</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" aria-label="Cerrar panel" @click="notifPanel = false" />
        </div>
      </div>
      <q-scroll-area class="fit">
        <q-list separator>
          <q-item
            v-for="notif in notifStore.todasOrdenadas"
            :key="notif.id"
            clickable
            v-ripple
            @click="abrirNotificacion(notif)"
            :class="['notif-item q-py-md', { 'notif-unread': !notif.leida }]"
          >
            <q-item-section avatar>
              <q-avatar :color="notif.color" text-color="white" size="40px">
                <q-icon :name="notif.icon" size="20px" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label :class="{ 'text-weight-bold': !notif.leida }">{{ notif.titulo }}</q-item-label>
              <q-item-label caption lines="2">{{ notif.descripcion }}</q-item-label>
              <q-item-label caption class="q-mt-xs">
                <span class="text-grey-6">{{ notif.curso }}</span>
                <span class="text-grey-5"> - {{ formatoRelativo(notif.fecha) }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-btn flat round dense size="xs" icon="close" color="grey-5" aria-label="Eliminar notificacion" @click.stop="notifStore.eliminar(notif.id)" />
            </q-item-section>
          </q-item>
          <div v-if="notifStore.todasOrdenadas.length === 0" class="text-center q-pa-xl text-grey-6">
            <q-icon name="notifications_none" size="56px" color="grey-4" />
            <p class="q-mt-sm">No hay notificaciones</p>
          </div>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <AppTutorialGuide v-model="tutorialOpen" />
  </q-layout>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useCursosStore } from 'src/stores/cursos'
import { useActividadesStore } from 'src/stores/actividades'
import { useNotificacionesStore } from 'src/stores/notificaciones'
import AppTutorialGuide from 'src/components/tutorial/AppTutorialGuide.vue'
import anime from 'animejs'

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()
const notifStore = useNotificacionesStore()

const leftDrawerOpen = ref(false)
const notifPanel = ref(false)
const tutorialOpen = ref(false)

onMounted(async () => {
  await cursosStore.cargarCursos()
  actividadesStore.cargarDesdeCursos(cursosStore.cursos)
  notifStore.inicializar()
})

const menuItems = computed(() => {
  const menus = {
    docente: [
      { label: 'Dashboard', icon: 'dashboard', path: '/docente/dashboard' },
      { label: 'Mis Cursos', icon: 'library_books', path: '/docente/cursos' },
      { label: 'Calificar', icon: 'grade', path: '/docente/calificar' },
      { label: 'Calendario', icon: 'event', path: '/calendario' },
      { label: 'Mensajes', icon: 'mail', path: '/mensajes' },
      { label: 'Herramientas', icon: 'auto_awesome', path: '/docente/herramientas' },
    ],
    estudiante: [
      { label: 'Dashboard', icon: 'dashboard', path: '/estudiante/dashboard' },
      { label: 'Mis Cursos', icon: 'library_books', path: '/estudiante/cursos' },
      { label: 'Pendientes', icon: 'task_alt', path: '/estudiante/centro' },
      { label: 'Mis Notas', icon: 'grade', path: '/estudiante/notas' },
      { label: 'Calendario', icon: 'event', path: '/calendario' },
      { label: 'Mensajes', icon: 'mail', path: '/mensajes' },
    ],
    director: [
      { label: 'Dashboard', icon: 'dashboard', path: '/director/dashboard' },
      { label: 'Seguimiento', icon: 'visibility', path: '/director/seguimiento' },
      { label: 'Observatorio', icon: 'insights', path: '/director/observatorio' },
      { label: 'Reportes', icon: 'assessment', path: '/director/reportes' },
      { label: 'Calendario', icon: 'event', path: '/calendario' },
      { label: 'Mensajes', icon: 'mail', path: '/mensajes' },
    ],
    admin: [
      { label: 'Gestión', icon: 'settings', path: '/admin/gestion' },
      { label: 'Usuarios', icon: 'people', path: '/admin/usuarios' },
      { label: 'Configuración', icon: 'tune', path: '/admin/configuracion' },
      { label: 'Calendario', icon: 'event', path: '/calendario' },
      { label: 'Mensajes', icon: 'mail', path: '/mensajes' },
    ],
  }
  return menus[auth.userRole] ?? []
})

const activityBars = [
  { label: 'Lun', height: '40%' },
  { label: 'Mar', height: '65%' },
  { label: 'Mie', height: '50%' },
  { label: 'Jue', height: '85%' },
  { label: 'Vie', height: '60%' },
  { label: 'Sab', height: '45%' },
  { label: 'Dom', height: '30%' },
]

const instructorsToFollow = ref([
  { id: 1, name: 'Dr. Juan Perez', subject: 'Matematicas', avatar: 'https://i.pravatar.cc/150?u=6', following: false },
  { id: 2, name: 'Ing. Laura Gomez', subject: 'Programacion', avatar: 'https://i.pravatar.cc/150?u=7', following: true },
  { id: 3, name: 'Lic. Pedro Ruiz', subject: 'Ingles', avatar: 'https://i.pravatar.cc/150?u=8', following: false },
])

const roleLabel = computed(() => {
  const map = { docente: 'Docente', estudiante: 'Estudiante', director: 'Director', admin: 'Admin' }
  return map[auth.userRole] ?? ''
})

const userIniciales = computed(() => {
  if (!auth.userName) return '?'
  return auth.userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleNotifPanel() {
  notifPanel.value = !notifPanel.value
}

function openNotifFromMenu() {
  notifPanel.value = true
}

function abrirNotificacion(notif) {
  notifStore.marcarLeida(notif.id)
  notifPanel.value = false
  if (notif.ruta) {
    router.push(notif.ruta)
  }
}

function startTutorial() {
  if (!leftDrawerOpen.value && $q.screen.lt.md) {
    leftDrawerOpen.value = true
  }
  tutorialOpen.value = true
}

function toggleDark() {
  $q.dark.toggle()
  localStorage.setItem('lms_dark_mode', String($q.dark.isActive))
}

function confirmarLogout() {
  $q.dialog({
    title: 'Cerrar Sesion',
    message: 'Estas seguro de que deseas cerrar sesion?',
    cancel: true,
    persistent: false,
  }).onOk(async () => {
    await auth.logout()
    router.push('/login')
  })
}

function formatoRelativo(fechaStr) {
  const diff = Date.now() - new Date(fechaStr).getTime()
  const minutos = Math.floor(diff / 60000)
  if (minutos < 1) return 'Ahora'
  if (minutos < 60) return `Hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Hace ${horas}h`
  const dias = Math.floor(horas / 24)
  return `Hace ${dias} dias`
}

/* Transiciones de pagina con anime.js */
function onPageEnter(el, done) {
  nextTick(() => {
    anime({
      targets: el,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutCubic',
      complete: done,
    })
  })
}

function onPageLeave(el, done) {
  anime({
    targets: el,
    translateY: [0, -10],
    opacity: [1, 0],
    duration: 250,
    easing: 'easeInQuad',
    complete: done,
  })
}

function animateBars() {
  const bars = document.querySelectorAll('.bar-chart__bar')
  bars.forEach((bar) => { bar.style.height = '0%' })
  anime({
    targets: '.bar-chart__bar',
    height: (el) => el.dataset.height || '60%',
    delay: anime.stagger(60, { start: 100 }),
    duration: 1200,
    easing: 'easeOutElastic(1, .6)',
  })
}
</script>

<style scoped>
/* Solo animaciones internas del layout */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.profile-dropdown :deep(.q-btn-dropdown__arrow) {
  margin-left: 4px;
}

.profile-menu {
  border-radius: 20px;
  background: var(--ta-bg-card);
  border: 1px solid var(--ta-border-card);
  box-shadow: var(--shadow-card-hover);
}

.profile-avatar {
  border: 3px solid rgba(107, 63, 160, 0.18);
  padding: 2px;
}
.body--dark .profile-avatar {
  border-color: rgba(167, 139, 250, 0.22);
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.06);
}

.notif-drawer {
  background: var(--ta-bg-card);
}
</style>
