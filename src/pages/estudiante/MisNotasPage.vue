<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Mis Calificaciones" data-tour="student-notes-header">
      <template #actions>
        <q-chip color="primary" text-color="white" icon="trending_up" data-tour="student-notes-average">
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
      <q-card-section class="row items-center">
        <div class="col">
          <div class="text-h6">{{ curso.nombre }}</div>
          <div class="text-caption text-grey-7">{{ curso.codigo }} — {{ curso.gestion }}</div>
        </div>
        <div class="col-auto text-right">
          <div class="text-caption text-grey-7">Promedio del Curso</div>
          <div class="text-h5" :class="colorNota(promedioCurso(curso.id))">{{ promedioCurso(curso.id) }} pts</div>
        </div>
      </q-card-section>

      <q-separator />

      <q-markup-table flat data-tour="student-notes-table">
        <thead>
          <tr class="text-left">
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
              <div class="text-body2">{{ nota.actividad }}</div>
              <div v-if="nota.retroalimentacion" class="text-caption text-grey-6">
                <q-icon name="chat" size="xs" /> {{ nota.retroalimentacion }}
              </div>
            </td>
            <td>
              <q-badge :color="colorTipo(nota.tipo)" text-color="white">
                {{ labelTipo(nota.tipo) }}
              </q-badge>
            </td>
            <td class="text-right">
              <span class="text-body2 text-weight-medium">{{ nota.nota }}</span>
            </td>
            <td class="text-right text-grey-7">{{ nota.nota_maxima }}</td>
            <td>
              <div class="row items-center q-gutter-xs">
                <q-icon :name="nota.porcentaje >= 60 ? 'check_circle' : 'error'" :color="nota.porcentaje >= 60 ? 'green' : 'red'" size="xs" />
                <span class="text-caption">{{ nota.porcentaje >= 60 ? 'Aprobado' : 'Reprobado' }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-card-section data-tour="student-notes-distribution">
        <div class="row items-center">
          <div class="col">
            <div class="text-body2">Distribucion de calificaciones</div>
          </div>
        </div>
        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-4 text-center" v-for="estado in distribucionCurso(curso.id)" :key="estado.label">
            <div class="text-h6" :class="estado.colorClass">{{ estado.cantidad }}</div>
            <div class="text-caption text-grey-7">{{ estado.label }}</div>
          </div>
        </div>
      </q-card-section>
    </TaCard>

    <DashboardEmptyState
      v-if="misCursos.length === 0"
      icon="grade"
      title="Sin calificaciones"
      message="Las notas apareceran cuando tus docentes publiquen resultados."
    />
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useCursosStore } from 'src/stores/cursos'
import { useActividadesStore } from 'src/stores/actividades'
import { useAuthStore } from 'src/stores/auth'
import { matriculas as mockMatriculas, calificaciones as mockCalificaciones } from 'src/mock/index.js'
import { useStaggerCards } from 'src/composables/useAnimations'
import DashboardEmptyState from 'src/components/dashboard/DashboardEmptyState.vue'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'

const cursosStore = useCursosStore()
const actividadesStore = useActividadesStore()
const auth = useAuthStore()

const misCursos = computed(() => {
  const userMatriculas = mockMatriculas.filter((m) => m.estudiante_id === auth.usuario?.id)
  const cursoIds = userMatriculas.map((m) => m.curso_id)
  return cursosStore.cursos.filter((c) => cursoIds.includes(c.id))
})

function getNotasCurso(cursoId) {
  const estudianteId = auth.usuario?.id
  const cursoNotas = mockCalificaciones[cursoId] || {}
  const misNotas = cursoNotas[estudianteId] || {}
  const resultado = []
  Object.entries(misNotas).forEach(([actId, nota]) => {
    const act = actividadesStore.actividades.find((a) => a.id === Number(actId))
    if (act) {
      resultado.push({
        actividad: act.titulo,
        tipo: act.tipo,
        nota: nota.nota,
        nota_maxima: act.nota_maxima,
        porcentaje: nota.porcentaje,
        retroalimentacion: nota.retro || null,
      })
    }
  })
  return resultado
}

const kpis = computed(() => [
  { label: 'Cursos Matriculados', valor: misCursos.value.length, colorClass: 'text-primary' },
  { label: 'Actividades Completadas', valor: totalActividadesCompletadas.value, colorClass: 'text-teal' },
  { label: 'Promedio General', valor: promedioGeneral.value + ' pts', colorClass: 'text-green' },
  { label: 'Materias Aprobadas', valor: materiasAprobadas.value, colorClass: 'text-indigo' },
])

const totalActividadesCompletadas = computed(() => {
  const eid = auth.usuario?.id
  let count = 0
  misCursos.value.forEach((c) => {
    const notasCurso = mockCalificaciones[c.id]?.[eid] || {}
    count += Object.keys(notasCurso).length
  })
  return count
})

const promedioGeneral = computed(() => {
  const eid = auth.usuario?.id
  const todas = []
  misCursos.value.forEach((c) => {
    const notasCurso = mockCalificaciones[c.id]?.[eid] || {}
    Object.values(notasCurso).forEach((n) => {
      if (n.porcentaje > 0) todas.push(n.porcentaje)
    })
  })
  if (!todas.length) return 0
  return Math.round(todas.reduce((s, p) => s + p, 0) / todas.length)
})

const materiasAprobadas = computed(() => {
  return misCursos.value.filter((c) => promedioCurso(c.id) >= 51).length
})

function promedioCurso(cursoId) {
  const notas = getNotasCurso(cursoId).filter((n) => n.nota_maxima > 0)
  if (!notas.length) return 0
  return Math.round(notas.reduce((s, n) => s + n.porcentaje, 0) / notas.length)
}

function distribucionCurso(cursoId) {
  const notas = getNotasCurso(cursoId).filter((n) => n.nota_maxima > 0)
  const aprobadasP = notas.filter((n) => n.porcentaje >= 60).length
  const reprobadas = notas.filter((n) => n.porcentaje < 60).length
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
</script>

<style scoped>
.nota-row:hover {
  background: rgba(0, 0, 0, 0.03);
}
.body--dark .nota-row:hover {
  background: rgba(255, 255, 255, 0.04);
}
</style>
