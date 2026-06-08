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

    <div class="rubrica-grid">
      <div class="rubrica-header">
        <div class="header-criterio">Criterio</div>
        <div v-for="nivel in niveles" :key="nivel.nombre" class="header-nivel text-center">
          <div class="text-weight-medium">{{ nivel.nombre }}</div>
          <div class="text-caption">{{ nivel.descripcion }}</div>
        </div>
      </div>

      <div v-for="(criterio, ci) in criterios" :key="ci" class="rubrica-row">
        <div class="celda-criterio">
          <div class="text-body2 text-weight-medium">{{ criterio.nombre }}</div>
          <div class="text-caption text-grey-6">Valor: {{ criterio.puntos }} pts</div>
        </div>
        <div
          v-for="(nivel, ni) in niveles"
          :key="ni"
          class="celda-nivel text-center cursor-pointer"
          :class="{ 'nivel-seleccionado': seleccion[ci] === ni }"
          @click="seleccionar(ci, ni)"
        >
          <div class="text-body2 text-weight-medium">{{ nivel.puntaje * criterio.puntos / 100 }}</div>
          <div class="text-caption">{{ nivel.nombre }}</div>
        </div>
      </div>
    </div>

    <div v-if="criterios.length === 0" class="text-center q-pa-md text-grey-6">
      <q-icon name="rule" size="32px" color="grey-4" />
      <p class="q-mt-sm">Sin criterios definidos para esta rubrica.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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
.rubrica-grid {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}
.rubrica-header {
  display: grid;
  grid-template-columns: 180px repeat(4, 1fr);
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
}
.header-criterio, .header-nivel {
  padding: 10px;
  border-right: 1px solid #e0e0e0;
}
.rubrica-row {
  display: grid;
  grid-template-columns: 180px repeat(4, 1fr);
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.15s;
}
.rubrica-row:last-child { border-bottom: none; }
.celda-criterio {
  padding: 10px;
  border-right: 1px solid #e0e0e0;
  background: #fafafa;
}
.celda-nivel {
  padding: 12px 8px;
  border-right: 1px solid #e0e0e0;
  transition: all 0.15s;
}
.celda-nivel:last-child { border-right: none; }
.celda-nivel:hover { background: #e8f5e9; }
.nivel-seleccionado {
  background: var(--q-primary-light, #e3f2fd);
  border: 2px solid var(--q-primary);
  font-weight: bold;
}
</style>
