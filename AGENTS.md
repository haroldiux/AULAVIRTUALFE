# AGENTS.md — Aula Virtual LMS UNITEPC

> Instrucciones para Codex Desktop y agentes de IA en esta aplicacion Quasar/Vue.

## Stack Tecnologico

| Capa | Tecnologia | Version |
|---|---|---|
| Frontend | Vue.js | 3.5 |
| UI Framework | Quasar | 2.16 |
| Estado | Pinia | 3.x |
| Router | Vue Router | 4.x |
| HTTP | Axios | 1.x |
| i18n | vue-i18n | 11.x |
| Build | Vite via Quasar CLI | - |

## Estructura Del Proyecto

```text
Aula-virtual/
├── src/
│   ├── boot/            # i18n, axios, auth
│   ├── components/      # componentes reutilizables
│   │   ├── curso-builder/
│   │   ├── actividades/
│   │   ├── calificaciones/
│   │   └── tailadmin/
│   ├── composables/
│   ├── css/
│   ├── layouts/
│   ├── mock/
│   ├── pages/
│   ├── router/
│   ├── services/
│   └── stores/
├── API_CONTRACTS.md
├── DESIGN_SYSTEM.md
└── AGENTS.md
```

## Codex / Antigravity + CodeGraph

CodeGraph esta configurado como MCP global de Codex y Antigravity. El indice vive en `.codegraph/codegraph.db`.

Como se usa `--no-watch`, actualizar manualmente el indice antes de sesiones grandes. Debido a que el frontend es un submódulo Git y el backend está en la raíz, ambos comparten la misma base de datos de CodeGraph mediante un enlace simbólico (Junction).

Para actualizar el índice de cada parte, ejecuta:

```powershell
# Sincronizar cambios del backend (PHP/Laravel) en la raíz:
cd "C:\PROYECTOS\PROYECTO AULA VIRTUAL"
codegraph sync .

# Sincronizar cambios del frontend (Vue/Quasar) en su subdirectorio:
cd "C:\PROYECTOS\PROYECTO AULA VIRTUAL\Aula-virtual"
codegraph sync .
```

Si el índice se bloquea o queda inconsistente, puedes recrearlo ejecutando:

```powershell
# En la raíz (reindexa backend):
cd "C:\PROYECTOS\PROYECTO AULA VIRTUAL"
codegraph unlock .
codegraph index .

# En Aula-virtual (reindexa frontend):
cd "C:\PROYECTOS\PROYECTO AULA VIRTUAL\Aula-virtual"
codegraph unlock .
codegraph index .
```

## Skills Recomendados

- `aula-virtual-frontend-design-system`: cambios visuales, dashboards, builder, experiencia estudiante.
- `aula-virtual-tailwind-design-system`: tokens Tailwind, responsive, accesibilidad, dark mode.
- `aula-virtual-laravel-patterns`: backend Laravel 12 futuro y servicios de integracion.

No usar `quasar-solana-no-usar`; pertenece a un framework Solana distinto de Quasar Vue.

## Comandos

```powershell
npm run dev      # iniciar servidor de desarrollo en http://localhost:9000
npm run build    # compilar para produccion
npm run lint     # ejecutar ESLint
npm run format   # ejecutar Prettier
```

## Metodologia SDD

1. Cada feature se especifica en un issue/doc antes de implementar.
2. El desarrollo sigue las fases definidas en `PLAN_LMS_UNITEPC.md`.
3. Todo componente usa mock data hasta que el backend este listo.
4. Las stores de Pinia simulan operaciones CRUD sobre datos mock.

## Estado Actual

- Fase 0: Auth mock, roles, guards, layout multi-rol y dashboards completados.
- Fase 1: experiencia docente, cursos, wizard SISA mock y builder completados.
- Fase 2: experiencia estudiante, actividades interactivas, H5P y quiz timer completados.
- Fase 3: calificaciones, reportes, rubricas y panel admin completados.
- Pendiente: backend Laravel 12, integraciones SISA reales, estudiantes, notas y SSO real.

## Convenciones De Codigo

- Vue 3 Composition API con `<script setup>`.
- Componentes en PascalCase; stores/composables en camelCase.
- Stores Pinia con `defineStore` e ids descriptivos.
- Mock data como default export de arrays/objetos.
- Componentes de actividad con interfaz comun: props `actividad` y `modo` (`builder`, `estudiante`, `calificar`).
- UI con Quasar, Tailwind y componentes `src/components/tailadmin`.
- CSS con clases Quasar, utilidades Tailwind y estilos scoped cuando sea necesario.
