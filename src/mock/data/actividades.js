// Seccion 1 - Unidad I Patrones (curso 1)
const s1 = [
  { id: 1, seccion_id: 1, tipo: 'leccion', titulo: 'Introduccion a Patrones de Diseno', descripcion: 'Historia, clasificacion y beneficios de los patrones GoF.', orden: 1, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 2, seccion_id: 1, tipo: 'tarea', titulo: 'Tarea 1 - Diagrama de Clases con Patrones', descripcion: 'Elaborar un diagrama UML aplicando al menos 3 patrones GoF.', orden: 2, tiene_nota: true, nota_maxima: 100, peso: 1.0, config: { fecha_entrega: '2026-03-15T23:59', fecha_limite: '2026-03-18T23:59', archivos_permitidos: 'pdf,docx,jpg', tamano_max_mb: 10, instrucciones: 'Incluir diagrama y explicacion de patrones' } },
  { id: 3, seccion_id: 1, tipo: 'foro', titulo: 'Foro Debate - Cual patron usar?', descripcion: 'Debatir que patron creacional es mas adecuado para sistemas de notificaciones.', orden: 3, tiene_nota: true, nota_maxima: 20, peso: 0.2, config: { tipo_foro: 'debate', moderado: true, anonimo: false } },
  { id: 4, seccion_id: 1, tipo: 'cuestionario', titulo: 'Quiz Rapido - Conceptos de Patrones', descripcion: 'Evaluacion de 5 preguntas sobre conceptos basicos de patrones.', orden: 4, tiene_nota: true, nota_maxima: 50, peso: 0.5, config: { tiempo_limite_minutos: 10, intentos_maximos: 2, aleatorio: true, preguntas: [{ id: 1, tipo: 'opcion_multiple', enunciado: 'Cual es un patron creacional?', opciones: [{ texto: 'Observer', es_correcta: false }, { texto: 'Singleton', es_correcta: true }, { texto: 'Adapter', es_correcta: false }, { texto: 'Decorator', es_correcta: false }], puntaje: 10 }, { id: 2, tipo: 'opcion_multiple', enunciado: 'El patron MVC separa:', opciones: [{ texto: 'Datos, Logica, Vista', es_correcta: true }, { texto: 'Cliente, Servidor, BD', es_correcta: false }, { texto: 'Input, Proceso, Output', es_correcta: false }], puntaje: 10 }, { id: 3, tipo: 'verdadero_falso', enunciado: 'El patron Factory Method delega la creacion a subclases', opciones: [{ texto: 'Verdadero', es_correcta: true }, { texto: 'Falso', es_correcta: false }], puntaje: 10 }] } },
  { id: 31, seccion_id: 1, tipo: 'h5p', titulo: 'Ejercicio Interactivo H5P - Patrones Creacionales', descripcion: 'Completa el ejercicio interactivo de verdadero/falso sobre patrones creacionales.', orden: 5, tiene_nota: true, nota_maxima: 100, peso: 0.8, config: { h5p_metadata: { title: 'Ejercicio H5P', mainLibrary: 'H5P.TrueFalse', version: '1.6' }, h5p_calificable: true, demo_content_path: '/h5p/contents/demo-1' } },
]

// Seccion 2 - Unidad II Arquitectura (curso 1)
const s2 = [
  { id: 5, seccion_id: 2, tipo: 'leccion', titulo: 'Arquitectura N-Capas', descripcion: 'Diseno de aplicaciones empresariales con separacion de responsabilidades.', orden: 1, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 6, seccion_id: 2, tipo: 'tarea', titulo: 'Tarea 2 - Diseno de Arquitectura', descripcion: 'Disenar la arquitectura para un sistema de gestion academica.', orden: 2, tiene_nota: true, nota_maxima: 100, peso: 1.5, config: { fecha_entrega: '2026-04-20T23:59', fecha_limite: '2026-04-23T23:59', archivos_permitidos: 'pdf,docx', tamano_max_mb: 15, instrucciones: 'Documentar cada capa y justificar decisiones' } },
  { id: 7, seccion_id: 2, tipo: 'foro', titulo: 'Foro - Mejores Practicas en Arquitectura', descripcion: 'Compartir experiencias y patrones arquitectonicos usados en proyectos reales.', orden: 3, tiene_nota: true, nota_maxima: 20, peso: 0.2, config: { tipo_foro: 'normal', moderado: false, anonimo: false } },
  { id: 8, seccion_id: 2, tipo: 'cuestionario', titulo: 'Evaluacion - Arquitectura de Software', descripcion: 'Cuestionario de 10 preguntas sobre patrones arquitectonicos.', orden: 4, tiene_nota: true, nota_maxima: 100, peso: 2.0, config: { tiempo_limite_minutos: 30, intentos_maximos: 1, aleatorio: true, preguntas: [{ id: 1, tipo: 'opcion_multiple', enunciado: 'Que capa contiene la logica de negocio?', opciones: [{ texto: 'Presentacion', es_correcta: false }, { texto: 'Negocio/Servicio', es_correcta: true }, { texto: 'Datos', es_correcta: false }, { texto: 'Infraestructura', es_correcta: false }], puntaje: 10 }] } },
]

// Seccion 3 - Unidad III Fullstack (curso 1)
const s3 = [
  { id: 9, seccion_id: 3, tipo: 'leccion', titulo: 'APIs RESTful con Node.js', descripcion: 'Creacion de endpoints REST con Express y buenas practicas.', orden: 1, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 10, seccion_id: 3, tipo: 'tarea', titulo: 'Tarea 3 - API REST Completa', descripcion: 'Implementar una API REST con al menos 5 endpoints CRUD.', orden: 2, tiene_nota: true, nota_maxima: 100, peso: 1.5, config: { fecha_entrega: '2026-05-15T23:59', fecha_limite: '2026-05-18T23:59', archivos_permitidos: 'zip,rar', tamano_max_mb: 20, instrucciones: 'Incluir codigo fuente y documentacion Swagger' } },
  { id: 11, seccion_id: 3, tipo: 'encuesta', titulo: 'Encuesta - Dificultad de la Unidad', descripcion: 'Evaluar la percepcion de los estudiantes sobre los temas vistos.', orden: 3, tiene_nota: false, nota_maxima: 0, peso: 0, config: { anonima: true, preguntas: [{ id: 1, tipo: 'escala', enunciado: 'Que tan dificil te parecio REST?', opciones: ['Muy facil', 'Facil', 'Normal', 'Dificil', 'Muy dificil'] }, { id: 2, tipo: 'texto_abierto', enunciado: 'Sugerencias:', opciones: [] }] } },
]

// Seccion 4 - Unidad IV Proyecto (curso 1)
const s4 = [
  { id: 12, seccion_id: 4, tipo: 'leccion', titulo: 'Guia del Proyecto Final', descripcion: 'Requisitos, rubrica y cronograma del proyecto integrador.', orden: 1, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 13, seccion_id: 4, tipo: 'tarea', titulo: 'Proyecto Final - Entrega', descripcion: 'Sistema completo aplicando patrones, arquitectura en capas y API REST.', orden: 2, tiene_nota: true, nota_maxima: 100, peso: 3.0, config: { fecha_entrega: '2026-06-25T23:59', fecha_limite: '2026-06-28T23:59', archivos_permitidos: 'zip', tamano_max_mb: 50, instrucciones: 'Incluir repositorio Git, documentacion y video demo' } },
  { id: 14, seccion_id: 4, tipo: 'foro', titulo: 'Foro - Consultas del Proyecto', descripcion: 'Espacio para resolver dudas sobre el proyecto final.', orden: 3, tiene_nota: false, nota_maxima: 0, peso: 0, config: { tipo_foro: 'pregunta_respuesta', moderado: true, anonimo: false } },
]

// Secciones curso 2 - Base de Datos II
const s5 = [
  { id: 15, seccion_id: 5, tipo: 'leccion', titulo: 'Indices y Planes de Ejecucion', descripcion: 'Tipos de indices, EXPLAIN y optimizacion de consultas lentas.', orden: 1, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 16, seccion_id: 5, tipo: 'tarea', titulo: 'Tarea 1 - Optimizacion de Consultas', descripcion: 'Optimizar 5 consultas SQL usando indices y reescritura.', orden: 2, tiene_nota: true, nota_maxima: 100, peso: 1.0, config: { fecha_entrega: '2026-03-20T23:59', fecha_limite: '2026-03-23T23:59', archivos_permitidos: 'sql,txt', tamano_max_mb: 5, instrucciones: 'Incluir consultas originales, EXPLAIN y version optimizada' } },
  { id: 17, seccion_id: 5, tipo: 'cuestionario', titulo: 'Quiz - Indices', descripcion: 'Evaluacion sobre tipos de indices y estrategias de optimizacion.', orden: 3, tiene_nota: true, nota_maxima: 60, peso: 0.6, config: { tiempo_limite_minutos: 15, intentos_maximos: 2, aleatorio: true, preguntas: [{ id: 1, tipo: 'opcion_multiple', enunciado: 'Que indice es mejor para busquedas de rango?', opciones: [{ texto: 'Hash', es_correcta: false }, { texto: 'B-Tree', es_correcta: true }, { texto: 'Bitmap', es_correcta: false }], puntaje: 20 }] } },
]
const s6 = [
  { id: 18, seccion_id: 6, tipo: 'leccion', titulo: 'Procedimientos Almacenados y Funciones', descripcion: 'Creacion de SPs, funciones escalares y de tabla en SQL Server y PostgreSQL.', orden: 1, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 19, seccion_id: 6, tipo: 'leccion', titulo: 'Triggers y Cursores', descripcion: 'Implementacion de triggers DML, DDL y cursores para procesamiento fila a fila.', orden: 2, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 20, seccion_id: 6, tipo: 'tarea', titulo: 'Tarea 2 - SPs y Triggers', descripcion: 'Crear 3 procedimientos y 2 triggers para un sistema de inventario.', orden: 3, tiene_nota: true, nota_maxima: 100, peso: 1.5, config: { fecha_entrega: '2026-04-25T23:59', fecha_limite: '2026-04-28T23:59', archivos_permitidos: 'sql', tamano_max_mb: 5, instrucciones: 'Script SQL completo con comentarios' } },
]
const s7 = [
  { id: 21, seccion_id: 7, tipo: 'leccion', titulo: 'Backups y Recuperacion', descripcion: 'Estrategias de respaldo, tipos de backup y planes de recuperacion.', orden: 1, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 22, seccion_id: 7, tipo: 'cuestionario', titulo: 'Evaluacion Final - BD II', descripcion: 'Evaluacion integral de todos los temas del curso.', orden: 2, tiene_nota: true, nota_maxima: 100, peso: 3.0, config: { tiempo_limite_minutos: 45, intentos_maximos: 1, aleatorio: false, preguntas: [{ id: 1, tipo: 'opcion_multiple', enunciado: 'Un trigger INSTEAD OF se ejecuta:', opciones: [{ texto: 'Despues del DML', es_correcta: false }, { texto: 'En lugar del DML', es_correcta: true }, { texto: 'Antes del DML', es_correcta: false }], puntaje: 10 }] } },
]

// Secciones curso 3 - Marketing Digital
const s8 = [
  { id: 23, seccion_id: 8, tipo: 'leccion', titulo: 'Que es el Marketing Digital?', descripcion: 'Conceptos fundamentales, evolucion y ecosistema digital actual.', orden: 1, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 24, seccion_id: 8, tipo: 'foro', titulo: 'Foro - Experiencias con Marketing Digital', descripcion: 'Comparte experiencias o campanas que te hayan llamado la atencion.', orden: 2, tiene_nota: true, nota_maxima: 15, peso: 0.3, config: { tipo_foro: 'normal', moderado: false, anonimo: false } },
]
const s9 = [
  { id: 25, seccion_id: 9, tipo: 'leccion', titulo: 'SEO On-Page y Off-Page', descripcion: 'Tecnicas de optimizacion para mejorar el posicionamiento organico.', orden: 1, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 26, seccion_id: 9, tipo: 'tarea', titulo: 'Tarea - Auditoria SEO', descripcion: 'Realizar una auditoria SEO basica de un sitio web real.', orden: 2, tiene_nota: true, nota_maxima: 100, peso: 1.0, config: { fecha_entrega: '2026-04-10T23:59', fecha_limite: '2026-04-13T23:59', archivos_permitidos: 'pdf,docx', tamano_max_mb: 10, instrucciones: 'Incluir analisis de palabras clave, meta tags, estructura y recomendaciones' } },
  { id: 27, seccion_id: 9, tipo: 'cuestionario', titulo: 'Quiz - Conceptos SEO', descripcion: 'Evaluacion de conceptos basicos de SEO.', orden: 3, tiene_nota: true, nota_maxima: 40, peso: 0.4, config: { tiempo_limite_minutos: 10, intentos_maximos: 2, aleatorio: true, preguntas: [] } },
]
const s10 = [
  { id: 28, seccion_id: 10, tipo: 'leccion', titulo: 'Estrategia de Contenido para Redes Sociales', descripcion: 'Creacion de calendarios editoriales, tipos de contenido y metricas.', orden: 1, tiene_nota: false, nota_maxima: 0, peso: 0, config: {} },
  { id: 29, seccion_id: 10, tipo: 'tarea', titulo: 'Tarea - Plan de Redes Sociales', descripcion: 'Crear un plan de contenido para 1 mes en 2 plataformas.', orden: 2, tiene_nota: true, nota_maxima: 100, peso: 1.5, config: { fecha_entrega: '2026-05-15T23:59', fecha_limite: '2026-05-18T23:59', archivos_permitidos: 'pdf,docx,xlsx', tamano_max_mb: 10, instrucciones: 'Incluir calendario, ejemplos de posts y metricas objetivo' } },
  { id: 30, seccion_id: 10, tipo: 'encuesta', titulo: 'Encuesta - Uso de Redes Sociales', descripcion: 'Analisis de habitos de consumo de redes sociales.', orden: 3, tiene_nota: false, nota_maxima: 0, peso: 0, config: { anonima: true, preguntas: [{ id: 1, tipo: 'opcion_multiple', enunciado: 'Que red social usas mas?', opciones: ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Twitter'] }, { id: 2, tipo: 'escala', enunciado: 'Influyen los anuncios en tu decision de compra?', opciones: ['Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Siempre'] }] } },
]

export default [].concat(s1, s2, s3, s4, s5, s6, s7, s8, s9, s10)
