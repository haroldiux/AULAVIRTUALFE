<template>
  <q-page class="av-dashboard-page q-pa-md">
    <TaPageHeader title="Calendario Académico" data-tour="calendar-header">
      <template #actions>
        <TaButton 
          v-if="puedeCrearEventos" 
          variant="primary" 
          icon="add" 
          label="Nuevo Evento" 
          @click="abrirDialogoCrear" 
        />
      </template>
    </TaPageHeader>

    <div class="row q-col-gutter-md q-mb-md items-center justify-between">
      <div class="col-12 col-sm-auto flex items-center q-gutter-sm">
        <q-btn flat round icon="chevron_left" aria-label="Mes anterior" @click="mesAnterior" />
        <h2 class="text-h5 text-weight-bold q-my-none text-capitalize" style="min-width: 180px; text-align: center;">
          {{ nombreMesActual }} {{ añoActual }}
        </h2>
        <q-btn flat round icon="chevron_right" aria-label="Mes siguiente" @click="mesSiguiente" />
        <q-btn outline color="primary" label="Hoy" size="sm" @click="irAHoy" />
      </div>

      <div class="col-12 col-sm-auto flex q-gutter-sm items-center">
        <!-- Filtro por curso -->
        <q-select
          v-model="filtroCurso"
          :options="opcionesCursos"
          label="Filtrar por Curso"
          outlined
          dense
          map-options
          emit-value
          style="min-width: 250px"
          @update:model-value="cargarEventos"
        />
        <!-- Leyenda -->
        <div class="flex items-center q-gutter-xs gt-xs">
          <q-badge color="orange" label="Entrega" />
          <q-badge color="purple" label="Evaluación" />
          <q-badge color="indigo" label="Clase" />
          <q-badge color="primary" label="Institucional" />
        </div>
      </div>
    </div>

    <!-- Rejilla de Calendario -->
    <TaCard class="calendar-card" :padding="false">
      <div class="calendar-grid">
        <!-- Días de la semana -->
        <div class="weekday-header-row">
          <div v-for="d in diasSemana" :key="d" class="weekday-header">
            {{ d }}
          </div>
        </div>

        <!-- Días del mes -->
        <div class="days-grid">
          <div 
            v-for="(day, index) in celdasCalendario" 
            :key="index"
            class="day-cell"
            :class="{ 
              'day-cell--outside': !day.esMesActual, 
              'day-cell--today': day.esHoy,
              'day-cell--selected': fechaSeleccionada === day.fechaStr
            }"
            @click="seleccionarDia(day)"
          >
            <div class="day-number-container">
              <span class="day-number">{{ day.numero }}</span>
            </div>

            <div class="day-events-list">
              <div 
                v-for="ev in day.eventos" 
                :key="ev.id"
                class="event-pill cursor-pointer"
                :class="'event-pill--' + ev.tipo"
                @click.stop="verDetalleEvento(ev)"
              >
                <div class="event-pill__title ellipsis">
                  <q-icon v-if="ev.todo_el_dia" name="event" size="10px" class="q-mr-xs" />
                  {{ ev.titulo }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TaCard>

    <!-- Diálogo Detalle de Evento -->
    <q-dialog v-model="dialogoDetalle">
      <q-card class="dialog-card">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar :color="colorTipo(eventoSeleccionado?.tipo)" text-color="white" size="40px">
            <q-icon :name="iconoTipo(eventoSeleccionado?.tipo)" />
          </q-avatar>
          <div class="q-ml-md">
            <div class="text-h6">{{ eventoSeleccionado?.titulo }}</div>
            <div class="text-caption text-weight-bold uppercase" :class="'text-' + colorTipo(eventoSeleccionado?.tipo)">
              {{ labelTipo(eventoSeleccionado?.tipo) }}
            </div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-py-md">
          <p class="text-body1" v-if="eventoSeleccionado?.descripcion">
            {{ eventoSeleccionado?.descripcion }}
          </p>
          <p class="text-body2 text-grey-7" v-else>
            Sin descripción.
          </p>

          <q-list dense>
            <q-item class="q-px-none">
              <q-item-section avatar class="min-width-0 q-pr-sm">
                <q-icon name="schedule" color="grey-6" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2">
                  <strong>Inicio:</strong> {{ formatearFecha(eventoSeleccionado?.fecha_inicio) }}
                </q-item-label>
                <q-item-label class="text-body2" v-if="eventoSeleccionado?.fecha_fin">
                  <strong>Fin:</strong> {{ formatearFecha(eventoSeleccionado?.fecha_fin) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="q-px-none" v-if="eventoSeleccionado?.curso_nombre">
              <q-item-section avatar class="min-width-0 q-pr-sm">
                <q-icon name="class" color="grey-6" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2">
                  <strong>Curso:</strong> {{ eventoSeleccionado?.curso_nombre }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="q-px-none" v-if="eventoSeleccionado?.creado_por_nombre">
              <q-item-section avatar class="min-width-0 q-pr-sm">
                <q-icon name="person" color="grey-6" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-body2">
                  <strong>Organizador:</strong> {{ eventoSeleccionado?.creado_por_nombre }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md" v-if="puedeEditarEvento(eventoSeleccionado)">
          <TaButton variant="danger" label="Eliminar" @click="eliminarEventoConfirm(eventoSeleccionado?.id)" />
          <TaButton variant="outline" label="Editar" @click="abrirDialogoEditar(eventoSeleccionado)" class="q-ml-sm" />
          <q-space />
          <TaButton variant="ghost" label="Cerrar" v-close-popup />
        </q-card-actions>
        <q-card-actions align="right" class="q-pa-md" v-else>
          <!-- Si tiene actividad asociada, permitir ir a verla -->
          <TaButton 
            v-if="eventoSeleccionado?.actividad_id"
            variant="primary" 
            label="Ir a Actividad" 
            @click="irAActividad(eventoSeleccionado)"
          />
          <q-space />
          <TaButton variant="ghost" label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo Crear/Editar Evento -->
    <q-dialog v-model="dialogoForm" persistent>
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">{{ editandoId ? 'Editar Evento' : 'Nuevo Evento Académico' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarForm">
            <q-input v-model="form.titulo" label="Título del evento" outlined class="q-mb-md" :rules="[val => !!val || 'El título es requerido']" />
            <q-input v-model="form.descripcion" label="Descripción" outlined type="textarea" rows="2" class="q-mb-md" />

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.tipo"
                  :options="[
                    { label: 'Clase', value: 'clase' },
                    { label: 'Evaluación', value: 'evaluacion' },
                    { label: 'Entrega / Tarea', value: 'entrega' },
                    { label: 'Evento Institucional', value: 'evento_institucional' }
                  ]"
                  label="Tipo de Evento"
                  outlined
                  map-options
                  emit-value
                  :rules="[val => !!val || 'El tipo es requerido']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.curso_id"
                  :options="opcionesCursosCrear"
                  label="Curso Vinculado"
                  outlined
                  map-options
                  emit-value
                  clearable
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-6">
                <q-input v-model="form.fecha_inicio" label="Fecha/Hora de Inicio" outlined type="datetime-local" :rules="[val => !!val || 'La fecha de inicio es requerida']" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.fecha_fin" label="Fecha/Hora de Fin" outlined type="datetime-local" />
              </div>
            </div>

            <div class="q-mb-md">
              <q-toggle v-model="form.todo_el_dia" label="Todo el día" />
            </div>

            <q-card-actions align="right" class="q-px-none q-pt-md">
              <TaButton variant="ghost" label="Cancelar" @click="dialogoForm = false" />
              <TaButton variant="primary" type="submit" :label="editandoId ? 'Guardar' : 'Crear Evento'" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useCursosStore } from 'src/stores/cursos'
import { calendarioService } from 'src/services/calendarioService.js'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'

const $q = useQuasar()
const router = useRouter()
const auth = useAuthStore()
const cursosStore = useCursosStore()

const hoy = new Date()
const mesActualIdx = ref(hoy.getMonth())
const añoActual = ref(hoy.getFullYear())

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const nombresMeses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const nombreMesActual = computed(() => nombresMeses[mesActualIdx.value])

const eventos = ref([])
const filtroCurso = ref(null)

const opcionesCursos = computed(() => {
  const lista = cursosStore.cursos.filter(c => {
    if (auth.esEstudiante) return true; // los del estudiante cargados en store
    return c.docente_id === auth.usuario?.id;
  }).map(c => ({ label: c.nombre, value: c.id }))
  return [{ label: 'Todos los Cursos', value: null }, ...lista]
})

const opcionesCursosCrear = computed(() => {
  return cursosStore.cursos.filter(c => {
    if (auth.esDocente) return c.docente_id === auth.usuario?.id;
    return true; // admin/director
  }).map(c => ({ label: c.nombre, value: c.id }))
})

const puedeCrearEventos = computed(() => {
  return auth.esDocente || auth.esDirector || auth.esAdmin
})

// Celdas del Calendario
const celdasCalendario = computed(() => {
  const celdas = []
  
  // Primer día del mes
  const primerDiaMes = new Date(añoActual.value, mesActualIdx.value, 1)
  // Día de la semana del primer día (0: dom, 1: lun, ..., 6: sab)
  // Convertimos a (0: lun, ..., 6: dom)
  let diaSemanaPrimerDia = primerDiaMes.getDay() - 1
  if (diaSemanaPrimerDia < 0) diaSemanaPrimerDia = 6 // Domingo es 6

  // Total de días en el mes actual
  const totalDiasMes = new Date(añoActual.value, mesActualIdx.value + 1, 0).getDate()
  
  // Total de días del mes anterior
  const totalDiasMesAnt = new Date(añoActual.value, mesActualIdx.value, 0).getDate()

  // Rellenar días del mes anterior
  for (let i = diaSemanaPrimerDia - 1; i >= 0; i--) {
    const diaNum = totalDiasMesAnt - i
    const d = new Date(añoActual.value, mesActualIdx.value - 1, diaNum)
    const fechaStr = formatFechaStr(d)
    celdas.push({
      numero: diaNum,
      esMesActual: false,
      fechaStr,
      esHoy: esMismoDia(d, hoy),
      eventos: buscarEventosDia(fechaStr)
    })
  }

  // Rellenar días del mes actual
  for (let i = 1; i <= totalDiasMes; i++) {
    const d = new Date(añoActual.value, mesActualIdx.value, i)
    const fechaStr = formatFechaStr(d)
    celdas.push({
      numero: i,
      esMesActual: true,
      fechaStr,
      esHoy: esMismoDia(d, hoy),
      eventos: buscarEventosDia(fechaStr)
    })
  }

  // Rellenar días del mes siguiente para completar la rejilla de 35 o 42
  const celdasRestantes = celdas.length <= 35 ? 35 - celdas.length : 42 - celdas.length
  for (let i = 1; i <= celdasRestantes; i++) {
    const d = new Date(añoActual.value, mesActualIdx.value + 1, i)
    const fechaStr = formatFechaStr(d)
    celdas.push({
      numero: i,
      esMesActual: false,
      fechaStr,
      esHoy: esMismoDia(d, hoy),
      eventos: buscarEventosDia(fechaStr)
    })
  }

  return celdas
})

const fechaSeleccionada = ref(null)
const dialogoDetalle = ref(false)
const eventoSeleccionado = ref(null)

// Formulario de eventos
const dialogoForm = ref(false)
const editandoId = ref(null)
const form = ref(initForm())

function initForm() {
  return {
    titulo: '',
    descripcion: '',
    tipo: 'clase',
    curso_id: null,
    fecha_inicio: '',
    fecha_fin: '',
    todo_el_dia: false
  }
}

// Métodos de navegación
function mesAnterior() {
  if (mesActualIdx.value === 0) {
    mesActualIdx.value = 11
    añoActual.value--
  } else {
    mesActualIdx.value--
  }
  cargarEventos()
}

function mesSiguiente() {
  if (mesActualIdx.value === 11) {
    mesActualIdx.value = 0
    añoActual.value++
  } else {
    mesActualIdx.value++
  }
  cargarEventos()
}

function irAHoy() {
  mesActualIdx.value = hoy.getMonth()
  añoActual.value = hoy.getFullYear()
  cargarEventos()
}

// Carga de eventos
async function cargarEventos() {
  const primerDiaGrid = new Date(añoActual.value, mesActualIdx.value, -7)
  const ultimoDiaGrid = new Date(añoActual.value, mesActualIdx.value + 1, 14)
  
  const filtros = {
    desde: formatFechaStr(primerDiaGrid),
    hasta: formatFechaStr(ultimoDiaGrid)
  }
  if (filtroCurso.value) {
    filtros.curso_id = filtroCurso.value
  }

  try {
    const res = await calendarioService.listar(filtros)
    eventos.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('Error al cargar eventos:', err)
  }
}

// Búsqueda de eventos
function buscarEventosDia(fechaStr) {
  return eventos.value.filter(ev => {
    const evFecha = ev.fecha_inicio.split('T')[0]
    return evFecha === fechaStr
  })
}

// Selección de día
function seleccionarDia(day) {
  fechaSeleccionada.value = day.fechaStr
}

function verDetalleEvento(ev) {
  eventoSeleccionado.value = ev
  dialogoDetalle.value = true
}

// Autorizaciones
function puedeEditarEvento(ev) {
  if (!ev) return false;
  if (ev.actividad_id) return false; // si viene de actividades, no se edita aquí
  if (auth.esAdmin || auth.esDirector) return true;
  return auth.esDocente && ev.creado_por_nombre !== 'Sistema';
}

// CRUD operaciones
function abrirDialogoCrear() {
  editandoId.value = null
  form.value = initForm()
  
  // Establecer fecha por defecto si hay una seleccionada
  if (fechaSeleccionada.value) {
    form.value.fecha_inicio = `${fechaSeleccionada.value}T08:00`
  } else {
    form.value.fecha_inicio = formatDateTimeLocal(new Date())
  }
  
  dialogoForm.value = true
}

function abrirDialogoEditar(ev) {
  dialogoDetalle.value = false
  editandoId.value = ev.id
  form.value = {
    titulo: ev.titulo,
    descripcion: ev.descripcion,
    tipo: ev.tipo,
    curso_id: ev.curso_id,
    fecha_inicio: formatDateTimeLocal(new Date(ev.fecha_inicio)),
    fecha_fin: ev.fecha_fin ? formatDateTimeLocal(new Date(ev.fecha_fin)) : '',
    todo_el_dia: ev.todo_el_dia
  }
  dialogoForm.value = true
}

async function guardarForm() {
  try {
    const datosEnvio = { ...form.value }
    if (!datosEnvio.fecha_fin) {
      delete datosEnvio.fecha_fin
    }
    
    if (editandoId.value) {
      await calendarioService.actualizar(editandoId.value, datosEnvio)
      $q.notify({ message: 'Evento actualizado', color: 'positive', timeout: 1500 })
    } else {
      await calendarioService.crear(datosEnvio)
      $q.notify({ message: 'Evento creado', color: 'positive', timeout: 1500 })
    }
    
    dialogoForm.value = false
    cargarEventos()
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al guardar evento', color: 'negative', timeout: 3000 })
  }
}

async function eliminarEventoConfirm(id) {
  if (!confirm('¿Seguro que deseas eliminar este evento?')) return
  try {
    await calendarioService.eliminar(id)
    dialogoDetalle.value = false
    $q.notify({ message: 'Evento eliminado', color: 'warning', timeout: 1500 })
    cargarEventos()
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al eliminar evento', color: 'negative', timeout: 3000 })
  }
}

function irAActividad(ev) {
  dialogoDetalle.value = false
  if (ev.curso_id && ev.actividad_id) {
    if (auth.esEstudiante) {
      router.push(`/estudiante/curso/${ev.curso_id}?actividad=${ev.actividad_id}`)
    } else {
      router.push(`/docente/curso/${ev.curso_id}/builder?actividad=${ev.actividad_id}`)
    }
  }
}

// Helpers
function formatFechaStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateTimeLocal(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

function esMismoDia(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}

function colorTipo(t) {
  const m = { entrega: 'orange', evaluacion: 'purple', clase: 'indigo', evento_institucional: 'primary' }
  return m[t] ?? 'grey'
}

function iconoTipo(t) {
  const m = { entrega: 'assignment', evaluacion: 'quiz', clase: 'school', evento_institucional: 'celebration' }
  return m[t] ?? 'event'
}

function labelTipo(t) {
  const m = { entrega: 'Entrega / Tarea', evaluacion: 'Evaluación / Parcial', clase: 'Clase Regular', evento_institucional: 'Evento Institucional' }
  return m[t] ?? 'Otro'
}

function formatearFecha(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(async () => {
  await cursosStore.cargarCursos()
  cargarEventos()
})
</script>

<style scoped>
.calendar-card {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--ta-border-card);
  background: var(--ta-bg-card);
  box-shadow: var(--shadow-card);
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.weekday-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: rgba(var(--primary-rgb), 0.05);
  border-bottom: 1px solid var(--ta-border-card);
}

.weekday-header {
  text-align: center;
  padding: 12px 4px;
  font-weight: 600;
  color: var(--ta-primary);
  font-size: 14px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(110px, 1fr);
}

.day-cell {
  border-right: 1px solid var(--ta-border-card);
  border-bottom: 1px solid var(--ta-border-card);
  padding: 6px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: background 0.2s ease;
}

.day-cell:nth-child(7n) {
  border-right: none;
}

.day-cell:hover {
  background: rgba(var(--primary-rgb), 0.02);
}

.day-cell--outside {
  opacity: 0.4;
  background: rgba(0, 0, 0, 0.02);
}
.body--dark .day-cell--outside {
  background: rgba(255, 255, 255, 0.01);
}

.day-cell--today {
  background: rgba(var(--primary-rgb), 0.06);
}

.day-cell--today .day-number {
  background: var(--ta-primary);
  color: white;
  font-weight: 700;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.day-cell--selected {
  outline: 2px solid var(--ta-primary);
  z-index: 2;
}

.day-number-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
}

.day-number {
  font-size: 13px;
  font-weight: 500;
  color: var(--ta-text-primary);
}

.day-events-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-grow: 1;
  overflow-y: auto;
  max-height: 90px;
}

.event-pill {
  font-size: 10px;
  padding: 4px 6px;
  border-radius: 6px;
  font-weight: 600;
  line-height: 1.2;
  transition: transform 0.15s ease;
}

.event-pill:hover {
  transform: translateY(-1px);
}

.event-pill--clase {
  background: rgba(63, 81, 181, 0.12);
  color: #3f51b5;
  border-left: 3px solid #3f51b5;
}
.body--dark .event-pill--clase {
  background: rgba(63, 81, 181, 0.22);
  color: #8f9ff5;
}

.event-pill--entrega {
  background: rgba(255, 152, 0, 0.12);
  color: #f57c00;
  border-left: 3px solid #ff9800;
}
.body--dark .event-pill--entrega {
  background: rgba(255, 152, 0, 0.22);
  color: #ffb74d;
}

.event-pill--evaluacion {
  background: rgba(156, 39, 176, 0.12);
  color: #9c27b0;
  border-left: 3px solid #9c27b0;
}
.body--dark .event-pill--evaluacion {
  background: rgba(156, 39, 176, 0.22);
  color: #e040fb;
}

.event-pill--evento_institucional {
  background: rgba(0, 150, 136, 0.12);
  color: #009688;
  border-left: 3px solid #009688;
}
.body--dark .event-pill--evento_institucional {
  background: rgba(0, 150, 136, 0.22);
  color: #4db6ac;
}

.dialog-card {
  width: min(550px, 92vw);
  border-radius: 20px;
}
.min-width-0 {
  min-width: 0;
}
</style>
