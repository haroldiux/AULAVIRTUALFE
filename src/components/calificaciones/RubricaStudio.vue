<template>
  <div class="rubrica-studio">
    <!-- Selector de Método de Evaluación -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4" v-for="opc in metodosEvaluacion" :key="opc.value">
        <div
          class="metodo-card cursor-pointer q-pa-md text-center"
          :class="{ 'metodo-card--active': localRubrica.metodo_evaluacion === opc.value }"
          @click="seleccionarMetodo(opc.value)"
        >
          <q-avatar :color="localRubrica.metodo_evaluacion === opc.value ? 'primary' : 'grey-3'" :text-color="localRubrica.metodo_evaluacion === opc.value ? 'white' : 'grey-7'" :icon="opc.icon" size="44px" class="q-mb-sm" />
          <div class="text-subtitle1 text-weight-bold">{{ opc.label }}</div>
          <div class="text-caption text-grey-6">{{ opc.descripcion }}</div>
        </div>
      </div>
    </div>

    <!-- Contenido Según Método Seleccionado -->
    <div class="studio-content border rounded-lg q-pa-md bg-glass-soft">
      <!-- CALIFICACION DIRECTA -->
      <div v-if="localRubrica.metodo_evaluacion === 'directa'" class="text-center q-py-lg">
        <q-icon name="grade" size="64px" color="grey-4" class="q-mb-md" />
        <div class="text-subtitle1 text-weight-bold text-grey-8">Calificación Directa (Numérica)</div>
        <p class="text-body2 text-grey-6 max-w-md mx-auto q-mt-sm">
          El estudiante será calificado asignando un puntaje numérico simple directamente del 0 al {{ maxPoints }} sin rúbricas ni criterios estructurados en el sistema.
        </p>
      </div>

      <!-- LISTA DE COTEJO -->
      <div v-else-if="localRubrica.metodo_evaluacion === 'lista_cotejo'">
        <div class="row items-center justify-between q-mb-md">
          <div>
            <div class="text-subtitle1 text-weight-bold text-primary">Ítems de Lista de Cotejo</div>
            <div class="text-caption text-grey-6">Agrega los ítems que el estudiante debe cumplir. Cada ítem sumará puntos al estar activo.</div>
          </div>
          <q-badge :color="puntosAcumulados === maxPoints ? 'green' : 'orange'" text-color="white" class="q-pa-sm text-subtitle2">
            Puntos: {{ puntosAcumulados }} / {{ maxPoints }}
          </q-badge>
        </div>

        <q-list separator class="q-mb-md">
          <q-item v-for="(item, idx) in localRubrica.criterios" :key="item.id || idx" class="criterio-item q-py-md">
            <q-item-section avatar style="min-width: 32px;">
              <q-chip size="sm" color="teal" text-color="white">{{ idx + 1 }}</q-chip>
            </q-item-section>
            
            <q-item-section>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-8">
                  <q-input v-model="item.nombre" label="Título del ítem / Criterio de aceptación" dense outlined :rules="[val => !!val || 'Requerido']" />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input v-model.number="item.puntos" type="number" label="Puntos" dense outlined suffix="pts" :rules="[val => val >= 0 || 'Inválido']" @update:model-value="emitirCambios" />
                </div>
                <div class="col-12">
                  <q-input v-model="item.descripcion" label="Descripción opcional de qué se evalúa" dense outlined type="textarea" rows="1" />
                </div>
              </div>
            </q-item-section>

            <q-item-section side>
              <q-btn flat round dense color="negative" icon="delete" @click="eliminarCriterio(idx)" />
            </q-item-section>
          </q-item>
        </q-list>

        <div class="row justify-between items-center q-mt-md">
          <q-btn color="primary" icon="add" label="Agregar Ítem" no-caps outline @click="agregarCriterio" />
          <q-btn color="grey-7" icon="restart_alt" label="Cargar Plantilla Básica" no-caps flat @click="cargarPlantillaCotejo" />
        </div>

        <div v-if="puntosAcumulados !== maxPoints" class="q-mt-md text-caption text-orange flex items-center q-gutter-xs">
          <q-icon name="warning" />
          <span>La suma de los puntos ({{ puntosAcumulados }} pts) no coincide con la nota máxima de la actividad ({{ maxPoints }} pts). La nota final se normalizará automáticamente.</span>
        </div>
      </div>

      <!-- RUBRICA AMPLIADA -->
      <div v-else-if="localRubrica.metodo_evaluacion === 'rubrica_ampliada'">
        <!-- Configuración de Niveles Globales -->
        <div class="bg-grey-1 q-pa-md rounded-lg q-mb-lg">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle2 text-weight-bold text-secondary">Niveles de Desempeño</div>
            <q-btn color="secondary" icon="add" label="Agregar Nivel" size="sm" no-caps outline @click="agregarNivel" />
          </div>
          <div class="row q-col-gutter-sm">
            <div v-for="(nivel, nIdx) in localRubrica.niveles" :key="nIdx" class="col-6 col-sm-3">
              <div class="nivel-badge-editor q-pa-sm border rounded relative-position bg-white">
                <q-btn flat round dense size="xs" color="negative" icon="close" class="absolute-top-right q-ma-xs" @click="eliminarNivel(nIdx)" :disable="localRubrica.niveles.length <= 2" />
                <q-input v-model="nivel.nombre" label="Nivel" dense outlined class="q-mb-xs" input-style="font-size:0.85rem" />
                <q-input v-model.number="nivel.porcentaje" type="number" label="Ponderación" dense outlined suffix="%" input-style="font-size:0.85rem" :rules="[val => (val >= 0 && val <= 100) || '0-100']" @update:model-value="emitirCambios" />
              </div>
            </div>
          </div>
        </div>

        <!-- Criterios de Rúbrica -->
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-bold text-primary">Criterios de Evaluación</div>
          <q-badge :color="puntosAcumulados === maxPoints ? 'green' : 'orange'" text-color="white" class="q-pa-sm text-subtitle2">
            Puntos: {{ puntosAcumulados }} / {{ maxPoints }}
          </q-badge>
        </div>

        <q-list separator class="q-mb-md">
          <div v-for="(criterio, ci) in localRubrica.criterios" :key="ci" class="criterio-ampliado-card q-mb-md q-pa-md border rounded-lg bg-white relative-position">
            <q-btn flat round dense color="negative" icon="delete" class="absolute-top-right q-ma-xs" @click="eliminarCriterio(ci)" />
            <div class="row q-col-gutter-sm items-center q-mb-sm">
              <div class="col-8">
                <q-input v-model="criterio.nombre" label="Nombre del criterio" dense outlined class="text-weight-medium" />
              </div>
              <div class="col-3">
                <q-input v-model.number="criterio.puntos" type="number" label="Peso máximo" dense outlined suffix="pts" @update:model-value="emitirCambios" />
              </div>
            </div>
            <q-input v-model="criterio.descripcion" label="Descripción de lo que se evalúa en este criterio" dense outlined type="textarea" rows="1" class="q-mb-md" />

            <!-- Previsualización de los Niveles para este criterio -->
            <div class="row q-col-gutter-xs text-center">
              <div v-for="(nivel, ni) in localRubrica.niveles" :key="ni" class="col">
                <div class="nivel-preview-box q-pa-xs border rounded bg-grey-1">
                  <div class="text-weight-bold text-caption text-primary">{{ nivel.nombre }}</div>
                  <div class="text-body2 text-weight-medium text-grey-8">
                    {{ Math.round((nivel.porcentaje * (criterio.puntos || 0)) / 100 * 10) / 10 }} pts
                  </div>
                  <div class="text-caption text-grey-5" style="font-size: 0.7rem;">{{ nivel.porcentaje }}%</div>
                </div>
              </div>
            </div>
          </div>
        </q-list>

        <div class="row justify-between items-center q-mt-md">
          <q-btn color="primary" icon="add" label="Agregar Criterio" no-caps outline @click="agregarCriterio" />
          <q-btn color="grey-7" icon="restart_alt" label="Cargar Rúbrica Estándar" no-caps flat @click="cargarPlantillaRubrica" />
        </div>

        <div v-if="puntosAcumulados !== maxPoints" class="q-mt-md text-caption text-orange flex items-center q-gutter-xs">
          <q-icon name="warning" />
          <span>La suma de los criterios ({{ puntosAcumulados }} pts) no coincide con la nota máxima de la actividad ({{ maxPoints }} pts). La nota final se normalizará automáticamente en el calificador.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      metodo_evaluacion: 'directa',
      criterios: [],
      niveles: []
    })
  },
  maxPoints: {
    type: Number,
    default: 100
  }
})

const emit = defineEmits(['update:modelValue'])

const metodosEvaluacion = [
  { value: 'directa', label: 'Calificación Numérica', icon: 'grade', descripcion: 'Calificación de 0 a ' + props.maxPoints + ' sin rúbricas' },
  { value: 'lista_cotejo', label: 'Lista de Cotejo', icon: 'checklist', descripcion: 'Criterios básicos evaluados con Sí / No (cumple o no)' },
  { value: 'rubrica_ampliada', label: 'Rúbrica Ampliada', icon: 'fact_check', descripcion: 'Matriz completa de criterios y niveles de logro (%)' }
]

// Crear copia reactiva interna
const localRubrica = ref(inicializarRubrica(props.modelValue))

function inicializarRubrica(val) {
  const base = {
    metodo_evaluacion: val?.metodo_evaluacion || 'directa',
    criterios: val?.criterios ? JSON.parse(JSON.stringify(val.criterios)) : [],
    niveles: val?.niveles ? JSON.parse(JSON.stringify(val.niveles)) : []
  }
  return base
}

const puntosAcumulados = computed(() => {
  if (!localRubrica.value.criterios?.length) return 0
  return localRubrica.value.criterios.reduce((sum, item) => sum + Number(item.puntos || 0), 0)
})

watch(() => props.modelValue, (newVal) => {
  localRubrica.value = inicializarRubrica(newVal)
}, { deep: true })

function seleccionarMetodo(metodo) {
  localRubrica.value.metodo_evaluacion = metodo
  if (metodo === 'lista_cotejo' && !localRubrica.value.criterios.length) {
    cargarPlantillaCotejo()
  } else if (metodo === 'rubrica_ampliada') {
    if (!localRubrica.value.niveles.length) {
      localRubrica.value.niveles = [
        { nombre: 'Excelente', porcentaje: 100 },
        { nombre: 'Bueno', porcentaje: 75 },
        { nombre: 'Regular', porcentaje: 50 },
        { nombre: 'Insuficiente', porcentaje: 25 }
      ]
    }
    if (!localRubrica.value.criterios.length) {
      cargarPlantillaRubrica()
    }
  }
  emitirCambios()
}

function agregarCriterio() {
  if (!localRubrica.value.criterios) localRubrica.value.criterios = []
  
  // Calcular puntos por defecto de forma que dividan el espacio restante
  const criterioPuntos = localRubrica.value.metodo_evaluacion === 'lista_cotejo' ? 10 : 20
  
  localRubrica.value.criterios.push({
    id: 'crit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    nombre: 'Nuevo Criterio',
    descripcion: '',
    puntos: Math.min(criterioPuntos, Math.max(0, props.maxPoints - puntosAcumulados.value))
  })
  emitirCambios()
}

function eliminarCriterio(index) {
  localRubrica.value.criterios.splice(index, 1)
  emitirCambios()
}

function agregarNivel() {
  if (!localRubrica.value.niveles) localRubrica.value.niveles = []
  const count = localRubrica.value.niveles.length
  // Ponderación basada en la cantidad
  const pct = count > 0 ? Math.max(0, Math.round(localRubrica.value.niveles[count - 1].porcentaje - 20)) : 100
  localRubrica.value.niveles.push({
    nombre: 'Nivel ' + (count + 1),
    porcentaje: pct
  })
  emitirCambios()
}

function eliminarNivel(index) {
  localRubrica.value.niveles.splice(index, 1)
  emitirCambios()
}

function cargarPlantillaCotejo() {
  localRubrica.value.criterios = [
    { id: 'cot_1', nombre: 'Presentación en fecha y formato', descripcion: 'El documento se entregó a tiempo y en formato PDF.', puntos: 20 },
    { id: 'cot_2', nombre: 'Dominio y justificación teórica', descripcion: 'Explica los conceptos de forma estructurada.', puntos: 30 },
    { id: 'cot_3', nombre: 'Solución del caso / Implementación', descripcion: 'El código o caso práctico funciona y resuelve el problema.', puntos: 30 },
    { id: 'cot_4', nombre: 'Conclusiones y referencias', descripcion: 'Añade conclusiones críticas y bibliografía de apoyo.', puntos: 20 }
  ]
  emitirCambios()
}

function cargarPlantillaRubrica() {
  localRubrica.value.niveles = [
    { nombre: 'Excelente', porcentaje: 100 },
    { nombre: 'Bueno', porcentaje: 75 },
    { nombre: 'Regular', porcentaje: 50 },
    { nombre: 'Insuficiente', porcentaje: 25 }
  ]
  localRubrica.value.criterios = [
    { id: 'rub_1', nombre: 'Calidad del Contenido', descripcion: 'Precisión, profundidad y relevancia en el planteamiento teórico.', puntos: 40 },
    { id: 'rub_2', nombre: 'Estructura y Organización', descripcion: 'Coherencia lógica, introducción, desarrollo lógico y conclusiones.', puntos: 30 },
    { id: 'rub_3', nombre: 'Evidencias y Casos Prácticos', descripcion: 'Inclusión de ejemplos aplicados, laboratorios, análisis o código funcional.', puntos: 20 },
    { id: 'rub_4', nombre: 'Ortografía y Referencias', descripcion: 'Formato de citación correcto, redacción académica y ausencia de faltas.', puntos: 10 }
  ]
  emitirCambios()
}

function emitirCambios() {
  emit('update:modelValue', {
    metodo_evaluacion: localRubrica.value.metodo_evaluacion,
    criterios: localRubrica.value.criterios,
    niveles: localRubrica.value.niveles
  })
}

// Watchers internos para actualizar en cambios tipados
watch(localRubrica, () => {
  emitirCambios()
}, { deep: true })
</script>

<style scoped>
.metodo-card {
  border: 1px solid var(--ta-border-card);
  border-radius: 16px;
  background: var(--ta-bg-card);
  transition: all 0.2s ease;
}
.metodo-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--ta-primary);
}
.metodo-card--active {
  border-color: var(--ta-primary);
  background: rgba(var(--primary-rgb), 0.04);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
}
.criterio-item {
  background: var(--ta-bg-card);
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid var(--ta-border-card);
}
.nivel-badge-editor {
  background: var(--ta-bg-card);
  border: 1px solid var(--ta-border-card);
  border-radius: 10px;
}
.criterio-ampliado-card {
  border: 1px solid var(--ta-border-card);
  box-shadow: var(--shadow-card);
}
.nivel-preview-box {
  border: 1px solid var(--ta-border-card);
  border-radius: 8px;
}
.max-w-md {
  max-width: 28rem;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
</style>
