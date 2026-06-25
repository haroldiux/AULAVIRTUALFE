import { defineStore } from 'pinia'
import {
  actividades as mockActividades,
  calificaciones as mockCalificaciones,
  cursos as mockCursos,
  entregasEstudiante as mockEntregas,
  matriculas as mockMatriculas,
  usuarios as mockUsuarios,
} from 'src/mock/index.js'
import { isTrackedActivity } from 'src/utils/activityModel'

const reglasIniciales = [
  {
    id: 1,
    nombre: 'Recuperar estudiantes inactivos',
    descripcion: 'Notifica a estudiantes que no ingresaron durante 7 dias.',
    condicion: 'inactividad',
    umbral: 7,
    canal: 'Notificacion + correo',
    activa: true,
    ultimaEjecucion: '2026-06-06T09:30:00',
  },
  {
    id: 2,
    nombre: 'Refuerzo por bajo rendimiento',
    descripcion: 'Envia recursos de apoyo cuando el promedio baja de 60%.',
    condicion: 'promedio',
    umbral: 60,
    canal: 'Notificacion',
    activa: true,
    ultimaEjecucion: '2026-06-07T14:15:00',
  },
  {
    id: 3,
    nombre: 'Recordatorio de entrega vencida',
    descripcion: 'Avisa al estudiante cuando mantiene una actividad vencida.',
    condicion: 'vencida',
    umbral: 1,
    canal: 'Notificacion + correo',
    activa: false,
    ultimaEjecucion: null,
  },
]

const plantillasIniciales = [
  {
    id: 1,
    categoria: 'actividad',
    tipo: 'tarea',
    nombre: 'Proyecto integrador',
    descripcion: 'Entrega por hitos con instrucciones, archivos y calificacion.',
    uso: 8,
    datos: {
      tipo: 'tarea',
      titulo: 'Proyecto integrador',
      descripcion: 'Aplica los contenidos de la unidad en un producto demostrable.',
      tiene_nota: true,
      nota_maxima: 100,
      peso: 2,
      config: { archivos_permitidos: 'pdf,docx,zip', tamano_max_mb: 30, instrucciones: 'Incluye memoria, evidencias y enlace de demostracion.' },
    },
  },
  {
    id: 2,
    categoria: 'actividad',
    tipo: 'foro',
    nombre: 'Debate con evidencia',
    descripcion: 'Foro calificable para argumentar y responder a companeros.',
    uso: 12,
    datos: {
      tipo: 'foro',
      titulo: 'Debate con evidencia',
      descripcion: 'Argumenta tu postura y responde al menos a dos participaciones.',
      tiene_nota: true,
      nota_maxima: 20,
      peso: 0.5,
      config: { tipo_foro: 'debate', moderado: true, anonimo: false },
    },
  },
  {
    id: 3,
    categoria: 'rubrica',
    tipo: 'rubrica',
    nombre: 'Rubrica de proyecto academico',
    descripcion: 'Criterios para dominio conceptual, aplicacion y presentacion.',
    uso: 18,
    datos: {
      criterios: [
        { nombre: 'Dominio conceptual', puntos: 30 },
        { nombre: 'Aplicacion practica', puntos: 30 },
        { nombre: 'Calidad de evidencias', puntos: 25 },
        { nombre: 'Presentacion', puntos: 15 },
      ],
    },
  },
  {
    id: 4,
    categoria: 'preguntas',
    tipo: 'cuestionario',
    nombre: 'Banco de verificacion rapida',
    descripcion: 'Cinco preguntas base para diagnostico de una unidad.',
    uso: 6,
    datos: {
      totalPreguntas: 3,
      preguntas: [
        { id: 1, tipo: 'opcion_multiple', enunciado: 'Selecciona la afirmacion correcta sobre el tema.', opciones: [{ texto: 'Opcion correcta', es_correcta: true }, { texto: 'Distractor', es_correcta: false }], puntaje: 10 },
        { id: 2, tipo: 'verdadero_falso', enunciado: 'El concepto puede aplicarse en un caso practico.', opciones: [{ texto: 'Verdadero', es_correcta: true }, { texto: 'Falso', es_correcta: false }], puntaje: 10 },
        { id: 3, tipo: 'respuesta_corta', enunciado: 'Explica el concepto con tus palabras.', opciones: [], puntaje: 10 },
      ],
    },
  },
  {
    id: 101,
    categoria: 'preguntas_sisa',
    tipo: 'cuestionario',
    nombre: '[SISA] Banco de Programacion Avanzada (UML & POO)',
    descripcion: 'Banco de preguntas sincronizado desde SISA para la asignatura de Programacion.',
    uso: 0,
    datos: {
      totalPreguntas: 5,
      preguntas: [
        { id: 101, tipo: 'opcion_multiple', enunciado: '¿Qué patrón se enfoca en crear una única instancia de una clase?', opciones: [{ texto: 'Prototype', es_correcta: false }, { texto: 'Singleton', es_correcta: true }, { texto: 'Builder', es_correcta: false }, { texto: 'Factory', es_correcta: false }], puntaje: 20 },
        { id: 102, tipo: 'verdadero_falso', enunciado: 'El patrón Observer permite notificar cambios a múltiples suscriptores automáticamente.', opciones: [{ texto: 'Verdadero', es_correcta: true }, { texto: 'Falso', es_correcta: false }], puntaje: 20 },
        { id: 103, tipo: 'opcion_multiple', enunciado: '¿Cuál es la función del patrón Decorator?', opciones: [{ texto: 'Añadir responsabilidades a objetos dinámicamente', es_correcta: true }, { texto: 'Definir una familia de algoritmos', es_correcta: false }, { texto: 'Proporcionar una interfaz unificada', es_correcta: false }], puntaje: 20 },
        { id: 104, tipo: 'verdadero_falso', enunciado: 'El patrón Strategy permite alternar algoritmos en tiempo de ejecución.', opciones: [{ texto: 'Verdadero', es_correcta: true }, { texto: 'Falso', es_correcta: false }], puntaje: 20 },
        { id: 105, tipo: 'respuesta_corta', enunciado: 'Escribe el nombre del patrón estructural que actúa como un adaptador de interfaces incompatibles.', opciones: [], puntaje: 20 }
      ]
    }
  },
  {
    id: 102,
    categoria: 'preguntas_sisa',
    tipo: 'cuestionario',
    nombre: '[SISA] Banco de Base de Datos II (Transacciones & Optimización)',
    descripcion: 'Banco de preguntas sincronizado desde SISA para la asignatura de Base de Datos.',
    uso: 0,
    datos: {
      totalPreguntas: 4,
      preguntas: [
        { id: 201, tipo: 'opcion_multiple', enunciado: '¿Qué propiedad de las transacciones ACID asegura que los datos sean guardados permanentemente?', opciones: [{ texto: 'Atomicity', es_correcta: false }, { texto: 'Consistency', es_correcta: false }, { texto: 'Isolation', es_correcta: false }, { texto: 'Durability', es_correcta: true }], puntaje: 25 },
        { id: 202, tipo: 'verdadero_falso', enunciado: 'Un índice agrupado (clustered index) ordena físicamente las filas de la tabla en el disco.', opciones: [{ texto: 'Verdadero', es_correcta: true }, { texto: 'Falso', es_correcta: false }], puntaje: 25 },
        { id: 203, tipo: 'opcion_multiple', enunciado: '¿Cuál de los siguientes niveles de aislamiento evita lecturas sucias (dirty reads) pero permite lecturas no repetibles?', opciones: [{ texto: 'Read Uncommitted', es_correcta: false }, { texto: 'Read Committed', es_correcta: true }, { texto: 'Repeatable Read', es_correcta: false }, { texto: 'Serializable', es_correcta: false }], puntaje: 25 },
        { id: 204, tipo: 'verdadero_falso', enunciado: 'Un Trigger de tipo INSTEAD OF reemplaza la ejecución de la sentencia DML correspondiente.', opciones: [{ texto: 'Verdadero', es_correcta: true }, { texto: 'Falso', es_correcta: false }], puntaje: 25 }
      ]
    }
  },
  {
    id: 5,
    categoria: 'rubrica',
    tipo: 'rubrica',
    nombre: 'Rubrica de participacion',
    descripcion: 'Valora argumento, evidencia y respuesta respetuosa en foros.',
    uso: 9,
    datos: {
      criterios: [
        { nombre: 'Argumento principal', puntos: 40 },
        { nombre: 'Uso de evidencia', puntos: 35 },
        { nombre: 'Dialogo con companeros', puntos: 25 },
      ],
    },
  },
]

function actividadCurso(actividad) {
  return mockCursos.find((curso) => curso.secciones.some((seccion) => seccion.id === actividad.seccion_id))
}

function estudiantesCurso(cursoId) {
  const ids = mockMatriculas
    .filter((matricula) => matricula.curso_id === cursoId && matricula.estado === 'activo')
    .map((matricula) => matricula.estudiante_id)
  return mockUsuarios.filter((usuario) => ids.includes(usuario.id))
}

function promedioEstudiante(cursoId, estudianteId) {
  const notas = Object.values(mockCalificaciones[cursoId]?.[estudianteId] || {})
  if (!notas.length) return 0
  return Math.round(notas.reduce((total, nota) => total + Number(nota.porcentaje || 0), 0) / notas.length)
}

function diasInactividad(estudianteId) {
  const patrones = [2, 4, 7, 9, 13, 16, 1, 6, 11, 3]
  return patrones[estudianteId % patrones.length]
}

export const useHerramientasDocenteStore = defineStore('herramientasDocente', {
  state: () => ({
    reglas: reglasIniciales.map((regla) => ({ ...regla })),
    plantillas: plantillasIniciales.map((plantilla) => ({ ...plantilla, datos: { ...plantilla.datos } })),
    ejecuciones: [],
    creacionesGuiadas: [],
  }),

  getters: {
    alertasPorDocente: () => (docenteId) => {
      const cursos = mockCursos.filter((curso) => curso.docente_id === docenteId)
      return cursos
        .flatMap((curso) =>
          estudiantesCurso(curso.id).map((estudiante) => {
            const promedio = promedioEstudiante(curso.id, estudiante.id)
            const actividadesCurso = mockActividades.filter((actividad) =>
              curso.secciones.some((seccion) => seccion.id === actividad.seccion_id) && isTrackedActivity(actividad)
            )
            const entregas = mockEntregas.filter(
              (entrega) => entrega.estudiante_id === estudiante.id && actividadesCurso.some((actividad) => actividad.id === entrega.actividad_id)
            )
            const pendientes = entregas.filter((entrega) => entrega.estado === 'pendiente').length
            const realizadas = Math.max(actividadesCurso.length - pendientes, 0)
            const inactividad = diasInactividad(estudiante.id)
            const factores = []
            if (promedio < 60) factores.push('Promedio bajo')
            if (pendientes >= 3) factores.push(`${pendientes}/${actividadesCurso.length} actividades pendientes`)
            if (inactividad >= 7) factores.push(`${inactividad} dias sin acceso`)
            if (pendientes > realizadas) factores.push('Baja participacion')
            const severidad = factores.length >= 3 || promedio < 40 ? 'critica' : factores.length >= 2 ? 'alta' : 'media'
            return {
              id: `${curso.id}-${estudiante.id}`,
              cursoId: curso.id,
              curso: curso.nombre,
              cursoCodigo: curso.codigo,
              actividadId: actividadesCurso.find((actividad) => actividad.tiene_nota)?.id,
              estudiante,
              promedio,
              pendientes,
              participacion: realizadas,
              participacionTotal: actividadesCurso.length,
              participacionLabel: `${realizadas}/${actividadesCurso.length}`,
              inactividad,
              factores,
              severidad,
            }
          })
        )
        .filter((alerta) => alerta.factores.length > 0)
        .sort((a, b) => {
          const orden = { critica: 3, alta: 2, media: 1 }
          return orden[b.severidad] - orden[a.severidad] || a.promedio - b.promedio
        })
    },

    agendaPorDocente: () => (docenteId) =>
      mockActividades
        .map((actividad) => ({ actividad, curso: actividadCurso(actividad) }))
        .filter(({ curso, actividad }) => curso?.docente_id === docenteId && (actividad.config?.fecha_entrega || actividad.config?.fecha_limite))
        .map(({ actividad, curso }) => {
          const fecha = actividad.config.fecha_entrega || actividad.config.fecha_limite
          const fechaDate = new Date(fecha)
          const diferenciaDias = Math.ceil((fechaDate.getTime() - new Date().getTime()) / 86400000)
          return {
            ...actividad,
            cursoId: curso.id,
            curso: curso.nombre,
            cursoCodigo: curso.codigo,
            fecha,
            diferenciaDias,
            estadoAgenda: diferenciaDias < 0 ? 'vencida' : diferenciaDias <= 7 ? 'proxima' : 'programada',
          }
        })
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),

    analiticaPorDocente: () => (docenteId) => {
      const cursos = mockCursos.filter((curso) => curso.docente_id === docenteId)
      const estudiantes = cursos.flatMap((curso) =>
        estudiantesCurso(curso.id).map((estudiante) => ({
          cursoId: curso.id,
          promedio: promedioEstudiante(curso.id, estudiante.id),
        }))
      )
      const rangos = [0, 0, 0, 0]
      estudiantes.forEach(({ promedio }) => {
        if (promedio < 40) rangos[0]++
        else if (promedio < 60) rangos[1]++
        else if (promedio < 80) rangos[2]++
        else rangos[3]++
      })
      const tipos = {}
      cursos.forEach((curso) => {
        mockActividades
          .filter((actividad) => curso.secciones.some((seccion) => seccion.id === actividad.seccion_id))
          .forEach((actividad) => {
            tipos[actividad.tipo] = (tipos[actividad.tipo] || 0) + 1
          })
      })
      return {
        cursos: cursos.map((curso) => ({
          id: curso.id,
          codigo: curso.codigo,
          nombre: curso.nombre,
          progreso: mockActividades.filter((actividad) => curso.secciones.some((seccion) => seccion.id === actividad.seccion_id) && isTrackedActivity(actividad)).length,
          progresoTotal: Math.max(curso.secciones.length * 4, 1),
        })),
        rangos,
        tipos,
      }
    },
  },

  actions: {
    toggleRegla(id) {
      const regla = this.reglas.find((item) => item.id === id)
      if (regla) regla.activa = !regla.activa
    },

    ejecutarRegla(id, destinatarios) {
      const regla = this.reglas.find((item) => item.id === id)
      if (!regla) return
      regla.ultimaEjecucion = new Date().toISOString()
      this.ejecuciones.unshift({ id: Date.now(), reglaId: id, fecha: regla.ultimaEjecucion, destinatarios })
    },

    registrarUsoPlantilla(id) {
      const plantilla = this.plantillas.find((item) => item.id === id)
      if (plantilla) plantilla.uso++
    },

    registrarCreacionGuiada(datos) {
      this.creacionesGuiadas.unshift({ id: Date.now(), ...datos, fecha: new Date().toISOString() })
      if (datos.tipo === 'cuestionario') this.registrarUsoPlantilla(4)
    },
  },
})
