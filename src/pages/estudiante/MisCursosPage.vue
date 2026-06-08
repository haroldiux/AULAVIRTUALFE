<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Mis Cursos" data-tour="student-courses-header" />

    <AppSkeleton v-if="cargando" :count="3" />

    <template v-else>
      <div class="av-section-heading">
        <div>
          <h2 class="av-section-heading__title">Cursos matriculados</h2>
          <p class="av-section-heading__subtitle">Continua tus materias activas de la gestion actual.</p>
        </div>
      </div>

      <div class="row q-col-gutter-md q-pa-md" data-tour="student-courses-list">
        <div v-for="curso in misCursos" :key="curso.id" class="col-12 col-md-6 col-lg-4 card-item">
          <div
            class="av-course-card cursor-pointer"
            data-tour="student-course-progress"
            @click="$router.push(`/estudiante/curso/${curso.id}`)"
          >
            <q-card-section>
              <div class="text-h6">{{ curso.nombre }}</div>
              <div class="text-caption text-grey-7">{{ curso.codigo }}</div>
              <div class="text-body2 q-mt-sm">{{ curso.descripcion }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row items-center q-mb-xs">
                <div class="col text-body2">Progreso</div>
                <div class="col-auto text-caption text-grey-7">{{ contadoresCurso(curso).labelRealizadas }}</div>
              </div>
              <q-linear-progress
                :value="ratio(contadoresCurso(curso).realizadas, contadoresCurso(curso).total)"
                :color="contadoresCurso(curso).realizadas >= contadoresCurso(curso).pendientes ? 'green' : 'orange'"
                size="12px"
                rounded
              />
            </q-card-section>

            <q-separator />

            <q-card-actions>
              <div class="text-caption text-grey-6 q-mr-auto">
                {{ curso.total_actividades }} actividades
              </div>
              <TaButton variant="ghost" label="Ver Curso" />
            </q-card-actions>
          </div>
        </div>

        <div v-if="misCursos.length === 0" class="col-12">
          <DashboardEmptyState
            icon="library_books"
            title="No estas matriculado"
            message="Cuando SISA confirme tu matricula, tus cursos apareceran aqui."
          />
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCursosStore } from 'src/stores/cursos'
import { useAuthStore } from 'src/stores/auth'
import { matriculas as mockMatriculas } from 'src/mock/index.js'
import { useActividadesStore } from 'src/stores/actividades'
import { useStaggerCards, useReflectionHover } from 'src/composables/useAnimations'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import DashboardEmptyState from 'src/components/dashboard/DashboardEmptyState.vue'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'

const cursosStore = useCursosStore()
const auth = useAuthStore()
const actividadesStore = useActividadesStore()

const cargando = ref(true)

const misCursos = computed(() => {
  const userMatriculas = mockMatriculas.filter((m) => m.estudiante_id === auth.usuario?.id)
  const cursoIds = userMatriculas.map((m) => m.curso_id)
  return cursosStore.cursos.filter((c) => cursoIds.includes(c.id))
})

function contadoresCurso(curso) {
  if (!auth.usuario?.id) return { total: 0, realizadas: 0, pendientes: 0, labelRealizadas: '0/0' }
  return actividadesStore.getContadoresCursoEstudiante(auth.usuario.id, curso)
}

function ratio(actual, total) {
  return total > 0 ? actual / total : 0
}

useStaggerCards('.card-item')
useReflectionHover('.av-course-card')

onMounted(() => {
  setTimeout(() => { cargando.value = false }, 600)
})
</script>
