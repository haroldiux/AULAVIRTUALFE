<template>
  <q-card
    flat
    bordered
    class="block-palette"
    :class="$q.dark.isActive ? 'block-palette--dark' : 'block-palette--light'"
    data-help="La Paleta de Bloques contiene todas las actividades y recursos que puedes arrastrar al lienzo central (canvas). Puedes agregar Lecciones, Tareas, Foros, Quizzes y contenido interactivo H5P."
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
              :class="$q.dark.isActive ? 'bloque-card--dark' : 'bloque-card--light'"
              data-help="Este es un bloque de plantilla. Arrástralo y suéltalo dentro de cualquier sección en el lienzo central para agregarlo a tu curso."
              data-help-title="Bloque de Actividad / Recurso"
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
    config: { ...original.configDefault },
  }
}

const categorias = [
  {
    nombre: 'Actividades',
    bloques: [
      { id: 'blk-leccion', tipo: 'leccion', label: 'Leccion', desc: 'Contenido lectura', icon: 'article', color: 'indigo', configDefault: { contenido_html: '' } },
      { id: 'blk-tarea', tipo: 'tarea', label: 'Tarea', desc: 'Entrega archivos', icon: 'assignment', color: 'orange', configDefault: { fecha_entrega: '', fecha_limite: '', archivos_permitidos: 'pdf,docx', tamano_max_mb: 10, instrucciones: '' } },
      { id: 'blk-foro', tipo: 'foro', label: 'Foro', desc: 'Discusion', icon: 'forum', color: 'teal', configDefault: { tipo_foro: 'normal', moderado: false, anonimo: false } },
      { id: 'blk-quiz', tipo: 'cuestionario', label: 'Quiz', desc: 'Evaluacion', icon: 'quiz', color: 'purple', configDefault: { tiempo_limite_minutos: 20, intentos_maximos: 1, aleatorio: false, preguntas: [] } },
      { id: 'blk-encuesta', tipo: 'encuesta', label: 'Encuesta', desc: 'Opinion', icon: 'poll', color: 'green', configDefault: { anonima: false, fecha_cierre: '', preguntas: [] } },
      { id: 'blk-h5p', tipo: 'h5p', label: 'H5P', desc: 'Contenido interactivo', icon: 'extension', color: 'pink', configDefault: { h5p_file: null, h5p_metadata: { title: '', mainLibrary: '', version: '' }, h5p_calificable: true, demo_content_path: '/h5p/contents/demo-1' } },
    ],
  },
  {
    nombre: 'Contenido',
    bloques: [
      { id: 'blk-texto', tipo: 'texto', label: 'Texto', desc: 'HTML enriquecido', icon: 'text_fields', color: 'grey-8', configDefault: { contenido_html: '<p>Escribe tu contenido aqui...</p>' } },
      { id: 'blk-imagen', tipo: 'imagen', label: 'Imagen', desc: 'Grafico/foto', icon: 'image', color: 'blue-grey', configDefault: { url: '', alt: '', caption: '' } },
      { id: 'blk-video', tipo: 'video', label: 'Video', desc: 'YouTube/Vimeo', icon: 'smart_display', color: 'red', configDefault: { url: '', tipo: 'youtube' } },
      { id: 'blk-archivo', tipo: 'archivo', label: 'Archivo', desc: 'Descargable', icon: 'attach_file', color: 'brown', configDefault: { nombre: '', url: '', tipo_archivo: '' } },
    ],
  },
  {
    nombre: 'Estructural',
    bloques: [
      { id: 'blk-separador', tipo: 'separador', label: 'Separador', desc: 'Division visual', icon: 'horizontal_rule', color: 'grey-5', configDefault: {} },
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

.palette-ghost {
  opacity: 0.4;
}
</style>
