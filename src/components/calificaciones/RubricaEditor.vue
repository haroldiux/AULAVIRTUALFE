<template>
  <div class="rubrica-editor">
    <!-- Resumen de Nota y Puntos -->
    <div class="row items-center q-mb-md">
      <div class="col text-subtitle2 font-medium text-grey-8">
        Método de Calificación:
        <span class="text-primary text-weight-bold">{{ labelMetodo }}</span>
      </div>
      <div class="col-auto">
        <q-badge :color="puntajeTotal >= puntajeMaximo ? 'green' : 'orange'" text-color="white" class="q-py-xs q-px-sm">
          Puntos acumulados: {{ puntajeTotal }} / {{ puntajeMaximo }} pts
        </q-badge>
      </div>
    </div>

    <!-- MODO LISTA DE COTEJO -->
    <div v-if="metodoEvaluacion === 'lista_cotejo'" class="lista-cotejo-container border rounded-lg q-pa-sm bg-grey-1">
      <q-list separator>
        <q-item v-for="(criterio, ci) in criterios" :key="ci" class="q-py-md items-center bg-white rounded-md q-mb-xs shadow-sm">
          <q-item-section>
            <q-item-label class="text-body2 text-weight-medium text-grey-9">{{ criterio.nombre }}</q-item-label>
            <q-item-label v-if="criterio.descripcion" caption class="text-grey-6">{{ criterio.descripcion }}</q-item-label>
            <q-item-label caption class="text-weight-bold text-teal">Valor: {{ criterio.puntos }} pts</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row items-center q-gutter-sm">
              <span class="text-caption" :class="seleccionCotejo[ci] ? 'text-green text-weight-bold' : 'text-grey-5'">
                {{ seleccionCotejo[ci] ? 'Cumple' : 'No cumple' }}
              </span>
              <q-toggle
                v-model="seleccionCotejo[ci]"
                color="green"
                @update:model-value="actualizarNotaCotejo"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- MODO RUBRICA AMPLIADA O FALLBACK -->
    <div v-else-if="metodoEvaluacion === 'rubrica_ampliada' || metodoEvaluacion === 'directa'" class="rubrica-scroll">
      <div class="rubrica-grid">
        <!-- Encabezado con niveles -->
        <div class="rubrica-header" :style="gridStyle">
          <div class="header-criterio">Criterio</div>
          <div v-for="(nivel, ni) in niveles" :key="ni" class="header-nivel text-center">
            <div class="text-weight-medium">{{ nivel.nombre }}</div>
            <div class="text-caption text-grey-6" style="font-size:0.75rem">
              {{ nivel.porcentaje }}%
            </div>
          </div>
        </div>

        <!-- Filas de criterios -->
        <div v-for="(criterio, ci) in criterios" :key="ci" class="rubrica-row" :style="gridStyle">
          <div class="celda-criterio">
            <div class="text-body2 text-weight-medium text-grey-9">{{ criterio.nombre }}</div>
            <div v-if="criterio.descripcion" class="text-caption text-grey-5 q-mb-xs" style="line-height: 1.15">{{ criterio.descripcion }}</div>
            <div class="text-caption text-weight-bold text-teal">Máx: {{ criterio.puntos }} pts</div>
          </div>
          
          <div
            v-for="(nivel, ni) in niveles"
            :key="ni"
            class="celda-nivel text-center cursor-pointer flex flex-center flex-column"
            :class="{ 'nivel-seleccionado': seleccionRubrica[ci] === ni }"
            @click="seleccionarNivel(ci, ni)"
          >
            <div class="text-body2 text-weight-bold">
              {{ Math.round((nivel.porcentaje * criterio.puntos) / 100 * 10) / 10 }}
            </div>
            <div class="text-caption text-grey-6" style="font-size: 0.7rem;">{{ nivel.nombre }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <AppEmptyState
      v-if="criterios.length === 0"
      icon="rule"
      title="Sin criterios definidos"
      message="Esta rúbrica aún no tiene criterios configurados en la actividad."
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const props = defineProps({
  actividad: { type: Object, required: true },
  modelValue: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue', 'update:total'])

// 1. Detectar el método de evaluación
const metodoEvaluacion = computed(() => {
  return props.actividad?.config?.rubrica?.metodo_evaluacion || 'directa'
})

const labelMetodo = computed(() => {
  const metodos = {
    directa: 'Numérica Directa',
    lista_cotejo: 'Lista de Cotejo',
    rubrica_ampliada: 'Rúbrica Ampliada'
  }
  return metodos[metodoEvaluacion.value] || 'Numérica Directa'
})

// 2. Cargar niveles de forma dinámica o usar fallback
const niveles = computed(() => {
  const personalizados = props.actividad?.config?.rubrica?.niveles
  if (personalizados?.length) {
    return personalizados
  }
  // Fallback si no tiene niveles
  return [
    { nombre: 'Excelente', porcentaje: 100 },
    { nombre: 'Bueno', porcentaje: 75 },
    { nombre: 'Regular', porcentaje: 50 },
    { nombre: 'Insuficiente', porcentaje: 25 },
  ]
})

// 3. Cargar criterios de forma dinámica o usar fallback
const criterios = computed(() => {
  const personalizados = props.actividad?.config?.rubrica?.criterios
  if (personalizados?.length) {
    return personalizados
  }
  // Fallback por defecto si no hay nada guardado
  return [
    { nombre: 'Calidad de contenido', puntos: 40, descripcion: 'Precisión, profundidad e investigación.' },
    { nombre: 'Estructura y formato', puntos: 30, descripcion: 'Organización lógica, redacción y bibliografía.' },
    { nombre: 'Implementación práctica', puntos: 30, descripcion: 'Resolución de ejercicios, código o diseño.' },
  ]
})

// Estilo de cuadrícula dinámico basado en la cantidad de niveles
const gridStyle = computed(() => {
  const cols = niveles.value.length
  return {
    display: 'grid',
    gridTemplateColumns: `200px repeat(${cols}, 1fr)`
  }
})

// 4. Estados de selección independientes
const seleccionRubrica = ref([])
const seleccionCotejo = ref([])

// Inicializar selecciones
function inicializarSelecciones() {
  seleccionRubrica.value = criterios.value.map(() => 0) // Por defecto Excelente
  seleccionCotejo.value = criterios.value.map(() => false) // Por defecto No cumple
  calcularYEmitir()
}

onMounted(() => {
  inicializarSelecciones()
})

// 5. Cálculos de puntajes
const puntajeTotal = computed(() => {
  if (metodoEvaluacion.value === 'lista_cotejo') {
    return seleccionCotejo.value.reduce((sum, cumple, idx) => {
      return sum + (cumple ? Number(criterios.value[idx]?.puntos || 0) : 0)
    }, 0)
  } else {
    return seleccionRubrica.value.reduce((sum, nivelIdx, ci) => {
      const nivel = niveles.value[nivelIdx]
      const criterio = criterios.value[ci]
      if (!nivel || !criterio) return sum
      return sum + ((nivel.porcentaje * criterio.puntos) / 100)
    }, 0)
  }
})

const puntajeMaximo = computed(() => {
  return criterios.value.reduce((sum, c) => sum + Number(c.puntos || 0), 0)
})

// 6. Acciones
function seleccionarNivel(ci, ni) {
  seleccionRubrica.value[ci] = ni
  calcularYEmitir()
}

function actualizarNotaCotejo() {
  calcularYEmitir()
}

function calcularYEmitir() {
  const maxNota = props.actividad?.nota_maxima || 100
  const maxPuntaje = puntajeMaximo.value || 1
  const nota = Math.round((puntajeTotal.value / maxPuntaje) * maxNota)
  
  emit('update:modelValue', nota)
  emit('update:total', nota)
}

// Watchers
watch(puntajeTotal, () => {
  calcularYEmitir()
})

watch(() => props.modelValue, (val) => {
  if (val === 0) {
    seleccionRubrica.value = criterios.value.map(() => niveles.value.length - 1) // Poner en insuficiente/mínimo
    seleccionCotejo.value = criterios.value.map(() => false)
  }
})

watch(() => props.actividad, () => {
  inicializarSelecciones()
}, { deep: true })
</script>

<style scoped>
.rubrica-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.rubrica-grid {
  min-width: 600px;
  border: 1px solid var(--ta-border-card);
  border-radius: 8px;
  overflow: hidden;
}
.rubrica-header {
  background: rgba(var(--primary-rgb), 0.06);
  border-bottom: 2px solid var(--ta-border-card);
}
.body--dark .rubrica-header {
  background: rgba(255, 255, 255, 0.06);
}
.header-criterio, .header-nivel {
  padding: 12px 10px;
  border-right: 1px solid var(--ta-border-card);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.header-nivel:last-child { border-right: none; }

.rubrica-row {
  border-bottom: 1px solid var(--ta-border-card);
  transition: background 0.15s;
}
.rubrica-row:last-child { border-bottom: none; }

.celda-criterio {
  padding: 12px 10px;
  border-right: 1px solid var(--ta-border-card);
  background: var(--ta-bg-card);
}
.celda-nivel {
  padding: 12px 8px;
  border-right: 1px solid var(--ta-border-card);
  transition: all 0.15s;
}
.celda-nivel:last-child { border-right: none; }
.celda-nivel:hover { background: rgba(var(--primary-rgb), 0.08); }
.body--dark .celda-nivel:hover { background: rgba(var(--primary-rgb), 0.18); }

.nivel-seleccionado {
  background: rgba(var(--primary-rgb), 0.14) !important;
  border: 2px solid var(--ta-primary) !important;
  font-weight: bold;
}
.body--dark .nivel-seleccionado {
  background: rgba(var(--primary-rgb), 0.25) !important;
}
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
}
</style>
