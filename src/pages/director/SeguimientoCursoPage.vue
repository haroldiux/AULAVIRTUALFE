<template>
  <q-page class="av-dashboard-page">
    <TaPageHeader title="Seguimiento de Cursos" data-tour="director-tracking-header" />

    <TaCard class="card-item" data-tour="director-tracking-table">
      <q-table
        :rows="cursosExtendidos"
        :columns="columns"
        row-key="id"
      >
        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="props.row.estado === 'publicado' ? 'green' : 'orange'">
              {{ props.row.estado === 'publicado' ? 'Publicado' : 'Borrador' }}
            </q-badge>
          </q-td>
        </template>
        <template #body-cell-avance="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-sm">
              <q-linear-progress
                :value="props.row.avance / 100"
                size="8px"
                :color="props.row.avance > 50 ? 'green' : 'orange'"
                style="width: 80px"
                rounded
              />
              <span class="text-caption">{{ props.row.avance }}%</span>
            </div>
          </q-td>
        </template>
        <template #body-cell-acciones="props">
          <q-td :props="props">
            <TaButton variant="ghost" icon="visibility" custom-class="q-pa-sm" />
            <TaButton variant="ghost" icon="assessment" custom-class="q-pa-sm" />
          </q-td>
        </template>
      </q-table>
    </TaCard>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useCursosStore } from 'src/stores/cursos'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import { useStaggerCards } from 'src/composables/useAnimations'

useStaggerCards('.card-item')

const cursosStore = useCursosStore()

const columns = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Curso', field: 'nombre', align: 'left', sortable: true },
  { name: 'docente', label: 'Docente', field: 'docente', align: 'left' },
  { name: 'estudiantes', label: 'Est.', field: 'estudiantes', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'avance', label: 'Avance', field: 'avance', align: 'left' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const cursosExtendidos = computed(() => [
  { ...cursosStore.cursos[0], docente: 'Dr. Carlos Mendoza', avance: 68 },
  { ...cursosStore.cursos[1], docente: 'Dr. Carlos Mendoza', avance: 45 },
  { ...cursosStore.cursos[2], docente: 'Dra. Maria Rios', avance: 0 },
])
</script>
