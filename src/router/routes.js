const isDev = process.env.DEV

// Eager load in dev to bypass Docker/WSL2 compile latency, lazy load in prod
const devPages = isDev ? import.meta.glob('../pages/**/*.vue', { eager: true }) : null
const devLayouts = isDev ? import.meta.glob('../layouts/**/*.vue', { eager: true }) : null

function page(path) {
  if (isDev) {
    const key = `../pages/${path}.vue`
    const component = devPages[key]
    if (!component) {
      console.error(`Page not found: ${key}`)
      return null
    }
    return component.default || component
  }
  return () => import(`../pages/${path}.vue`)
}

function layout(path) {
  if (isDev) {
    const key = `../layouts/${path}.vue`
    const component = devLayouts[key]
    if (!component) {
      console.error(`Layout not found: ${key}`)
      return null
    }
    return component.default || component
  }
  return () => import(`../layouts/${path}.vue`)
}

const routes = [
  {
    path: '/',
    redirect: () => {
      const stored = localStorage.getItem('auth_usuario')
      if (!stored) return '/login'
      try {
        const user = JSON.parse(stored)
        const map = {
          docente: '/docente/cursos',
          estudiante: '/estudiante/dashboard',
          director: '/director/dashboard',
          admin: '/admin/gestion',
        }
        return map[user.rol] ?? '/login'
      } catch {
        return '/login'
      }
    },
  },
  {
    path: '/login',
    component: page('auth/LoginPage'),
    meta: { public: true, title: 'Iniciar Sesion' },
  },
  {
    path: '/',
    component: layout('MainLayout'),
    children: [
      {
        path: 'calendario',
        component: page('shared/CalendarioPage'),
        meta: { title: 'Calendario' },
      },
      {
        path: 'mensajes',
        component: page('shared/MensajeriaPage'),
        meta: { title: 'Mensajes' },
      },
    ],
  },
  {
    path: '/docente',
    component: layout('MainLayout'),
    meta: { roles: ['docente'] },
    children: [
      {
        path: '',
        redirect: '/docente/cursos',
      },
      {
        path: 'cursos',
        component: page('docente/MisCursosPage'),
        meta: { title: 'Mis Cursos' },
      },
      {
        path: 'curso/:id/builder',
        component: page('docente/CursoBuilderPage'),
        meta: { title: 'Builder de Curso' },
      },
      {
        path: 'curso/:id/preview',
        component: page('docente/CursoPreviewPage'),
        meta: { title: 'Previsualizar Curso' },
      },
      {
        path: 'dashboard',
        component: page('docente/DashboardDocentePage'),
        meta: { title: 'Dashboard Docente' },
      },
      {
        path: 'calificar',
        component: page('docente/CalificarPage'),
        meta: { title: 'Libro de Calificaciones' },
      },
      {
        path: 'herramientas',
        component: page('docente/HerramientasDocentePage'),
        meta: { title: 'Centro Inteligente Docente' },
      },
    ],
  },
  {
    path: '/estudiante',
    component: layout('MainLayout'),
    meta: { roles: ['estudiante'] },
    children: [
      {
        path: '',
        redirect: '/estudiante/dashboard',
      },
      {
        path: 'dashboard',
        component: page('estudiante/DashboardEstudiantePage'),
        meta: { title: 'Dashboard Estudiante' },
      },
      {
        path: 'cursos',
        component: page('estudiante/MisCursosPage'),
        meta: { title: 'Mis Cursos' },
      },
      {
        path: 'curso/:id',
        component: page('estudiante/VerCursoPage'),
        meta: { title: 'Ver Curso' },
      },
      {
        path: 'notas',
        component: page('estudiante/MisNotasPage'),
        meta: { title: 'Mis Notas' },
      },
      {
        path: 'centro',
        component: page('estudiante/CentroEstudiantePage'),
        meta: { title: 'Centro de Pendientes' },
      },
    ],
  },
  {
    path: '/director',
    component: layout('MainLayout'),
    meta: { roles: ['director'] },
    children: [
      {
        path: '',
        redirect: '/director/dashboard',
      },
      {
        path: 'dashboard',
        component: page('director/DashboardDirectorPage'),
        meta: { title: 'Dashboard Director' },
      },
      {
        path: 'seguimiento',
        component: page('director/SeguimientoCursoPage'),
        meta: { title: 'Seguimiento' },
      },
      {
        path: 'reportes',
        component: page('director/ReportesPage'),
        meta: { title: 'Reportes' },
      },
      {
        path: 'observatorio',
        component: page('director/ObservatorioAcademicoPage'),
        meta: { title: 'Observatorio Academico' },
      },
    ],
  },
  {
    path: '/admin',
    component: layout('MainLayout'),
    meta: { roles: ['admin'] },
    children: [
      {
        path: '',
        redirect: '/admin/gestion',
      },
      {
        path: 'gestion',
        component: page('admin/AdminPage'),
        meta: { title: 'Gestion' },
      },
      {
        path: 'configuracion',
        component: page('admin/ConfiguracionSistemaPage'),
        meta: { title: 'Configuracion' },
      },
      {
        path: 'usuarios',
        component: page('admin/UsuariosPage'),
        meta: { title: 'Gestion de Usuarios' },
      },
      {
        path: 'plantillas',
        component: page('admin/PlantillasCursosPage'),
        meta: { title: 'Plantillas de Cursos' },
      },
    ],
  },
  {
    path: '/test-loading',
    component: layout('MainLayout'),
    meta: { public: true },
    children: [
      {
        path: '',
        component: page('TestLoadingPage'),
        meta: { title: 'Laboratorio de Animaciones' },
      },
    ],
  },
  {
    path: '/dev-access',
    component: page('auth/DevAccessPage'),
    meta: { public: true, title: 'Acceso de Desarrollo' },
  },
  {
    path: '/:catchAll(.*)*',
    component: page('ErrorNotFound'),
    meta: { title: 'Pagina no encontrada' },
  },
]

export default routes
