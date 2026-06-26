<template>
  <!-- H5P -->
  <template v-if="bloque.tipo === 'h5p'">
    <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nuevo Contenido H5P' }}</div>
    <div class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption" :class="dark ? 'bg-pink-10 text-pink-2' : 'bg-pink-1'">
      <q-icon name="extension" size="xs" /> {{ bloque.config?.h5p_metadata?.mainLibrary || 'H5P' }}
      <span v-if="bloque.tiene_nota !== false"> · {{ bloque.nota_maxima || 100 }} pts</span>
    </div>
  </template>

  <!-- Leccion -->
  <template v-else-if="bloque.tipo === 'leccion'">
    <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nueva Leccion' }}</div>
    <div class="text-caption" :class="dark ? 'text-grey-5' : 'text-grey-6'" v-if="bloque.descripcion">{{ bloque.descripcion }}</div>
    <div
      class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
      :class="dark ? 'bg-indigo-10 text-indigo-2' : 'bg-indigo-1 text-indigo-8'"
      v-else
    >
      Click para configurar contenido
    </div>
  </template>

  <!-- Tarea -->
  <template v-else-if="bloque.tipo === 'tarea'">
    <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nueva Tarea' }}</div>
    <div
      class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
      :class="dark ? 'bg-orange-10 text-orange-2' : 'bg-orange-1'"
    >
      <q-icon name="event" size="xs" /> {{ bloque.config?.fecha_entrega ? formatFecha(bloque.config.fecha_entrega) : 'Sin fecha' }}
      <span v-if="bloque.tiene_nota !== false"> · {{ bloque.nota_maxima || 100 }} pts</span>
    </div>
  </template>

  <!-- Foro -->
  <template v-else-if="bloque.tipo === 'foro'">
    <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nuevo Foro' }}</div>
    <div
      class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
      :class="dark ? 'bg-teal-10 text-teal-2' : 'bg-teal-1'"
    >
      {{ labelTipoForo(bloque) }} · {{ bloque.config?.moderado ? 'Moderado' : 'Libre' }}
    </div>
  </template>

  <!-- Cuestionario / Quiz -->
  <template v-else-if="bloque.tipo === 'cuestionario'">
    <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nuevo Quiz' }}</div>
    <div
      class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
      :class="dark ? 'bg-purple-10 text-purple-2' : 'bg-purple-1'"
    >
      <q-icon name="timer" size="xs" /> {{ bloque.config?.tiempo_limite_minutos || 20 }} min · {{ bloque.config?.intentos_maximos || 1 }} intento(s)
    </div>
  </template>

  <!-- Encuesta -->
  <template v-else-if="bloque.tipo === 'encuesta'">
    <div class="text-body2 text-weight-medium q-mt-xs">{{ bloque.titulo || 'Nueva Encuesta' }}</div>
    <div
      class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
      :class="dark ? 'bg-green-10 text-green-2' : 'bg-green-1'"
    >
      {{ bloque.config?.anonima ? 'Anonima' : 'Publica' }} · {{ (bloque.config?.preguntas || []).length }} preguntas
    </div>
  </template>

  <!-- Texto -->
  <template v-else-if="bloque.tipo === 'texto'">
    <div
      class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption"
      :class="dark ? 'bg-grey-9 text-grey-3' : 'bg-grey-2'"
      v-html="previewTexto(bloque)"
    />
  </template>

  <!-- Imagen -->
  <template v-else-if="bloque.tipo === 'imagen'">
    <div class="bloque-preview-mini q-mt-xs rounded-borders overflow-hidden">
      <img v-if="bloque.config?.url" :src="bloque.config.url" class="full-width" style="max-height: 120px; object-fit: cover" />
      <div v-else class="text-center q-pa-lg" :class="dark ? 'bg-grey-8 text-grey-4' : 'bg-grey-3 text-grey-6'">
        <q-icon name="image" size="32px" />
        <div class="text-caption">Imagen no configurada</div>
      </div>
    </div>
  </template>

  <!-- Video -->
  <template v-else-if="bloque.tipo === 'video'">
    <div class="bloque-preview-mini q-mt-xs rounded-borders text-center q-pa-md" :class="dark ? 'bg-grey-8' : 'bg-grey-3'">
      <q-icon name="play_circle" size="32px" color="grey-6" />
      <div class="text-caption" :class="dark ? 'text-grey-4' : 'text-grey-6'">{{ bloque.config?.url ? 'Video configurado' : 'Video no configurado' }}</div>
    </div>
  </template>

  <!-- Archivo -->
  <template v-else-if="bloque.tipo === 'archivo'">
    <div
      class="bloque-preview-mini q-pa-xs q-mt-xs rounded-borders text-caption row items-center"
      :class="dark ? 'bg-brown-10 text-brown-2' : 'bg-brown-1'"
    >
      <q-icon name="attach_file" size="xs" class="q-mr-xs" />
      {{ bloque.config?.nombre || 'Archivo descargable' }}
      <q-chip v-if="bloque.descargable" dense color="positive" text-color="white" icon="download" size="xs" class="q-ml-auto">Descargable</q-chip>
    </div>
  </template>

  <!-- Separador -->
  <template v-else-if="bloque.tipo === 'separador'">
    <q-separator class="q-my-sm" />
  </template>

  <!-- Carpeta (preview resumida dentro de carpeta anidada no aplica, pero por si acaso) -->
  <template v-else-if="bloque.tipo === 'carpeta'">
    <div class="text-caption text-grey-6 q-mt-xs">
      <q-icon name="folder_special" color="amber-8" size="xs" class="q-mr-xs" />
      Carpeta con {{ (bloque.bloquesAnidados || []).length }} elemento(s)
    </div>
  </template>
</template>

<script setup>
defineProps({
  bloque: { type: Object, required: true },
  dark: { type: Boolean, default: false },
  mini: { type: Boolean, default: false },
})

function formatFecha(f) {
  return f ? new Date(f).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }) : 'Sin fecha'
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
.bloque-preview-mini { overflow: hidden; }
</style>
