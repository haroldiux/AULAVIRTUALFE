<template>
  <q-page class="av-dashboard-page">
    <AppSkeleton v-if="cargando" variant="list" :count="5" />

    <template v-else>
      <TaPageHeader title="Mis Calificaciones" data-tour="student-notes-header">
        <template #actions>
          <q-chip color="primary" text-color="white" icon="trending_up" class="av-average-chip" data-tour="student-notes-average">
            Promedio General: {{ promedioGeneral }} pts
          </q-chip>
        </template>
      </TaPageHeader>

      <div class="row q-col-gutter-md q-mb-lg" data-tour="student-notes-kpis">
      <div v-for="(kpi, idx) in kpis" :key="kpi.label" class="col-6 col-md-3 card-item">
        <TaKpiCard
          :icon="['school', 'check_circle', 'trending_up', 'emoji_events'][idx]"
          :label="kpi.label"
          :value="kpi.valor"
          :icon-color="[
            'var(--gradient-unitepc)',
            'var(--gradient-unitepc-reverse)',
            'linear-gradient(135deg, #6B3FA0 0%, #0D9488 100%)',
            'linear-gradient(135deg, #0D9488 0%, #6B3FA0 100%)'
          ][idx]"
        />
      </div>
    </div>

    <TaCard
      v-for="curso in misCursos"
      :key="curso.id"
      :padding="false"
      :shadow="false"
      class="q-mb-lg card-item"
      data-tour="student-notes-course"
    >
      <q-card-section class="row items-center av-course-header">
        <div class="col">
          <div class="text-h6 av-text-primary">{{ curso.nombre }}</div>
          <div class="text-caption av-text-secondary">{{ curso.codigo }} — {{ curso.gestion }}</div>
        </div>
        <div class="col-auto text-right">
          <div class="text-caption av-text-secondary">Promedio del Curso</div>
          <div class="text-h5 av-course-score" :class="colorNota(promedioCurso(curso.id))">{{ promedioCurso(curso.id) }} pts</div>
        </div>
      </q-card-section>

      <q-separator class="av-card-separator" />

      <div class="overflow-x-auto">
        <q-markup-table flat class="av-notes-table" data-tour="student-notes-table">
          <thead>
            <tr class="text-left av-notes-table__head">
              <th style="width: 40%">Actividad</th>
              <th style="width: 15%">Tipo</th>
              <th style="width: 10%" class="text-right">Nota</th>
              <th style="width: 10%" class="text-right">Max</th>
              <th style="width: 15%">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="nota in getNotasCurso(curso.id)" :key="nota.actividad" class="nota-row">
              <td>
                <div class="text-body2 av-text-primary">{{ nota.actividad }}</div>
                <div v-if="nota.retroalimentacion" class="text-caption av-text-muted">
                  <q-icon name="chat" size="xs" /> {{ nota.retroalimentacion }}
                </div>
              </td>
              <td>
                <q-badge :color="colorTipo(nota.tipo)" text-color="white" class="av-badge">
                  {{ labelTipo(nota.tipo) }}
                </q-badge>
              </td>
              <td class="text-right">
                <span class="text-body2 text-weight-medium av-text-primary">{{ nota.nota }}</span>
              </td>
              <td class="text-right av-text-secondary">{{ nota.nota_maxima }}</td>
              <td>
                <div class="row items-center q-gutter-xs">
                  <q-icon :name="nota.porcentaje >= 60 ? 'check_circle' : 'error'" :color="nota.porcentaje >= 60 ? 'positive' : 'negative'" size="xs" />
                  <span class="text-caption av-text-secondary">{{ nota.porcentaje >= 60 ? 'Aprobado' : 'Reprobado' }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>

      <q-card-section class="av-distribution" data-tour="student-notes-distribution">
        <div class="row items-center">
          <div class="col">
            <div class="text-body2 text-weight-medium av-text-primary">Distribucion de calificaciones</div>
          </div>
        </div>
        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-4 text-center" v-for="estado in distribucionCurso(curso.id)" :key="estado.label">
            <div class="av-distribution__item">
              <div class="text-h6" :class="estado.colorClass">{{ estado.cantidad }}</div>
              <div class="text-caption av-text-secondary">{{ estado.label }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </TaCard>

      <AppEmptyState
        v-if="misCursos.length === 0"
        icon="grade"
        title="Sin calificaciones"
        message="Las notas apareceran cuando tus docentes publiquen resultados."
      />
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { calificacionService } from 'src/services/calificacionService.js'
import { useStaggerCards } from 'src/composables/useAnimations'
import { useLoadingState } from 'src/composables/useLoadingState'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'

const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 600 })

const datosNotas = ref({ cursos: [], promedio_general: null })

const misCursos = computed(() => datosNotas.value.cursos || [])

async function cargarNotas() {
  try {
    const res = await calificacionService.misNotas()
    datosNotas.value = res.data || { cursos: [], promedio_general: null }
  } catch {
    datosNotas.value = { cursos: [], promedio_general: null }
  }
}

function getNotasCurso(cursoId) {
  const curso = misCursos.value.find((c) => c.curso_id === cursoId)
  if (!curso) return []
  return curso.notas || []
}

const kpis = computed(() => [
  { label: 'Cursos Matriculados', valor: misCursos.value.length, colorClass: 'text-primary' },
  { label: 'Actividades Calificadas', valor: totalActividadesCompletadas.value, colorClass: 'text-teal' },
  { label: 'Promedio General', valor: (datosNotas.value.promedio_general || 0) + ' pts', colorClass: 'text-green' },
  { label: 'Materias Aprobadas', valor: materiasAprobadas.value, colorClass: 'text-indigo' },
])

const totalActividadesCompletadas = computed(() => {
  return misCursos.value.reduce((sum, c) => sum + (c.notas?.length || 0), 0)
})

const promedioGeneral = computed(() => datosNotas.value.promedio_general || 0)

const materiasAprobadas = computed(() => {
  return misCursos.value.filter((c) => (c.promedio || 0) >= 51).length
})

function promedioCurso(cursoId) {
  const curso = misCursos.value.find((c) => c.curso_id === cursoId)
  return curso?.promedio || 0
}

function distribucionCurso(cursoId) {
  const notas = getNotasCurso(cursoId).filter((n) => n.nota_maxima > 0)
  const aprobadasP = notas.filter((n) => (n.porcentaje || 0) >= 60).length
  const reprobadas = notas.filter((n) => (n.porcentaje || 0) < 60).length
  return [
    { label: 'Aprobadas', cantidad: aprobadasP, colorClass: 'text-green' },
    { label: 'Reprobadas', cantidad: reprobadas, colorClass: 'text-red' },
    { label: 'Total', cantidad: notas.length, colorClass: 'text-primary' },
  ]
}

function colorNota(porcentaje) {
  if (porcentaje >= 80) return 'text-positive'
  if (porcentaje >= 60) return 'text-primary'
  if (porcentaje >= 40) return 'text-secondary'
  return 'text-negative'
}

function labelTipo(tipo) {
  const map = { leccion: 'Leccion', tarea: 'Tarea', foro: 'Foro', cuestionario: 'Quiz', encuesta: 'Encuesta', h5p: 'Contenido H5P' }
  return map[tipo] ?? tipo
}

function colorTipo(tipo) {
  const map = { leccion: 'primary', tarea: 'secondary', foro: 'primary', cuestionario: 'secondary', encuesta: 'primary', h5p: 'secondary' }
  return map[tipo] ?? 'grey'
}

useStaggerCards('.card-item')

onMounted(async () => {
  await cargarNotas()
  finalizarCarga()
})
</script>

<style scoped>
.av-text-primary { color: var(--ta-text-primary); }
.av-text-secondary { color: var(--ta-text-secondary); }
.av-text-muted { color: var(--ta-text-muted); }
.av-card-separator { background: var(--ta-border-card); }
.av-average-chip { border-radius: 999px; font-weight: 700; }

.av-course-header { padding: 18px 20px; }
.av-course-score { font-weight: 850; }

.av-notes-table {
  border-radius: 0;
  min-width: 640px;
  width: 100%;
}
.av-notes-table__head {
  background: rgba(var(--primary-rgb), 0.04);
  color: var(--ta-text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.body--dark .av-notes-table__head {
  background: rgba(255, 255, 255, 0.04);
}
.av-notes-table th {
  padding: 12px 16px;
  border-bottom: 1px solid var(--ta-border-card);
}
.av-notes-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--ta-border-card);
  color: var(--ta-text-primary);
}
.nota-row {
  transition: background-color 0.2s ease;
}
.nota-row:hover {
  background: rgba(var(--primary-rgb), 0.04);
}
.body--dark .nota-row:hover {
  background: rgba(255, 255, 255, 0.04);
}
.av-badge {
  border-radius: 999px;
  padding: 4px 8px;
  font-weight: 600;
}

.av-distribution { padding: 18px 20px; }
.av-distribution__item {
  padding: 10px 8px;
  border-radius: 16px;
  background: rgba(var(--primary-rgb), 0.03);
  border: 1px solid var(--ta-border-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.av-distribution__item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}
.body--dark .av-distribution__item {
  background: rgba(255, 255, 255, 0.03);
}
</style>
