# Cambios visuales y de UX/UI — Aula Virtual UNITEPC

> Documento de contexto para el equipo y agentes posteriores. Resume los cambios visuales, de accesibilidad y de rendimiento aplicados al frontend durante la sesion de trabajo con las skills de `ui-skills`.

---

## 1. Objetivo

Unificar y pulir la experiencia visual del LMS en todos los roles (estudiante, docente, director y admin), aplicando una linea base de calidad UI, accesibilidad, metadatos y rendimiento de animaciones.

---

## 2. Skills aplicadas

Se creo una suite local en `.opencode/skills/` adaptada al stack Vue 3 + Quasar 2 + Tailwind del proyecto:

| Skill | Uso |
|-------|-----|
| `baseline-ui` | Espaciado, jerarquia tipografica, layout, estados de carga/vacio, branding y dark/light mode. |
| `fixing-accessibility` | `aria-label` en botones icon-only, foco, teclado, contraste y HTML semantico. |
| `fixing-motion-performance` | Animar solo `transform`/`opacity`, respetar `prefers-reduced-motion`, evitar `will-change` permanente. |
| `fixing-metadata` | Titulos de pagina via router meta, `document.title`, Open Graph/Twitter, URL canonica. |

---

## 3. Cambios realizados

### 3.1 Estados de carga (loading)

- Se redisenio `src/components/ui/AppSkeleton.vue` con variantes contextuales:
  - `dashboard`, `card-grid`, `list`, `table`, `hero`, `compact`.
- Se creo `src/composables/useLoadingState.js` para estandarizar la carga con `minDuration`.
- Se aplico el patron de carga a las paginas principales:
  - Estudiante: `DashboardEstudiantePage`, `MisCursosPage`, `CentroEstudiantePage`, `MisNotasPage`, `VerCursoPage`.
  - Docente: `DashboardDocentePage`, `MisCursosPage`, `CalificarPage`, `HerramientasDocentePage`, `CursoBuilderPage`, `CursoPreviewPage`.
  - Director: `DashboardDirectorPage`, `SeguimientoCursoPage`, `ObservatorioAcademicoPage`, `ReportesPage`.
  - Admin: `AdminPage`, `ConfiguracionSistemaPage`.
- Se mejoro `src/components/tailadmin/TaLoadingScreen.vue` con logo UNITEPC, anillo giratorio y texto animado.

### 3.2 Estados vacios (empty states)

- Se creo `src/components/ui/AppEmptyState.vue` con estilo consistente para light/dark mode.
- Se migro todo el proyecto de `DashboardEmptyState` a `AppEmptyState`.
- Se elimino el componente obsoleto `src/components/dashboard/DashboardEmptyState.vue`.
- Se agregaron acciones claras en empty states relevantes, por ejemplo en `DashboardDocentePage.vue` con botones "Crear curso".

### 3.3 Accesibilidad

- Se revisaron todos los botones icon-only del proyecto y se les agrego `aria-label`:
  - `MainLayout.vue`: notificaciones, mensajes, guardados, configuracion, panel de notificaciones.
  - `CursoBuilderPage.vue`: editar/eliminar seccion, opciones de actividad, cerrar dialogo, eliminar plantilla.
  - `HerramientasDocentePage.vue`: enviar mensaje, abrir calificaciones, reprogramar, editar, ejecutar, usar plantilla.
  - `CalificarPage.vue`: editar calificacion, calificar entrega.
  - `ObservatorioAcademicoPage.vue`: ver detalle, contactar docente.
  - `BuilderCanvas.vue`: editar/eliminar seccion y bloque.
  - `ActividadLeccion.vue`: descargar archivo.
  - `ActividadTarea.vue`: eliminar archivo.
  - `AppTutorialGuide.vue`: cerrar tutorial.

### 3.4 Metadatos de pagina

- Se agrego/actualizo `meta.title` en rutas principales:
  - `/login`, `/dev-access`, catch-all.
  - Se diferenciaron los titulos "Dashboard" por rol: "Dashboard Docente", "Dashboard Estudiante", "Dashboard Director".
- Se agrego guarda en `src/router/index.js` para generar `document.title = "{titulo} | UNITEPC Aula Virtual"`.

### 3.5 Motion performance

- Se verifico que no exista `will-change` permanente.
- Se confirmo que `ActividadCuestionario.vue` limpia su `setInterval` en `onUnmounted`.
- Se dejo documentado que el spotlight del tutorial (`design-system.scss`) anima propiedades de layout de forma aislada y pequenia.

### 3.6 Baseline UI (pulido visual)

- Se eliminaron clases de `letter-spacing` no solicitadas (`tracking-tight`, `tracking-widest`) en `LoginPage.vue`, `DevAccessPage.vue` y `VerCursoPage.vue`.
- Se corrigio el contraste de `q-btn-toggle` en dark mode en:
  - `CentroEstudiantePage.vue`
  - `DashboardEstudiantePage.vue`
  - `HerramientasDocentePage.vue`
  - Cambio: envolver el toggle en un contenedor `.filter-bar` con fondo de tarjeta y bordes redondeados; el toggle usa `flat` para que los botones no seleccionados muestren texto `primary` sin fondo y el seleccionado tenga fondo `primary` con texto blanco.
- Se anadio variante `light` a `src/components/tailadmin/TaButton.vue` para botones sobre fondos oscuros/gradientes sin romper el sistema de variantes existente.
- Se actualizaron los botones de header en `CentroEstudiantePage.vue` a `variant="light"` para mejorar legibilidad sobre el gradiente institucional.
- Se preservaron los gradientes institucionales UNITEPC porque forman parte del branding.

### 3.7 Dark mode

- Se mejoraron tokens de color en `src/css/tailadmin-theme.scss`.
- Se ajustaron sombras y colores de `TaCard.vue`, `TaKpiCard.vue` y `LoginPage.vue` para mejor contraste en dark mode.

### 3.8 Modernizacion visual global (sesion UI skills)

Se aplico una revision completa con las skills `baseline-ui`, `frontend-design-system` y `tailwind-design-system` para lograr un look mas fresco, moderno y atractivo respetando la marca UNITEPC.

#### Tokens y sistema de diseno
- Se actualizaron sombras en `src/css/design-system.scss`: `--shadow-card`, `--shadow-card-hover`, `--shadow-btn`, `--shadow-btn-hover` y `--shadow-glow` mas suaves y con tinte de marca.
- Se anadio `--gradient-unitepc-radial` y clases de utilidad `.ta-aurora`, `.ta-blob--purple`, `.ta-blob--teal` para fondos decorativos modernos.
- Se mejoro el fondo de pagina en `src/css/tailadmin-theme.scss` con radiales sutiles de marca en light/dark.
- Se ajustaron colores de tarjeta, borde y texto para mejor contraste.
- Se modernizo la scrollbar con tinte primario.

#### Componentes base (`src/components/tailadmin/`)
- `TaCard.vue`: radio 22px, borde primario sutil en hover, barra de acento superior opcional (`accent`).
- `TaButton.vue`: primary con gradiente UNITEPC, danger con gradiente rojo, radio 12px, hover/active con transform.
- `TaKpiCard.vue`: icono 52px con sombra de marca, valor con gradiente de texto en light mode, trend redondeado.
- `TaPageHeader.vue`: hero con doble gradiente, shine sutil y mayor profundidad.
- `TaInput.vue`: focus con anillo de marca en light/dark mode.

#### Layout (`src/layouts/MainLayout.vue`)
- Header: search glassmorphism mejorado, hover redondeado en botones, logo con animacion sutil.
- Sidebar: items con gradiente activo y desplazamiento suave en hover.
- Dropdown de perfil: menu con fondo de tarjeta, borde del tema, sombra elevada, avatar con borde de marca.
- Panel de notificaciones: drawer con fondo de tema, avatares de color, padding mejorado.
- Se agregaron `aria-label` faltantes en botones icon-only del header.

#### Login (`src/pages/auth/LoginPage.vue`)
- Fondo con blobs púrpura/teal animados.
- Card glassmorphism con blur 26px, borde y sombra mas refinados.
- Boton SSO con efecto shine en hover.
- Inputs con iconos person/lock y estados focus institucionales.
- Logo flotante con sombra teal.

#### Dashboards principales
- `DashboardShell.vue`: envuelto en `.ta-aurora` para fondo decorativo.
- `DashboardChartCard.vue`: icono 46px, separador con color de tema.
- `DashboardEstudiantePage.vue`: buscador y `.filter-bar` con sombra y focus de marca.
- `DashboardDocentePage.vue`: boton principal con sombra de marca.
- `DashboardDirectorPage.vue`: `q-select` adaptativo a dark mode.
- `AdminPage.vue`: boton principal con sombra de marca.

#### Paginas secundarias
Se revisaron y pulieron visualmente:
- Estudiante: `MisCursosPage.vue`, `CentroEstudiantePage.vue`, `MisNotasPage.vue`, `VerCursoPage.vue`.
- Docente: `MisCursosPage.vue`, `CalificarPage.vue`, `HerramientasDocentePage.vue`, `CursoBuilderPage.vue`, `CursoPreviewPage.vue`.
- Director: `SeguimientoCursoPage.vue`, `ObservatorioAcademicoPage.vue`, `ReportesPage.vue`.
- Admin: `ConfiguracionSistemaPage.vue`.
- Auth: `DevAccessPage.vue`.

Cambios aplicados en estas paginas:
- Uso de `TaCard`, `TaButton`, `TaInput`, `AppEmptyState` para consistencia.
- Tarjetas con hover lift, bordes redondeados y sombras de marca.
- Tablas con cabecera sutil, hover en filas y bordes del tema.
- Badges/chips con colores institucionales y buen contraste dark.
- Heroes con gradiente institucional donde faltaban.
- Listas con `.av-list-item` y hover sutil.
- Dialogos con `.dialog-card` (radio 20px) y fondo de tarjeta.
- Correccion de `aria-label` en botones icon-only.
- Mejora de contrastes de texto en dark mode usando variables `--ta-text-*`.

#### Empty states
- `AppEmptyState.vue`: icono con fondo degradado suave de marca, forma redondeada moderna y sombra sutil.

---

## 4. Archivos clave modificados

- `src/components/ui/AppSkeleton.vue`
- `src/components/ui/AppEmptyState.vue` *(nuevo)*
- `src/components/tailadmin/TaLoadingScreen.vue`
- `src/components/tailadmin/TaCard.vue`
- `src/components/tailadmin/TaKpiCard.vue`
- `src/css/tailadmin-theme.scss`
- `src/composables/useLoadingState.js` *(nuevo)*
- `src/router/routes.js`
- `src/router/index.js`
- `src/pages/auth/LoginPage.vue`
- `src/pages/auth/DevAccessPage.vue`
- `src/layouts/MainLayout.vue`
- `src/components/tutorial/AppTutorialGuide.vue`
- `src/components/curso-builder/BuilderCanvas.vue`
- `src/components/actividades/ActividadLeccion.vue`
- `src/components/actividades/ActividadTarea.vue`
- `src/css/design-system.scss`
- `src/css/app.scss`
- `src/css/tailadmin-theme.scss`
- `src/components/dashboard/DashboardShell.vue`
- `src/components/dashboard/DashboardChartCard.vue`
- `src/components/ui/AppEmptyState.vue`
- `src/pages/estudiante/*.vue`
- `src/pages/docente/*.vue`
- `src/pages/director/*.vue`
- `src/pages/admin/*.vue`

---

## 5. Verificacion

- `npm run lint` ✅ sin errores.
- `npm run build` ✅ compilacion exitosa.
- Rutas publicas `/login` y `/dev-access` responden `200`.

---

## 6. Notas y proximos pasos

- Las skills locales requieren reiniciar opencode para que se carguen en futuras sesiones.
- Pendiente de validacion visual con screenshots una vez que Playwright este disponible.
- Se recomienda continuar aplicando `/fixing-accessibility` a formularios y `/baseline-ui` a nuevas pantallas.
- Los textos de `aria-label` estan en espanol; cuando el proyecto migre completamente a i18n, deberian moverse a las claves de traduccion.
- Se sugiere revisar con el usuario si quiere ajustar la intensidad de los blobs/auroras o mantener el glassmorphism actual.
