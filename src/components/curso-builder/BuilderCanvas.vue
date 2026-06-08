<template>
  <div class="builder-canvas">
    <div v-if="!secciones.length" class="text-center q-pa-xl">
      <q-icon name="dashboard_customize" size="64px" color="grey-4" />
      <p class="text-grey-6 q-mt-md">Arrastra bloques desde la paleta al lienzo para empezar a construir tu curso.</p>
      <p class="text-caption text-grey-5">Tambien puedes agregar secciones con el boton superior.</p>
    </div>

    <div v-for="seccion in secciones" :key="seccion.id" class="canvas-seccion q-mb-md">
      <div
        class="row items-center q-pa-sm rounded-borders"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
      >
        <q-icon name="drag_indicator" class="drag-handle q-mr-sm text-grey-5 cursor-grab" size="sm" />
        <q-icon name="folder" color="primary" size="sm" class="q-mr-sm" />
        <div class="col">
          <div class="text-subtitle2 text-weight-medium">{{ seccion.titulo }}</div>
          <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">{{ seccion.descripcion }}</div>
        </div>
        <div class="col-auto row q-gutter-xs">
          <q-btn flat round dense size="sm" icon="edit" color="grey-7" @click="$emit('edit-seccion', seccion)" />
          <q-btn flat round dense size="sm" icon="delete" color="negative" @click="$emit('delete-seccion', seccion.id)" />
        </div>
      </div>

      <draggable
        :model-value="bloquesPorSeccion[seccion.id] || []"
        @update:model-value="(val) => $emit('update-bloques', seccion.id, val)"
        group="canvas-blocks"
        item-key="id"
        animation="200"
        ghost-class="canvas-ghost"
        class="canvas-drop-zone q-pa-sm"
        :class="$q.dark.isActive ? 'canvas-drop-zone--dark' : 'canvas-drop-zone--light'"
        @change="(e) => $emit('bloque-change', seccion.id, e)"
      >
        <template #item="{ element: bloque, index: bIdx }">
          <div
            class="canvas-bloque q-mb-sm"
            :class="{ 'bloque-nuevo': bloque.esNuevo, 'canvas-bloque--dark': $q.dark.isActive, 'canvas-bloque--light': !$q.dark.isActive }"
          >
            <div
              class="row items-center q-px-sm q-py-xs bloque-header"
              :class="$q.dark.isActive ? 'bloque-header--dark' : 'bloque-header--light'"
            >
              <q-icon name="drag_indicator" class="bloque-drag text-grey-4 cursor-grab" size="xs" />
              <q-icon :name="iconBloque(bloque)" :color="colorBloque(bloque)" size="xs" class="q-mr-sm" />
              <span class="text-caption text-weight-medium">{{ labelBloque(bloque) }}</span>
              <q-space />
              <q-btn flat round dense size="xs" icon="edit" color="grey-6" @click="$emit('edit-bloque', bloque, seccion.id)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round dense size="xs" icon="delete" color="negative" @click="$emit('delete-bloque', seccion.id, bIdx)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>

            <div class="q-px-sm q-pb-sm">
              <template v-if="bloque.tipo === 'h5p'">
                <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nuevo Contenido H5P' }}</div>
                <div class="bloque-preview-mini bg-pink-1 q-pa-xs q-mt-xs rounded-borders text-caption">
                  <q-icon name="extension" size="xs" /> {{ bloque.config?.h5p_metadata?.mainLibrary || 'H5P' }}
                  <span v-if="bloque.tiene_nota !== false"> · {{ bloque.nota_maxima || 100 }} pts</span>
                </div>
              </template>

              <template v-if="bloque.tipo === 'leccion'">
                <div class="text-body2 text-weight-medium q-mt-xs">
                  {{ bloque.titulo || 'Nueva Leccion' }}
                </div>
                <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'" v-if="bloque.descripcion">{{ bloque.descripcion }}</div>
                <div
                  class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
                  :class="$q.dark.isActive ? 'bg-indigo-10 text-indigo-2' : 'bg-indigo-1 text-indigo-8'"
                  v-else
                >
                  Click para configurar contenido
                </div>
              </template>

              <template v-else-if="bloque.tipo === 'tarea'">
                <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nueva Tarea' }}</div>
                <div
                  class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
                  :class="$q.dark.isActive ? 'bg-orange-10 text-orange-2' : 'bg-orange-1'"
                >
                  <q-icon name="event" size="xs" /> {{ bloque.config?.fecha_entrega ? formatFecha(bloque.config.fecha_entrega) : 'Sin fecha' }}
                  <span v-if="bloque.tiene_nota !== false"> · {{ bloque.nota_maxima || 100 }} pts</span>
                </div>
              </template>

              <template v-else-if="bloque.tipo === 'foro'">
                <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nuevo Foro' }}</div>
                <div
                  class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
                  :class="$q.dark.isActive ? 'bg-teal-10 text-teal-2' : 'bg-teal-1'"
                >
                  {{ labelTipoForo(bloque) }} · {{ bloque.config?.moderado ? 'Moderado' : 'Libre' }}
                </div>
              </template>

              <template v-else-if="bloque.tipo === 'cuestionario'">
                <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nuevo Quiz' }}</div>
                <div
                  class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
                  :class="$q.dark.isActive ? 'bg-purple-10 text-purple-2' : 'bg-purple-1'"
                >
                  <q-icon name="timer" size="xs" /> {{ bloque.config?.tiempo_limite_minutos || 20 }} min · {{ bloque.config?.intentos_maximos || 1 }} intento(s)
                </div>
              </template>

              <template v-else-if="bloque.tipo === 'encuesta'">
                <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nueva Encuesta' }}</div>
                <div
                  class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
                  :class="$q.dark.isActive ? 'bg-green-10 text-green-2' : 'bg-green-1'"
                >
                  {{ bloque.config?.anonima ? 'Anonima' : 'Publica' }} · {{ (bloque.config?.preguntas || []).length }} preguntas
                </div>
              </template>

              <template v-else-if="bloque.tipo === 'texto'">
                <div
                  class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
                  :class="$q.dark.isActive ? 'bg-grey-9 text-grey-3' : 'bg-grey-2'"
                  v-html="previewTexto(bloque)"
                />
              </template>

              <template v-else-if="bloque.tipo === 'imagen'">
                <div class="bloque-preview-mini q-mt-xs rounded-borders overflow-hidden">
                  <img v-if="bloque.config?.url" :src="bloque.config.url" class="full-width" style="max-height: 120px; object-fit: cover" />
                  <div v-else class="text-center q-pa-lg" :class="$q.dark.isActive ? 'bg-grey-8 text-grey-4' : 'bg-grey-3 text-grey-6'">
                    <q-icon name="image" size="32px" />
                    <div class="text-caption">Imagen no configurada</div>
                  </div>
                </div>
              </template>

              <template v-else-if="bloque.tipo === 'video'">
                <div class="bloque-preview-mini q-mt-xs rounded-borders text-center q-pa-md" :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-3'">
                  <q-icon name="play_circle" size="32px" color="grey-6" />
                  <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">{{ bloque.config?.url ? 'Video configurado' : 'Video no configurado' }}</div>
                </div>
              </template>

              <template v-else-if="bloque.tipo === 'archivo'">
                <div
                  class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption row items-center"
                  :class="$q.dark.isActive ? 'bg-brown-10 text-brown-2' : 'bg-brown-1'"
                >
                  <q-icon name="attach_file" size="xs" class="q-mr-xs" />
                  {{ bloque.config?.nombre || 'Archivo descargable' }}
                </div>
              </template>

              <template v-else-if="bloque.tipo === 'separador'">
                <q-separator class="q-my-sm" />
              </template>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="text-center q-py-sm">
            <span class="text-caption" :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-5'">Suelta bloques aqui</span>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import { useQuasar } from 'quasar'

const $q = useQuasar()

defineProps({
  secciones: { type: Array, required: true },
  bloquesPorSeccion: { type: Object, required: true },
})

defineEmits([
  'edit-seccion',
  'delete-seccion',
  'update-bloques',
  'bloque-change',
  'edit-bloque',
  'delete-bloque',
])

function formatFecha(f) {
  return f ? new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }) : 'Sin fecha'
}

function iconBloque(b) {
  const m = { leccion: 'article', tarea: 'assignment', foro: 'forum', cuestionario: 'quiz', encuesta: 'poll', h5p: 'extension', texto: 'text_fields', imagen: 'image', video: 'smart_display', archivo: 'attach_file', separador: 'horizontal_rule' }
  return m[b.tipo] || 'widgets'
}

function colorBloque(b) {
  const m = { leccion: 'indigo', tarea: 'orange', foro: 'teal', cuestionario: 'purple', encuesta: 'green', h5p: 'pink', texto: 'grey-8', imagen: 'blue-grey', video: 'red', archivo: 'brown', separador: 'grey-5' }
  return m[b.tipo] || 'grey'
}

function labelBloque(b) {
  const m = { leccion: 'Leccion', tarea: 'Tarea', foro: 'Foro', cuestionario: 'Quiz', encuesta: 'Encuesta', h5p: 'H5P', texto: 'Texto', imagen: 'Imagen', video: 'Video', archivo: 'Archivo', separador: 'Separador' }
  return m[b.tipo] || b.tipo
}

function labelTipoForo(b) {
  const m = { normal: 'General', debate: 'Debate', pregunta_respuesta: 'Pregunta/Respuesta' }
  return m[b.config?.tipo_foro] || 'General'
}

function previewTexto(bloque) {
  const html = bloque.config?.contenido_html || ''
  if (html) {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent?.substring(0, 100) + (temp.textContent?.length > 100 ? '...' : '') || 'Sin contenido'
  }
  return 'Click para agregar texto'
}
</script>

<style scoped>
.canvas-seccion {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}
.body--dark .canvas-seccion {
  border-color: #2e3a47;
}

.canvas-drop-zone--light {
  min-height: 60px;
  background: #fafafa;
  border: 2px dashed transparent;
  transition: all 0.2s;
}
.canvas-drop-zone--light:hover {
  border-color: var(--q-primary);
  background: var(--q-primary-light, #e3f2fd44);
}

.canvas-drop-zone--dark {
  min-height: 60px;
  background: #1c2434;
  border: 2px dashed transparent;
  transition: all 0.2s;
}
.canvas-drop-zone--dark:hover {
  border-color: var(--q-primary);
  background: rgba(37, 99, 235, 0.08);
}

.canvas-bloque--light {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  transition: all 0.15s;
}
.canvas-bloque--light:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.canvas-bloque--dark {
  background: #1c2434;
  border: 1px solid #2e3a47;
  border-radius: 4px;
  transition: all 0.15s;
}
.canvas-bloque--dark:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.bloque-nuevo {
  border-color: var(--q-primary);
  border-style: dashed;
}

.bloque-header--light {
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}
.bloque-header--dark {
  border-bottom: 1px solid #2e3a47;
  background: #242f3d;
}

.bloque-drag { opacity: 0; transition: opacity 0.15s; }
.canvas-bloque--light:hover .bloque-drag,
.canvas-bloque--dark:hover .bloque-drag { opacity: 1; }

.canvas-ghost { opacity: 0.5; background: #e3f2fd; }
.body--dark .canvas-ghost { background: rgba(37, 99, 235, 0.2); }

.bloque-preview-mini { overflow: hidden; }
</style>
