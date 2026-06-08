<template>
  <div class="fullscreen error-404 flex flex-center q-pa-md">
    <div class="text-center" style="max-width: 500px">
      <!-- Ilustracion animada: 404 -->
      <div class="relative flex justify-center items-center q-mb-lg" style="height: 160px">
        <!-- Planeta de fondo -->
        <div
          ref="planetRef"
          class="absolute rounded-full"
          style="width: 100px; height: 100px; background: linear-gradient(135deg, #6B3FA0, #0D9488); opacity: 0.14; filter: blur(20px);"
        />
        <!-- Numero 404 -->
        <div ref="num404Ref" class="text-404 text-weight-black relative" style="font-size: 100px; line-height: 1; letter-spacing: 0;">
          404
        </div>
      </div>

      <!-- Texto -->
      <div ref="contentRef">
        <div class="text-h5 text-weight-bold q-mb-sm" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
          Pagina no encontrada
        </div>
        <p class="text-body2 q-mb-xl" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">
          Parece que te perdiste en el espacio digital. La pagina que buscas no existe o ha sido movida.
        </p>

        <q-btn
          ref="btnRef"
          unelevated
          color="primary"
          text-color="white"
          size="md"
          to="/"
          label="Volver al inicio"
          icon="home"
          class="text-weight-bold"
          style="border-radius: 12px; padding: 8px 24px"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import anime from 'animejs'

const $q = useQuasar()
const planetRef = ref(null)
const num404Ref = ref(null)
const contentRef = ref(null)
const btnRef = ref(null)

onMounted(() => {
  const tl = anime.timeline({ easing: 'easeOutCubic' })

  // 1. Planeta aparece (scale + fade)
  if (planetRef.value) {
    tl.add({
      targets: planetRef.value,
      scale: [0.5, 1],
      opacity: [0, 0.12],
      duration: 800,
    }, 0)

    // Planeta pulsa en loop infinito
    anime({
      targets: planetRef.value,
      scale: [1, 1.2, 1],
      opacity: [0.08, 0.15, 0.08],
      duration: 4000,
      loop: true,
      easing: 'easeInOutSine',
    })
  }

  // 2. 404: entrada desde arriba + scale
  if (num404Ref.value) {
    tl.add({
      targets: num404Ref.value,
      translateY: [-40, 0],
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 700,
    }, 100)

    // Flotacion continua
    anime({
      targets: num404Ref.value,
      translateY: [-6, 6],
      duration: 3000,
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine',
      delay: 800,
    })
  }

  // 3. Contenido: fade in + slide up
  if (contentRef.value) {
    tl.add({
      targets: contentRef.value.children,
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      duration: 500,
    }, 400)
  }

  // 4. Boton: scale bounce
  if (btnRef.value?.$el) {
    tl.add({
      targets: btnRef.value.$el,
      scale: [0.9, 1.05, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutElastic(1, .5)',
    }, 700)
  }
})
</script>

<style scoped>
.error-404 {
  background: linear-gradient(135deg, #fbfbfd 0%, #eefaf8 100%);
}
.body--dark .error-404 {
  background: linear-gradient(135deg, #0b1121 0%, #182F33 100%);
}

.text-404 {
  color: #6B3FA0;
  text-shadow: 0 8px 30px rgba(13, 148, 136, 0.18);
}
.body--dark .text-404 {
  color: #A78BFA;
  text-shadow: 0 8px 30px rgba(13, 148, 136, 0.14);
}
</style>
