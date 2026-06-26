<template>
  <q-card
    flat
    bordered
    class="block-palette"
    :class="$q.dark.isActive ? 'block-palette--dark' : 'block-palette--light'"
    data-help="La Paleta de Bloques contiene todas las actividades y recursos que puedes arrastrar al lienzo central (canvas). Puedes agregar Lecciones, Tareas, Foros, Quizzes, contenido interactivo H5P, Carpetas para agrupar elementos y más."
    data-help-title="Paleta de Bloques"
  >
    <q-card-section :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'">
      <div class="text-subtitle2 text-weight-medium">Paleta de Bloques</div>
      <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Arrastra bloques al lienzo</div>
    </q-card-section>

    <q-separator />

    <div v-for="categoria in categorias" :key="categoria.nombre" class="q-pa-sm">
      <div class="text-caption text-weight-medium q-px-xs q-mb-xs" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">
        {{ categoria.nombre }}
      </div>

      <draggable
        :list="categoria.bloques"
        :group="{ name: 'canvas-blocks', pull: 'clone', put: false }"
        :sort="false"
        :clone="clonarBloque"
        item-key="id"
        ghost-class="palette-ghost"
        class="row q-col-gutter-xs"
      >
        <template #item="{ element: bloque }">
          <div class="col-6">
            <q-card
              flat
              bordered
              class="bloque-card cursor-grab"
              :class="[$q.dark.isActive ? 'bloque-card--dark' : 'bloque-card--light', bloque.tipo === 'carpeta' ? 'bloque-card--folder' : '']"
              :data-help="getHelpText(bloque)"
              :data-help-title="getHelpTitle(bloque)"
              :data-help-tip="getHelpTip(bloque)"
            >
              <q-card-section class="q-pa-sm text-center">
                <q-icon :name="bloque.icon" :color="bloque.color" size="sm" />
                <div class="text-caption text-weight-medium">{{ bloque.label }}</div>
                <div class="text-caption text-grey-6" style="font-size: 0.65rem">{{ bloque.desc }}</div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </draggable>
    </div>
  </q-card>
</template>

<script setup>
import draggable from 'vuedraggable'

const idCounter = { value: 1000 }

function clonarBloque(original) {
  idCounter.value++
  return {
    ...original,
    id: idCounter.value,
    esNuevo: true,
    titulo: '',
    descripcion: '',
    descargable: original.descargableDefault ?? false,
    config: { ...original.configDefault },
    // Las carpetas tienen una lista interna de bloques anidados
    ...(original.tipo === 'carpeta' ? { bloquesAnidados: [] } : {}),
  }
}

function getHelpTitle(bloque) {
  const titles = {
    leccion: 'Bloque de Lección',
    tarea: 'Bloque de Tarea',
    foro: 'Bloque de Foro',
    cuestionario: 'Bloque de Quiz (Cuestionario)',
    encuesta: 'Bloque de Encuesta',
    h5p: 'Bloque H5P Interactivo',
    texto: 'Bloque de Texto',
    imagen: 'Bloque de Imagen',
    video: 'Bloque de Video',
    archivo: 'Bloque de Archivo',
    separador: 'Bloque Separador Estructural',
    carpeta: 'Bloque de Carpeta',
  }
  return titles[bloque.tipo] || `Bloque de ${bloque.label}`
}

function getHelpText(bloque) {
  const texts = {
    leccion: 'Permite estructurar contenidos de lectura para tus alumnos con formato enriquecido. Ideal para explicaciones teóricas, guías de estudio o material de lectura obligatoria.',
    tarea: 'Habilita la recepción de trabajos académicos de los alumnos (archivos PDF, Word, imágenes o texto en línea). Permite definir fechas de entrega, límites de tamaño y nota máxima.',
    foro: 'Crea un espacio de discusión temático para debatir ideas, responder preguntas o fomentar la participación grupal de manera asíncrona.',
    cuestionario: 'Permite diseñar exámenes interactivos con límite de tiempo e intentos máximos. Puedes crear preguntas de opción múltiple, verdadero/falso, emparejamiento, etc.',
    encuesta: 'Recopila comentarios u opiniones anónimas de tus estudiantes acerca del curso, dinámicas de clase o autoevaluaciones del periodo.',
    h5p: 'Integra objetos de aprendizaje enriquecidos e interactivos como videos interactivos, presentaciones didácticas, tarjetas de memoria, juegos de palabras o quizzes dinámicos.',
    texto: 'Inserta párrafos de texto simple, instrucciones, etiquetas o avisos generales directamente en la página de la sección.',
    imagen: 'Muestra un recurso gráfico, fotografía, infografía o diagrama explicativo dentro de la sección del curso.',
    video: 'Incrusta videos educativos provenientes de plataformas externas como YouTube o Vimeo, permitiendo a los estudiantes verlos directamente en el Aula Virtual.',
    archivo: 'Sube archivos descargables para tus estudiantes (presentaciones de PowerPoint, archivos PDF, plantillas de Excel, guías en Word, etc.).',
    separador: 'Inserta una línea de división visual para organizar mejor los bloques y actividades dentro de una sección académica.',
    carpeta: 'Agrupa varios bloques de contenido o actividades dentro de una carpeta colapsable. Ideal para organizar recursos de un mismo tema. Puedes hacer toda la carpeta descargable en un solo clic.',
  }
  return texts[bloque.tipo] || 'Este es un bloque de plantilla. Arrástralo y suéltalo dentro de cualquier sección en el lienzo central para agregarlo a tu curso.'
}

function getHelpTip(bloque) {
  const tips = {
    leccion: 'Puedes insertar código HTML, enlaces y formato de texto estructurado en su editor.',
    tarea: 'Define rúbricas claras en las instrucciones para facilitar la calificación.',
    foro: 'Puedes configurar el foro como moderado o libre dependiendo de la dinámica pedagógica.',
    cuestionario: 'Usa el banco de preguntas del sistema para reutilizar reactivos de exámenes anteriores.',
    encuesta: 'Excelente para medir la satisfacción del grupo a mitad del semestre.',
    h5p: 'H5P permite calificar directamente los resultados del estudiante dentro de la plataforma.',
    texto: 'Úsalo para dar la bienvenida a una unidad o agregar breves descripciones contextuales.',
    imagen: 'Asegúrate de agregar un texto alternativo (Alt) para favorecer la accesibilidad.',
    video: 'Ideal para clases grabadas o recursos complementarios de autoaprendizaje.',
    archivo: 'Organiza tus archivos con nombres claros que indiquen su propósito académico.',
    separador: 'Ayuda a mantener la interfaz limpia y a diferenciar las lecturas de las tareas prácticas.',
    carpeta: 'Arrastra otros bloques dentro de la carpeta para agruparlos. Activa "Descargable" en la configuración para permitir la descarga de todos los elementos contenidos.',
  }
  return tips[bloque.tipo] || 'Arrastra este bloque al lienzo para empezar a usarlo.'
}


const categorias = [
  {
    nombre: 'Actividades',
    bloques: [
      { id: 'blk-leccion', tipo: 'leccion', label: 'Leccion', desc: 'Contenido lectura', icon: 'article', color: 'indigo', descargableDefault: false, configDefault: { contenido_html: '' } },
      { id: 'blk-tarea', tipo: 'tarea', label: 'Tarea', desc: 'Entrega archivos', icon: 'assignment', color: 'orange', descargableDefault: false, configDefault: { fecha_entrega: '', fecha_limite: '', archivos_permitidos: 'pdf,docx', tamano_max_mb: 10, instrucciones: '' } },
      { id: 'blk-foro', tipo: 'foro', label: 'Foro', desc: 'Discusion', icon: 'forum', color: 'teal', descargableDefault: false, configDefault: { tipo_foro: 'normal', moderado: false, anonimo: false } },
      { id: 'blk-quiz', tipo: 'cuestionario', label: 'Quiz', desc: 'Evaluacion', icon: 'quiz', color: 'purple', descargableDefault: false, configDefault: { tiempo_limite_minutos: 20, intentos_maximos: 1, aleatorio: false, preguntas: [] } },
      { id: 'blk-encuesta', tipo: 'encuesta', label: 'Encuesta', desc: 'Opinion', icon: 'poll', color: 'green', descargableDefault: false, configDefault: { anonima: false, fecha_cierre: '', preguntas: [] } },
      { id: 'blk-h5p', tipo: 'h5p', label: 'H5P', desc: 'Contenido interactivo', icon: 'extension', color: 'pink', descargableDefault: false, configDefault: { h5p_file: null, h5p_metadata: { title: '', mainLibrary: '', version: '' }, h5p_calificable: true, demo_content_path: '/h5p/contents/demo-1' } },
      { id: 'blk-rubrica', tipo: 'rubrica', label: 'Rúbrica', desc: 'Evaluación por Rúbrica/Cotejo', icon: 'fact_check', color: 'teal', descargableDefault: false, configDefault: { fecha_entrega: '', fecha_limite: '', archivos_permitidos: 'pdf,docx,zip', tamano_max_mb: 20, instrucciones: '', rubrica: { metodo_evaluacion: 'rubrica_ampliada', criterios: [], niveles: [] } } },
    ],
  },
  {
    nombre: 'Contenido',
    bloques: [
      { id: 'blk-texto', tipo: 'texto', label: 'Texto', desc: 'HTML enriquecido', icon: 'text_fields', color: 'grey-8', descargableDefault: false, configDefault: { contenido_html: '<p>Escribe tu contenido aqui...</p>' } },
      { id: 'blk-imagen', tipo: 'imagen', label: 'Imagen', desc: 'Grafico/foto', icon: 'image', color: 'blue-grey', descargableDefault: true, configDefault: { url: '', alt: '', caption: '' } },
      { id: 'blk-video', tipo: 'video', label: 'Video', desc: 'YouTube/Vimeo', icon: 'smart_display', color: 'red', descargableDefault: false, configDefault: { url: '', tipo: 'youtube' } },
      { id: 'blk-archivo', tipo: 'archivo', label: 'Archivo', desc: 'Descargable', icon: 'attach_file', color: 'brown', descargableDefault: true, configDefault: { nombre: '', url: '', tipo_archivo: '' } },
    ],
  },
  {
    nombre: 'Estructural',
    bloques: [
      { id: 'blk-separador', tipo: 'separador', label: 'Separador', desc: 'Division visual', icon: 'horizontal_rule', color: 'grey-5', descargableDefault: false, configDefault: {} },
      { id: 'blk-carpeta', tipo: 'carpeta', label: 'Carpeta', desc: 'Agrupa elementos', icon: 'folder_special', color: 'amber-8', descargableDefault: false, configDefault: { color_carpeta: 'amber' } },
    ],
  },
]
</script>

<style scoped>
.block-palette {
  max-width: 280px;
}
.block-palette--light {
  background: white;
  border-color: #e2e8f0;
}
.block-palette--dark {
  background: #1c2434;
  border-color: #2e3a47;
}

.bloque-card--light {
  background: white;
  border-color: #e2e8f0;
  transition: all 0.15s;
}
.bloque-card--light:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.bloque-card--dark {
  background: #1c2434;
  border-color: #2e3a47;
  transition: all 0.15s;
}
.bloque-card--dark:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transform: translateY(-1px);
}

/* Folder card highlight */
.bloque-card--folder {
  border-color: #f59e0b !important;
  border-style: dashed !important;
}
.bloque-card--folder:hover {
  background: rgba(245, 158, 11, 0.06) !important;
}

.palette-ghost {
  opacity: 0.4;
}
</style>
