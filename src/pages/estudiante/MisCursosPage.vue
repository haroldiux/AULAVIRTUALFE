<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Mis Cursos" data-tour="student-courses-header" />

    <AppSkeleton v-if="cargando" variant="card-grid" :count="3" />

    <template v-else>
      <div class="av-section-heading">
        <div>
          <h2 class="av-section-heading__title">Cursos matriculados</h2>
          <p class="av-section-heading__subtitle">Continua tus materias activas de la gestion actual.</p>
        </div>
      </div>

      <div class="row q-col-gutter-md" data-tour="student-courses-list">
        <div v-for="curso in misCursos" :key="curso.id" class="col-12 col-md-6 col-lg-4 card-item">
          <TaCard
            :padding="false"
            :shadow="true"
            custom-class="av-course-card cursor-pointer"
            data-tour="student-course-progress"
            @click="$router.push(`/estudiante/curso/${curso.id}`)"
          >
            <q-card-section>
              <div class="text-h6 av-course-card__title">{{ curso.nombre }}</div>
              <div class="text-caption av-text-secondary">{{ curso.codigo }}</div>
              <div class="text-body2 q-mt-sm av-text-secondary line-clamp-2">{{ curso.descripcion }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row items-center q-mb-xs">
                <div class="col text-body2 av-text-primary">Progreso</div>
                <div class="col-auto text-caption av-text-secondary">{{ contadoresCurso(curso).labelRealizadas }}</div>
              </div>
              <q-linear-progress
                :value="ratio(contadoresCurso(curso).realizadas, contadoresCurso(curso).total)"
                :color="contadoresCurso(curso).realizadas >= contadoresCurso(curso).pendientes ? 'positive' : 'warning'"
                size="12px"
                rounded
                class="av-course-card__progress"
              />
            </q-card-section>

            <q-separator class="av-card-separator" />

            <q-card-actions class="av-course-card__actions">
              <div class="text-caption av-text-muted q-mr-auto">
                {{ curso.total_actividades }} actividades
              </div>
              <TaButton variant="ghost" label="Ver Curso" />
            </q-card-actions>
          </TaCard>
        </div>

        <div v-if="misCursos.length === 0" class="col-12">
          <AppEmptyState
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
import { computed, onMounted } from 'vue'
import { useCursosStore } from 'src/stores/cursos'
import { useAuthStore } from 'src/stores/auth'
import { useActividadesStore } from 'src/stores/actividades'
import { useStaggerCards, useReflectionHover } from 'src/composables/useAnimations'
import { useLoadingState } from 'src/composables/useLoadingState'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'

const cursosStore = useCursosStore()
const auth = useAuthStore()
const actividadesStore = useActividadesStore()

const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 600 })

const misCursos = computed(() => {
  return cursosStore.publicados
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

onMounted(async () => {
  await cursosStore.cargarCursos()
  finalizarCarga()
})
</script>

<style scoped>
.av-text-primary { color: var(--ta-text-primary); }
.av-text-secondary { color: var(--ta-text-secondary); }
.av-text-muted { color: var(--ta-text-muted); }
.av-card-separator { background: var(--ta-border-card); }

.av-course-card {
  height: 100%;
  border-radius: 22px;
  overflow: hidden;
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
}
.av-course-card:hover {
  transform: translateY(-4px);
}
.av-course-card__title {
  color: var(--ta-text-primary);
}
.av-course-card__progress {
  border-radius: 999px;
  overflow: hidden;
}
.av-course-card__actions {
  padding: 12px 16px;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
