# Design System — Aula Virtual Premium

> Documentacion de utilidades, componentes y tokens visuales creados en la refactorizacion premium (Fases 1-5).

---

## Tokens CSS (variables)

Archivo: `src/css/design-system.scss`

| Token | Valor (light) | Uso |
|---|---|---|
| `--radius-sm` | 8px | Chips, badges pequenos |
| `--radius-md` | 12px | Inputs, botones pequenos |
| `--radius-lg` | 20px | **Cards principales** |
| `--radius-xl` | 28px | Modales, dialogs grandes |
| `--radius-btn` | 10px | Botones premium |
| `--shadow-card` | 0 1px 3px rgba(0,0,0,0.08) | Cards en reposo |
| `--shadow-card-hover` | 0 10px 40px rgba(0,0,0,0.12) | Cards en hover |
| `--shadow-btn` | 0 2px 6px rgba(60,80,224,0.12) | Botones en reposo |
| `--shadow-btn-hover` | 0 4px 12px rgba(60,80,224,0.18) | Botones en hover |
| `--glass-bg` | rgba(255,255,255,0.75) | Fondos cristal (light) |
| `--glass-border` | rgba(0,0,0,0.06) | Bordes cristal (light) |

---

## Clases de utilidad

| Clase | Efecto |
|---|---|
| `.ta-card-reflection` | Card con overflow hidden + position relative (preparada para shine) |
| `.ta-btn-premium` | Boton con sombra sutil + transicion suave |
| `.card-glass` | Card con backdrop-filter blur 24px + borde glass |
| `.header-glass` | Header con backdrop-filter blur 20px saturate(180%) |
| `.ta-skeleton-shimmer` | Skeleton con animacion de brillo CSS |

---

## Componentes Base (TailAdmin)

### `TaCard.vue`
- Radio: **20px**
- Borde: 1px solid adaptativo al tema
- Hover: `translateY(-4px)` + sombra profunda
- **Preparada para `useReflectionHover`**

### `TaButton.vue`
- Variantes: `primary` (gradiente), `outline`, `ghost`, `danger`, `secondary`
- Radio: **10px**
- Primary usa `linear-gradient(135deg, #3C50E0, #4F5BEC)`
- **Preparada para `useButtonPress`**

### `TaInput.vue`
- Radio: **12px** (0.75rem)
- Altura: 46px
- Glow en focus: anillo de 4px con opacidad aumentada

### `TaKpiCard.vue`
- Radio: **20px**
- Icono con sombra de color
- Hover: sombra profunda + cambio de fondo sutil
- **Preparada para `useReflectionHover`**

### `TaLoadingScreen.vue`
- Glassmorphism: fondo blur + transparencia
- Logo con pulse suave
- 5 barras elasticas tipo ecualizador (anime.js)
- Uso: `<TaLoadingScreen :visible="cargando" message="..." />`

### `TaPageHeader.vue`
- Breadcrumbs + titulo + slot de acciones
- Sin cambios visuales (ya era limpio)

---

## Composables de Animacion (anime.js)

Archivo: `src/composables/useAnimations.js`

| Composable | Uso | Selector tipico |
|---|---|---|
| `useStaggerCards(selector)` | Entrada escalonada fade+slide de cards | `.card-item` |
| `useCardHover(selector)` | Hover con escala + sombra | `.curso-card` |
| `useBarChartAnimation(selector)` | Barras creciendo con elasticidad | `.bar-chart__bar` |
| `useRightPanelStagger(selector)` | Stagger para paneles laterales | `.right-panel-animate` |
| `useSkeletonPulse()` | Pulso de opacidad para skeletons | (usa targets manualmente) |
| `useReflectionHover(selector)` | **Efecto de brillo (shine) en hover** | `.ta-card-reflection` |
| `useButtonPress(selector)` | **Press con escala + rebote elastico** | `.ta-btn-premium` |
| `usePageLoadAnimation(selector, delay)` | **Entrada fade+slide de pagina** | `.page-animate` |
| `useRippleEffect(selector)` | **Ripple material en click** | `.ta-ripple` |

---

## Transiciones de Pagina (Router)

En `MainLayout.vue`, el `<router-view>` ahora tiene:
- **Entrada**: `translateY(20 → 0)` + `opacity(0 → 1)` en 400ms, `easeOutCubic`
- **Salida**: `translateY(0 → -10)` + `opacity(1 → 0)` en 250ms, `easeInQuad`
- Mode: `out-in` (la anterior sale primero)

---

## Notificaciones (Toast)

Todas las notificaciones `$q.notify()` heredan animacion CSS global:
- Entrada: `toastSlideIn` — slide desde abajo + scale bounce
- Easing: `cubic-bezier(0.175, 0.885, 0.32, 1.275)`

---

## Paginas ya refactorizadas

| Pagina | Mejoras aplicadas |
|---|---|
| `LoginPage.vue` | TaLoadingScreen, card 24px, botones premium |
| `DashboardDocentePage.vue` | TaKpiCard, sombras profundas |
| `DashboardEstudiantePage.vue` | TaKpiCard, content-card 20px, course-card 20px + shine |
| `MisCursosPage.vue` (docente) | TaCard + reflection hover, TaButton press |
| `MisCursosPage.vue` (estudiante) | TaCard + reflection hover |
| `CursoBuilderPage.vue` | seccion-card 16px, actividad-item hover slide |
| `CalificarPage.vue` | Tabla con row hover, bordes suaves, sticky column |
| `VerCursoPage.vue` | actividad-card 16px + shine |
| `ErrorNotFound.vue` | 404 flotante + planeta animado |

---

## Dark Mode

Todos los componentes premium son **full reactive** con `$q.dark.isActive` via `computed()` + `v-bind()` en CSS. No hay manipulacion de DOM para cambiar colores.

Para forzar recalculo al togglear tema, usar `computed()` para cualquier propiedad que dependa del tema.

---

## Checklist de consistencia

- [x] Cards: radio 20px (TaCard, TaKpiCard)
- [x] Botones: radio 10px, gradiente en primary
- [x] Inputs: radio 12px, glow en focus
- [x] Header: glassmorphism blur 20px
- [x] Sidebar items: radio 10px, gradiente en activo
- [x] Dialogs: radio 20px (global CSS)
- [x] Skeletons: shimmer CSS + stagger
- [x] Tablas: row hover con color primario sutil
- [x] Badges: scale(1.05) en hover
- [x] Listas: hover sutil con color primario
- [x] Notificaciones: slide+bounce en entrada
- [x] Scrollbar: estilizado en WebKit
- [x] Seleccion de texto: color primario semitransparente
- [x] Focus ring: anillo visible para accesibilidad
- [x] Transicion de tema: suave en body
- [x] Anime.js: stagger, reflection, press, ripple, page load
