<template>
  <q-page class="av-dashboard-page">
    <AppSkeleton v-if="cargando" variant="list" :count="6" />

    <template v-else>
      <q-form @submit.prevent="guardarCambios">
      <TaPageHeader title="Configuracion del Sistema">
        <template #actions>
          <TaButton variant="outline" icon="security" label="Auditoria" type="button" @click="verAuditoria" />
          <TaButton variant="primary" icon="save" label="Guardar cambios" type="submit" />
        </template>
      </TaPageHeader>

      <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="kpi in kpis" :key="kpi.label" class="col-6 col-lg-3">
        <TaKpiCard class="card-item" :icon="kpi.icon" :icon-color="kpi.color" :label="kpi.label" :value="kpi.value" :trend="kpi.trend" />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-xl-7">
        <TaCard title="Integraciones y servicios" subtitle="Control operativo de APIs externas y servicios LMS" :padding="false" class="card-item q-mb-lg">
          <AppEmptyState
            v-if="!centro.configuraciones.length"
            icon="cloud_off"
            title="Sin integraciones configuradas"
            message="No hay servicios externos registrados en este momento."
          />
          <q-list v-else separator>
            <q-item v-for="config in centro.configuraciones" :key="config.id" class="av-list-item config-item q-py-md">
              <q-item-section avatar>
                <q-avatar :color="colorEstado(config.estado)" text-color="white" size="44px">
                  <q-icon :name="iconoEstado(config.estado)" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ config.nombre }}</q-item-label>
                <q-item-label caption>{{ config.tipo }} · responsable: {{ config.responsable }}</q-item-label>
                <q-item-label caption>Ultimo sync: {{ formatoFecha(config.ultimoSync) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle :model-value="config.estado === 'online'" color="teal" @update:model-value="suite.toggleConfiguracion(config.id)" />
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>

        <TaCard title="Politicas academicas" subtitle="Reglas globales que afectan docentes, estudiantes y directores" :padding="false" class="card-item">
          <AppEmptyState
            v-if="!centro.politicas.length"
            icon="rule_folder"
            title="Sin politicas academicas"
            message="Aun no se han definido reglas globales del sistema."
          />
          <q-list v-else separator>
            <q-item v-for="politica in centro.politicas" :key="politica.id" class="av-list-item config-item q-py-md">
              <q-item-section avatar><q-icon name="rule" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ politica.nombre }}</q-item-label>
                <q-item-label caption>{{ politica.valor }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge class="policy-badge" text-color="white">{{ politica.estado }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </TaCard>
      </div>

      <div class="col-12 col-xl-5">
        <TaCard title="Preferencias visuales" subtitle="Personalizacion institucional del LMS" class="card-item q-mb-lg">
          <div class="text-caption q-mb-md" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Activa las experiencias visuales y de navegacion del LMS.</div>
          <div class="settings-grid">
            <q-toggle v-model="configLocal.animaciones" label="Animaciones premium" color="primary" />
            <q-toggle v-model="configLocal.tutoriales" label="Tutoriales por rol" color="teal" />
            <q-toggle v-model="configLocal.alertas" label="Alertas inteligentes" color="orange" />
            <q-toggle v-model="configLocal.modoCompacto" label="Modo compacto para tablas" color="purple" />
          </div>
          <q-separator class="q-my-md" />
          <q-select v-model="configLocal.tema" :options="temas" label="Tema institucional" outlined :rules="[val => !!val || 'Selecciona un tema institucional']" hint="Afecta los colores y contrastes de toda la plataforma" />
          <q-select v-model="configLocal.densidad" :options="densidades" label="Densidad de interfaz" outlined class="q-mt-md" :rules="[val => !!val || 'Selecciona una densidad de interfaz']" hint="Compacta reduce el espacio entre filas de tablas" />
        </TaCard>

        <TaCard title="Auditoria reciente" subtitle="Eventos relevantes del sistema" :padding="false" class="card-item">
          <AppEmptyState
            v-if="!centro.auditoria.length"
            icon="history"
            title="Sin eventos recientes"
            message="La auditoria del sistema esta vacia."
          />
          <q-list v-else separator>
            <q-item v-for="evento in centro.auditoria" :key="evento.id" class="av-list-item config-item q-py-md">
              <q-item-section avatar>
                <q-avatar :color="evento.tipo === 'success' ? 'positive' : 'warning'" :text-color="evento.tipo === 'success' ? 'white' : 'black'" size="38px">
                  <q-icon :name="evento.tipo === 'success' ? 'check' : 'warning'" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ evento.accion }}</q-item-label>
                <q-item-label caption>{{ evento.detalle }}</q-item-label>
              </q-item-section>
              <q-item-section side><div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ evento.fecha }}</div></q-item-section>
            </q-item>
          </q-list>
        </TaCard>
      </div>
    </div>
      </q-form>
    </template>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useSuiteRolesStore } from 'src/stores/suiteRoles'
import TaPageHeader from 'src/components/tailadmin/TaPageHeader.vue'
import TaCard from 'src/components/tailadmin/TaCard.vue'
import TaButton from 'src/components/tailadmin/TaButton.vue'
import TaKpiCard from 'src/components/tailadmin/TaKpiCard.vue'
import AppSkeleton from 'src/components/ui/AppSkeleton.vue'
import AppEmptyState from 'src/components/ui/AppEmptyState.vue'
import { useStaggerCards } from 'src/composables/useAnimations'
import { useLoadingState } from 'src/composables/useLoadingState'

const $q = useQuasar()
const suite = useSuiteRolesStore()
const { isLoading: cargando, stop: finalizarCarga } = useLoadingState({ minDuration: 600 })
const centro = computed(() => suite.centroAdmin())
const configLocal = ref({ animaciones: true, tutoriales: true, alertas: true, modoCompacto: false, tema: 'UNITEPC Premium', densidad: 'Confortable' })
const temas = ['UNITEPC Premium', 'Institucional claro', 'Institucional oscuro']
const densidades = ['Confortable', 'Compacta', 'Amplia']

const kpis = computed(() => [
  { label: 'Integraciones', value: centro.value.integraciones.length, icon: 'hub', color: '#6B3FA0', trend: 0 },
  { label: 'Online', value: centro.value.configuraciones.filter((c) => c.estado === 'online').length, icon: 'check_circle', color: '#0D9488', trend: 2 },
  { label: 'Alertas config', value: centro.value.configuraciones.filter((c) => c.estado !== 'online').length, icon: 'warning', color: '#F59E0B', trend: -1 },
  { label: 'Politicas', value: centro.value.politicas.length, icon: 'rule', color: '#10b981', trend: 1 },
])

function colorEstado(estado) { return { online: 'green', degradado: 'orange', pausado: 'grey' }[estado] || 'red' }
function iconoEstado(estado) { return estado === 'online' ? 'check_circle' : estado === 'pausado' ? 'pause_circle' : 'warning' }
function formatoFecha(fecha) { return new Date(fecha).toLocaleString('es-BO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
function guardarCambios() { suite.registrarAccion('admin', 'Configuracion guardada'); $q.notify({ message: 'Configuracion guardada (mock)', color: 'positive', icon: 'save' }) }
function verAuditoria() { $q.notify({ message: 'Auditoria completa disponible en backend futuro', color: 'info', icon: 'security' }) }

useStaggerCards('.card-item')

onMounted(() => {
  finalizarCarga()
})
</script>

<style scoped>
.settings-grid {
  display: grid;
  gap: 14px;
  padding: 6px;
  border: 1px solid var(--ta-border-card);
  border-radius: 16px;
  background: var(--ta-bg-card);
}
.body--dark .settings-grid {
  background: rgba(255, 255, 255, 0.02);
}
.config-item {
  border-radius: 14px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.config-item:hover {
  background: rgba(var(--primary-rgb), 0.04);
  transform: translateX(2px);
}
.body--dark .config-item:hover {
  background: rgba(255, 255, 255, 0.03);
}
.policy-badge {
  background: rgba(var(--accent-rgb), 0.12);
  color: var(--ta-info);
}
.body--dark .policy-badge {
  background: rgba(var(--accent-rgb), 0.18);
  color: var(--ta-text-primary);
}
</style>
