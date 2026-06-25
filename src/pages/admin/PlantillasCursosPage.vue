<template>
  <q-page class="av-dashboard-page q-pa-md">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el label="Administración" to="/admin/gestion" />
      <q-breadcrumbs-el label="Plantillas de Cursos" />
    </q-breadcrumbs>

    <TaPageHeader title="Plantillas de Estructura de Cursos" subtitle="Administra los formatos, temas y secciones institucionales predefinidos para los cursos.">
      <template #actions>
        <TaButton variant="outline" icon="upload" label="Importar JSON" @click="abrirDialogoImportar" />
        <TaButton variant="primary" icon="add" label="Nueva Plantilla" @click="abrirNuevaPlantilla" />
      </template>
    </TaPageHeader>

    <div v-if="cargando" class="q-mt-lg">
      <AppSkeleton variant="list" :count="4" />
    </div>

    <template v-else>
      <div class="row q-col-gutter-md q-mt-md">
        <!-- Listado de Plantillas -->
        <div class="col-12">
          <TaCard :padding="false">
            <q-table
              flat
              bordered
              :rows="plantillas"
              :columns="columnas"
              row-key="id"
              class="av-table"
              no-data-label="No hay plantillas de cursos registradas."
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:body-cell-nombre="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-subtitle2">{{ props.row.nombre }}</div>
                  <div class="text-caption text-grey-6 text-italic" style="max-width: 450px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    {{ props.row.descripcion || 'Sin descripción' }}
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-secciones="props">
                <q-td :props="props" class="text-center">
                  <q-badge color="purple-1" text-color="primary" class="q-px-sm q-py-xs text-weight-bold">
                    {{ props.row.datos?.length || 0 }} secciones
                  </q-badge>
                </q-td>
              </template>

              <template v-slot:body-cell-uso_count="props">
                <q-td :props="props" class="text-center text-weight-medium">
                  {{ props.row.uso_count || 0 }} veces
                </q-td>
              </template>

              <template v-slot:body-cell-publica="props">
                <q-td :props="props" class="text-center">
                  <q-badge :color="props.row.publica ? 'positive' : 'warning'" text-color="white" class="q-px-sm">
                    {{ props.row.publica ? 'Institucional' : 'Privada' }}
                  </q-badge>
                </q-td>
              </template>

              <template v-slot:body-cell-acciones="props">
                <q-td :props="props" class="text-center q-gutter-xs">
                  <q-btn flat round dense size="sm" icon="visibility" color="primary" @click="verDetalles(props.row)">
                    <q-tooltip>Ver Estructura</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense size="sm" icon="download" color="secondary" @click="exportarPlantilla(props.row)">
                    <q-tooltip>Exportar JSON</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense size="sm" icon="edit" color="grey-7" @click="editarPlantilla(props.row)">
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense size="sm" icon="delete" color="negative" @click="eliminarPlantilla(props.row)">
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </TaCard>
        </div>
      </div>
    </template>

    <!-- Dialogo para Nueva / Editar Plantilla -->
    <q-dialog v-model="dialogoForm" persistent maximized>
      <q-card class="column bg-grey-1 text-black">
        <q-bar class="bg-primary text-white q-py-md">
          <div class="text-weight-bold text-subtitle1">{{ editandoId ? 'Editar Plantilla' : 'Nueva Plantilla de Estructura' }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="col scroll q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Datos Basicos -->
            <div class="col-12 col-md-4">
              <TaCard title="Datos Generales" class="full-height">
                <q-input v-model="form.nombre" label="Nombre de la Plantilla *" outlined class="q-mb-md" :rules="[val => !!val || 'El nombre es obligatorio']" />
                <q-input v-model="form.descripcion" label="Descripción de la estructura" outlined type="textarea" rows="4" class="q-mb-md" />
                
                <q-toggle v-model="form.publica" label="Hacer Plantilla Institucional (Pública)" color="primary" class="q-mb-lg" />
                <q-banner rounded class="bg-blue-1 text-primary q-pa-sm text-caption">
                  <q-icon name="info" class="q-mr-xs" size="sm" />
                  Las plantillas institucionales estarán disponibles para todos los docentes del LMS UNITEPC cuando estén configurando la estructura de sus materias.
                </q-banner>
              </TaCard>
            </div>

            <!-- Estructura de Secciones -->
            <div class="col-12 col-md-8">
              <TaCard title="Estructura y Formato (Secciones / Actividades)" class="full-height">
                <div class="row items-center justify-between q-mb-md">
                  <div class="text-subtitle2 text-weight-medium">Secciones de la plantilla:</div>
                  <TaButton variant="outline" icon="add" label="Agregar Sección" size="sm" @click="agregarSeccion" />
                </div>

                <div v-if="!form.datos.length" class="text-center q-pa-xl bg-grey-2 rounded-borders">
                  <q-icon name="layers_clear" size="48px" color="grey-5" />
                  <div class="text-subtitle2 text-grey-6 q-mt-sm">Sin secciones definidas</div>
                  <div class="text-caption text-grey-5">Agrega secciones para definir el formato y estructura.</div>
                </div>

                <div v-else class="q-gutter-y-md">
                  <q-card flat bordered v-for="(seccion, secIdx) in form.datos" :key="secIdx" class="bg-white rounded-borders">
                    <q-card-section class="q-py-sm q-px-md row items-center justify-between bg-purple-1">
                      <div class="row items-center col">
                        <q-badge color="primary" text-color="white" class="q-mr-sm text-weight-bold">
                          #{{ secIdx + 1 }}
                        </q-badge>
                        <q-input v-model="seccion.titulo" placeholder="Título de la Sección (ej. Unidad I - Fundamentos)" dense borderless class="text-weight-bold text-subtitle2 col q-px-xs" />
                      </div>
                      <div class="row items-center q-gutter-sm">
                        <q-btn flat round dense size="sm" icon="add_box" color="primary" @click="abrirDialogoActividad(secIdx)">
                          <q-tooltip>Agregar Actividad Sugerida</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense size="sm" icon="delete" color="negative" @click="eliminarSeccionForm(secIdx)">
                          <q-tooltip>Eliminar Sección</q-tooltip>
                        </q-btn>
                      </div>
                    </q-card-section>
                    
                    <q-card-section class="q-pa-sm">
                      <q-input v-model="seccion.descripcion" placeholder="Escribe una breve descripción del propósito de esta sección..." dense outlined class="q-mb-md q-px-sm" type="textarea" rows="1" />
                      
                      <!-- Lista de actividades de la seccion -->
                      <div class="q-px-sm">
                        <div class="text-caption text-grey-6 q-mb-xs">Actividades y Bloques Sugeridos:</div>
                        
                        <div v-if="!seccion.actividades?.length" class="text-caption text-grey-5 text-italic q-py-sm text-center">
                          Sin actividades. Haz clic en el botón '+' arriba para agregar una actividad sugerida.
                        </div>

                        <q-list v-else bordered separator class="rounded-borders">
                          <q-item v-for="(act, actIdx) in seccion.actividades" :key="actIdx" class="q-py-xs">
                            <q-item-section avatar>
                              <q-icon :name="iconoTipo(act.tipo)" :color="colorTipo(act.tipo)" size="sm" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium text-body2">{{ act.titulo }}</q-item-label>
                              <q-item-label caption>
                                <q-badge :color="colorTipo(act.tipo)" text-color="white" dense class="q-mr-xs">
                                  {{ labelTipo(act.tipo) }}
                                </q-badge>
                                <span v-if="act.tiene_nota" class="text-caption text-grey-6">
                                  {{ act.nota_maxima }} pts · Peso: {{ act.peso }}x
                                </span>
                                <span v-else class="text-caption text-grey-5">Sin calificación</span>
                              </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <div class="row q-gutter-xs">
                                <q-btn flat round dense size="xs" icon="edit" color="primary" @click="editarActividadForm(secIdx, actIdx)" />
                                <q-btn flat round dense size="xs" icon="delete" color="negative" @click="eliminarActividadForm(secIdx, actIdx)" />
                              </div>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </TaCard>
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <q-card-actions align="right" class="q-py-md q-px-lg bg-white">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
          <TaButton variant="primary" label="Guardar Plantilla" :loading="guardando" @click="guardarPlantilla" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo para Importar JSON -->
    <q-dialog v-model="dialogoImportar" persistent>
      <q-card style="width: 550px; max-width: 90vw;" class="dialog-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Importar Plantilla de Curso (JSON)</div>
          <div class="text-caption text-grey-6">Pega aquí el código JSON estructurado de la plantilla de curso.</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="jsonImportar"
            outlined
            type="textarea"
            rows="10"
            placeholder='{
  "nombre": "Nombre de la Plantilla",
  "descripcion": "Descripción...",
  "publica": true,
  "datos": [
    {
      "titulo": "Unidad I",
      "descripcion": "...",
      "actividades": [
        { "tipo": "leccion", "titulo": "Bienvenida", "tiene_nota": false }
      ]
    }
  ]
}'
            class="font-mono text-xs"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
          <TaButton variant="primary" label="Importar Estructura" @click="confirmarImportar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo de Vista Previa de Estructura -->
    <q-dialog v-model="dialogoVer">
      <q-card style="width: 600px; max-width: 90vw;" class="dialog-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ plantillaSeleccionada?.nombre }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-sm scroll" style="max-height: 60vh;">
          <p class="text-body2 text-grey-7 q-mb-md">{{ plantillaSeleccionada?.descripcion || 'Sin descripción' }}</p>
          <div class="text-subtitle2 q-mb-sm text-weight-medium">Estructura del Curso:</div>
          
          <q-list bordered class="rounded-borders">
            <q-expansion-item
              v-for="(seccion, i) in plantillaSeleccionada?.datos"
              :key="i"
              expand-separator
              icon="folder"
              :label="seccion.titulo"
              :caption="seccion.descripcion"
              header-class="text-weight-bold"
            >
              <q-card>
                <q-card-section class="q-py-xs q-pl-md">
                  <q-list separator dense v-if="seccion.actividades?.length">
                    <q-item v-for="(act, j) in seccion.actividades" :key="j" class="q-py-sm">
                      <q-item-section avatar>
                        <q-icon :name="iconoTipo(act.tipo)" :color="colorTipo(act.tipo)" size="sm" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-body2 text-weight-medium">{{ act.titulo }}</q-item-label>
                        <q-item-label caption>
                          <q-badge :color="colorTipo(act.tipo)" text-color="white" dense>
                            {{ labelTipo(act.tipo) }}
                          </q-badge>
                          <span v-if="act.tiene_nota" class="text-caption text-grey-6 q-ml-xs">
                            {{ act.nota_maxima }} pts · Peso: {{ act.peso }}x
                          </span>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-caption text-grey-5 text-italic q-pa-sm">Sin actividades sugeridas.</div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <TaButton variant="outline" label="Exportar JSON" icon="download" @click="exportarPlantilla(plantillaSeleccionada)" />
          <TaButton variant="primary" label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo para Agregar/Editar Actividad en el Formulario -->
    <q-dialog v-model="dialogoActividadForm">
      <q-card style="width: 450px; max-width: 90vw;" class="dialog-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold">{{ actEditIdx !== null ? 'Editar Actividad' : 'Agregar Actividad Sugerida' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <q-input v-model="formAct.titulo" label="Título de la Actividad *" outlined :rules="[val => !!val || 'El título es obligatorio']" />
          <q-input v-model="formAct.descripcion" label="Descripción / Consigna" outlined type="textarea" rows="2" />
          
          <q-select
            v-model="formAct.tipo"
            :options="opcionesTiposActividad"
            label="Tipo de Actividad *"
            outlined
            emit-value
            map-options
          />

          <q-toggle v-model="formAct.tiene_nota" label="Actividad Calificable" />

          <div class="row q-col-gutter-sm" v-if="formAct.tiene_nota">
            <div class="col-6">
              <q-input v-model.number="formAct.nota_maxima" label="Nota Máxima" type="number" outlined />
            </div>
            <div class="col-6">
              <q-input v-model.number="formAct.peso" label="Peso" type="number" step="0.1" outlined />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <TaButton variant="ghost" label="Cancelar" @click="dialogoActividadForm = false" />
          <TaButton variant="primary" :label="actEditIdx !== null ? 'Actualizar' : 'Agregar'" @click="guardarActividadForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { bancoDocenteService } from 'src/services/bancoDocenteService.js'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'

const $q = useQuasar()

const plantillas = ref([])
const cargando = ref(true)
const guardando = ref(false)

const dialogoForm = ref(false)
const dialogoImportar = ref(false)
const dialogoVer = ref(false)
const dialogoActividadForm = ref(false)

const editandoId = ref(null)
const jsonImportar = ref('')
const plantillaSeleccionada = ref(null)

// Formulario de Plantilla
const form = ref({
  nombre: '',
  descripcion: '',
  publica: true,
  datos: [] // Secciones y actividades
})

// Actividad para el sub-formulario
const secActivaIdx = ref(null)
const actEditIdx = ref(null)
const formAct = ref({
  titulo: '',
  descripcion: '',
  tipo: 'tarea',
  tiene_nota: true,
  nota_maxima: 100,
  peso: 1.0,
  config: {}
})

const columnas = [
  { name: 'nombre', label: 'Estructura de Materia / Plantilla', align: 'left', field: 'nombre', sortable: true },
  { name: 'secciones', label: 'Estructura', align: 'center', field: row => row.datos?.length || 0 },
  { name: 'uso_count', label: 'Frecuencia de Uso', align: 'center', field: 'uso_count', sortable: true },
  { name: 'publica', label: 'Alcance', align: 'center', field: 'publica' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const opcionesTiposActividad = [
  { label: 'Lección (Teórica)', value: 'leccion' },
  { label: 'Tarea (Práctica)', value: 'tarea' },
  { label: 'Foro (Interactiva)', value: 'foro' },
  { label: 'Cuestionario (Evaluación)', value: 'cuestionario' },
  { label: 'Encuesta (Diagnóstico/Satisfacción)', value: 'encuesta' },
  { label: 'Contenido H5P', value: 'h5p' }
]

function labelTipo(tipo) {
  const m = { leccion: 'Lección', tarea: 'Tarea', foro: 'Foro', cuestionario: 'Cuestionario', encuesta: 'Encuesta', h5p: 'Contenido H5P' }
  return m[tipo] ?? tipo
}

function iconoTipo(tipo) {
  const m = { leccion: 'article', tarea: 'assignment', foro: 'forum', cuestionario: 'quiz', encuesta: 'poll', h5p: 'extension' }
  return m[tipo] ?? 'help'
}

function colorTipo(tipo) {
  const m = { leccion: 'indigo', tarea: 'orange', foro: 'teal', cuestionario: 'purple', encuesta: 'green', h5p: 'pink' }
  return m[tipo] ?? 'grey'
}

async function cargarPlantillas() {
  cargando.value = true
  try {
    const res = await bancoDocenteService.listar({ categoria: 'curso' })
    plantillas.value = res.data?.data || res.data || []
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al cargar las plantillas de cursos', color: 'negative' })
  } finally {
    cargando.value = false
  }
}

function abrirNuevaPlantilla() {
  editandoId.value = null
  form.value = {
    nombre: '',
    descripcion: '',
    publica: true,
    datos: [
      { titulo: 'Unidad I - Fundamentos', descripcion: 'Conceptos iniciales.', actividades: [] }
    ]
  }
  dialogoForm.value = true
}

function editarPlantilla(plantilla) {
  editandoId.value = plantilla.id
  form.value = {
    nombre: plantilla.nombre,
    descripcion: plantilla.descripcion || '',
    publica: !!plantilla.publica,
    datos: JSON.parse(JSON.stringify(plantilla.datos || []))
  }
  dialogoForm.value = true
}

function verDetalles(plantilla) {
  plantillaSeleccionada.value = plantilla
  dialogoVer.value = true
}

function eliminarPlantilla(plantilla) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar la plantilla "${plantilla.nombre}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await bancoDocenteService.eliminar(plantilla.id)
      $q.notify({ message: 'Plantilla eliminada con éxito', color: 'warning' })
      cargarPlantillas()
    } catch (err) {
      console.error(err)
      $q.notify({ message: 'Error al eliminar la plantilla', color: 'negative' })
    }
  })
}

// Lógica de Secciones en el Formulario
function agregarSeccion() {
  form.value.datos.push({
    titulo: `Unidad ${form.value.datos.length + 1}`,
    descripcion: '',
    actividades: []
  })
}

function eliminarSeccionForm(idx) {
  form.value.datos.splice(idx, 1)
}

// Lógica de Actividades en el Formulario
function abrirDialogoActividad(secIdx) {
  secActivaIdx.value = secIdx
  actEditIdx.value = null
  formAct.value = {
    titulo: '',
    descripcion: '',
    tipo: 'tarea',
    tiene_nota: true,
    nota_maxima: 100,
    peso: 1.0,
    config: {}
  }
  dialogoActividadForm.value = true
}

function editarActividadForm(secIdx, actIdx) {
  secActivaIdx.value = secIdx
  actEditIdx.value = actIdx
  const act = form.value.datos[secIdx].actividades[actIdx]
  formAct.value = JSON.parse(JSON.stringify(act))
  dialogoActividadForm.value = true
}

function guardarActividadForm() {
  if (!formAct.value.titulo.trim()) return
  
  const sec = form.value.datos[secActivaIdx.value]
  if (!sec.actividades) sec.actividades = []

  const actData = {
    ...formAct.value,
    nota_maxima: formAct.value.tiene_nota ? formAct.value.nota_maxima : 0,
    peso: formAct.value.tiene_nota ? formAct.value.peso : 0
  }

  if (actEditIdx.value !== null) {
    sec.actividades[actEditIdx.value] = actData
  } else {
    sec.actividades.push(actData)
  }
  
  dialogoActividadForm.value = false
}

function eliminarActividadForm(secIdx, actIdx) {
  form.value.datos[secIdx].actividades.splice(actIdx, 1)
}

// Guardar en la Base de Datos
async function guardarPlantilla() {
  if (!form.value.nombre.trim()) return
  if (!form.value.datos.length) {
    $q.notify({ message: 'Debes definir al menos una sección en la estructura.', color: 'warning' })
    return
  }

  guardando.value = true
  const data = {
    categoria: 'curso',
    tipo: 'curso',
    nombre: form.value.nombre.trim(),
    descripcion: form.value.descripcion,
    publica: form.value.publica,
    datos: form.value.datos
  }

  try {
    if (editandoId.value) {
      await bancoDocenteService.actualizar(editandoId.value, data)
      $q.notify({ message: 'Plantilla de curso actualizada con éxito', color: 'positive' })
    } else {
      await bancoDocenteService.crear(data)
      $q.notify({ message: 'Plantilla de curso creada con éxito', color: 'positive' })
    }
    dialogoForm.value = false
    cargarPlantillas()
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al guardar la plantilla de curso', color: 'negative' })
  } finally {
    guardando.value = false
  }
}

// Importar JSON
function abrirDialogoImportar() {
  jsonImportar.value = ''
  dialogoImportar.value = true
}

async function confirmarImportar() {
  try {
    const importado = JSON.parse(jsonImportar.value)
    
    if (!importado.nombre || !importado.datos || !Array.isArray(importado.datos)) {
      $q.notify({ message: 'El JSON no tiene el formato correcto. Requiere "nombre" y un array "datos".', color: 'negative' })
      return
    }

    const data = {
      categoria: 'curso',
      tipo: 'curso',
      nombre: importado.nombre,
      descripcion: importado.descripcion || '',
      publica: importado.publica !== undefined ? !!importado.publica : true,
      datos: importado.datos
    }

    await bancoDocenteService.crear(data)
    $q.notify({ message: 'Plantilla importada con éxito', color: 'positive' })
    dialogoImportar.value = false
    cargarPlantillas()
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al parsear el JSON. Verifica que sea un JSON válido.', color: 'negative' })
  }
}

// Exportar JSON
function exportarPlantilla(plantilla) {
  const fileData = {
    nombre: plantilla.nombre,
    descripcion: plantilla.descripcion,
    publica: plantilla.publica,
    datos: plantilla.datos
  }
  
  const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `plantilla_curso_${plantilla.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.json`
  link.click()
  URL.revokeObjectURL(url)
  $q.notify({ message: 'Archivo JSON descargado', color: 'info' })
}

onMounted(() => {
  cargarPlantillas()
})
</script>

<style scoped>
.av-table {
  background: white;
}
.body--dark .av-table {
  background: var(--ta-bg-card);
}
.dialog-card {
  border-radius: 20px;
}
.bg-purple-1 {
  background: rgba(107, 63, 160, 0.08);
}
.body--dark .bg-purple-1 {
  background: rgba(167, 139, 250, 0.15);
}
</style>
