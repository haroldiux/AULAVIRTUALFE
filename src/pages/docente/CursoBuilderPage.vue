<template>
  <q-page class="av-dashboard-page">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el label="Mis Cursos" to="/docente/cursos" />
      <q-breadcrumbs-el :label="curso?.nombre ?? 'Curso'" />
    </q-breadcrumbs>

    <AppSkeleton v-if="cargando" variant="list" :count="5" />

    <template v-else-if="curso">
      <TaPageHeader :title="curso.nombre" data-tour="teacher-builder-header">
        <template #actions>
          <TaButton variant="primary" icon="visibility" label="Previsualizar" @click="previsualizarCurso" />
          <TaButton v-if="curso.estado === 'borrador'" variant="primary" icon="publish" label="Publicar" @click="publicarCurso" />
          <TaButton v-else variant="secondary" icon="unpublished" label="Despublicar" />
          <TaButton variant="outline" icon="sync" label="Sincronizar Estudiantes" :loading="sincronizandoEstudiantes" @click="syncEstudiantes" />
          <TaButton variant="ghost" icon="more_vert" aria-label="Opciones del curso">
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
                <q-item clickable v-close-popup @click="abrirDialogoPlantillas">
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
        <q-badge :color="curso.estado === 'publicado' ? 'positive' : 'warning'" class="q-px-sm">
          {{ curso.estado === 'publicado' ? 'Publicado' : 'Borrador' }}
        </q-badge>
        <span class="text-caption q-ml-sm" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ curso.codigo }} — {{ curso.gestion }} — {{ curso.total_estudiantes }} estudiantes</span>
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
                @change="onSeccionesChange"
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
                          <q-badge class="section-count" text-color="white">
                            {{ getActividadesCount(seccion.id) }} actividades
                          </q-badge>
                          <q-btn flat round dense size="sm" icon="edit" color="grey-7" aria-label="Editar seccion" @click.stop="abrirDialogoSeccion(seccion)">
                            <q-tooltip>Editar seccion</q-tooltip>
                          </q-btn>
                          <q-btn flat round dense size="sm" icon="delete" color="negative" aria-label="Eliminar seccion" @click.stop="eliminarSeccion(seccion.id)">
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
                              <q-btn flat round dense size="sm" icon="more_vert" aria-label="Opciones de actividad">
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
                                    <q-item clickable v-close-popup @click.stop="guardarComoPlantilla(act)">
                                      <q-item-section avatar><q-icon name="archive" color="primary" /></q-item-section>
                                      <q-item-section class="text-primary">Guardar como Plantilla</q-item-section>
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

              <AppEmptyState
                v-if="!curso.secciones.length"
                icon="folder_open"
                title="Sin secciones"
                message="Agrega tu primera seccion o genera un curso desde SISA."
              >
                <div class="row q-gutter-sm q-mt-md justify-center">
                  <TaButton variant="primary" icon="add" label="Agregar Seccion" @click="abrirDialogoSeccion()" />
                  <TaButton variant="outline" icon="cloud_download" label="Generar desde SISA" @click="menuSisa = true" />
                </div>
              </AppEmptyState>
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
      <div class="text-center" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
        <q-icon name="error_outline" size="48px" :color="$q.dark.isActive ? 'grey-6' : 'grey-4'" />
        <p class="q-mt-md">Curso no encontrado.</p>
        <TaButton variant="primary" icon="arrow_back" label="Volver a mis cursos" :to="'/docente/cursos'" />
      </div>
    </div>

    <!-- Dialogos (seccion, tipo actividad, formulario actividad, SISA, confirmar eliminar) -->
    <q-dialog v-model="dialogoSeccion">
      <q-card class="dialog-card">
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
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">Seleccionar Tipo de Actividad</div>
        </q-card-section>
        <q-card-section>
          <q-list>
            <!-- Banco Docente Item -->
            <q-item clickable v-ripple @click="abrirBancoDocente" class="bg-purple-1 text-primary q-mb-sm rounded" style="border-radius: 8px;">
              <q-item-section avatar>
                <q-icon name="archive" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Banco Docente (Plantillas)</q-item-label>
                <q-item-label caption class="text-primary">Importa una actividad prediseñada de la biblioteca institucional</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator class="q-mb-md" />

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
    </q-dialog>    <q-dialog v-model="dialogoActividad" persistent>
      <q-card class="dialog-card">
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
            <div class="col-6">
              <q-select
                v-model="formActividad.tipo_actividad"
                :options="[{label: 'Teórica', value: 'teorica'}, {label: 'Práctica', value: 'practica'}]"
                label="Tipo de Actividad"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-6 flex items-center justify-end">
              <q-toggle v-model="formActividad.tiene_nota" label="Calificable" left-label />
            </div>
          </div>
          
          <template v-if="formActividad.tiene_nota">
            <div class="row q-col-gutter-sm q-mb-sm">
              <div class="col-6">
                <q-input v-model.number="formActividad.nota_maxima" label="Nota Maxima" outlined dense type="number" />
              </div>
              <div class="col-6">
                <q-input v-model.number="formActividad.peso" label="Peso" outlined dense type="number" step="0.1" />
              </div>
            </div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12">
                <q-select
                  v-model="formActividad.grupo_calificacion"
                  :options="[
                    {label: 'Formativa Teórica', value: 'formativa_teorica'},
                    {label: 'Formativa Práctica', value: 'formativa_practica'},
                    {label: 'Examen Parcial', value: 'examen_parcial'},
                    {label: 'Examen Final', value: 'examen_final'}
                  ]"
                  label="Grupo de Calificación"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>
            <q-expansion-item
              icon="help_outline"
              label="Ver guía de calificación (Peso, Tipos y Grupos)"
              header-class="text-primary text-weight-medium bg-blue-1 rounded-borders q-mb-sm dense-help-header"
              dense
              class="q-mb-md overflow-hidden rounded-borders"
              style="border: 1px dashed var(--q-primary);"
            >
              <q-card class="bg-blue-1 text-caption text-blue-10 q-pa-sm">
                <div class="q-mb-xs"><strong>¿Qué es el Peso?</strong></div>
                <div class="q-pl-sm q-mb-sm">El peso es un multiplicador (por defecto 1.0) para calcular la importancia de la actividad dentro de su grupo. Por ejemplo, una tarea con peso <strong>2.0</strong> incide el doble en la nota promedio de ese grupo que una de peso <strong>1.0</strong>.</div>
                
                <div class="q-mb-xs"><strong>Tipos de Actividad:</strong></div>
                <div class="q-pl-sm q-mb-sm">
                  • <strong>Teórica:</strong> Centrada en la conceptualización, foros teóricos o cuestionarios de conocimiento.<br>
                  • <strong>Práctica:</strong> Centrada en talleres, tareas de desarrollo, proyectos o laboratorios.
                </div>
                
                <div class="q-mb-xs"><strong>Grupos de Calificación (Sistema UNITEPC):</strong></div>
                <div class="q-pl-sm">
                  • <strong>Formativa Teórica:</strong> Tareas y evaluaciones conceptuales.<br>
                  • <strong>Formativa Práctica:</strong> Prácticas de campo, laboratorios y proyectos.<br>
                  • <strong>Examen Parcial:</strong> Evaluación intermedia parcial.<br>
                  • <strong>Examen Final:</strong> Examen integrador final.
                </div>
              </q-card>
            </q-expansion-item>
          </template>

          <template v-if="formActividad.tipo === 'tarea'">
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-sm">Configuracion de Tarea</div>
            <div class="row q-col-gutter-sm q-mb-sm">
              <div class="col-6"><q-input v-model="formActividad.config.fecha_entrega" label="Fecha de entrega" outlined type="datetime-local" /></div>
              <div class="col-6"><q-input v-model="formActividad.config.fecha_limite" label="Fecha limite" outlined type="datetime-local" /></div>
            </div>
            
            <div class="q-mb-sm">
              <div class="text-caption text-weight-bold av-text-secondary q-mb-xs">Formatos de archivo permitidos:</div>
              <div class="row q-col-gutter-xs q-pa-sm rounded-borders bg-grey-2" style="max-height: 120px; overflow-y: auto;">
                <div v-for="ext in extensionesDisponibles" :key="ext.val" class="col-6 col-sm-4">
                  <q-checkbox
                    v-model="archivosSeleccionados"
                    :val="ext.val"
                    :label="ext.label"
                    dense
                    class="text-caption"
                  />
                </div>
              </div>
              <div class="row q-col-gutter-sm q-mt-xs">
                <div class="col-8">
                  <q-input
                    v-model="formActividad.config.archivos_permitidos"
                    label="Formatos permitidos (separados por coma)"
                    outlined
                    dense
                    hint="Ej: pdf,docx,xlsx"
                  />
                </div>
                <div class="col-4">
                  <q-input v-model.number="formActividad.config.tamano_max_mb" label="Tamano max (MB)" outlined dense type="number" />
                </div>
              </div>
            </div>

            <q-input v-model="formActividad.config.instrucciones" label="Instrucciones" outlined type="textarea" rows="3" class="q-mt-sm" />
          </template>

          <template v-if="formActividad.tipo === 'cuestionario'">
            <q-separator class="q-my-md" />
            <div class="text-subtitle2 q-mb-sm">Configuracion de Cuestionario</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-4"><q-input v-model.number="formActividad.config.tiempo_limite_minutos" label="Tiempo limite (min)" outlined dense type="number" /></div>
              <div class="col-4"><q-input v-model.number="formActividad.config.intentos_maximos" label="Intentos maximos" outlined dense type="number" /></div>
              <div class="col-4 flex flex-center"><q-toggle v-model="formActividad.config.aleatorio" label="Aleatorio" dense /></div>
            </div>

            <!-- Editor de Preguntas de Cuestionario -->
            <div class="q-mt-md">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-primary">Preguntas del Cuestionario ({{ formActividad.config.preguntas?.length || 0 }})</div>
                <div class="row q-gutter-xs">
                  <q-btn size="sm" color="purple" icon="cloud_download" label="Importar SISA" no-caps @click="abrirSisaPreguntas" />
                  <q-btn size="sm" color="primary" icon="add" label="Añadir Manual" no-caps @click="agregarPreguntaManual" />
                </div>
              </div>
              
              <q-list bordered separator rounded class="bg-grey-1" style="max-height: 200px; overflow-y: auto; border-radius: 8px;">
                <q-item v-for="(p, idx) in formActividad.config.preguntas || []" :key="idx" class="q-py-sm">
                  <q-item-section avatar style="min-width: 32px;">
                    <q-chip size="sm" color="purple" text-color="white" class="q-ma-none">{{ idx + 1 }}</q-chip>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-body2 text-weight-medium line-clamp-1">{{ p.enunciado }}</q-item-label>
                    <q-item-label caption>{{ labelTipoPregunta(p.tipo) }} · {{ p.puntaje || 0 }} pts</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round dense size="sm" color="negative" icon="delete" @click="eliminarPregunta(idx)" />
                  </q-item-section>
                </q-item>
                <q-item v-if="!(formActividad.config.preguntas?.length)" class="text-center text-grey-6 q-pa-md">
                  <q-item-section>No hay preguntas añadidas a este cuestionario.</q-item-section>
                </q-item>
              </q-list>
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
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn label="Guardar" color="primary" @click="guardarActividad" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para Importar Preguntas desde Banco SISA -->
    <q-dialog v-model="dialogoSisaPreguntas" persistent>
      <q-card style="width: 550px; max-width: 90vw; border-radius: 16px;">
        <q-bar class="bg-primary text-white">
          <div>Banco de Preguntas SISA</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        
        <q-card-section class="q-pb-none">
          <div class="text-caption text-grey-7 q-mb-md">
            Selecciona el banco de preguntas centralizado de la asignatura para alimentarlo en este cuestionario.
          </div>
          <q-select
            v-model="asignaturaSisaPreguntas"
            :options="[
              {label: 'SIS-401 — Programación Avanzada (UML & POO)', value: 'SIS-401'},
              {label: 'SIS-305 — Base de Datos II (Transacciones & Optimización)', value: 'SIS-305'},
              {label: 'SIS-210 — Ingeniería de Software (Testing & Calidad)', value: 'SIS-210'}
            ]"
            label="Seleccionar Banco de Asignatura SISA"
            outlined
            emit-value
            map-options
            @update:model-value="cargarPreguntasSisa"
          />
        </q-card-section>

        <q-card-section v-if="cargandoPreguntasSisa" class="text-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
          <div class="text-caption text-grey-7 q-mt-md">Obteniendo banco de preguntas desde SISA API...</div>
        </q-card-section>

        <q-card-section v-else-if="preguntasSisaDisponibles.length > 0">
          <div class="text-subtitle2 q-mb-sm text-primary">Preguntas Disponibles ({{ preguntasSisaDisponibles.length }})</div>
          <q-list bordered separator style="max-height: 250px; overflow-y: auto; border-radius: 8px;">
            <q-item v-for="p in preguntasSisaDisponibles" :key="p.id" tag="label" v-ripple>
              <q-item-section avatar>
                <q-checkbox v-model="preguntasSisaSeleccionadas" :val="p.id" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2 line-clamp-2">{{ p.enunciado }}</q-item-label>
                <q-item-label caption>{{ labelTipoPregunta(p.tipo) }} · {{ p.puntaje }} pts</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn color="primary" label="Importar Seleccionadas" :disable="preguntasSisaSeleccionadas.length === 0" @click="confirmarImportarSisaPreguntas" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="menuSisa" maximized>
      <q-card class="sisa-wizard">
        <q-bar class="bg-primary text-white">
          <div>Generar Curso desde SISA</div>
          <q-space />
          <q-btn dense flat icon="close" aria-label="Cerrar dialogo" v-close-popup />
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
      <q-card class="dialog-card">
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
      <q-card class="dialog-card" style="width: 550px; max-width: 90vw;">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-weight-bold">Cargar Estructura / Plantilla</div>
          <p class="text-grey-7 q-mb-sm">Selecciona un formato predefinido para estructurar las secciones y actividades sugeridas.</p>
          
          <q-tabs v-model="tabPlantillas" class="text-primary" align="justify" narrow-indicator>
            <q-tab name="institucionales" label="Institucionales" icon="school" />
            <q-tab name="mis_plantillas" label="Mis Plantillas" icon="bookmark" />
          </q-tabs>
        </q-card-section>

        <q-separator />

        <q-tab-panels v-model="tabPlantillas" animated class="bg-transparent">
          <!-- Pestaña Plantillas Institucionales -->
          <q-tab-panel name="institucionales" class="q-pa-none">
            <q-card-section>
              <div v-if="cargandoInstitucionales" class="flex flex-center q-pa-lg">
                <q-spinner-dots size="40px" color="primary" />
                <div class="q-ml-sm text-grey-6 text-caption">Obteniendo plantillas de la institución...</div>
              </div>

              <template v-else>
                <q-list bordered separator v-if="plantillasInstitucionales.length > 0">
                  <q-item v-for="p in plantillasInstitucionales" :key="p.id" clickable v-ripple v-close-popup @click="cargarPlantilla(p)">
                    <q-item-section avatar>
                      <q-icon name="auto_stories" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium text-subtitle2">{{ p.nombre }}</q-item-label>
                      <q-item-label caption lines="2">{{ p.descripcion }}</q-item-label>
                      <q-item-label caption class="q-mt-xs">
                        <q-badge color="purple-1" text-color="primary" class="q-px-sm">
                          {{ p.datos?.length || 0 }} secciones
                        </q-badge>
                        <span class="q-ml-xs text-grey-5">Usado {{ p.uso_count || 0 }} veces</span>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <AppEmptyState
                  v-else
                  icon="school"
                  title="Sin plantillas institucionales"
                  message="El administrador no ha publicado plantillas de estructura de materias."
                />
              </template>
            </q-card-section>
          </q-tab-panel>

          <!-- Pestaña Mis Plantillas Locales -->
          <q-tab-panel name="mis_plantillas" class="q-pa-none">
            <q-card-section>
              <q-list bordered separator v-if="plantillas.length > 0">
                <q-item v-for="(plantilla, i) in plantillas" :key="i" clickable v-ripple v-close-popup @click="cargarPlantilla(plantilla)">
                  <q-item-section avatar>
                    <q-icon name="bookmark" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium text-subtitle2">{{ plantilla.nombre }}</q-item-label>
                    <q-item-label caption lines="2">{{ plantilla.descripcion }}</q-item-label>
                    <q-item-label caption class="q-mt-xs">
                      <q-badge color="grey-3" text-color="grey-8">
                        {{ plantilla.secciones || 0 }} secciones
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <q-btn flat round dense size="sm" icon="delete" color="negative" aria-label="Eliminar plantilla" @click.stop="eliminarPlantilla(i)" />
                  </q-item-section>
                </q-item>
              </q-list>

              <AppEmptyState
                v-else
                icon="bookmark_border"
                title="Sin plantillas locales"
                message="Usa 'Guardar como Plantilla' en el menú de arriba para crear una propia."
              />
            </q-card-section>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator />
        <q-card-actions align="right" class="q-py-md q-px-md">
          <TaButton variant="ghost" label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo Guardar como Plantilla en Banco Docente -->
    <q-dialog v-model="dialogoGuardarPlantillaActividad" persistent>
      <q-card style="width: 460px; max-width: 90vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Guardar en Banco Docente</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <p class="text-caption text-grey-7 q-mb-none">
            Guarda esta actividad como plantilla para reutilizarla en tus cursos o compartirla con otros docentes de la institución.
          </p>
          <q-input
            v-model="plantillaActividadForm.nombre"
            label="Nombre de la Plantilla"
            outlined
            dense
            :rules="[val => !!val || 'El nombre es obligatorio']"
          />
          <q-input
            v-model="plantillaActividadForm.descripcion"
            label="Descripción / Recomendaciones de Uso"
            type="textarea"
            rows="3"
            outlined
            dense
          />
          <q-toggle
            v-model="plantillaActividadForm.publica"
            label="Hacer pública para otros docentes"
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
          <TaButton variant="primary" label="Guardar Plantilla" @click="confirmarGuardarPlantilla" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo Banco Docente (Cargar Plantilla) -->
    <q-dialog v-model="dialogoBancoDocente" persistent>
      <q-card style="width: 600px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Banco Docente Institucional</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <!-- Filtros del Banco -->
          <div class="row q-col-gutter-sm items-center q-mb-md">
            <div class="col-6">
              <q-select
                v-model="filtroCategoriaBanco"
                :options="[
                  {label: 'Todas las Categorías', value: 'todos'},
                  {label: 'Actividades', value: 'actividad'},
                  {label: 'Rúbricas', value: 'rubrica'},
                  {label: 'Preguntas', value: 'preguntas'}
                ]"
                label="Categoría"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="cargarPlantillasBanco"
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="filtroTipoBanco"
                :options="[
                  {label: 'Todos los Tipos', value: 'todos'},
                  {label: 'Tareas', value: 'tarea'},
                  {label: 'Cuestionarios', value: 'cuestionario'},
                  {label: 'Foros', value: 'foro'}
                ]"
                label="Tipo"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="cargarPlantillasBanco"
              />
            </div>
          </div>

          <!-- Listado de Plantillas -->
          <q-scroll-area style="height: 300px;" class="border rounded q-pa-sm bg-glass-soft">
            <q-list separator v-if="plantillasBancoDocente.length > 0">
              <q-item v-for="p in plantillasBancoDocente" :key="p.id" class="q-py-md">
                <q-item-section avatar>
                  <q-avatar color="primary-1" text-color="primary" size="40px">
                    <q-icon :name="iconoTipo(p.tipo)" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ p.nombre }}</q-item-label>
                  <q-item-label caption lines="2">{{ p.descripcion || 'Sin descripción' }}</q-item-label>
                  <q-item-label caption class="q-mt-xs text-xs text-grey-5">
                    Por: {{ p.docente?.nombre || 'Docente UNITEPC' }} · Usada {{ p.uso_count }} veces
                    <q-badge v-if="p.publica" color="teal-1" text-color="teal-9" class="q-ml-sm">Pública</q-badge>
                    <q-badge v-else color="grey-3" text-color="grey-8" class="q-ml-sm">Privada</q-badge>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <TaButton
                    variant="primary"
                    label="Importar"
                    size="sm"
                    dense
                    @click="importarPlantillaBanco(p)"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="archive" size="48px" color="grey-4" />
              <p class="q-mt-sm">No se encontraron plantillas disponibles.</p>
            </div>
          </q-scroll-area>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <TaButton variant="ghost" label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, shallowReactive, onMounted } from 'vue'
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
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import { useLoadingState } from 'src/composables/useLoadingState'
import { getActivityModel } from 'src/utils/activityModel'
import { integracionService } from 'src/services/integracionService.js'
import { bancoDocenteService } from 'src/services/bancoDocenteService.js'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()
const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 700 })

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

onMounted(async () => {
  const curso = await cursosStore.cargarCurso(Number(route.params.id))
  if (curso) actividadesStore.cargarDesdeCursos([curso])
  inicializarListas()
  finalizarCarga()
})

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

async function onSeccionesChange(evt) {
  if (evt.moved || evt.added || evt.removed) {
    const ids = curso.value.secciones.map((s) => s.id)
    try {
      await cursosStore.reordenarSecciones(curso.value.id, ids)
      $q.notify({ message: 'Orden de secciones actualizado', color: 'positive', timeout: 1000 })
    } catch (err) {
      console.error('[builder] Error al reordenar secciones:', err)
      $q.notify({ message: 'Error al guardar el orden de secciones', color: 'negative', timeout: 2000 })
    }
  }
}

async function onActividadChange(seccionId, evt) {
  sincronizarAlStore(seccionId)
  
  if (evt.moved) {
    const ids = listasActividades[seccionId].map((a) => a.id)
    try {
      await actividadesStore.reordenarActividades(seccionId, ids)
    } catch (err) {
      console.error('[builder] Error al reordenar actividades:', err)
      $q.notify({ message: 'Error al guardar el orden de actividades', color: 'negative', timeout: 2000 })
    }
  }
  
  if (evt.added) {
    const act = evt.added.element
    try {
      await actividadesStore.actualizarActividad(act.id, { seccion_id: seccionId })
      act.seccion_id = seccionId
      const ids = listasActividades[seccionId].map((a) => a.id)
      await actividadesStore.reordenarActividades(seccionId, ids)
    } catch (err) {
      console.error('[builder] Error al mover actividad:', err)
      $q.notify({ message: 'Error al trasladar actividad de seccion', color: 'negative', timeout: 2000 })
    }
  }

  if (evt.removed) {
    const ids = listasActividades[seccionId].map((a) => a.id)
    try {
      await actividadesStore.reordenarActividades(seccionId, ids)
    } catch (err) {
      console.error('[builder] Error al reordenar origen de actividad:', err)
    }
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

async function guardarSeccion() {
  if (!formSeccion.value.titulo.trim()) return
  if (seccionEditando.value) {
    await cursosStore.actualizarSeccion(curso.value.id, seccionEditando.value.id, { ...formSeccion.value })
    $q.notify({ message: 'Seccion actualizada', color: 'positive', timeout: 1500 })
  } else {
    await cursosStore.agregarSeccion(curso.value.id, { ...formSeccion.value })
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

const extensionesDisponibles = [
  { label: 'PDF (.pdf)', val: 'pdf' },
  { label: 'Word (.docx)', val: 'docx' },
  { label: 'Excel (.xlsx)', val: 'xlsx' },
  { label: 'PowerPoint (.pptx)', val: 'pptx' },
  { label: 'Imágenes (.png)', val: 'png' },
  { label: 'Imágenes (.jpg)', val: 'jpg' },
  { label: 'ZIP (.zip)', val: 'zip' },
  { label: 'RAR (.rar)', val: 'rar' },
]
const archivosSeleccionados = ref([])
watch(archivosSeleccionados, (newVal) => {
  if (formActividad.value && formActividad.value.config) {
    formActividad.value.config.archivos_permitidos = newVal.join(',')
  }
}, { deep: true })

// Banco Docente variables and methods
const dialogoGuardarPlantillaActividad = ref(false)
const plantillaActividadForm = ref({ nombre: '', descripcion: '', publica: true })
const actividadParaPlantilla = ref(null)

const dialogoBancoDocente = ref(false)
const plantillasBancoDocente = ref([])
const filtroCategoriaBanco = ref('todos')
const filtroTipoBanco = ref('todos')

function guardarComoPlantilla(act) {
  actividadParaPlantilla.value = act
  plantillaActividadForm.value = {
    nombre: act.titulo,
    descripcion: act.descripcion || '',
    publica: true
  }
  dialogoGuardarPlantillaActividad.value = true
}

async function confirmarGuardarPlantilla() {
  if (!plantillaActividadForm.value.nombre.trim()) return
  const act = actividadParaPlantilla.value
  
  const data = {
    categoria: 'actividad',
    tipo: act.tipo,
    nombre: plantillaActividadForm.value.nombre,
    descripcion: plantillaActividadForm.value.descripcion,
    datos: {
      titulo: act.titulo,
      descripcion: act.descripcion,
      tiene_nota: act.tiene_nota,
      nota_maxima: act.nota_maxima,
      peso: act.peso,
      config: act.config || {}
    },
    publica: plantillaActividadForm.value.publica
  }

  try {
    await bancoDocenteService.crear(data)
    $q.notify({ message: 'Guardado exitosamente en el Banco Docente', color: 'positive', timeout: 2000 })
    dialogoGuardarPlantillaActividad.value = false
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al guardar la plantilla', color: 'negative' })
  }
}

function abrirBancoDocente() {
  tipoActividadDialog.value = false
  dialogoBancoDocente.value = true
  filtroCategoriaBanco.value = 'todos'
  filtroTipoBanco.value = 'todos'
  cargarPlantillasBanco()
}

async function cargarPlantillasBanco() {
  try {
    const params = {}
    if (filtroCategoriaBanco.value !== 'todos') {
      params.categoria = filtroCategoriaBanco.value
    }
    if (filtroTipoBanco.value !== 'todos') {
      params.tipo = filtroTipoBanco.value
    }
    const res = await bancoDocenteService.listar(params)
    plantillasBancoDocente.value = res.data?.data || res.data || []
  } catch (err) {
    console.error(err)
  }
}

async function importarPlantillaBanco(plantilla) {
  const sid = seccionActivaParaAgregar.value
  const datos = plantilla.datos
  
  try {
    await bancoDocenteService.usar(plantilla.id)
  } catch (err) {
    console.error(err)
  }

  const nuevoBloque = {
    tipo: plantilla.tipo,
    titulo: datos.titulo || plantilla.nombre,
    descripcion: datos.descripcion || plantilla.descripcion || '',
    tiene_nota: datos.tiene_nota !== undefined ? datos.tiene_nota : true,
    nota_maxima: datos.nota_maxima || 100,
    peso: datos.peso || 1.0,
    seccion_id: sid,
    orden: (listasActividades[sid] || []).length + 1,
    config: datos.config || {}
  }

  try {
    const id = await actividadesStore.agregarActividad(sid, nuevoBloque)
    nuevoBloque.id = id
    if (!listasActividades[sid]) listasActividades[sid] = []
    listasActividades[sid].push(nuevoBloque)
    
    $q.notify({ message: 'Actividad importada desde el Banco Docente', color: 'positive', timeout: 2000 })
    dialogoBancoDocente.value = false
    inicializarListas()
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al importar actividad', color: 'negative' })
  }
}

function initFormActividad() {
  return {
    titulo: '',
    descripcion: '',
    tipo: 'tarea',
    tiene_nota: true,
    nota_maxima: 100,
    peso: 1.0,
    tipo_actividad: 'teorica',
    grupo_calificacion: 'formativa_teorica',
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
      preguntas: [],
    },
  }
}

function abrirFormularioActividad(tipo) {
  formActividad.value = { ...initFormActividad(), tipo }
  formActividad.value.tipo_actividad = ['tarea', 'h5p', 'foro'].includes(tipo) ? 'practica' : 'teorica'
  formActividad.value.grupo_calificacion = formActividad.value.tipo_actividad === 'practica' ? 'formativa_practica' : 'formativa_teorica'
  archivosSeleccionados.value = ['pdf', 'docx']
  actividadEditando.value = null
  dialogoActividad.value = true
}

function editarActividad(act) {
  formActividad.value = {
    titulo: act.titulo, descripcion: act.descripcion, tipo: act.tipo,
    tiene_nota: act.tiene_nota, nota_maxima: act.nota_maxima, peso: act.peso,
    tipo_actividad: act.tipo_actividad || (['tarea', 'h5p', 'foro'].includes(act.tipo) ? 'practica' : 'teorica'),
    grupo_calificacion: act.grupo_calificacion || (['tarea', 'h5p', 'foro'].includes(act.tipo) ? 'formativa_practica' : 'formativa_teorica'),
    config: { ...initFormActividad().config, ...act.config },
  }
  archivosSeleccionados.value = formActividad.value.config.archivos_permitidos
    ? formActividad.value.config.archivos_permitidos.split(',').map(s => s.trim()).filter(Boolean)
    : []
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

// SISA banco de preguntas variables
const dialogoSisaPreguntas = ref(false)
const asignaturaSisaPreguntas = ref(null)
const preguntasSisaDisponibles = ref([])
const preguntasSisaSeleccionadas = ref([])
const cargandoPreguntasSisa = ref(false)

function abrirSisaPreguntas() {
  dialogoSisaPreguntas.value = true
  preguntasSisaSeleccionadas.value = []
  preguntasSisaDisponibles.value = []
  
  const codigo = curso.value?.codigo
  if (codigo) {
    asignaturaSisaPreguntas.value = codigo
    cargarPreguntasSisa(codigo)
  } else {
    asignaturaSisaPreguntas.value = null
  }
}

async function cargarPreguntasSisa(codigo) {
  if (!codigo) return
  cargandoPreguntasSisa.value = true
  try {
    const res = await integracionService.bancoPreguntasSisa(codigo)
    preguntasSisaDisponibles.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('[CursoBuilder] Error al cargar preguntas SISA:', err)
    $q.notify({ message: 'Error al conectar con el Banco de Preguntas SISA', color: 'negative' })
    preguntasSisaDisponibles.value = []
  } finally {
    cargandoPreguntasSisa.value = false
  }
}

function confirmarImportarSisaPreguntas() {
  const elegidas = preguntasSisaDisponibles.value.filter((p) => preguntasSisaSeleccionadas.value.includes(p.id))
  if (!formActividad.value.config.preguntas) {
    formActividad.value.config.preguntas = []
  }
  elegidas.forEach((p) => {
    const nuevaP = {
      id: Date.now() + Math.random(),
      tipo: p.tipo,
      enunciado: p.enunciado,
      opciones: JSON.parse(JSON.stringify(p.opciones || [])),
      puntaje: p.puntaje || 10
    }
    formActividad.value.config.preguntas.push(nuevaP)
  })
  dialogoSisaPreguntas.value = false
  $q.notify({ message: `Importadas ${elegidas.length} preguntas desde SISA`, color: 'positive', timeout: 2000 })
}

function agregarPreguntaManual() {
  if (!formActividad.value.config.preguntas) {
    formActividad.value.config.preguntas = []
  }
  $q.dialog({
    title: 'Añadir Pregunta Manual',
    message: 'Ingresa el enunciado de la pregunta:',
    prompt: {
      model: '',
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk((enunciado) => {
    if (!enunciado.trim()) return
    
    $q.dialog({
      title: 'Tipo de Pregunta',
      message: 'Selecciona el formato de la pregunta:',
      options: {
        type: 'radio',
        model: 'opcion_multiple',
        items: [
          { label: 'Opción Múltiple', value: 'opcion_multiple' },
          { label: 'Verdadero o Falso', value: 'verdadero_falso' },
          { label: 'Respuesta Corta', value: 'respuesta_corta' }
        ]
      },
      cancel: true,
      persistent: true
    }).onOk((tipo) => {
      let opciones = []
      if (tipo === 'opcion_multiple') {
        opciones = [
          { texto: 'Opción A (Correcta)', es_correcta: true },
          { texto: 'Opción B', es_correcta: false },
          { texto: 'Opción C', es_correcta: false }
        ]
      } else if (tipo === 'verdadero_falso') {
        opciones = [
          { texto: 'Verdadero', es_correcta: true },
          { texto: 'Falso', es_correcta: false }
        ]
      }
      
      const nuevaP = {
        id: Date.now() + Math.random(),
        tipo,
        enunciado: enunciado.trim(),
        opciones,
        puntaje: 10
      }
      formActividad.value.config.preguntas.push(nuevaP)
      $q.notify({ message: 'Pregunta agregada', color: 'positive', timeout: 1500 })
    })
  })
}

function eliminarPregunta(index) {
  formActividad.value.config.preguntas.splice(index, 1)
}

function labelTipoPregunta(t) {
  const m = { opcion_multiple: 'Opción Múltiple', verdadero_falso: 'Verdadero/Falso', respuesta_corta: 'Respuesta Corta' }
  return m[t] ?? t
}

async function guardarActividad() {
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
  
  if (!formActividad.value.tiene_nota) {
    formActividad.value.grupo_calificacion = null
  }

  if (actividadEditando.value) {
    if (esActividad) {
      await actividadesStore.actualizarActividad(actividadEditando.value.id, { ...formActividad.value })
    }
    $q.notify({ message: 'Bloque actualizado', color: 'positive', timeout: 1500 })
  } else {
    const nuevoBloque = {
      ...formActividad.value,
      seccion_id: sid,
      orden: (listasActividades[sid] || []).length + 1,
    }
    if (esActividad) {
      const id = await actividadesStore.agregarActividad(sid, nuevoBloque)
      nuevoBloque.id = id
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

async function confirmarEliminacion() {
  if (modoEliminar.value === 'seccion' && itemAEliminarSeccion.value) {
    await cursosStore.eliminarSeccion(curso.value.id, itemAEliminarSeccion.value.id)
    $q.notify({ message: 'Seccion eliminada', color: 'warning', timeout: 1500 })
  } else if (itemAEliminarAct.value) {
    await actividadesStore.eliminarActividad(itemAEliminarAct.value.id)
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

async function publicarCurso() {
  await cursosStore.publicarCurso(curso.value.id)
  $q.notify({ message: 'Curso publicado! Los estudiantes ya pueden verlo.', color: 'positive', timeout: 3000, icon: 'check_circle' })
}

const sincronizandoEstudiantes = ref(false)

async function syncEstudiantes() {
  if (!curso.value) return
  sincronizandoEstudiantes.value = true
  try {
    const res = await integracionService.sincronizarEstudiantes(curso.value.id)
    const data = res.data?.data || res.data
    $q.notify({
      message: `Sincronización de estudiantes completada: ${data.total_matriculas} matriculados (${data.estudiantes_matriculados} nuevos).`,
      color: 'positive',
      icon: 'check_circle',
      timeout: 3000
    })
    // Reload course to update student count in the header
    await cursosStore.cargarCurso(curso.value.id)
  } catch (err) {
    console.error('[Builder] Error al sincronizar estudiantes:', err)
    $q.notify({
      message: 'Error al sincronizar estudiantes con el sistema de matrículas',
      color: 'negative',
      timeout: 3000
    })
  } finally {
    sincronizandoEstudiantes.value = false
  }
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

async function sisaGenerar() {
  const nroSecciones = Math.floor(Math.random() * 3) + 2
  for (let i = 0; i < nroSecciones; i++) {
    await cursosStore.agregarSeccion(curso.value.id, {
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
const tabPlantillas = ref('institucionales')
const plantillasInstitucionales = ref([])
const cargandoInstitucionales = ref(false)

async function abrirDialogoPlantillas() {
  dialogoPlantillas.value = true
  tabPlantillas.value = 'institucionales'
  cargandoInstitucionales.value = true
  try {
    const res = await bancoDocenteService.listar({ categoria: 'curso' })
    plantillasInstitucionales.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('[Builder] Error al cargar plantillas institucionales:', err)
  } finally {
    cargandoInstitucionales.value = false
  }
}

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

async function cargarPlantilla(plantilla) {
  if (!curso.value) return
  
  $q.loading.show({ message: 'Aplicando estructura de plantilla...' })
  
  try {
    // Limpiar secciones existentes
    const seccionesActuales = [...curso.value.secciones]
    for (const s of seccionesActuales) {
      await cursosStore.eliminarSeccion(curso.value.id, s.id)
    }

    const seccionesData = plantilla.datos || plantilla.data || []

    // Crear nuevas secciones desde la plantilla
    for (const secData of seccionesData) {
      await cursosStore.agregarSeccion(curso.value.id, {
        titulo: secData.titulo,
        descripcion: secData.descripcion || '',
      })
      const nuevaSeccion = curso.value.secciones[curso.value.secciones.length - 1]
      if (nuevaSeccion && secData.actividades) {
        for (const actData of secData.actividades) {
          await actividadesStore.agregarActividad(nuevaSeccion.id, {
            orden: actividadesStore.actividades.filter((a) => a.seccion_id === nuevaSeccion.id).length + 1,
            tipo: actData.tipo,
            titulo: actData.titulo,
            descripcion: actData.descripcion || '',
            tiene_nota: !!actData.tiene_nota,
            nota_maxima: actData.nota_maxima || 0,
            peso: actData.peso || 0,
            config: actData.config ? { ...actData.config } : {},
          })
        }
      }
    }

    // Registrar el uso en el backend si viene de la DB (tiene id)
    if (plantilla.id) {
      try {
        await bancoDocenteService.usar(plantilla.id)
      } catch (err) {
        console.error('Error al registrar uso de plantilla:', err)
      }
    }

    recargarActividades()
    $q.notify({ message: `Plantilla "${plantilla.nombre}" cargada!`, color: 'positive', timeout: 3000, icon: 'check_circle' })
  } catch (err) {
    console.error('Error al cargar plantilla:', err)
    $q.notify({ message: 'Error al aplicar la plantilla de curso', color: 'negative' })
  } finally {
    $q.loading.hide()
  }
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
  border-radius: 18px;
  border: 1px solid var(--ta-border-card);
  background: var(--ta-bg-card);
  box-shadow: var(--shadow-card);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.seccion-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: rgba(var(--primary-rgb), 0.22);
}
.body--dark .seccion-card:hover {
  border-color: rgba(var(--primary-rgb), 0.28);
}

.ghost-card {
  opacity: 0.65;
  background: rgba(var(--primary-rgb), 0.08);
  border: 2px dashed rgba(var(--primary-rgb), 0.35);
  border-radius: 18px;
}

.drag-handle { cursor: grab; transition: color 0.2s ease; }
.drag-handle:hover { color: var(--ta-primary); }
.drag-handle:active { cursor: grabbing; }

.actividad-item {
  border-radius: 12px;
  margin: 3px 10px;
  transition: background 0.25s ease, transform 0.2s ease;
}
.actividad-item:hover {
  background: rgba(var(--primary-rgb), 0.05);
  transform: translateX(3px);
}
.body--dark .actividad-item:hover {
  background: rgba(255, 255, 255, 0.04);
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
  color: var(--ta-primary);
}
.act-drag-handle:active { cursor: grabbing; }

.add-act-row {
  border-radius: 12px;
  margin: 3px 10px;
  transition: all 0.2s ease;
  color: var(--ta-text-secondary);
}
.add-act-row:hover {
  background: rgba(var(--primary-rgb), 0.06);
  color: var(--ta-primary);
}

.sisa-wizard { max-width: 700px; width: 100%; border-radius: 20px; }
.dialog-card { width: min(700px, 92vw); border-radius: 20px; }
.section-count {
  background: rgba(var(--primary-rgb), 0.12);
  color: var(--ta-primary);
  font-weight: 600;
}
.body--dark .section-count {
  background: rgba(var(--primary-rgb), 0.2);
  color: var(--ta-text-primary);
}
</style>
