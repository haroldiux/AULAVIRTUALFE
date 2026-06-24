<template>
  <q-page class="av-dashboard-page">
    <AppSkeleton v-if="cargando" variant="table" :count="6" :columns="5" />

    <template v-else>
      <TaPageHeader title="Gestión de Cuentas y Usuarios">
        <template #actions>
          <TaButton variant="outline" icon="upload_file" label="Importar CSV" @click="abrirImportar" />
          <TaButton variant="outline" icon="school" label="Matricular Alumnos" @click="abrirMatriculacion" />
          <TaButton variant="primary" icon="person_add" label="Nuevo Usuario" @click="abrirNuevoUsuario" />
        </template>
      </TaPageHeader>

      <!-- KPI Summary -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-lg-3">
          <TaKpiCard icon="people" icon-color="var(--gradient-unitepc)" label="Total Cuentas" :value="totalCuentas" />
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <TaKpiCard icon="school" icon-color="var(--gradient-unitepc-reverse)" label="Estudiantes" :value="totalEstudiantes" />
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <TaKpiCard icon="local_library" icon-color="linear-gradient(135deg, #10B981 0%, #059669 100%)" label="Docentes" :value="totalDocentes" />
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <TaKpiCard icon="admin_panel_settings" icon-color="linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" label="Otros Roles" :value="totalOtros" />
        </div>
      </div>

      <!-- Filters & Table -->
      <TaCard title="Directorio de Cuentas" subtitle="Visualiza, edita o elimina usuarios registrados en el sistema">
        <div class="row q-col-gutter-sm items-center q-mb-md">
          <div class="col-12 col-sm-5">
            <q-input
              v-model="filtroBusqueda"
              placeholder="Buscar por nombre o correo..."
              outlined
              dense
              clearable
              @update:model-value="buscarUsuarios"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filtroRol"
              :options="opcionesRol"
              label="Rol"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="cargarDatos"
            />
          </div>
          <div class="col-12 col-sm-4 text-right">
            <div class="text-caption text-grey-6">
              Mostrando página {{ paginaActual }} de {{ totalPaginas }} · Total {{ totalCuentas }} usuarios
            </div>
          </div>
        </div>

        <div class="table-scroll-container">
          <table class="av-custom-table q-mb-md">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Carrera / Sede</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in listaUsuarios" :key="user.id">
                <td>
                  <div class="row items-center no-wrap">
                    <q-avatar size="32px" color="primary" text-color="white" class="q-mr-sm">
                      <img v-if="user.avatar" :src="user.avatar" />
                      <span v-else>{{ obtenerIniciales(user.nombre) }}</span>
                    </q-avatar>
                    <div class="text-weight-medium">{{ user.nombre }}</div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <q-badge :color="colorRol(user.rol)" text-color="white">
                    {{ labelRol(user.rol) }}
                  </q-badge>
                </td>
                <td class="text-caption text-grey-7">
                  Carrera #{{ user.carrera_id || 'N/A' }} · Sede #{{ user.sede_id || 'N/A' }}
                </td>
                <td>
                  <q-chip
                    :color="user.activo ? 'teal-1' : 'red-1'"
                    :text-color="user.activo ? 'teal-9' : 'red-9'"
                    dense
                    size="sm"
                  >
                    {{ user.activo ? 'Activo' : 'Inactivo' }}
                  </q-chip>
                </td>
                <td class="text-right no-wrap">
                  <q-btn flat round size="sm" icon="edit" color="primary" @click="editarUsuario(user)">
                    <q-tooltip>Editar Cuenta</q-tooltip>
                  </q-btn>
                  <q-btn flat round size="sm" icon="delete" color="negative" @click="confirmarEliminar(user)">
                    <q-tooltip>Eliminar Cuenta</q-tooltip>
                  </q-btn>
                </td>
              </tr>

              <tr v-if="listaUsuarios.length === 0">
                <td colspan="6" class="text-center q-pa-xl">
                  <AppEmptyState icon="people_outline" title="Sin usuarios" message="No se encontraron cuentas con los filtros aplicados." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-center q-py-md" v-if="totalPaginas > 1">
          <q-pagination
            v-model="paginaActual"
            :max="totalPaginas"
            direction-links
            flat
            color="primary"
            @update:model-value="cargarDatos"
          />
        </div>
      </TaCard>
    </template>

    <!-- Dialogo Crear / Editar Usuario -->
    <q-dialog v-model="dialogoUsuario" persistent>
      <q-card style="width: 480px; max-width: 90vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ editMode ? 'Editar Cuenta' : 'Nueva Cuenta de Usuario' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="guardarUsuario">
          <q-card-section class="q-gutter-y-md">
            <q-input
              v-model="formUsuario.nombre"
              label="Nombre Completo"
              outlined
              dense
              :rules="[val => !!val || 'El nombre es obligatorio']"
            />
            <q-input
              v-model="formUsuario.email"
              label="Correo Electrónico"
              type="email"
              outlined
              dense
              :rules="[val => !!val || 'El correo es obligatorio', val => /.+@.+\..+/.test(val) || 'Formato de correo no válido']"
            />
            <q-select
              v-model="formUsuario.rol"
              :options="opcionesFormRol"
              label="Rol del Usuario"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'El rol es obligatorio']"
            />
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model.number="formUsuario.carrera_id"
                  label="ID Carrera SISA (Opcional)"
                  type="number"
                  outlined
                  dense
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="formUsuario.sede_id"
                  label="ID Sede SISA (Opcional)"
                  type="number"
                  outlined
                  dense
                />
              </div>
            </div>
            <q-input
              v-model="formUsuario.password"
              :label="editMode ? 'Nueva Contraseña (Opcional)' : 'Contraseña'"
              type="password"
              outlined
              dense
              :placeholder="editMode ? 'Dejar en blanco para no cambiar' : 'Por defecto: unitepc123'"
            />
            <q-toggle
              v-if="editMode"
              v-model="formUsuario.activo"
              label="Cuenta de Usuario Activa"
              color="teal"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <TaButton variant="ghost" label="Cancelar" v-close-popup />
            <TaButton variant="primary" :label="editMode ? 'Guardar Cambios' : 'Crear Usuario'" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialogo Importar CSV -->
    <q-dialog v-model="dialogoImportar" persistent>
      <q-card style="width: 520px; max-width: 90vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Importación Masiva de Cuentas</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p class="text-caption text-grey-7 q-mb-md">
            Sube un archivo en formato CSV con delimitador de punto y coma (;) o coma (,). Los encabezados de las columnas deben incluir exactamente: <br />
            <strong>nombre;email;rol;carrera_id;sede_id</strong> <br />
            El campo password se generará automáticamente como <em>unitepc123</em>.
          </p>

          <!-- Dropzone -->
          <div
            class="csv-dropzone flex flex-center column q-pa-lg text-center"
            :class="archivoSeleccionado ? 'csv-dropzone--selected' : ''"
            @click="dispararInputFile"
            @dragover.prevent
            @drop.prevent="alSoltarArchivo"
          >
            <q-icon :name="archivoSeleccionado ? 'insert_drive_file' : 'cloud_upload'" size="48px" :color="archivoSeleccionado ? 'primary' : 'grey-5'" />
            <div class="text-subtitle1 text-weight-bold q-mt-sm">
              {{ archivoSeleccionado ? archivoSeleccionado.name : 'Arrastra tu archivo CSV aquí' }}
            </div>
            <div class="text-caption text-grey-6">
              {{ archivoSeleccionado ? `${(archivoSeleccionado.size/1024).toFixed(2)} KB` : 'o haz clic para explorar en tu equipo' }}
            </div>
            <input type="file" ref="fileInput" accept=".csv,.txt" class="hidden" @change="alSeleccionarArchivo" />
          </div>

          <!-- Stats / Errors -->
          <div v-if="resultadoImportacion" class="q-mt-md">
            <q-banner dense rounded class="bg-teal-1 text-teal-9 q-mb-sm">
              <template #avatar><q-icon name="check_circle" /></template>
              Se procesó el archivo con éxito. Creados: <strong>{{ resultadoImportacion.creados }}</strong> · Actualizados: <strong>{{ resultadoImportacion.actualizados }}</strong>.
            </q-banner>

            <div v-if="resultadoImportacion.errores.length > 0">
              <div class="text-weight-bold text-negative q-mb-xs">Errores encontrados ({{ resultadoImportacion.errores.length }}):</div>
              <q-scroll-area style="height: 120px;" class="border rounded q-pa-xs bg-grey-1">
                <div v-for="err in resultadoImportacion.errores" :key="err.fila" class="text-caption text-red-9 q-mb-xs">
                  Fila {{ err.fila }} ({{ err.email }}): {{ err.motivo }}
                </div>
              </q-scroll-area>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <TaButton variant="ghost" label="Cerrar" v-close-popup />
          <TaButton
            variant="primary"
            label="Procesar e Importar"
            :disable="!archivoSeleccionado || importando"
            :loading="importando"
            @click="subirCsv"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo Matriculación Masiva -->
    <q-dialog v-model="dialogoMatriculacion" persistent>
      <q-card style="width: 500px; max-width: 90vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Asignación Masiva a Asignaturas</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="ejecutarMatriculacion">
          <q-card-section class="q-gutter-y-md">
            <q-select
              v-model="matriculaForm.curso_id"
              :options="opcionesCursos"
              label="Selecciona la Asignatura"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'Debes seleccionar un curso']"
            />

            <q-select
              v-model="matriculaForm.usuario_ids"
              :options="opcionesEstudiantes"
              label="Selecciona los Estudiantes"
              outlined
              dense
              multiple
              use-chips
              emit-value
              map-options
              :rules="[val => val && val.length > 0 || 'Selecciona al menos un estudiante']"
              style="max-height: 250px; overflow: auto;"
            />

            <div class="row justify-between items-center q-mt-sm">
              <span class="text-caption text-grey-7">Elige si deseas matricularlos o desmatricularlos en lote</span>
              <q-btn-toggle
                v-model="matriculaForm.accion"
                toggle-color="primary"
                flat
                dense
                :options="[
                  {label: 'Matricular', value: 'matricular'},
                  {label: 'Desmatricular', value: 'desmatricular'}
                ]"
              />
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <TaButton variant="ghost" label="Cancelar" v-close-popup />
            <TaButton variant="primary" label="Ejecutar Proceso" type="submit" :loading="sincronizandoMatricula" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCursosStore } from 'src/stores/cursos'
import { adminUsuarioService } from 'src/services/adminUsuarioService.js'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const $q = useQuasar()
const cursosStore = useCursosStore()

const cargando = ref(true)
const listaUsuarios = ref([])
const totalCuentas = ref(0)
const totalEstudiantes = ref(0)
const totalDocentes = ref(0)
const totalOtros = ref(0)

const filtroBusqueda = ref('')
const filtroRol = ref('todos')
const paginaActual = ref(1)
const totalPaginas = ref(1)

const opcionesRol = [
  { label: 'Todos los Roles', value: 'todos' },
  { label: 'Estudiantes', value: 'estudiante' },
  { label: 'Docentes', value: 'docente' },
  { label: 'Directores', value: 'director' },
  { label: 'Administradores', value: 'admin' },
]

const opcionesFormRol = [
  { label: 'Estudiante', value: 'estudiante' },
  { label: 'Docente', value: 'docente' },
  { label: 'Director', value: 'director' },
  { label: 'Administrador', value: 'admin' },
]

// Diálogo Usuario
const dialogoUsuario = ref(false)
const editMode = ref(false)
const usuarioSeleccionado = ref(null)
const formUsuario = ref({
  nombre: '',
  email: '',
  rol: 'estudiante',
  carrera_id: null,
  sede_id: null,
  password: '',
  activo: true
})

// Diálogo Importar
const dialogoImportar = ref(false)
const fileInput = ref(null)
const archivoSeleccionado = ref(null)
const importando = ref(false)
const resultadoImportacion = ref(null)

// Diálogo Matriculación
const dialogoMatriculacion = ref(false)
const sincronizandoMatricula = ref(false)
const matriculaForm = ref({
  curso_id: null,
  usuario_ids: [],
  accion: 'matricular'
})

const opcionesCursos = computed(() => {
  return cursosStore.cursos.map(c => ({
    label: `${c.codigo} — ${c.nombre}`,
    value: c.id
  }))
})

// Obtener una lista de estudiantes para el dropdown
const estudiantesTodos = ref([])
const opcionesEstudiantes = computed(() => {
  return estudiantesTodos.value.map(e => ({
    label: `${e.nombre} (${e.email})`,
    value: e.id
  }))
})

// Cargar Datos
async function cargarDatos() {
  try {
    const params = {
      page: paginaActual.value,
      per_page: 15,
    }

    if (filtroBusqueda.value.trim()) {
      params.search = filtroBusqueda.value
    }

    if (filtroRol.value !== 'todos') {
      params.rol = filtroRol.value
    }

    const res = await adminUsuarioService.listar(params)
    const payload = res.data?.data || res.data || []
    listaUsuarios.value = payload

    if (res.data?.meta) {
      paginaActual.value = res.data.meta.page
      totalPaginas.value = res.data.meta.last_page
      totalCuentas.value = res.data.meta.total
    }

    // Actualizar KPIs (basados en llamadas directas o conteo total)
    const kpiRes = await adminUsuarioService.listar({ per_page: 9999 })
    const todos = kpiRes.data?.data || kpiRes.data || []
    totalCuentas.value = todos.length
    totalEstudiantes.value = todos.filter(u => u.rol === 'estudiante').length
    totalDocentes.value = todos.filter(u => u.rol === 'docente').length
    totalOtros.value = todos.filter(u => u.rol !== 'estudiante' && u.rol !== 'docente').length

    // Cachear estudiantes para el selector de matriculación
    estudiantesTodos.value = todos.filter(u => u.rol === 'estudiante')
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al cargar listado de usuarios', color: 'negative' })
  } finally {
    cargando.value = false
  }
}

// Búsqueda interactiva debounced
let buscarTimeout = null
function buscarUsuarios() {
  clearTimeout(buscarTimeout)
  buscarTimeout = setTimeout(() => {
    paginaActual.value = 1
    cargarDatos()
  }, 400)
}

// Abrir dialogos
function abrirNuevoUsuario() {
  editMode.value = false
  usuarioSeleccionado.value = null
  formUsuario.value = {
    nombre: '',
    email: '',
    rol: 'estudiante',
    carrera_id: null,
    sede_id: null,
    password: '',
    activo: true
  }
  dialogoUsuario.value = true
}

function editarUsuario(user) {
  editMode.value = true
  usuarioSeleccionado.value = user
  formUsuario.value = {
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    carrera_id: user.carrera_id,
    sede_id: user.sede_id,
    password: '',
    activo: user.activo
  }
  dialogoUsuario.value = true
}

// Guardar Usuario
async function guardarUsuario() {
  try {
    if (editMode.value) {
      await adminUsuarioService.actualizar(usuarioSeleccionado.value.id, formUsuario.value)
      $q.notify({ message: 'Usuario actualizado correctamente', color: 'positive', timeout: 1500 })
    } else {
      await adminUsuarioService.crear(formUsuario.value)
      $q.notify({ message: 'Usuario creado con éxito', color: 'positive', timeout: 1500 })
    }
    dialogoUsuario.value = false
    cargarDatos()
  } catch (err) {
    const errorMsg = err.response?.data?.errors 
      ? Object.values(err.response.data.errors).flat().join(', ')
      : err.response?.data?.message || 'Error en la petición'
    $q.notify({ message: `Error: ${errorMsg}`, color: 'negative', timeout: 4000 })
  }
}

// Eliminar
function confirmarEliminar(user) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar permanentemente a ${user.nombre}? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await adminUsuarioService.eliminar(user.id)
      $q.notify({ message: 'Usuario eliminado con éxito', color: 'positive', timeout: 1500 })
      cargarDatos()
    } catch (err) {
      $q.notify({ message: err.response?.data?.message || 'Error al eliminar usuario', color: 'negative' })
    }
  })
}

// Importar CSV
function abrirImportar() {
  archivoSeleccionado.value = null
  resultadoImportacion.value = null
  dialogoImportar.value = true
}

function dispararInputFile() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function alSeleccionarArchivo(e) {
  const files = e.target.files
  if (files.length > 0) {
    archivoSeleccionado.value = files[0]
  }
}

function alSoltarArchivo(e) {
  const files = e.dataTransfer.files
  if (files.length > 0) {
    archivoSeleccionado.value = files[0]
  }
}

async function subirCsv() {
  if (!archivoSeleccionado.value) return
  importando.value = true
  resultadoImportacion.value = null
  try {
    const res = await adminUsuarioService.importarCsv(archivoSeleccionado.value)
    resultadoImportacion.value = res.data?.data || res.data
    $q.notify({ message: 'Archivo CSV procesado con éxito', color: 'positive', timeout: 2000 })
    cargarDatos()
  } catch (err) {
    $q.notify({ message: err.response?.data?.message || 'Error al procesar archivo CSV', color: 'negative' })
  } finally {
    importando.value = false
  }
}

// Matriculación
function abrirMatriculacion() {
  matriculaForm.value = {
    curso_id: opcionesCursos.value.length > 0 ? opcionesCursos.value[0].value : null,
    usuario_ids: [],
    accion: 'matricular'
  }
  dialogoMatriculacion.value = true
}

async function ejecutarMatriculacion() {
  sincronizandoMatricula.value = true
  try {
    const res = await adminUsuarioService.matricularMasivo(matriculaForm.value.curso_id, {
      usuario_ids: matriculaForm.value.usuario_ids,
      accion: matriculaForm.value.accion
    })
    $q.notify({
      message: `Proceso completado: ${res.data?.data?.procesados} registros asignados.`,
      color: 'positive',
      timeout: 2500
    })
    dialogoMatriculacion.value = false
    cursosStore.cargarCursos() // recargar listado en Pinia
  } catch {
    $q.notify({ message: 'Error al ejecutar matriculación masiva', color: 'negative' })
  } finally {
    sincronizandoMatricula.value = false
  }
}

// Helpers
function obtenerIniciales(nombre) {
  if (!nombre) return 'US'
  const partes = nombre.split(' ')
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase()
  }
  return nombre.slice(0, 2).toUpperCase()
}

function colorRol(rol) {
  return {
    estudiante: 'teal',
    docente: 'primary',
    director: 'orange',
    admin: 'negative',
  }[rol] || 'grey'
}

function labelRol(rol) {
  return {
    estudiante: 'Estudiante',
    docente: 'Docente',
    director: 'Director',
    admin: 'Administrador',
  }[rol] || rol
}

onMounted(() => {
  cursosStore.cargarCursos()
  cargarDatos()
})
</script>

<style scoped>
.csv-dropzone {
  border: 2px dashed var(--ta-border-card);
  border-radius: 12px;
  cursor: pointer;
  background: rgba(var(--primary-rgb), 0.01);
  transition: all 0.2s ease;
}
.csv-dropzone:hover {
  border-color: var(--ta-primary);
  background: rgba(var(--primary-rgb), 0.03);
}
.csv-dropzone--selected {
  border-color: var(--ta-teal);
  background: rgba(var(--teal-rgb), 0.02);
}
.border {
  border: 1px solid var(--ta-border-card);
}
.rounded {
  border-radius: 8px;
}
.table-scroll-container {
  overflow-x: auto;
}
.av-custom-table {
  width: 100%;
  border-collapse: collapse;
}
.av-custom-table th {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid var(--ta-border-card);
  font-weight: 600;
  color: var(--ta-text-secondary);
}
.av-custom-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--primary-rgb), 0.05);
}
.av-custom-table tr:hover {
  background: rgba(var(--primary-rgb), 0.01);
}
</style>
