/**
 * Las fichas de los proyectos: un `<dialog>` por proyecto, ya en el HTML.
 *
 * El navegador hace casi todo. `showModal()` deja inerte el resto de la página,
 * lleva el foco adentro y lo devuelve a la lámina al cerrar, y Escape cierra.
 * Aquí queda lo que el navegador no hace solo: abrir, cerrar con su botón o al
 * tocar el velo, abrir la ficha que pida la dirección (/#ponlenota) y que la
 * ficha salga de su lámina y vuelva a ella, en vez de aparecer de la nada.
 *
 * Va con Web Animations y no con View Transitions: Safari no captura bien un
 * `<dialog>` modal en una View Transition, y lo pinta en su sitio final
 * debajo del que viaja.
 */

const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)')

// Entra o sale algo: ease-out, como el resto del sitio (--ease-out). La curva
// va en el primer fotograma y no en la animación entera, para que los puntos
// intermedios de la opacidad se cuenten en tiempo y no sobre la curva.
const DURACION = 420
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'

// Los dos estados de la ficha, medidos ahora. En la lámina, la ficha toma su
// ancho, se pone encima y se recorta a su alto y a su radio; en su sitio no
// lleva nada de eso. El recorte se mide en px de la ficha sin escalar, que es
// donde se aplica.
function formas(ficha, lamina) {
  const desde = lamina.getBoundingClientRect()
  const hasta = ficha.getBoundingClientRect()
  const escala = desde.width / hasta.width
  const radio = (elemento) => parseFloat(getComputedStyle(elemento).borderTopLeftRadius)
  const sobra = Math.max(0, hasta.height - desde.height / escala)
  return {
    enLamina: {
      transform: `translate(${desde.left - hasta.left}px, ${desde.top - hasta.top}px) scale(${escala})`,
      clipPath: `inset(0 0 ${sobra}px 0 round ${radio(lamina) / escala}px)`,
      opacity: 0,
    },
    enSuSitio: {
      transform: 'none',
      clipPath: `inset(0 0 0 0 round ${radio(ficha)}px)`,
      opacity: 1,
    },
  }
}

export default function initFichas() {
  for (const boton of document.querySelectorAll('[data-ficha]')) {
    const ficha = document.getElementById(boton.dataset.ficha)
    const lamina = boton.closest('.obra')
    let animacion = null
    let cerrando = false

    const abrir = () => {
      // Cada vez se abre por arriba, no donde se dejó la vez anterior.
      ficha.scrollTop = 0
      ficha.showModal()
      if (movimientoReducido.matches) return
      const { enLamina, enSuSitio } = formas(ficha, lamina)
      // Aparece sobre la lámina en el primer tercio, mientras crece.
      animacion = ficha.animate([{ ...enLamina, easing: EASE_OUT }, { opacity: 1, offset: 0.3 }, enSuSitio], DURACION)
    }

    const cerrar = () => {
      if (cerrando) return
      if (movimientoReducido.matches) return ficha.close()
      cerrando = true
      if (animacion?.playState === 'running') {
        // A medio abrir: vuelve por donde venía.
        animacion.reverse()
      } else {
        const { enLamina, enSuSitio } = formas(ficha, lamina)
        // Se apaga al final, cuando ya está sobre la lámina.
        animacion = ficha.animate([{ ...enSuSitio, easing: EASE_OUT }, { opacity: 1, offset: 0.6 }, enLamina], DURACION)
      }
      ficha.animate({ opacity: [1, 0] }, { duration: DURACION, easing: EASE_OUT, pseudoElement: '::backdrop' })
      animacion.onfinish = () => ficha.close()
    }

    // Se cierre como se cierre (también con un Escape que no se deja
    // detener), lo que quede animándose ya no tiene sentido.
    ficha.addEventListener('close', () => {
      cerrando = false
      animacion?.cancel()
    })

    boton.addEventListener('click', abrir)

    // Un botón y no un `<form method="dialog">`: la ficha solo se abre con
    // JavaScript, y un formulario de más Lighthouse lo cuenta como uno sin
    // anotar para los agentes de IA (WebMCP).
    ficha.querySelector('.ficha-cerrar').addEventListener('click', cerrar)

    // Escape. Si el navegador no deja detenerlo, cierra a su manera.
    ficha.addEventListener('cancel', (evento) => {
      if (!evento.cancelable) return
      evento.preventDefault()
      cerrar()
    })

    // El panel ocupa todo el `<dialog>`: un toque que llega al propio
    // `<dialog>` cayó fuera del panel, en el velo.
    ficha.addEventListener('click', (evento) => {
      if (evento.target === ficha) cerrar()
    })
  }

  if (location.hash) {
    document.querySelector(`[data-ficha="ficha-${CSS.escape(location.hash.slice(1))}"]`)?.click()
  }
}
