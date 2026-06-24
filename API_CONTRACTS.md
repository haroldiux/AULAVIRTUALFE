# Contratos API REST — LMS UNITEPC

> Documento de especificacion de endpoints para integracion backend Laravel 12.
> Base URL: `http://localhost:8000/api`

---

## 1. Autenticacion (SSO via SISA)

### POST /auth/login
Verifica token Sanctum contra SISA, devuelve token JWT del LMS.

```
Request:
{
  "sisa_token": "string"
}

Response 200:
{
  "usuario": { "id": 1, "nombre": "Dr. Carlos Mendoza", "email": "...", "rol": "docente", "avatar": "..." },
  "token": "jwt-token-lms",
  "rol": "docente"
}

Response 401: { "error": "Token SISA invalido" }
```

### POST /auth/logout
Invalida el token actual.

```
Headers: Authorization: Bearer {token}
Response 200: { "message": "Sesion cerrada" }
```

### GET /auth/me
Devuelve datos del usuario autenticado.

```
Headers: Authorization: Bearer {token}
Response 200: { "id": 1, "nombre": "...", "rol": "docente", ... }
```

---

## 2. Cursos

### GET /cursos
Lista cursos del usuario autenticado (filtrado por rol).

```
Headers: Authorization: Bearer {token}
Query: ?estado=publicado|borrador&gestion=1-2026

Response 200:
{
  "data": [
    { "id": 1, "codigo": "SIS-401", "nombre": "Programacion Avanzada",
      "descripcion": "...", "docente_id": 1, "carrera_id": 1,
      "gestion": "1-2026", "estado": "publicado", "total_estudiantes": 35,
      "total_actividades": 12, "secciones": [...] }
  ]
}
```

### GET /cursos/{id}
Detalle completo de un curso con secciones y actividades.

```
Response 200:
{
  "data": {
    "id": 1, "...",
    "secciones": [
      { "id": 1, "titulo": "Unidad I", "descripcion": "...", "orden": 1,
        "actividades": [
          { "id": 1, "tipo": "tarea", "titulo": "...", ... }
        ]
      }
    ]
  }
}
```

### POST /cursos
Crear curso manualmente.

```
Request:
{
  "codigo": "SIS-499",
  "nombre": "Nuevo Curso",
  "descripcion": "...",
  "carrera_id": 1,
  "gestion": "1-2026",
  "estado": "borrador"
}

Response 201: { "data": { "id": 4, ... } }
```

### PUT /cursos/{id}
Actualizar datos del curso.

```
Request: { "nombre": "...", "descripcion": "..." }
Response 200: { "data": { ... } }
```

### PUT /cursos/{id}/publicar
Publica el curso (cambia estado a 'publicado').

```
Response 200: { "data": { ... } }
```

### DELETE /cursos/{id}
Archiva el curso (soft delete, estado = 'archivado').

```
Response 200: { "message": "Curso archivado" }
```

---

## 3. Sincronizacion SISA

### POST /sisa/generar-curso
Genera un curso completo desde el PAC de SISA.

```
Request:
{
  "sisa_codigo": "SIS-401",
  "gestion": "1-2026"
}

Response 201:
{
  "data": {
    "curso_id": 5,
    "secciones_creadas": 4,
    "actividades_base": 8,
    "mensaje": "Curso generado desde SISA exitosamente"
  }
}
```

### GET /sisa/asignaturas-disponibles
Lista asignaturas en SISA disponibles para generar cursos.

```
Query: ?docente_id=1&gestion=1-2026

Response 200:
{
  "data": [
    { "codigo": "SIS-401", "nombre": "Programacion Avanzada", "pac_disponible": true },
    { "codigo": "SIS-305", "nombre": "Base de Datos II", "pac_disponible": true }
  ]
}
```

---

## 4. Secciones

### POST /cursos/{cursoId}/secciones
Agregar seccion a un curso.

```
Request: { "titulo": "Unidad V", "descripcion": "...", "orden": 5 }
Response 201: { "data": { "id": 11, ... } }
```

### PUT /secciones/{id}
Actualizar seccion.

```
Request: { "titulo": "...", "descripcion": "..." }
Response 200: { "data": { ... } }
```

### DELETE /secciones/{id}
Eliminar seccion y sus actividades.

```
Response 200: { "message": "Seccion eliminada" }
```

### PUT /cursos/{cursoId}/secciones/reordenar
Reordenar secciones del curso.

```
Request: { "orden": [3, 1, 2] }
Response 200: { "message": "Orden actualizado" }
```

---

## 5. Actividades

### GET /secciones/{seccionId}/actividades
Lista actividades de una seccion.

```
Response 200:
{
  "data": [
    { "id": 1, "tipo": "tarea", "titulo": "...", "orden": 1,
      "tiene_nota": true, "nota_maxima": 100, "peso": 1.0,
      "config": { "fecha_entrega": "...", ... } }
  ]
}
```

### POST /secciones/{seccionId}/actividades
Crear actividad.

```
Request:
{
  "tipo": "tarea",
  "titulo": "Tarea 1",
  "descripcion": "...",
  "tiene_nota": true,
  "nota_maxima": 100,
  "peso": 1.0,
  "config": { "fecha_entrega": "2026-03-15T23:59:00", ... }
}

Response 201: { "data": { "id": 31, ... } }
```

### PUT /actividades/{id}
Actualizar actividad.

```
Request: { "titulo": "...", "config": { ... } }
Response 200: { "data": { ... } }
```

### DELETE /actividades/{id}
Eliminar actividad.

```
Response 200: { "message": "Actividad eliminada" }
```

### PUT /secciones/{seccionId}/actividades/reordenar
Reordenar actividades dentro de una seccion.

```
Request: { "orden": [5, 3, 7] }
Response 200: { "message": "Orden actualizado" }
```

---

## 6. Entregas (Estudiantes)

### GET /actividades/{actId}/entregas
Lista entregas de una actividad (docente ve todas, estudiante ve las suyas).

```
Response 200:
{
  "data": [
    { "id": 1, "estudiante_id": 100, "contenido": { "texto": "...", "archivos": [...] },
      "fecha_entrega": "2026-03-14T10:30:00", "estado": "entregado" }
  ]
}
```

### POST /actividades/{actId}/entregas
Entregar actividad (estudiante).

```
Request:
{
  "contenido": { "texto": "Mi respuesta...", "archivos": [{ "nombre": "tarea.pdf", "url": "..." }] }
}

Response 201: { "data": { "id": 2, "estado": "entregado" } }
```

### GET /entregas/{id}
Ver detalle de una entrega.

```
Response 200: { "data": { ... } }
```

---

## 7. Calificaciones

### GET /cursos/{cursoId}/calificaciones
Libro de calificaciones completo del curso.

```
Query: ?estudiante_id=100 (opcional, filtra por estudiante)

Response 200:
{
  "data": {
    "estudiantes": [
      { "id": 100, "nombre": "...",
        "notas": [
          { "actividad_id": 1, "nota": 85, "nota_maxima": 100, "porcentaje": 85, "retroalimentacion": "..." }
        ],
        "promedio": 78.5
      }
    ],
    "promedio_general": 72.3,
    "pendientes_calificar": 42
  }
}
```

### POST /entregas/{entregaId}/calificar
Calificar una entrega.

```
Request:
{
  "nota": 85.5,
  "retroalimentacion": "Buen trabajo. Mejora la documentacion.",
  "rubrica": [
    { "criterio": "contenido", "nivel": "excelente", "puntaje": 40 },
    { "criterio": "estructura", "nivel": "bueno", "puntaje": 18 }
  ]
}

Response 201: { "data": { "id": 1, ... } }
```

### PUT /calificaciones/{id}
Actualizar calificacion existente.

```
Request: { "nota": 90, "retroalimentacion": "Corregido." }
Response 200: { "data": { ... } }
```

---

## 8. Foros

### GET /actividades/{foroId}/hilos
Lista hilos del foro.

```
Query: ?pagina=1&por_pagina=20

Response 200:
{
  "data": [
    { "id": 1, "titulo": "...", "contenido": "...", "autor_id": 100,
      "fijado": false, "respuestas_count": 5, "fecha": "..." }
  ],
  "meta": { "pagina": 1, "total": 15 }
}
```

### POST /actividades/{foroId}/hilos
Crear un hilo de discusion.

```
Request: { "titulo": "...", "contenido": "..." }
Response 201: { "data": { "id": 3, ... } }
```

### GET /hilos/{id}/respuestas
Lista respuestas de un hilo.

```
Response 200:
{
  "data": [
    { "id": 1, "contenido": "...", "autor_id": 100, "fecha": "..." }
  ]
}
```

### POST /hilos/{id}/respuestas
Responder a un hilo.

```
Request: { "contenido": "..." }
Response 201: { "data": { "id": 5, ... } }
```

---

## 9. Cuestionarios

### GET /actividades/{quizId}/cuestionario
Obtener preguntas del cuestionario (estudiante, sin respuestas correctas).

```
Response 200:
{
  "data": {
    "tiempo_limite_minutos": 20,
    "preguntas": [
      { "id": 1, "tipo": "opcion_multiple", "enunciado": "...",
        "opciones": [{ "texto": "A", "id": 0 }, { "texto": "B", "id": 1 }] }
    ]
  }
}
```

### POST /actividades/{quizId}/intentos
Iniciar un intento del cuestionario.

```
Response 201: { "data": { "intento_id": 5, "tiempo_inicio": "..." } }
```

### POST /intentos/{intentoId}/responder
Enviar respuestas del cuestionario.

```
Request:
{
  "respuestas": [
    { "pregunta_id": 1, "seleccionadas": [0], "texto": null }
  ]
}

Response 200:
{
  "data": {
    "nota": 80,
    "nota_maxima": 100,
    "porcentaje": 80,
    "estado": "finalizado",
    "resultados": [
      { "pregunta_id": 1, "es_correcta": true, "puntaje_obtenido": 10 }
    ]
  }
}
```

---

## 10. Notificaciones

### GET /notificaciones
Lista notificaciones del usuario.

```
Query: ?no_leidas=true

Response 200:
{
  "data": [
    { "id": 1, "icon": "assignment_turned_in", "color": "green",
      "titulo": "...", "descripcion": "...", "curso": "...",
      "fecha": "...", "leida": false }
  ]
}
```

### PUT /notificaciones/{id}/leida
Marcar notificacion como leida.

```
Response 200: { "data": { ... } }
```

### PUT /notificaciones/leer-todas
Marcar todas como leidas.

```
Response 200: { "message": "Todas marcadas como leidas" }
```

---

## 11. Sincronizacion de Notas (Sistema Externo)

### POST /sync/enviar-notas
Envia calificaciones al sistema centralizado de notas.

```
Request:
{
  "curso_codigo": "SIS-401",
  "gestion": "1-2026",
  "notas": [
    { "estudiante_id": "12345", "actividad": "Tarea 1", "nota": 85.5, "nota_maxima": 100, "porcentaje": 85.5, "fecha_calificacion": "2026-06-15" }
  ]
}

Response 200:
{
  "data": { "enviadas": 35, "fallidas": 0, "mensaje": "Sincronizacion completada" }
}
```

### GET /sync/estado
Estado de la ultima sincronizacion.

```
Response 200:
{
  "data": { "ultima_sync": "2026-06-02T08:00:00", "estado": "exitoso", "notas_pendientes": 3 }
}
```

---

## 12. Dashboard / Reportes

### GET /dashboard/docente
KPIs del docente autenticado.

```
Response 200:
{
  "data": {
    "cursos_activos": 2, "total_estudiantes": 65,
    "promedio_general": 72, "pendientes_calificar": 12,
    "entregas_recientes": [...], "proximos_eventos": [...]
  }
}
```

### GET /dashboard/director
KPIs del director de carrera.

```
Query: ?carrera_id=1

Response 200:
{
  "data": {
    "cursos_activos": 2, "total_docentes": 2, "total_estudiantes": 90,
    "promedio_general": 62, "tasa_aprobacion": 78,
    "rendimiento_por_curso": [...], "alertas": [...]
  }
}
```

### GET /reportes/{tipo}
Exportar reporte (excel, pdf).

```
Query: ?formato=excel&curso_id=1

Response 200: (archivo binario)
```

---

## 13. Centros inteligentes por rol (previsto)

Endpoints futuros para reemplazar los mocks de `suiteRoles` y `herramientasDocente`.

### GET /centros/estudiante
Devuelve pendientes, actividades realizadas, metas y contadores por curso del estudiante autenticado. Las actividades no usan un flujo unico de "entrega": cada tipo define su modo de interaccion.

```
Response 200:
{
  "data": {
    "cursos": [{
      "id": 1,
      "codigo": "SIS-401",
      "contadores": { "realizadas": 4, "pendientes": 8, "total": 12, "label_realizadas": "4/12", "label_pendientes": "8/12" }
    }],
    "pendientes": [{
      "actividad_id": 2,
      "curso_id": 1,
      "tipo": "tarea",
      "modo_interaccion": "entrega",
      "regla_completado": "entrega_enviada",
      "requiere_entrega": true,
      "accion_label": "Subir tarea",
      "estado": "pendiente",
      "fecha": "2026-06-25T23:59:00"
    }],
    "realizadas": [{ "actividad_id": 4, "tipo": "cuestionario", "estado": "calificada", "nota": 42, "nota_maxima": 50 }],
    "metas": [{ "nombre": "Actividades realizadas", "actual": 4, "total": 12 }]
  }
}
```

### GET /centros/docente
Devuelve alertas, agenda, automatizaciones, banco docente y analitica del docente autenticado.

```
Response 200:
{
  "data": {
    "alertas": [{ "estudiante_id": 100, "curso_id": 1, "severidad": "alta", "factores": ["promedio_bajo"] }],
    "agenda": [{ "actividad_id": 2, "estado": "vencida", "fecha": "2026-03-15T23:59:00" }],
    "automatizaciones": [{ "id": 1, "condicion": "inactividad", "activa": true }],
    "plantillas": [{ "id": 1, "categoria": "actividad", "tipo": "tarea" }],
    "analitica": {
      "rangos": [2, 4, 8, 10],
      "tipos": { "tarea": 8, "foro": 4 },
      "cursos": [{ "curso_id": 1, "actividades_creadas": 9, "actividades_esperadas": 12, "label_contenido": "9/12" }]
    }
  }
}
```

### POST /centros/docente/asistente-generar
Crea una estructura editable desde el asistente docente.

```
Request:
{
  "curso_id": 1,
  "tipo": "tema-guiado",
  "tema": "Patrones de Diseno",
  "objetivo": "Aplicar patrones creacionales en un caso practico"
}

Response 201:
{
  "data": {
    "seccion_id": 1,
    "actividades_creadas": [31, 32, 33],
    "mensaje": "Estructura creada"
  }
}
```

### POST /centros/docente/actividades-guiadas
Crea una actividad desde el Estudio Docente respetando su interaccion y regla de completado.

```
Request:
{
  "curso_id": 1,
  "seccion_id": 2,
  "tipo": "cuestionario",
  "titulo": "Verificacion de la unidad",
  "objetivo": "Comprobar conceptos clave",
  "modo_interaccion": "intento_sistema",
  "regla_completado": "intento_finalizado",
  "requiere_entrega": false,
  "calificable": true,
  "puntos": 30,
  "fecha_limite": "2026-06-25T23:59:00",
  "banco_preguntas_id": 4,
  "rubrica_id": null
}

Response 201:
{
  "data": {
    "actividad_id": 40,
    "accion_estudiante": { "label": "Iniciar cuestionario", "icon": "quiz" },
    "mensaje": "Actividad creada"
  }
}
```

### GET /centros/director
Devuelve observatorio academico: riesgo por curso, cumplimiento docente y cobertura de contenidos con contadores.

```
Response 200:
{
  "data": {
    "cursos": [{
      "curso_id": 1,
      "riesgo": "medio",
      "promedio": 68,
      "cobertura": 9,
      "cobertura_total": 12,
      "cobertura_label": "9/12",
      "pendientes_docente": 4
    }],
    "docentes": [{ "docente_id": 1, "cumplimiento": 18, "cumplimiento_total": 24, "cumplimiento_label": "18/24", "pendientes_docente": 12 }]
  }
}
```

### GET /centros/admin/configuracion
Devuelve integraciones, servicios, politicas academicas y auditoria operativa.

```
Response 200:
{
  "data": {
    "configuraciones": [{ "id": "sisa", "estado": "online", "ultimo_sync": "2026-06-08T08:10:00" }],
    "politicas": [{ "id": "seguimiento", "valor": "Promedio < 60%" }],
    "auditoria": [{ "id": 1, "accion": "Sync SISA completado", "tipo": "success" }]
  }
}
```

### PUT /centros/admin/configuracion/{id}
Actualiza una configuracion global o pausa/reactiva una integracion.

```
Request: { "estado": "online", "config": { "timeout_segundos": 10 } }
Response 200: { "data": { "id": "sisa", "estado": "online" } }
```

---

## 14. Calendario Academico

### GET /calendario
Eventos del calendario filtrados por rango de fechas y opcionalmente por curso.

```
Query: ?desde=2026-06-01&hasta=2026-06-30&curso_id=1

Response 200:
{
  "data": [
    { "id": 1, "titulo": "Entrega Tarea 1", "tipo": "entrega", "fecha_inicio": "2026-06-15T23:59:00", "fecha_fin": null, "todo_el_dia": false, "curso_id": 1, "actividad_id": 5 }
  ]
}
```

### POST /calendario/eventos
Crear evento académico.

```
Request:
{
  "curso_id": 1,
  "actividad_id": null,
  "titulo": "Reunion de grupo",
  "descripcion": "...",
  "tipo": "evento_institucional",
  "fecha_inicio": "2026-06-20T10:00:00",
  "fecha_fin": "2026-06-20T11:00:00",
  "todo_el_dia": false
}

Response 201: { "data": { "id": 10, ... } }
```

### PUT /calendario/eventos/{id}
Actualizar evento.

### DELETE /calendario/eventos/{id}
Eliminar evento.

---

## 15. Mensajeria Interna

### GET /mensajes/conversaciones
Lista de conversaciones del usuario autenticado.

```
Response 200:
{
  "data": [
    { "id": 1, "asunto": "Duda Tarea 1", "ultimo_mensaje": "...", "no_leidos": 2, "participantes": [{ "id": 100, "nombre": "Ana Vargas" }] }
  ]
}
```

### POST /mensajes/conversaciones
Crear conversacion.

```
Request:
{
  "curso_id": 1,
  "asunto": "Consulta sobre la leccion",
  "participantes": [100, 101]
}

Response 201: { "data": { "id": 2, ... } }
```

### GET /mensajes/conversaciones/{id}
Mensajes de una conversacion paginados.

```
Query: ?pagina=1&por_pagina=20

Response 200:
{
  "data": [
    { "id": 1, "remitente_id": 100, "contenido": "...", "adjuntos": [], "leido": true, "created_at": "..." }
  ],
  "meta": { "pagina": 1, "total": 15 }
}
```

### POST /mensajes/conversaciones/{id}/mensajes
Enviar mensaje.

```
Request:
{
  "contenido": "...",
  "adjuntos": [{ "nombre": "...", "url": "..." }]
}

Response 201: { "data": { "id": 5, ... } }
```

### PUT /mensajes/{id}/leido
Marcar mensaje como leido.

---

## 16. Gestion de Usuarios y Matriculas (Admin)

### GET /admin/usuarios
Lista de usuarios con filtros.

```
Query: ?rol=estudiante&q=Ana&pagina=1

Response 200:
{
  "data": [{ "id": 100, "nombre": "Ana Vargas", "email": "...", "rol": "estudiante", "activo": true }],
  "meta": { "pagina": 1, "total": 120 }
}
```

### POST /admin/usuarios
Crear usuario local (admin o respaldo).

```
Request:
{
  "nombre": "...",
  "email": "...",
  "rol": "docente",
  "password": "..."
}

Response 201: { "data": { "id": 200, ... } }
```

### POST /admin/usuarios/importar-csv
Importar usuarios masivamente desde CSV.

```
Content-Type: multipart/form-data
Request: archivo CSV con columnas [nombre, email, rol, carrera_id]

Response 200:
{
  "data": { "creados": 45, "actualizados": 3, "errores": [] }
}
```

### PUT /admin/usuarios/{id}
Actualizar usuario.

### DELETE /admin/usuarios/{id}
Desactivar usuario.

### GET /cursos/{cursoId}/estudiantes
Estudiantes matriculados en un curso.

```
Response 200:
{
  "data": [
    { "id": 100, "nombre": "Ana Vargas", "estado": "activo", "fecha_matricula": "..." }
  ]
}
```

### POST /cursos/{cursoId}/matricular
Matricular un estudiante.

```
Request: { "estudiante_id": 100 }
Response 201: { "data": { "matricula_id": 1, ... } }
```

### POST /cursos/{cursoId}/desmatricular
Desmatricular un estudiante.

```
Request: { "estudiante_id": 100 }
Response 200: { "message": "Estudiante desmatriculado" }
```

### POST /cursos/{cursoId}/matricular-masivo
Matricular varios estudiantes a la vez.

```
Request: { "estudiantes_ids": [100, 101, 102] }
Response 200: { "data": { "matriculados": 3, "errores": [] } }
```

---

## 17. Banco Docente

### GET /banco-docente/plantillas
Plantillas del docente autenticado o publicas.

```
Query: ?categoria=actividad&tipo=tarea&publicas=true

Response 200:
{
  "data": [
    { "id": 1, "categoria": "actividad", "tipo": "tarea", "nombre": "Tarea base", "uso_count": 5 }
  ]
}
```

### POST /banco-docente/plantillas
Guardar plantilla.

```
Request:
{
  "categoria": "actividad",
  "tipo": "tarea",
  "nombre": "...",
  "descripcion": "...",
  "datos": { ... },
  "publica": false
}

Response 201: { "data": { "id": 4, ... } }
```

### PUT /banco-docente/plantillas/{id}
Actualizar plantilla.

### DELETE /banco-docente/plantillas/{id}
Eliminar plantilla.

### POST /banco-docente/plantillas/{id}/usar
Copiar plantilla a una seccion destino.

```
Request:
{
  "curso_id": 1,
  "seccion_id": 2
}

Response 201:
{
  "data": {
    "actividad_id": 40,
    "mensaje": "Plantilla copiada al curso"
  }
}
```

---

## Autenticacion

Todos los endpoints requieren el header:
```
Authorization: Bearer {jwt-token-lms}
```

Excepto: `POST /auth/login` y `GET /auth/me` (publicos para validacion SSO).

## Manejo de Errores

Formato estandar de error:
```json
{
  "error": true,
  "message": "Descripcion del error",
  "errors": {
    "campo": ["Error de validacion"]
  }
}
```

Codigos HTTP:
- 200: Exito
- 201: Creado
- 400: Error de validacion / datos incorrectos
- 401: No autenticado
- 403: No autorizado (rol incorrecto)
- 404: Recurso no encontrado
- 422: Datos de entrada invalidos
- 500: Error del servidor
