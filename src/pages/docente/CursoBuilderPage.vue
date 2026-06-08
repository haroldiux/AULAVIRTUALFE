<template>
  <q-page class="av-dashboard-page">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el label="Mis Cursos" to="/docente/cursos" />
      <q-breadcrumbs-el :label="curso?.nombre ?? 'Curso'" />
    </q-breadcrumbs>

    <template v-if="curso">
      <TaPageHeader :title="curso.nombre" data-tour="teacher-builder-header">
        <template #actions>
          <TaButton variant="primary" icon="visibility" label="Previsualizar" @click="previsualizarCurso" />
          <TaButton v-if="curso.estado === 'borrador'" variant="primary" icon="publish" label="Publicar" @click="publicarCurso" />
          <TaButton v-else variant="secondary" icon="unpublished" label="Despublicar" />
          <TaButton variant="ghost" icon="more_vert">
            <q-menu>
              <q-list dense style="min-width: 180px">
                <q-item clickable v-close-popup @click="duplicarCurso">
                  <q-item-section avatar><q-icon name="content_copy" /></q-item-section>
                  <q-item-section>Duplicar Curso</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="guardarPlantilla">
                  <q-item-section avatar><q-icon name="bookmark" color="orange" /></q-item-section>
                  <q-item-section>Guardar como Plantilla</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="dialogoPlantillas = true">
                  <q-item-section avatar><q-icon name="folder_open" color="teal" /></q-item-section>
                  <q-item-section>Cargar Plantilla</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="menuSisa = true">
                  <q-item-section avatar><q-icon name="cloud_download" color="primary" /></q-item-section>
                  <q-item-section>Regenerar desde SISA</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </TaButton>
        </template>
      </TaPageHeader>
      <div class="row items-center q-mb-lg q-mt-sm">
        <q-badge :color="curso.estado === 'publicado' ? 'green' : 'orange'">
          {{ curso.estado === 'publicado' ? 'Publicado' : 'Borrador' }}
        </q-badge>
        <span class="text-caption text-grey-7 q-ml-sm">{{ curso.codigo }} — {{ curso.gestion }} — {{ curso.total_estudiantes }} estudiantes</span>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12">
          <TaCard :padding="false">
            <q-card-section class="row items-center">
              <div class="col text-subtitle1 text-weight-medium">Estructura del Curso</div>
              <div class="col-auto row q-gutter-sm items-center" data-tour="teacher-builder-mode">
                <q-btn-toggle
                  v-model="modoBuilder"
                  :options="[
                    { label: 'Simple', value: 'simple', icon: 'list' },
                    { label: 'Canvas', value: 'canvas', icon: 'dashboard_customize' }
                  ]"
                  toggle-color="primary"
                  size="sm"
                  outline
                  rounded
                />
                <TaButton variant="primary" icon="add" label="Agregar Seccion" @click="abrirDialogoSeccion()" />
              </div>
            </q-card-section>

            <!-- MODO SIMPLE -->
            <q-card-section v-if="modoBuilder === 'simple'" class="q-pt-none" data-tour="teacher-builder-structure">
              <draggable
                v-model="curso.secciones"
                handle=".drag-handle"
                item-key="id"
                animation="200"
                ghost-class="ghost-card"
              >
                <template #item="{ element: seccion }">
                  <q-card flat bordered class="q-mb-sm seccion-card">
                    <q-card-section class="q-pa-sm">
                      <div class="row items-center">
                        <q-icon name="drag_indicator" class="drag-handle q-mr-sm text-grey-5" size="sm" />
                        <q-icon name="folder" color="primary" size="sm" class="q-mr-sm" />
                        <div class="col">
                          <div class="text-subtitle2 text-weight-medium">{{ seccion.titulo }}</div>
                          <div class="text-caption text-grey-6">{{ seccion.descripcion }}</div>
                        </div>
                        <div class="col-auto row q-gutter-xs">
                          <q-badge color="grey-4" text-color="grey-8">
                            {{ getActividadesCount(seccion.id) }} actividades
                          </q-badge>
                          <q-btn flat round dense size="sm" icon="edit" color="grey-7" @click.stop="abrirDialogoSeccion(seccion)">
                            <q-tooltip>Editar seccion</q-tooltip>
                          </q-btn>
                          <q-btn flat round dense size="sm" icon="delete" color="negative" @click.stop="eliminarSeccion(seccion.id)">
                            <q-tooltip>Eliminar seccion</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-section class="q-pa-none">
                      <draggable
                        :list="getListaActividades(seccion.id)"
                        handle=".act-drag-handle"
                        item-key="id"
                        animation="200"
                        ghost-class="ghost-card"
                        group="actividades"
                        @change="(evt) => onActividadChange(seccion.id, evt)"
                        :move="onActividadMove"
                      >
                        <template #item="{ element: act }">
                          <q-item clickable v-ripple class="actividad-item" @click="editarActividad(act)">
                            <q-item-section avatar>
                              <q-icon name="drag_indicator" class="act-drag-handle text-grey-4" size="xs" />
                            </q-item-section>
                            <q-item-section avatar>
                              <q-icon :name="iconoTipo(act.tipo)" :color="colorTipo(act.tipo)" size="sm" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-body2">{{ act.titulo }}</q-item-label>
                              <q-item-label caption>
                                <q-badge :color="colorTipo(act.tipo)" text-color="white" dense class="q-mr-xs">
                                  {{ labelTipo(act.tipo) }}
                                </q-badge>
                                <template v-if="act.tiene_nota">{{ act.nota_maxima }} pts · Peso: {{ act.peso }}x</template>
                                <template v-else>Sin calificacion</template>
                              </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-btn flat round dense size="sm" icon="more_vert">
                                <q-menu>
                                  <q-list dense>
                                    <q-item clickable v-close-popup @click.stop="editarActividad(act)">
                                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                                      <q-item-section>Editar</q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup>
                                      <q-item-section avatar><q-icon name="content_copy" /></q-item-section>
                                      <q-item-section>Duplicar</q-item-section>
                                    </q-item>
                                    <q-separator />
                                    <q-item clickable v-close-popup @click.stop="eliminarActividad(act.id)">
                                      <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                                      <q-item-section class="text-negative">Eliminar</q-item-section>
                                    </q-item>
                                  </q-list>
                                </q-menu>
                              </q-btn>
                            </q-item-section>
                          </q-item>
                        </template>
                      </draggable>

                      <q-item class="text-grey-6 add-act-row" clickable @click="tipoActividadDialog = true; seccionActivaParaAgregar = seccion.id">
                        <q-item-section avatar>
                          <q-icon name="add" />
                        </q-item-section>
                        <q-item-section>Agregar actividad...</q-item-section>
                      </q-item>
                    </q-card-section>
                  </q-card>
                </template>
              </draggable>

              <div v-if="!curso.secciones.length" class="text-center q-pa-xl" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
                <q-icon name="folder_open" size="48px" :color="$q.dark.isActive ? 'grey-6' : 'grey-4'" />
                <p>No hay secciones. Agrega tu primera seccion o genera un curso desde SISA.</p>
                <TaButton variant="primary" icon="add" label="Agregar Seccion" @click="abrirDialogoSeccion()" />
                <TaButton variant="outline" icon="cloud_download" label="Generar desde SISA" class="q-ml-sm" @click="menuSisa = true" />
              </div>
            </q-card-section>

            <!-- MODO CANVAS -->
            <q-card-section v-else class="q-pt-sm">
              <div class="row q-col-gutter-md" data-tour="teacher-builder-canvas">
                <div class="col-auto">
                  <BlockPalette />
                </div>
                <div class="col">
                  <BuilderCanvas
                    :secciones="curso.secciones"
                    :bloques-por-seccion="listasActividades"
                    @edit-seccion="abrirDialogoSeccion"
                    @delete-seccion="(id) => eliminarSeccion(id)"
                    @update-bloques="onUpdateCanvasBloques"
                    @bloque-change="onCanvasBloqueChange"
                    @edit-bloque="onEditCanvasBloque"
                    @delete-bloque="onDeleteCanvasBloque"
                  />
                </div>
              </div>
            </q-card-section>
          </TaCard>
        </div>
      </div>
    </template>

    <div v-else class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- Dialogos (seccion, tipo actividad, formulario actividad, SISA, confirmar eliminar) -->
    <q-dialog v-model="dialogoSeccion">
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">{{ seccionEditando ? 'Editar Seccion' : 'Nueva Seccion' }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="formSeccion.titulo" label="Titulo de la seccion" outlined autofocus class="q-mb-sm" />
          <q-input v-model="formSeccion.descripcion" label="Descripcion" outlined type="textarea" rows="2" />
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
          <TaButton variant="primary" :label="seccionEditando ? 'Guardar' : 'Agregar'" @click="guardarSeccion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="tipoActividadDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Seleccionar Tipo de Actividad</div>
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item v-for="tipo in tiposActividad" :key="tipo.valor" clickable v-ripple v-close-popup @click="abrirFormularioActividad(tipo.valor)">
              <q-item-section avatar>
                <q-icon :name="tipo.icon" :color="tipo.color" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ tipo.label }}</q-item-label>
                <q-item-label caption>{{ tipo.descripcion }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoActividad" persistent>
      <q-card style="min-width: 550px; max-width: 700px">
        <q-card-section>
          <div class="text-h6">{{ actividadEditando ? 'Editar ' + labelTipo(formActividad.tipo) : 'Nueva ' + labelTipo(formActividad.tipo) }}</div>
        </q-card-section>
        <q-card-section>
          <q-banner rounded class="bg-purple-1 text-primary q-mb-md">
            <template #avatar><q-icon :name="modeloFormActividad.accion_icon" color="primary" /></template>
            <strong>El estudiante vera: {{ modeloFormActividad.accion_label }}</strong>
            <div class="text-caption">{{ modeloFormActividad.accion_tooltip }} · {{ modeloFormActividad.requiere_entrega ? 'Requiere entrega' : 'Se trabaja dentro del sistema' }}</div>
          </q-banner>
          <q-input v-model="formActividad.titulo" label="Titulo de la actividad" outlined class="q-mb-sm" />
          <q-input v-model="formActividad.descripcion" label="Descripcion" outlined type="textarea" rows="2" class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col">
              <q-toggle v-model="formActividad.tiene_nota" label="Calificable" left-label />
            </div>
          </div>
          <template v-if="formActividad.tiene_nota">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input v-model.number="formActividad.nota_maxima" label="Nota Maxima" outlined type="number" />
              </div>
              <div class="col-6">
                <q-input v-model.number="formActividad.peso" label="Peso" outlined type="number" step="0.1" />
              </div>
            </div>
          </template>
          <template v-if="formActividad.tipo === 'tarea'">
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-sm">Configuracion de Tarea</div>
            <div class="row q-col-gutter-sm q-mb-sm">
              <div class="col-6"><q-input v-model="formActividad.config.fecha_entrega" label="Fecha de entrega" outlined type="datetime-local" /></div>
              <div class="col-6"><q-input v-model="formActividad.config.fecha_limite" label="Fecha limite" outlined type="datetime-local" /></div>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-8"><q-input v-model="formActividad.config.archivos_permitidos" label="Archivos permitidos (ej: pdf,docx)" outlined /></div>
              <div class="col-4"><q-input v-model.number="formActividad.config.tamano_max_mb" label="Tamano max (MB)" outlined type="number" /></div>
            </div>
            <q-input v-model="formActividad.config.instrucciones" label="Instrucciones" outlined type="textarea" rows="3" class="q-mt-sm" />
          </template>
          <template v-if="formActividad.tipo === 'cuestionario'">
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-sm">Configuracion de Cuestionario</div>
            <div class="row q-col-gutter-sm">
              <div class="col-4"><q-input v-model.number="formActividad.config.tiempo_limite_minutos" label="Tiempo limite (min)" outlined type="number" /></div>
              <div class="col-4"><q-input v-model.number="formActividad.config.intentos_maximos" label="Intentos maximos" outlined type="number" /></div>
              <div class="col-4 flex flex-center"><q-toggle v-model="formActividad.config.aleatorio" label="Aleatorio" /></div>
            </div>
          </template>
          <template v-if="formActividad.tipo === 'foro'">
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-sm">Configuracion de Foro</div>
            <div class="row q-col-gutter-sm">
              <div class="col"><q-select v-model="formActividad.config.tipo_foro" :options="['normal', 'debate', 'pregunta_respuesta']" label="Tipo de foro" outlined /></div>
            </div>
            <div class="row q-mt-sm">
              <q-toggle v-model="formActividad.config.moderado" label="Moderado" class="q-mr-lg" />
              <q-toggle v-model="formActividad.config.anonimo" label="Anonimo" />
            </div>
          </template>
          <template v-if="formActividad.tipo === 'encuesta'">
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-sm">Configuracion de Encuesta</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6"><q-input v-model="formActividad.config.fecha_cierre" label="Fecha de cierre" outlined type="datetime-local" /></div>
              <div class="col-6 flex flex-center"><q-toggle v-model="formActividad.config.anonima" label="Anonima" /></div>
            </div>
          </template>
          <template v-if="formActividad.tipo === 'leccion'">
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-sm">Configuracion de Leccion</div>
            <q-input v-model="formActividad.config.contenido_html" label="Contenido HTML" outlined type="textarea" rows="4" />
          </template>
          <template v-if="formActividad.tipo === 'h5p'">
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-sm">Configuracion de Contenido H5P</div>
            <q-file
              v-model="formActividad.config.h5p_file"
              label="Subir archivo .h5p"
              accept=".h5p"
              outlined
              clearable
              @update:model-value="onH5pFileChange"
              class="q-mb-sm"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
            <div v-if="formActividad.config.h5p_metadata?.title" class="q-mb-sm">
              <q-banner dense class="bg-blue-1 text-blue-8 rounded-borders">
                <div class="text-caption text-weight-medium">Metadata del contenido:</div>
                <div class="text-caption">Titulo: {{ formActividad.config.h5p_metadata.title }}</div>
                <div class="text-caption">Tipo: {{ formActividad.config.h5p_metadata.mainLibrary }}</div>
                <div class="text-caption">Version: {{ formActividad.config.h5p_metadata.version }}</div>
              </q-banner>
            </div>
            <q-toggle v-model="formActividad.config.h5p_calificable" label="Este contenido es calificable" class="q-mb-sm" />
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
          <TaButton variant="primary" :label="actividadEditando ? 'Guardar' : 'Agregar'" @click="guardarActividad" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="menuSisa" maximized>
      <q-card class="sisa-wizard">
        <q-bar class="bg-primary text-white">
          <div>Generar Curso desde SISA</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section class="q-pa-lg">
          <div class="text-h5 text-center q-mb-lg">Importar Plan Analitico de Curso (PAC)</div>
          <q-stepper v-model="sisaPaso" vertical color="primary" animated>
            <q-step name="conectar" title="Conectar con SISA" icon="cloud" :done="sisaPaso !== 'conectar'">
              <p class="text-grey-7">El sistema se conectara a la API de SISA para obtener el Plan Analitico de Curso de la asignatura seleccionada.</p>
              <q-select v-model="sisaAsignatura" :options="opcionesSisa" label="Seleccionar asignatura en SISA" outlined style="max-width: 400px" />
              <q-stepper-navigation>
                <q-btn color="primary" label="Siguiente" @click="sisaConectar" :disable="!sisaAsignatura" />
              </q-stepper-navigation>
            </q-step>
            <q-step name="mapear" title="Mapear PAC a Curso" icon="compare_arrows" :done="sisaPaso === 'confirmar'">
              <p class="text-grey-7">El sistema mapea automaticamente la estructura del PAC a la estructura del curso LMS:</p>
              <q-list bordered separator class="q-mb-md">
                <q-item v-for="(map, i) in sisaMapeo" :key="i">
                  <q-item-section avatar><q-icon name="arrow_forward" color="primary" /></q-item-section>
                  <q-item-section>
                    <q-item-label>{{ map.sisa }}</q-item-label>
                    <q-item-label caption>{{ map.lms }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-stepper-navigation>
                <q-btn flat color="primary" label="Atras" @click="sisaPaso = 'conectar'" class="q-mr-sm" />
                <q-btn color="primary" label="Generar Curso" @click="sisaGenerar" />
              </q-stepper-navigation>
            </q-step>
            <q-step name="confirmar" title="Curso Generado" icon="check_circle">
              <div class="text-center q-pa-lg">
                <q-icon name="check_circle" size="64px" color="green" />
                <h6 class="text-green q-mt-md">Curso generado exitosamente!</h6>
                <p class="text-grey-7">Se han creado {{ sisaSeccionesCreadas }} secciones y {{ sisaActividadesCreadas }} actividades base a partir del PAC.</p>
              </div>
              <q-stepper-navigation>
                <q-btn color="primary" label="Ir al Builder" v-close-popup @click="recargarActividades" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoConfirmar">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirmar Eliminacion</div>
        </q-card-section>
        <q-card-section>
          Estas seguro de que deseas eliminar "{{ itemAEliminar?.titulo }}"?
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
          <TaButton variant="danger" label="Eliminar" @click="confirmarEliminacion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo Cargar Plantilla -->
    <q-dialog v-model="dialogoPlantillas">
      <q-card style="min-width: 500px; max-width: 650px">
        <q-card-section>
          <div class="text-h6">Cargar Plantilla</div>
          <p class="text-grey-7 q-mb-none">Selecciona una plantilla para aplicar su estructura al curso actual.</p>
        </q-card-section>
        <q-card-section>
          <q-list bordered separator>
            <q-item v-for="(plantilla, i) in plantillas" :key="i" clickable v-ripple v-close-popup @click="cargarPlantilla(plantilla)">
              <q-item-section avatar>
                <q-icon name="bookmark" color="orange" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ plantilla.nombre }}</q-item-label>
                <q-item-label caption>
                  {{ plantilla.descripcion }}
                  <q-badge color="grey-4" text-color="grey-7" dense class="q-ml-sm">
                    {{ plantilla.secciones }} secciones
                  </q-badge>
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-btn flat round dense size="sm" icon="delete" color="negative" @click.stop="eliminarPlantilla(i)" />
              </q-item-section>
            </q-item>
          </q-list>
          <div v-if="plantillas.length === 0" class="text-center q-pa-md" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
            <q-icon name="bookmark_border" size="32px" :color="$q.dark.isActive ? 'grey-6' : 'grey-4'" />
            <p class="q-mt-sm">No hay plantillas guardadas. Usa "Guardar como Plantilla" para crear una.</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, shallowReactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCursosStore } from 'src/stores/cursos'
import { useActividadesStore } from 'src/stores/actividades'
import draggable from 'vuedraggable'
import JSZip from 'jszip'
import BlockPalette from 'src/components/curso-builder/BlockPalette.vue'
import BuilderCanvas from 'src/components/curso-builder/BuilderCanvas.vue'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import { getActivityModel } from 'src/utils/activityModel'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()

const curso = computed(() => cursosStore.getCursoById(Number(route.params.id)))

const modoBuilder = ref('simple')

const listasActividades = shallowReactive({})

function inicializarListas() {
  if (!curso.value) return
  const secciones = curso.value.secciones || []
  const esActividad = (b) => ['leccion', 'tarea', 'foro', 'cuestionario', 'encuesta', 'h5p'].includes(b.tipo)

  secciones.forEach((s) => {
    const desdeStore = actividadesStore.actividades
      .filter((a) => a.seccion_id === s.id)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0))

    const bloquesContenido = (listasActividades[s.id] || []).filter((b) => !esActividad(b))

    const storeMap = new Map(desdeStore.map((a) => [a.id, a]))
    if (!listasActividades[s.id]) {
      listasActividades[s.id] = [...desdeStore, ...bloquesContenido]
    } else {
      listasActividades[s.id] = listasActividades[s.id].filter((b) => {
        if (esActividad(b)) return storeMap.has(b.id)
        return true
      })
      desdeStore.forEach((a) => {
        if (!listasActividades[s.id].find((b) => b.id === a.id)) {
          listasActividades[s.id].push(a)
        }
      })
    }
  })

  const ids = new Set(secciones.map((s) => s.id))
  Object.keys(listasActividades).forEach((k) => {
    if (!ids.has(Number(k))) delete listasActividades[k]
  })
}

inicializarListas()

watch(
  () => [curso.value?.secciones?.length, curso.value?.secciones?.map((s) => s.id).join(',')],
  () => { inicializarListas() },
  { immediate: false }
)

function getListaActividades(seccionId) {
  if (!listasActividades[seccionId]) {
    listasActividades[seccionId] = actividadesStore.actividades
      .filter((a) => a.seccion_id === seccionId)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0))
  }
  return listasActividades[seccionId]
}

function getActividadesCount(seccionId) {
  return (listasActividades[seccionId] || []).length
}

function sincronizarAlStore(seccionId) {
  const lista = listasActividades[seccionId]
  if (!lista) return
  lista.forEach((act, idx) => {
    if (['leccion', 'tarea', 'foro', 'cuestionario', 'encuesta', 'h5p'].includes(act.tipo)) {
      act.orden = idx + 1
      act.seccion_id = seccionId
      const existente = actividadesStore.actividades.find((a) => a.id === act.id)
      if (existente) {
        existente.orden = idx + 1
        existente.seccion_id = seccionId
      }
    }
  })
}

function onActividadMove() {
  return true
}

function onActividadChange(seccionId, evt) {
  sincronizarAlStore(seccionId)
  if (evt.added) {
    const originalSeccion = evt.added.element.seccion_id
    if (originalSeccion && originalSeccion !== seccionId) {
      sincronizarAlStore(originalSeccion)
    }
  }
  if (evt.moved) {
    evt.moved.element.seccion_id = seccionId
  }
}

function recargarActividades() {
  inicializarListas()
}

const tiposActividad = [
  { valor: 'leccion', label: 'Leccion', icon: 'article', color: 'indigo', descripcion: 'Contenido de lectura con texto enriquecido' },
  { valor: 'tarea', label: 'Tarea', icon: 'assignment', color: 'orange', descripcion: 'Entrega de archivos o texto por el estudiante' },
  { valor: 'foro', label: 'Foro', icon: 'forum', color: 'teal', descripcion: 'Espacio de discusion entre estudiantes' },
  { valor: 'cuestionario', label: 'Cuestionario', icon: 'quiz', color: 'purple', descripcion: 'Evaluacion con preguntas de opcion multiple' },
  { valor: 'encuesta', label: 'Encuesta', icon: 'poll', color: 'green', descripcion: 'Recoleccion de opinion de estudiantes' },
  { valor: 'h5p', label: 'Contenido H5P', icon: 'extension', color: 'pink', descripcion: 'Contenido interactivo H5P (quiz, video, drag & drop, etc.)' },
  { valor: 'texto', label: 'Texto HTML', icon: 'text_fields', color: 'grey-8', descripcion: 'Bloque de texto enriquecido' },
  { valor: 'imagen', label: 'Imagen', icon: 'image', color: 'blue-grey', descripcion: 'Imagen o grafico' },
  { valor: 'video', label: 'Video', icon: 'smart_display', color: 'red', descripcion: 'Video de YouTube o Vimeo' },
  { valor: 'archivo', label: 'Archivo', icon: 'attach_file', color: 'brown', descripcion: 'Archivo descargable' },
  { valor: 'separador', label: 'Separador', icon: 'horizontal_rule', color: 'grey-5', descripcion: 'Linea divisoria visual' },
]

const dialogoSeccion = ref(false)
const seccionEditando = ref(null)
const formSeccion = ref({ titulo: '', descripcion: '' })

function abrirDialogoSeccion(seccion = null) {
  seccionEditando.value = seccion
  formSeccion.value = seccion ? { titulo: seccion.titulo, descripcion: seccion.descripcion } : { titulo: '', descripcion: '' }
  dialogoSeccion.value = true
}

function guardarSeccion() {
  if (!formSeccion.value.titulo.trim()) return
  if (seccionEditando.value) {
    cursosStore.actualizarSeccion(curso.value.id, seccionEditando.value.id, { ...formSeccion.value })
    $q.notify({ message: 'Seccion actualizada', color: 'positive', timeout: 1500 })
  } else {
    cursosStore.agregarSeccion(curso.value.id, { ...formSeccion.value })
    $q.notify({ message: 'Seccion agregada', color: 'positive', timeout: 1500 })
  }
  dialogoSeccion.value = false
  seccionEditando.value = null
}

const tipoActividadDialog = ref(false)
const seccionActivaParaAgregar = ref(null)
const dialogoActividad = ref(false)
const actividadEditando = ref(null)
const formActividad = ref(initFormActividad())
const modeloFormActividad = computed(() => getActivityModel(formActividad.value))

function initFormActividad() {
  return {
    titulo: '',
    descripcion: '',
    tipo: 'tarea',
    tiene_nota: true,
    nota_maxima: 100,
    peso: 1.0,
    config: {
      fecha_entrega: '', fecha_limite: '',
      archivos_permitidos: 'pdf,docx', tamano_max_mb: 10, instrucciones: '',
      tipo_foro: 'normal', moderado: false, anonimo: false,
      tiempo_limite_minutos: 20, intentos_maximos: 1, aleatorio: false,
      fecha_cierre: '', anonima: false, contenido_html: '',
      h5p_file: null,
      h5p_metadata: { title: '', mainLibrary: '', version: '' },
      h5p_calificable: true,
      demo_content_path: '/h5p/contents/demo-1',
      seguimiento_requerido: true,
      modo_interaccion: 'entrega',
      regla_completado: 'entrega_enviada',
    },
  }
}

function abrirFormularioActividad(tipo) {
  formActividad.value = { ...initFormActividad(), tipo }
  actividadEditando.value = null
  dialogoActividad.value = true
}

function editarActividad(act) {
  formActividad.value = {
    titulo: act.titulo, descripcion: act.descripcion, tipo: act.tipo,
    tiene_nota: act.tiene_nota, nota_maxima: act.nota_maxima, peso: act.peso,
    config: { ...initFormActividad().config, ...act.config },
  }
  actividadEditando.value = act
  seccionActivaParaAgregar.value = act.seccion_id
  dialogoActividad.value = true
}

async function onH5pFileChange(file) {
  if (!file) return
  try {
    const zip = await JSZip.loadAsync(file)
    const h5pJsonFile = zip.file('h5p.json')
    if (!h5pJsonFile) {
      $q.notify({ message: 'El archivo no parece ser un contenido H5P valido (falta h5p.json)', color: 'negative', timeout: 3000 })
      return
    }
    const h5pJsonText = await h5pJsonFile.async('string')
    const h5pJson = JSON.parse(h5pJsonText)
    formActividad.value.config.h5p_metadata = {
      title: h5pJson.title || 'Sin titulo',
      mainLibrary: h5pJson.mainLibrary || 'Desconocido',
      version: h5pJson.mainLibrary ? h5pJson.mainLibrary.split(' ').pop() : '',
    }
    // Auto-llenar titulo si esta vacio
    if (!formActividad.value.titulo.trim()) {
      formActividad.value.titulo = h5pJson.title || 'Contenido H5P'
    }
    // Auto-detectar si es calificable por el tipo de libreria
    const calificableLibs = ['H5P.MultiChoice', 'H5P.TrueFalse', 'H5P.DragQuestion', 'H5P.Blanks', 'H5P.SingleChoiceSet', 'H5P.QuestionSet', 'H5P.InteractiveVideo']
    const isCalificable = calificableLibs.some(lib => h5pJson.mainLibrary?.startsWith(lib))
    formActividad.value.config.h5p_calificable = isCalificable
    formActividad.value.tiene_nota = isCalificable
    $q.notify({ message: `H5P parseado: ${h5pJson.title}`, color: 'positive', timeout: 2000 })
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al leer el archivo H5P', color: 'negative', timeout: 3000 })
  }
}

function guardarActividad() {
  if (!formActividad.value.titulo.trim()) return
  const esActividad = ['leccion', 'tarea', 'foro', 'cuestionario', 'encuesta', 'h5p'].includes(formActividad.value.tipo)
  const sid = seccionActivaParaAgregar.value
  const modelo = getActivityModel(formActividad.value)
  formActividad.value.config = {
    ...formActividad.value.config,
    modo_interaccion: modelo.modo_interaccion,
    regla_completado: modelo.regla_completado,
    seguimiento_requerido: true,
  }

  if (actividadEditando.value) {
    if (esActividad) {
      actividadesStore.actualizarActividad(actividadEditando.value.id, { ...formActividad.value })
    }
    $q.notify({ message: 'Bloque actualizado', color: 'positive', timeout: 1500 })
  } else {
    const nuevoBloque = {
      ...formActividad.value,
      seccion_id: sid,
      orden: (listasActividades[sid] || []).length + 1,
    }
    if (esActividad) {
      actividadesStore.agregarActividad(nuevoBloque)
    }
    if (!listasActividades[sid]) listasActividades[sid] = []
    listasActividades[sid].push(nuevoBloque)
    $q.notify({ message: 'Bloque agregado', color: 'positive', timeout: 1500 })
  }
  dialogoActividad.value = false
  actividadEditando.value = null
  inicializarListas()
}

const itemAEliminarSeccion = ref(null)
const itemAEliminarAct = ref(null)
const modoEliminar = ref('actividad')
const dialogoConfirmar = ref(false)

const itemAEliminar = computed(() =>
  modoEliminar.value === 'seccion' ? itemAEliminarSeccion.value : itemAEliminarAct.value
)

function eliminarSeccion(id) {
  itemAEliminarSeccion.value = curso.value.secciones.find((s) => s.id === id)
  modoEliminar.value = 'seccion'
  dialogoConfirmar.value = true
}

function eliminarActividad(id) {
  itemAEliminarAct.value = actividadesStore.getActividadById(id)
  modoEliminar.value = 'actividad'
  dialogoConfirmar.value = true
}

function confirmarEliminacion() {
  if (modoEliminar.value === 'seccion' && itemAEliminarSeccion.value) {
    cursosStore.eliminarSeccion(curso.value.id, itemAEliminarSeccion.value.id)
    $q.notify({ message: 'Seccion eliminada', color: 'warning', timeout: 1500 })
  } else if (itemAEliminarAct.value) {
    actividadesStore.eliminarActividad(itemAEliminarAct.value.id)
    $q.notify({ message: 'Actividad eliminada', color: 'warning', timeout: 1500 })
  }
  dialogoConfirmar.value = false
  inicializarListas()
}

function previsualizarCurso() {
  const cursoId = curso.value?.id
  if (!cursoId) return
  router.push(`/docente/curso/${cursoId}/preview`)
}

function publicarCurso() {
  cursosStore.actualizarCurso(curso.value.id, { estado: 'publicado' })
  $q.notify({ message: 'Curso publicado! Los estudiantes ya pueden verlo.', color: 'positive', timeout: 3000, icon: 'check_circle' })
}

function duplicarCurso() {
  $q.notify({ message: 'Curso duplicado (mock)', color: 'info', timeout: 2000 })
}

const menuSisa = ref(false)
const sisaPaso = ref('conectar')
const sisaAsignatura = ref(null)
const sisaSeccionesCreadas = ref(0)
const sisaActividadesCreadas = ref(0)

const opcionesSisa = [
  { label: 'SIS-401 — Programacion Avanzada', value: 'SIS-401' },
  { label: 'SIS-305 — Base de Datos II', value: 'SIS-305' },
]

const sisaMapeo = [
  { sisa: 'Asignatura', lms: 'Curso' },
  { sisa: 'Unidad I, II, III...', lms: 'Seccion' },
  { sisa: 'Temas por unidad', lms: 'Actividades sugeridas' },
  { sisa: 'Logros de aprendizaje', lms: 'Objetivos de la seccion' },
  { sisa: 'Cronograma maestro', lms: 'Fechas sugeridas' },
  { sisa: 'Sistema de evaluacion', lms: 'Esquema de calificacion inicial' },
]

function sisaConectar() {
  $q.loading.show({ message: 'Conectando con API SISA...' })
  setTimeout(() => { $q.loading.hide(); sisaPaso.value = 'mapear' }, 1200)
}

function sisaGenerar() {
  const nroSecciones = Math.floor(Math.random() * 3) + 2
  for (let i = 0; i < nroSecciones; i++) {
    cursosStore.agregarSeccion(curso.value.id, {
      titulo: `Unidad ${['I', 'II', 'III', 'IV'][i]} — Importada desde SISA`,
      descripcion: `Contenido del PAC de ${sisaAsignatura.value?.label ?? 'SISA'}`,
    })
  }
  sisaSeccionesCreadas.value = nroSecciones
  sisaActividadesCreadas.value = nroSecciones * 2
  sisaPaso.value = 'confirmar'
  inicializarListas()
  $q.notify({ message: `Curso generado desde SISA con ${nroSecciones} secciones`, color: 'positive', timeout: 3000 })
}

function labelTipo(tipo) {
  const m = { leccion: 'Leccion', tarea: 'Tarea', foro: 'Foro', cuestionario: 'Cuestionario', encuesta: 'Encuesta', h5p: 'Contenido H5P', texto: 'Texto', imagen: 'Imagen', video: 'Video', archivo: 'Archivo', separador: 'Separador' }
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

// Canvas — comparte listasActividades con el modo Simple
function onUpdateCanvasBloques(seccionId, val) {
  listasActividades[seccionId] = val
  sincronizarAlStore(seccionId)
}

function onCanvasBloqueChange(seccionId) {
  sincronizarAlStore(seccionId)
}

function onEditCanvasBloque(bloque) {
  if (['leccion', 'tarea', 'foro', 'cuestionario', 'encuesta', 'h5p'].includes(bloque.tipo)) {
    editarActividad(bloque)
  } else {
    $q.notify({ message: `Editor de bloque "${labelTipo(bloque.tipo)}" (mock)`, color: 'info', timeout: 1500 })
  }
}

function onDeleteCanvasBloque(seccionId, idx) {
  const lista = listasActividades[seccionId]
  if (!lista) return
  const bloque = lista[idx]
  if (bloque && ['leccion', 'tarea', 'foro', 'cuestionario', 'encuesta', 'h5p'].includes(bloque.tipo)) {
    itemAEliminarAct.value = bloque
    modoEliminar.value = 'actividad'
    dialogoConfirmar.value = true
  } else {
    lista.splice(idx, 1)
  }
}

// Plantillas
const dialogoPlantillas = ref(false)
const PLANTILLAS_KEY = 'lms_plantillas_curso'

const plantillaEjemplo = {
  nombre: 'Curso Universitario Estandar',
  descripcion: 'Estructura tipica de curso: Introduccion, Desarrollo, Evaluacion',
  secciones: 3,
  data: [
    { titulo: 'Unidad I — Introduccion', descripcion: 'Presentacion del curso y conceptos fundamentales', actividades: [
      { tipo: 'leccion', titulo: 'Bienvenida al Curso', descripcion: 'Video de presentacion y objetivos', tiene_nota: false },
      { tipo: 'foro', titulo: 'Foro de Presentacion', descripcion: 'Presentate y conoce a tus companeros', tiene_nota: false },
    ]},
    { titulo: 'Unidad II — Desarrollo', descripcion: 'Contenido principal del curso', actividades: [
      { tipo: 'leccion', titulo: 'Material de Estudio', descripcion: 'Lectura obligatoria', tiene_nota: false },
      { tipo: 'tarea', titulo: 'Tarea Practica', descripcion: 'Aplica lo aprendido', tiene_nota: true, nota_maxima: 100, peso: 1.0 },
      { tipo: 'foro', titulo: 'Foro de Debate', descripcion: 'Discute los temas de la unidad', tiene_nota: true, nota_maxima: 20, peso: 0.5 },
    ]},
    { titulo: 'Unidad III — Evaluacion', descripcion: 'Evaluacion final de conocimientos', actividades: [
      { tipo: 'cuestionario', titulo: 'Evaluacion Final', descripcion: 'Cuestionario de cierre', tiene_nota: true, nota_maxima: 100, peso: 2.0 },
      { tipo: 'encuesta', titulo: 'Encuesta de Satisfaccion', descripcion: 'Evalua tu experiencia en el curso', tiene_nota: false },
    ]},
  ],
}

function cargarPlantillasGuardadas() {
  try {
    return JSON.parse(localStorage.getItem(PLANTILLAS_KEY) || '[]')
  } catch { return [] }
}

function guardarPlantillasEnStorage(lista) {
  localStorage.setItem(PLANTILLAS_KEY, JSON.stringify(lista))
}

const plantillas = ref(cargarPlantillasGuardadas())

function guardarPlantilla() {
  const nombre = prompt('Nombre de la plantilla:', curso.value?.nombre || 'Mi Plantilla')
  if (!nombre?.trim()) return
  const data = curso.value.secciones.map((s) => ({
    titulo: s.titulo,
    descripcion: s.descripcion,
    actividades: (actividadesStore.actividades || [])
      .filter((a) => a.seccion_id === s.id)
      .map((a) => ({
        tipo: a.tipo,
        titulo: a.titulo,
        descripcion: a.descripcion,
        tiene_nota: a.tiene_nota,
        nota_maxima: a.nota_maxima,
        peso: a.peso,
        config: a.config,
      })),
  }))
  const nueva = {
    nombre: nombre.trim(),
    descripcion: `${data.length} secciones, ${data.reduce((s, se) => s + se.actividades.length, 0)} actividades`,
    secciones: data.length,
    data,
  }
  plantillas.value.unshift(nueva)
  guardarPlantillasEnStorage(plantillas.value)
  $q.notify({ message: `Plantilla "${nueva.nombre}" guardada`, color: 'positive', timeout: 2000 })
}

function cargarPlantilla(plantilla) {
  if (!curso.value) return
  // Limpiar secciones existentes
  const seccionesActuales = [...curso.value.secciones]
  seccionesActuales.forEach((s) => cursosStore.eliminarSeccion(curso.value.id, s.id))

  // Crear nuevas secciones desde la plantilla
  plantilla.data.forEach((secData) => {
    cursosStore.agregarSeccion(curso.value.id, {
      titulo: secData.titulo,
      descripcion: secData.descripcion,
    })
    const nuevaSeccion = curso.value.secciones[curso.value.secciones.length - 1]
    if (nuevaSeccion && secData.actividades) {
      secData.actividades.forEach((actData) => {
        actividadesStore.agregarActividad({
          seccion_id: nuevaSeccion.id,
          orden: actividadesStore.actividades.filter((a) => a.seccion_id === nuevaSeccion.id).length + 1,
          ...actData,
          config: { ...actData.config },
        })
      })
    }
  })
  recargarActividades()
  $q.notify({ message: `Plantilla "${plantilla.nombre}" cargada!`, color: 'positive', timeout: 3000, icon: 'check_circle' })
}

function eliminarPlantilla(idx) {
  const nombre = plantillas.value[idx]?.nombre || 'Plantilla'
  plantillas.value.splice(idx, 1)
  guardarPlantillasEnStorage(plantillas.value)
  $q.notify({ message: `Plantilla "${nombre}" eliminada`, color: 'warning', timeout: 1500 })
}

// Inicializar con plantilla de ejemplo si no hay ninguna
if (plantillas.value.length === 0) {
  plantillas.value.push(plantillaEjemplo)
  guardarPlantillasEnStorage(plantillas.value)
}
</script>

<style scoped>
.seccion-card {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.seccion-card:hover {
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.08);
  border-color: #c7d2fe;
}
.body--dark .seccion-card {
  border-color: #2e3a47;
  background: #1c2434;
}
.body--dark .seccion-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  border-color: #3e4a5e;
}

.ghost-card {
  opacity: 0.6;
  background: rgba(37, 99, 235, 0.08);
  border: 2px dashed rgba(37, 99, 235, 0.4);
  border-radius: 16px;
}

.drag-handle { cursor: grab; transition: color 0.2s ease; }
.drag-handle:hover { color: #3c50e0; }
.drag-handle:active { cursor: grabbing; }

.actividad-item {
  border-radius: 10px;
  margin: 2px 8px;
  transition: background 0.25s ease, transform 0.2s ease;
}
.actividad-item:hover {
  background: rgba(37, 99, 235, 0.04);
  transform: translateX(2px);
}
.body--dark .actividad-item:hover {
  background: rgba(79, 91, 236, 0.06);
}

.act-drag-handle {
  opacity: 0;
  transition: opacity 0.2s ease, color 0.2s ease;
  cursor: grab;
}
.actividad-item:hover .act-drag-handle {
  opacity: 0.5;
}
.act-drag-handle:hover {
  opacity: 1 !important;
  color: #3c50e0;
}
.act-drag-handle:active { cursor: grabbing; }

.add-act-row {
  border-radius: 10px;
  margin: 2px 8px;
  transition: all 0.2s ease;
}
.add-act-row:hover {
  background: rgba(37, 99, 235, 0.06);
  color: #3c50e0;
}

.sisa-wizard { max-width: 700px; width: 100%; }
</style>
