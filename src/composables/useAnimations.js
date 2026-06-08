import { onMounted, onUnmounted, nextTick } from 'vue'
import anime from 'animejs'

export function useStaggerCards(selector = '.curso-card') {
  let animation = null

  onMounted(() => {
    animation = anime({
      targets: selector,
      translateY: [24, 0],
      opacity: [0, 1],
      delay: anime.stagger(80, { start: 100 }),
      duration: 500,
      easing: 'easeOutCubic',
    })
  })

  onUnmounted(() => {
    if (animation) anime.remove(selector)
  })
}

export function useCardHover(selector = '.curso-card') {
  let activeListener = null

  function onEnter(el) {
    anime({
      targets: el,
      scale: 1.02,
      boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
      duration: 250,
      easing: 'easeOutCubic',
    })
  }

  function onLeave(el) {
    anime({
      targets: el,
      scale: 1,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      duration: 250,
      easing: 'easeOutCubic',
    })
  }

  onMounted(() => {
    const cards = document.querySelectorAll(selector)
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => onEnter(card))
      card.addEventListener('mouseleave', () => onLeave(card))
    })
    activeListener = { cards, onEnter, onLeave }
  })

  onUnmounted(() => {
    if (activeListener) {
      activeListener.cards.forEach((card) => {
        card.removeEventListener('mouseenter', () => activeListener.onEnter(card))
        card.removeEventListener('mouseleave', () => activeListener.onLeave(card))
      })
    }
  })
}

export function useBarChartAnimation(selector = '.bar-chart__bar') {
  let animation = null

  onMounted(() => {
    animation = anime({
      targets: selector,
      height: [0, (el) => el.dataset.height || '60%'],
      delay: anime.stagger(60, { start: 200 }),
      duration: 1200,
      easing: 'easeOutElastic(1, .6)',
    })
  })

  onUnmounted(() => {
    if (animation) anime.remove(selector)
  })
}

export function useRightPanelStagger(selector = '.right-panel-animate') {
  let animation = null

  onMounted(() => {
    animation = anime({
      targets: selector,
      translateY: [16, 0],
      opacity: [0, 1],
      delay: anime.stagger(70, { start: 300 }),
      duration: 600,
      easing: 'easeOutCubic',
    })
  })

  onUnmounted(() => {
    if (animation) anime.remove(selector)
  })
}

export function useSkeletonPulse() {
  return {
    start(targets) {
      return anime({
        targets,
        opacity: [0.4, 1],
        duration: 800,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
      })
    },
    stop(targets) {
      anime.remove(targets)
    },
  }
}

// ===================== NUEVOS COMPOSABLES PREMIUM =====================

/**
 * Aplica un efecto de reflejo/brillo (shine) en hover a cards.
 * Usa un pseudo-elemento animado con anime.js.
 */
export function useReflectionHover(selector = '.ta-card-reflection') {
  let listeners = []

  onMounted(async () => {
    await nextTick()
    const cards = document.querySelectorAll(selector)
    cards.forEach((card) => {
      // Crear capa de shine si no existe
      let shine = card.querySelector('.ta-card-shine')
      if (!shine) {
        shine = document.createElement('div')
        shine.className = 'ta-card-shine'
        shine.style.cssText = `
          position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.15) 50%, transparent 55%);
          background-size: 200% 200%;
          opacity: 0; pointer-events: none; z-index: 2; mix-blend-mode: overlay;
        `
        card.style.position = card.style.position || 'relative'
        card.style.overflow = 'hidden'
        card.appendChild(shine)
      }

      const onEnter = () => {
        anime.remove(shine)
        anime({
          targets: shine,
          opacity: [0, 1, 0],
          backgroundPosition: ['0% 50%', '200% 50%'],
          duration: 900,
          easing: 'easeOutCubic',
        })
      }

      const onLeave = () => {
        anime.remove(shine)
        anime({
          targets: shine,
          opacity: 0,
          duration: 400,
          easing: 'easeOutQuad',
        })
      }

      card.addEventListener('mouseenter', onEnter)
      card.addEventListener('mouseleave', onLeave)
      listeners.push({ card, onEnter, onLeave })
    })
  })

  onUnmounted(() => {
    listeners.forEach(({ card, onEnter, onLeave }) => {
      card.removeEventListener('mouseenter', onEnter)
      card.removeEventListener('mouseleave', onLeave)
    })
    listeners = []
  })
}

/**
 * Efecto de "press" en botones: escala hacia abajo + retorno suave.
 */
export function useButtonPress(selector = '.ta-btn-premium') {
  let listeners = []

  onMounted(async () => {
    await nextTick()
    const buttons = document.querySelectorAll(selector)
    buttons.forEach((btn) => {
      const onDown = () => {
        anime.remove(btn)
        anime({
          targets: btn,
          scale: 0.96,
          duration: 120,
          easing: 'easeOutQuad',
        })
      }
      const onUp = () => {
        anime.remove(btn)
        anime({
          targets: btn,
          scale: 1,
          duration: 300,
          easing: 'easeOutElastic(1, .5)',
        })
      }
      btn.addEventListener('mousedown', onDown)
      btn.addEventListener('mouseup', onUp)
      btn.addEventListener('mouseleave', onUp)
      listeners.push({ btn, onDown, onUp })
    })
  })

  onUnmounted(() => {
    listeners.forEach(({ btn, onDown, onUp }) => {
      btn.removeEventListener('mousedown', onDown)
      btn.removeEventListener('mouseup', onUp)
      btn.removeEventListener('mouseleave', onUp)
    })
    listeners = []
  })
}

/**
 * Animacion de entrada para paginas completas (fade + slideUp).
 */
export function usePageLoadAnimation(selector = '.page-animate', delay = 0) {
  let animation = null

  onMounted(async () => {
    await nextTick()
    animation = anime({
      targets: selector,
      translateY: [24, 0],
      opacity: [0, 1],
      delay: anime.stagger(60, { start: delay + 100 }),
      duration: 600,
      easing: 'easeOutCubic',
    })
  })

  onUnmounted(() => {
    if (animation) anime.remove(selector)
  })
}

/**
 * Animacion de "ripple" sutil para botones y elementos interactivos.
 */
export function useRippleEffect(selector = '.ta-ripple') {
  let listeners = []

  onMounted(async () => {
    await nextTick()
    const items = document.querySelectorAll(selector)
    items.forEach((el) => {
      const onClick = (e) => {
        const rect = el.getBoundingClientRect()
        const ripple = document.createElement('span')
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2

        ripple.style.cssText = `
          position: absolute; border-radius: 50%;
          width: ${size}px; height: ${size}px;
          left: ${x}px; top: ${y}px;
          background: rgba(255,255,255,0.25);
          pointer-events: none; z-index: 10; transform: scale(0); opacity: 1;
        `
        el.style.position = 'relative'
        el.style.overflow = 'hidden'
        el.appendChild(ripple)

        anime({
          targets: ripple,
          scale: [0, 2.5],
          opacity: [1, 0],
          duration: 600,
          easing: 'easeOutCubic',
          complete: () => ripple.remove(),
        })
      }
      el.addEventListener('click', onClick)
      listeners.push({ el, onClick })
    })
  })

  onUnmounted(() => {
    listeners.forEach(({ el, onClick }) => {
      el.removeEventListener('click', onClick)
    })
    listeners = []
  })
}
