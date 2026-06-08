<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Mis Cursos" data-tour="teacher-courses-header">
      <template #actions>
        <TaButton variant="primary" icon="add" label="Nuevo Curso" @click="nuevoCurso = true" />
      </template>
    </TaPageHeader>
    <div class="av-section-heading">
      <div>
        <h2 class="av-section-heading__title">Gestion actual: 1-2026</h2>
        <p class="av-section-heading__subtitle">Administra cursos, estructura academica y publicacion de contenidos.</p>
      </div>
    </div>

    <AppSkeleton v-if="cargando" :count="3" />

    <div v-else class="row q-col-gutter-md" data-tour="teacher-courses-list">
      <div v-for="curso in cursos" :key="curso.id" class="col-12 col-md-6 col-lg-4">
        <TaCard class="card-item curso-card cursor-pointer" :padding="false" @click="$router.push(`/docente/curso/${curso.id}/builder`)">
          <q-card-section>
            <div class="row items-start">
              <div class="col">
                <q-badge :color="curso.estado === 'publicado' ? 'green' : 'orange'" text-color="white" class="q-mb-sm">
                  {{ curso.estado === 'publicado' ? 'Publicado' : 'Borrador' }}
                </q-badge>
                <div class="text-h6">{{ curso.nombre }}</div>
                <div class="text-caption text-grey-7">{{ curso.codigo }}</div>
                <div class="text-body2 q-mt-sm">{{ curso.descripcion }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-sm text-center">
              <div class="col-4">
                <div class="text-h6 text-primary">{{ curso.total_estudiantes }}</div>
                <div class="text-caption text-grey-7">Estudiantes</div>
              </div>
              <div class="col-4">
                <div class="text-h6 text-teal">{{ curso.total_actividades }}</div>
                <div class="text-caption text-grey-7">Actividades</div>
              </div>
              <div class="col-4">
                <div class="text-h6 text-orange">{{ actividadesCurso(curso) }}/{{ objetivoContenido(curso) }}</div>
                <div class="text-caption text-grey-7">Contenido</div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <div class="q-pa-md row justify-end q-gutter-sm" data-tour="teacher-course-actions">
        <TaButton variant="ghost" icon="edit" label="Builder" customClass="ta-btn-premium" />
        <TaButton variant="ghost" icon="visibility" label="Previsualizar" customClass="text-grey ta-btn-premium" />
          </div>
        </TaCard>
      </div>

      <div v-if="cursos.length === 0" class="col-12 text-center q-pa-xl">
        <q-icon name="library_books" size="64px" :color="$q.dark.isActive ? 'grey-6' : 'grey-4'" />
        <p :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">No tienes cursos creados. Genera uno desde SISA o crea uno manualmente.</p>
      </div>
    </div>

    <q-dialog v-model="nuevoCurso">
      <q-card style="min-width: 400px; border-radius: 20px;">
        <q-card-section>
          <div class="text-h6">Crear Nuevo Curso</div>
        </q-card-section>
        <q-card-section>
          <p class="text-grey-7">Selecciona el modo de creacion:</p>
          <q-list>
            <q-item clickable v-ripple @click="crearDesdeSisa">
              <q-item-section avatar>
                <q-icon name="cloud_download" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Generar desde SISA</q-item-label>
                <q-item-label caption>Importa el PAC desde el sistema SISA</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple @click="crearManual">
              <q-item-section avatar>
                <q-icon name="edit_note" color="teal" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Crear Manualmente</q-item-label>
                <q-item-label caption>Define la estructura desde cero</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <TaButton variant="ghost" label="Cancelar" v-close-popup customClass="text-grey ta-btn-premium" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCursosStore } from 'src/stores/cursos'
import { useAuthStore } from 'src/stores/auth'
import { useActividadesStore } from 'src/stores/actividades'
import { useStaggerCards, useReflectionHover, useButtonPress } from 'src/composables/useAnimations'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'

const $q = useQuasar()
const cursosStore = useCursosStore()
const auth = useAuthStore()
const actividadesStore = useActividadesStore()

const nuevoCurso = ref(false)
const cargando = ref(true)

const cursos = computed(() => {
  return cursosStore.cursos.filter((c) => c.docente_id === auth.usuario?.id)
})

function actividadesCurso(curso) {
  return actividadesStore.actividades.filter((actividad) => curso.secciones.some((seccion) => seccion.id === actividad.seccion_id)).length
}

function objetivoContenido(curso) {
  return Math.max(curso.secciones.length * 4, 1)
}

useStaggerCards('.card-item')
useReflectionHover('.curso-card')
useButtonPress('.ta-btn-premium')

onMounted(() => {
  setTimeout(() => { cargando.value = false }, 600)
})

function crearDesdeSisa() {
  nuevoCurso.value = false
  $q.notify({ message: 'Mock: Conectando con API SISA...', color: 'info', timeout: 2000 })
  setTimeout(() => {
    $q.notify({ message: 'Curso generado desde SISA exitosamente (mock)', color: 'positive', timeout: 3000 })
  }, 1500)
}

function crearManual() {
  nuevoCurso.value = false
  $q.notify({ message: 'Modo manual — disponible en FASE 1', color: 'info', timeout: 2000 })
}
</script>

<style scoped>
.curso-card {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease;
}
.curso-card:hover {
  transform: translateY(-4px);
}
</style>
