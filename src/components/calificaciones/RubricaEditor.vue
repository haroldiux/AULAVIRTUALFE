<template>
  <div>
    <div class="row items-center q-mb-sm">
      <div class="col text-subtitle2">Rubrica de Evaluacion</div>
      <div class="col-auto">
        <q-badge :color="puntajeTotal >= puntajeMaximo ? 'green' : 'orange'" text-color="white">
          Puntaje: {{ puntajeTotal }} / {{ puntajeMaximo }}
        </q-badge>
      </div>
    </div>

    <div class="rubrica-scroll">
      <div class="rubrica-grid">
        <div class="rubrica-header">
          <div class="header-criterio">Criterio</div>
          <div v-for="nivel in niveles" :key="nivel.nombre" class="header-nivel text-center">
            <div class="text-weight-medium">{{ nivel.nombre }}</div>
            <div class="text-caption av-text-secondary">{{ nivel.descripcion }}</div>
          </div>
        </div>

        <div v-for="(criterio, ci) in criterios" :key="ci" class="rubrica-row">
          <div class="celda-criterio">
            <div class="text-body2 text-weight-medium">{{ criterio.nombre }}</div>
            <div class="text-caption av-text-secondary">Valor: {{ criterio.puntos }} pts</div>
          </div>
          <div
            v-for="(nivel, ni) in niveles"
            :key="ni"
            class="celda-nivel text-center cursor-pointer"
            :class="{ 'nivel-seleccionado': seleccion[ci] === ni }"
            @click="seleccionar(ci, ni)"
          >
            <div class="text-body2 text-weight-medium">{{ nivel.puntaje * criterio.puntos / 100 }}</div>
            <div class="text-caption av-text-secondary">{{ nivel.nombre }}</div>
          </div>
        </div>
      </div>
    </div>

    <AppEmptyState
      v-if="criterios.length === 0"
      icon="rule"
      title="Sin criterios definidos"
      message="Esta rubrica aun no tiene criterios configurados."
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'

const props = defineProps({
  actividad: { type: Object, required: true },
  modelValue: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue', 'update:total'])

const niveles = [
  { nombre: 'Excelente', descripcion: 'Logro completo', puntaje: 100 },
  { nombre: 'Bueno', descripcion: 'Logro esperado', puntaje: 75 },
  { nombre: 'Regular', descripcion: 'Logro parcial', puntaje: 50 },
  { nombre: 'Insuficiente', descripcion: 'Requiere mejora', puntaje: 25 },
]

const criterios = computed(() => {
  const personalizados = props.actividad?.config?.rubrica?.criterios
  if (personalizados?.length) {
    return personalizados.map((criterio) => ({ nombre: criterio.nombre, puntos: criterio.puntos ?? criterio.peso ?? 0 }))
  }
  return [
    { nombre: 'Contenido y precision', puntos: 40 },
    { nombre: 'Estructura y organizacion', puntos: 25 },
    { nombre: 'Argumentacion', puntos: 20 },
    { nombre: 'Presentacion', puntos: 15 },
  ]
})

const seleccion = ref(criterios.value.map(() => 0))

const puntajePorCriterio = computed(() =>
  seleccion.value.map((nivelIdx, ci) => {
    const nivel = niveles[nivelIdx]
    return (nivel.puntaje * criterios.value[ci].puntos) / 100
  })
)

const puntajeTotal = computed(() => puntajePorCriterio.value.reduce((s, p) => s + p, 0))

const puntajeMaximo = computed(() =>
  criterios.value.reduce((s, c) => s + c.puntos, 0)
)

function seleccionar(ci, ni) {
  seleccion.value[ci] = ni
}

watch(puntajeTotal, (val) => {
  const maxNota = props.actividad?.nota_maxima || 100
  const nota = Math.round((val / puntajeMaximo.value) * maxNota)
  emit('update:modelValue', nota)
  emit('update:total', nota)
})

watch(() => props.modelValue, (val) => {
  if (val === 0) seleccion.value = criterios.value.map(() => 0)
})
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
  display: grid;
  grid-template-columns: 180px repeat(4, 1fr);
  background: rgba(var(--primary-rgb), 0.06);
  border-bottom: 2px solid var(--ta-border-card);
}
.body--dark .rubrica-header {
  background: rgba(255, 255, 255, 0.06);
}
.header-criterio, .header-nivel {
  padding: 10px;
  border-right: 1px solid var(--ta-border-card);
}
.rubrica-row {
  display: grid;
  grid-template-columns: 180px repeat(4, 1fr);
  border-bottom: 1px solid var(--ta-border-card);
  transition: background 0.15s;
}
.rubrica-row:last-child { border-bottom: none; }
.celda-criterio {
  padding: 10px;
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
  background: rgba(var(--primary-rgb), 0.14);
  border: 2px solid var(--ta-primary);
  font-weight: bold;
}
.av-text-secondary { color: var(--ta-text-secondary); }
</style>
