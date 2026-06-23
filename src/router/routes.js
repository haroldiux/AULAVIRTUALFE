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
    component: () => import('pages/auth/LoginPage.vue'),
    meta: { public: true, title: 'Iniciar Sesion' },
  },
  {
    path: '/docente',
    component: () => import('layouts/MainLayout.vue'),
    meta: { roles: ['docente'] },
    children: [
      {
        path: '',
        redirect: '/docente/cursos',
      },
      {
        path: 'cursos',
        component: () => import('pages/docente/MisCursosPage.vue'),
        meta: { title: 'Mis Cursos' },
      },
      {
        path: 'curso/:id/builder',
        component: () => import('pages/docente/CursoBuilderPage.vue'),
        meta: { title: 'Builder de Curso' },
      },
      {
        path: 'curso/:id/preview',
        component: () => import('pages/docente/CursoPreviewPage.vue'),
        meta: { title: 'Previsualizar Curso' },
      },
      {
        path: 'dashboard',
        component: () => import('pages/docente/DashboardDocentePage.vue'),
        meta: { title: 'Dashboard Docente' },
      },
      {
        path: 'calificar',
        component: () => import('pages/docente/CalificarPage.vue'),
        meta: { title: 'Libro de Calificaciones' },
      },
      {
        path: 'herramientas',
        component: () => import('pages/docente/HerramientasDocentePage.vue'),
        meta: { title: 'Centro Inteligente Docente' },
      },
    ],
  },
  {
    path: '/estudiante',
    component: () => import('layouts/MainLayout.vue'),
    meta: { roles: ['estudiante'] },
    children: [
      {
        path: '',
        redirect: '/estudiante/dashboard',
      },
      {
        path: 'dashboard',
        component: () => import('pages/estudiante/DashboardEstudiantePage.vue'),
        meta: { title: 'Dashboard Estudiante' },
      },
      {
        path: 'cursos',
        component: () => import('pages/estudiante/MisCursosPage.vue'),
        meta: { title: 'Mis Cursos' },
      },
      {
        path: 'curso/:id',
        component: () => import('pages/estudiante/VerCursoPage.vue'),
        meta: { title: 'Ver Curso' },
      },
      {
        path: 'notas',
        component: () => import('pages/estudiante/MisNotasPage.vue'),
        meta: { title: 'Mis Notas' },
      },
      {
        path: 'centro',
        component: () => import('pages/estudiante/CentroEstudiantePage.vue'),
        meta: { title: 'Centro de Pendientes' },
      },
    ],
  },
  {
    path: '/director',
    component: () => import('layouts/MainLayout.vue'),
    meta: { roles: ['director'] },
    children: [
      {
        path: '',
        redirect: '/director/dashboard',
      },
      {
        path: 'dashboard',
        component: () => import('pages/director/DashboardDirectorPage.vue'),
        meta: { title: 'Dashboard Director' },
      },
      {
        path: 'seguimiento',
        component: () => import('pages/director/SeguimientoCursoPage.vue'),
        meta: { title: 'Seguimiento' },
      },
      {
        path: 'reportes',
        component: () => import('pages/director/ReportesPage.vue'),
        meta: { title: 'Reportes' },
      },
      {
        path: 'observatorio',
        component: () => import('pages/director/ObservatorioAcademicoPage.vue'),
        meta: { title: 'Observatorio Academico' },
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { roles: ['admin'] },
    children: [
      {
        path: '',
        redirect: '/admin/gestion',
      },
      {
        path: 'gestion',
        component: () => import('pages/admin/AdminPage.vue'),
        meta: { title: 'Gestion' },
      },
      {
        path: 'configuracion',
        component: () => import('pages/admin/ConfiguracionSistemaPage.vue'),
        meta: { title: 'Configuracion' },
      },
    ],
  },
  {
    path: '/test-loading',
    component: () => import('layouts/MainLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: '',
        component: () => import('pages/TestLoadingPage.vue'),
        meta: { title: 'Laboratorio de Animaciones' },
      },
    ],
  },
  {
    path: '/dev-access',
    component: () => import('layouts/MainLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: '',
        component: () => import('pages/auth/DevAccessPage.vue'),
        meta: { title: 'Acceso de Desarrollo' },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { title: 'Pagina no encontrada' },
  },
]

export default routes
