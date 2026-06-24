<template>
  <q-page class="av-dashboard-page q-pa-none flex no-wrap" style="height: calc(100vh - 70px); min-height: 0;">
    <!-- Panel Izquierdo: Lista de Chats -->
    <div class="chats-sidebar border-right flex column">
      <div class="q-pa-md border-bottom bg-glass flex items-center justify-between">
        <h2 class="text-h6 text-weight-bold q-my-none">Mensajes</h2>
        <TaButton 
          variant="primary" 
          icon="add" 
          label="Nuevo Chat" 
          dense 
          size="sm" 
          @click="abrirNuevoChat" 
        />
      </div>

      <!-- Buscador de Chats -->
      <div class="q-px-md q-py-sm border-bottom">
        <q-input
          v-model="filtroBusqueda"
          placeholder="Buscar conversación..."
          outlined
          dense
          clearable
        >
          <template #prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
      </div>

      <!-- Lista de Conversaciones -->
      <q-scroll-area class="col flex-1">
        <q-list separator>
          <q-item
            v-for="conv in conversacionesFiltradas"
            :key="conv.id"
            clickable
            v-ripple
            :active="conversacionActiva?.id === conv.id"
            active-class="chat-item--active"
            class="chat-item"
            @click="seleccionarConversacion(conv)"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" size="42px">
                <img v-if="conv.otro_participante?.avatar" :src="conv.otro_participante.avatar" />
                <span v-else>{{ obtenerIniciales(conv.otro_participante?.nombre) }}</span>
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold row items-center justify-between no-wrap">
                <span class="ellipsis">{{ conv.otro_participante?.nombre || conv.asunto }}</span>
                <span class="text-caption text-weight-regular text-grey-6 q-ml-xs">
                  {{ formatearHora(conv.updated_at) }}
                </span>
              </q-item-label>
              <q-item-label caption lines="1" class="row items-center justify-between no-wrap">
                <span class="ellipsis text-grey-7">
                  <span v-if="conv.ultimo_mensaje?.remitente_id === auth.usuario?.id" class="text-weight-medium">Yo: </span>
                  {{ conv.ultimo_mensaje?.contenido || 'Sin mensajes aún' }}
                </span>
                <q-badge v-if="conv.no_leidos > 0" color="negative" rounded class="q-ml-sm">
                  {{ conv.no_leidos }}
                </q-badge>
              </q-item-label>
              <q-item-label caption class="text-xs text-grey-5 q-mt-xs">
                {{ conv.otro_participante?.rol }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <div v-if="conversacionesFiltradas.length === 0" class="text-center q-pa-xl text-grey-6">
            <q-icon name="chat" size="48px" color="grey-4" />
            <p class="q-mt-sm">No se encontraron conversaciones.</p>
          </div>
        </q-list>
      </q-scroll-area>
    </div>

    <!-- Panel Derecho: Conversación Activa -->
    <div class="chat-main col flex column bg-glass-soft">
      <template v-if="conversacionActiva">
        <!-- Cabecera de Chat -->
        <div class="q-pa-md border-bottom bg-glass flex items-center">
          <q-avatar color="primary" text-color="white" size="40px" class="q-mr-md">
            <img v-if="conversacionActiva.otro_participante?.avatar" :src="conversacionActiva.otro_participante.avatar" />
            <span v-else>{{ obtenerIniciales(conversacionActiva.otro_participante?.nombre) }}</span>
          </q-avatar>
          <div>
            <div class="text-subtitle1 text-weight-bold">{{ conversacionActiva.otro_participante?.nombre }}</div>
            <div class="text-caption text-grey-6">
              {{ conversacionActiva.otro_participante?.rol }} · {{ conversacionActiva.otro_participante?.email }}
            </div>
          </div>
        </div>

        <!-- Historial de Mensajes -->
        <q-scroll-area ref="chatScroll" class="col flex-1 q-pa-md">
          <div class="q-gutter-y-md">
            <div 
              v-for="msg in listaMensajes" 
              :key="msg.id" 
              class="row"
              :class="msg.remitente_id === auth.usuario?.id ? 'justify-end' : 'justify-start'"
            >
              <div class="flex items-end q-gutter-x-sm" :class="msg.remitente_id === auth.usuario?.id ? 'row-reverse' : ''">
                <!-- Avatar en mensajes recibidos -->
                <q-avatar v-if="msg.remitente_id !== auth.usuario?.id" color="primary" text-color="white" size="28px" class="q-mb-xs">
                  <img v-if="msg.remitente_avatar" :src="msg.remitente_avatar" />
                  <span v-else>{{ obtenerIniciales(msg.remitente_nombre) }}</span>
                </q-avatar>

                <div>
                  <div 
                    class="message-bubble"
                    :class="msg.remitente_id === auth.usuario?.id ? 'message-bubble--outgoing' : 'message-bubble--incoming'"
                  >
                    <div class="text-body2 whitespace-pre-wrap">{{ msg.contenido }}</div>
                  </div>
                  <div 
                    class="text-caption text-grey-5 q-mt-xs"
                    :style="{ textAlign: msg.remitente_id === auth.usuario?.id ? 'right' : 'left' }"
                  >
                    {{ formatearHoraCompleta(msg.created_at) }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="listaMensajes.length === 0" class="text-center q-pa-xl text-grey-5">
              Comienza la conversación enviando un mensaje abajo.
            </div>
          </div>
        </q-scroll-area>

        <!-- Barra de Envío -->
        <div class="q-pa-md border-top bg-glass">
          <q-form @submit.prevent="enviarMensaje" class="row q-col-gutter-sm items-center">
            <div class="col">
              <q-input
                v-model="nuevoMensajeTexto"
                placeholder="Escribe tu mensaje aquí..."
                outlined
                dense
                autofocus
                @keydown.enter.prevent="enviarMensaje"
              />
            </div>
            <div class="col-auto">
              <q-btn
                type="submit"
                color="primary"
                icon="send"
                round
                dense
                :disable="!nuevoMensajeTexto.trim()"
              />
            </div>
          </q-form>
        </div>
      </template>

      <!-- Pantalla de Selección Vacía -->
      <template v-else>
        <div class="fit flex flex-center">
          <div class="text-center text-grey-6">
            <q-icon name="forum" size="76px" color="grey-3" />
            <h5 class="q-my-md text-weight-medium">Bandeja de Mensajes</h5>
            <p>Selecciona un chat de la lista o inicia uno nuevo con tus contactos.</p>
            <TaButton 
              variant="primary" 
              icon="add" 
              label="Iniciar Nueva Conversación" 
              @click="abrirNuevoChat" 
              class="q-mt-sm"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Diálogo Selección de Contacto (Nuevo Chat) -->
    <q-dialog v-model="dialogoNuevoChat">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">Iniciar Conversación</div>
          <p class="text-grey-7 q-mb-none">Selecciona un docente o estudiante de tus asignaturas.</p>
        </q-card-section>

        <!-- Filtro contactos -->
        <q-card-section class="q-py-none">
          <q-input
            v-model="filtroContactos"
            placeholder="Buscar contacto..."
            outlined
            dense
            clearable
            class="q-mb-sm"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="q-py-sm overflow-auto" style="max-height: 350px;">
          <q-list bordered separator v-if="contactosFiltrados.length > 0">
            <q-item 
              v-for="contacto in contactosFiltrados" 
              :key="contacto.id" 
              clickable 
              v-ripple
              @click="prepararPrimerMensaje(contacto)"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="36px">
                  <img v-if="contacto.avatar" :src="contacto.avatar" />
                  <span v-else>{{ obtenerIniciales(contacto.nombre) }}</span>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ contacto.nombre }}</q-item-label>
                <q-item-label caption>{{ contacto.email }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="grey-3" text-color="grey-8">
                  {{ contacto.rol }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="text-center q-pa-lg text-grey-6">
            <q-icon name="person_off" size="36px" color="grey-4" />
            <p class="q-mt-sm">No se encontraron contactos disponibles.</p>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <TaButton variant="ghost" label="Cancelar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo Redactar Primer Mensaje -->
    <q-dialog v-model="dialogoPrimerMensaje" persistent>
      <q-card class="dialog-card">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar color="primary" text-color="white" size="36px" class="q-mr-sm">
            <img v-if="contactoSeleccionado?.avatar" :src="contactoSeleccionado.avatar" />
            <span v-else>{{ obtenerIniciales(contactoSeleccionado?.nombre) }}</span>
          </q-avatar>
          <div>
            <div class="text-h6">Chat con {{ contactoSeleccionado?.nombre }}</div>
            <div class="text-caption text-grey-6">{{ contactoSeleccionado?.email }}</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="dialogoPrimerMensaje = false" />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="asuntoPrimerMensaje"
            label="Asunto / Tema del Chat"
            outlined
            dense
            class="q-mb-md"
            placeholder="Ej: Duda sobre práctica 3"
          />
          <q-input
            v-model="primerMensajeTexto"
            label="Mensaje Inicial"
            outlined
            type="textarea"
            rows="3"
            autofocus
            placeholder="Escribe el primer mensaje para iniciar el chat..."
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <TaButton variant="ghost" label="Cancelar" @click="dialogoPrimerMensaje = false" />
          <TaButton 
            variant="primary" 
            label="Enviar e Iniciar Chat" 
            :disable="!primerMensajeTexto.trim()" 
            @click="confirmarPrimerMensaje" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useCursosStore } from 'src/stores/cursos'
import { mensajeService } from 'src/services/mensajeService.js'
import TaButton from 'src/components/tailadmin/TaButton.vue'

const $q = useQuasar()
const auth = useAuthStore()
const cursosStore = useCursosStore()

const filtroBusqueda = ref('')
const conversaciones = ref([])
const conversacionActiva = ref(null)

const listaMensajes = ref([])
const nuevoMensajeTexto = ref('')
const chatScroll = ref(null)

// Diálogo nuevo chat
const dialogoNuevoChat = ref(false)
const contactos = ref([])
const filtroContactos = ref('')

// Diálogo primer mensaje
const dialogoPrimerMensaje = ref(false)
const contactoSeleccionado = ref(null)
const asuntoPrimerMensaje = ref('')
const primerMensajeTexto = ref('')

const conversacionesFiltradas = computed(() => {
  if (!filtroBusqueda.value.trim()) return conversaciones.value
  const query = filtroBusqueda.value.toLowerCase()
  return conversaciones.value.filter(c => {
    const nombre = c.otro_participante?.nombre?.toLowerCase() || ''
    const asunto = c.asunto?.toLowerCase() || ''
    const ultimo = c.ultimo_mensaje?.contenido?.toLowerCase() || ''
    return nombre.includes(query) || asunto.includes(query) || ultimo.includes(query)
  })
})

const contactosFiltrados = computed(() => {
  if (!filtroContactos.value.trim()) return contactos.value
  const query = filtroContactos.value.toLowerCase()
  return contactos.value.filter(c => {
    return c.nombre.toLowerCase().includes(query) || c.email.toLowerCase().includes(query)
  })
})

// Carga inicial
async function cargarConversaciones(autoSelectId = null) {
  try {
    const res = await mensajeService.listarConversaciones()
    conversaciones.value = res.data?.data || res.data || []
    
    if (autoSelectId) {
      const encontrada = conversaciones.value.find(c => c.id === autoSelectId)
      if (encontrada) seleccionarConversacion(encontrada)
    }
  } catch (err) {
    console.error('Error al cargar conversaciones:', err)
  }
}

// Seleccionar chat
async function seleccionarConversacion(conv) {
  conversacionActiva.value = conv
  try {
    const res = await mensajeService.obtenerMensajes(conv.id)
    listaMensajes.value = res.data?.data || res.data || []
    
    // Marcar como leído
    if (conv.no_leidos > 0) {
      await mensajeService.marcarLeido(conv.id)
      conv.no_leidos = 0
    }
    
    scrollDown()
  } catch (err) {
    console.error(err)
  }
}

// Enviar mensaje en chat activo
async function enviarMensaje() {
  if (!nuevoMensajeTexto.value.trim() || !conversacionActiva.value) return
  const convId = conversacionActiva.value.id
  const texto = nuevoMensajeTexto.value
  nuevoMensajeTexto.value = ''
  
  try {
    const res = await mensajeService.enviar(convId, texto)
    const msg = res.data?.data || res.data
    listaMensajes.value.push(msg)
    
    // Actualizar último mensaje de la conversación en la barra lateral
    const conv = conversaciones.value.find(c => c.id === convId)
    if (conv) {
      conv.ultimo_mensaje = {
        contenido: texto,
        remitente_id: auth.usuario?.id,
        created_at: new Date().toISOString()
      }
      conv.updated_at = new Date().toISOString()
      // Reordenar conversaciones para subir el chat activo al principio
      conversaciones.value.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    }

    scrollDown()
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al enviar mensaje', color: 'negative', timeout: 2000 })
  }
}

// Abrir diálogo de contactos
async function abrirNuevoChat() {
  dialogoNuevoChat.value = true
  filtroContactos.value = ''
  try {
    const res = await mensajeService.obtenerContactos()
    contactos.value = res.data?.data || res.data || []
  } catch (err) {
    console.error(err)
  }
}

// Preparar envío inicial
function prepararPrimerMensaje(contacto) {
  contactoSeleccionado.value = contacto
  asuntoPrimerMensaje.value = ''
  primerMensajeTexto.value = ''
  dialogoNuevoChat.value = false
  dialogoPrimerMensaje.value = true
}

// Confirmar e iniciar chat
async function confirmarPrimerMensaje() {
  if (!primerMensajeTexto.value.trim() || !contactoSeleccionado.value) return
  const data = {
    usuario_id: contactoSeleccionado.value.id,
    mensaje: primerMensajeTexto.value,
    asunto: asuntoPrimerMensaje.value || null
  }
  
  try {
    const res = await mensajeService.crearConversacion(
      data.usuario_id, 
      data.mensaje, 
      null, 
      data.asunto
    )
    const resp = res.data?.data || res.data
    dialogoPrimerMensaje.value = false
    
    // Recargar y seleccionar automáticamente la conversación
    await cargarConversaciones(resp.conversacion_id)
    $q.notify({ message: 'Conversación iniciada con éxito', color: 'positive', timeout: 1500 })
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Error al iniciar conversación', color: 'negative', timeout: 3000 })
  }
}

// Helpers
function scrollDown() {
  nextTick(() => {
    if (chatScroll.value) {
      chatScroll.value.setScrollPosition('vertical', 99999, 100)
    }
  })
}

function obtenerIniciales(nombre) {
  if (!nombre) return ''
  const partes = nombre.split(' ')
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase()
  }
  return nombre.slice(0, 2).toUpperCase()
}

function formatearHora(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function formatearHoraCompleta(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(async () => {
  await cursosStore.cargarCursos()
  cargarConversaciones()
})
</script>

<style scoped>
.chats-sidebar {
  width: 320px;
  background: var(--ta-bg-card);
  height: 100%;
}

.chat-main {
  height: 100%;
}

.border-right {
  border-right: 1px solid var(--ta-border-card);
}

.border-bottom {
  border-bottom: 1px solid var(--ta-border-card);
}

.border-top {
  border-top: 1px solid var(--ta-border-card);
}

.bg-glass {
  background: rgba(var(--primary-rgb), 0.03);
}

.bg-glass-soft {
  background: rgba(var(--primary-rgb), 0.01);
}

.chat-item {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(var(--primary-rgb), 0.02);
}

.chat-item:hover {
  background: rgba(var(--primary-rgb), 0.03);
}

.chat-item--active {
  background: rgba(var(--primary-rgb), 0.08) !important;
  color: var(--ta-primary);
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 14px;
  max-width: 480px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}

.message-bubble--outgoing {
  background: var(--gradient-unitepc);
  color: white;
  border-bottom-right-radius: 2px;
}

.message-bubble--incoming {
  background: var(--ta-border-card);
  color: var(--ta-text-primary);
  border-bottom-left-radius: 2px;
}
.body--dark .message-bubble--incoming {
  background: rgba(255, 255, 255, 0.08);
}

.dialog-card {
  width: min(500px, 92vw);
  border-radius: 20px;
}

.row-reverse {
  flex-direction: row-reverse;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}

.min-width-0 {
  min-width: 0;
}
</style>
