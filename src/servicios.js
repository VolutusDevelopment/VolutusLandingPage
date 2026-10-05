/**
 * Los servicios: girar la rueda.
 *
 * La rueda entera es CSS (Servicios.css): cada card calcula su lugar en el
 * anillo a partir de un solo número, `--giro`, y el HTML ya llega con la
 * primera al frente. Esto anima ese número y marca cuál quedó delante.
 *
 * Se gira de cuatro formas, y todas terminan con una card al frente:
 * eligiéndola abajo o con las flechas, pulsando una que asoma, arrastrando
 * (al soltar sigue con su impulso) y con el trackpad de lado. Siempre por el
 * camino corto, y con un resorte: arranca sin demora y se asienta sin golpe.
 *
 * En S no hay rueda: el mazo que se apila es solo CSS.
 */
import { quieto } from './lib/movimiento.js'

// Un resorte apenas subamortiguado: el rebote al llegar es casi imperceptible,
// el de una rueda con algo de peso.
const RIGIDEZ = 90
const AMORTIGUACION = 15.4
// Lo que se mueve el puntero antes de que un clic pase a ser arrastre.
const ARRANQUE = 6
// Cuánto gira un píxel de arrastre o de trackpad, medido contra el radio del
// anillo: una card cuesta el mismo recorrido de dedo en cualquier pantalla.
const ARRASTRE = 83
const TRACKPAD = 65
// Cuánto sigue la rueda al soltarla, en segundos de la velocidad que llevaba.
const INERCIA = 0.22

/** Lleva un ángulo a (-180, 180]: la diferencia que da el camino corto. */
const corto = (grados) => (((grados % 360) + 540) % 360) - 180

export default function initServicios() {
  const rueda = document.querySelector('.rueda')
  // La misma condición que arma la rueda en el CSS. Sin ella queda el mazo de
  // S o la rejilla de respaldo, y no hay nada que girar.
  const anillo = matchMedia('(min-width: 768px) and (scripting: enabled)')
  if (!rueda || !CSS.supports('rotate', 'calc(1deg * sin(1deg))')) return

  const servicios = [...rueda.querySelectorAll('.servicio')]
  const chips = [...document.querySelectorAll('.servicios-chip')]
  const aviso = document.querySelector('.servicios-aviso')
  const paso = 360 / servicios.length

  let giro = 0
  let objetivo = 0
  let velocidad = 0
  let cuadro = 0
  let activo = 0
  let anunciado = 0
  let arrastre = null
  let ignorarClicHasta = 0
  let porPxTrackpad = 0
  let reposo = 0
  let inclinada = null

  const porPx = (constante) => constante / parseFloat(getComputedStyle(rueda).getPropertyValue('--radio'))

  function dibujar() {
    rueda.style.setProperty('--giro', giro.toFixed(2))
    const n = servicios.length
    const frente = (((Math.round(giro / paso) % n) + n) % n)
    if (frente === activo) return
    servicios[activo].classList.remove('activo')
    chips[activo].removeAttribute('aria-current')
    activo = frente
    servicios[activo].classList.add('activo')
    chips[activo].setAttribute('aria-current', 'true')
    enderezar()
  }

  // Se avisa cuando la rueda se detiene, no a cada card que pasa por delante.
  function anunciar() {
    if (activo === anunciado) return
    anunciado = activo
    aviso.textContent = `Al frente: ${servicios[activo].querySelector('.servicio-nombre').textContent}`
  }

  function animar() {
    cancelAnimationFrame(cuadro)
    if (quieto()) {
      giro = objetivo
      velocidad = 0
      dibujar()
      anunciar()
      return
    }
    let previo = performance.now()
    const avanzar = (ahora) => {
      // Un cuadro largo (la pestaña en segundo plano) no puede disparar el resorte.
      const dt = Math.min((ahora - previo) / 1000, 1 / 30)
      previo = ahora
      velocidad += (RIGIDEZ * (objetivo - giro) - AMORTIGUACION * velocidad) * dt
      giro += velocidad * dt
      // A una décima de grado ya no se ve moverse: ahí se da por llegada.
      const quieta = Math.abs(objetivo - giro) < 0.1 && Math.abs(velocidad) < 1
      if (quieta) {
        giro = objetivo
        velocidad = 0
      }
      dibujar()
      if (quieta) {
        cuadro = 0
        anunciar()
      } else {
        cuadro = requestAnimationFrame(avanzar)
      }
    }
    cuadro = requestAnimationFrame(avanzar)
  }

  function detener() {
    cancelAnimationFrame(cuadro)
    cuadro = 0
    velocidad = 0
  }

  function irA(i) {
    objetivo += corto(i * paso - objetivo)
    animar()
  }

  chips.forEach((chip, i) => chip.addEventListener('click', () => irA(i)))
  for (const flecha of document.querySelectorAll('.servicios-flecha')) {
    flecha.addEventListener('click', () => {
      objetivo = Math.round(objetivo / paso) * paso + Number(flecha.dataset.sentido) * paso
      animar()
    })
  }

  // Una card que asoma se trae al frente con un clic, o cuando le llega el
  // foco del teclado (su enlace), para que nunca se enfoque algo tapado.
  function traer(e) {
    const i = servicios.indexOf(e.target.closest('.servicio'))
    if (anillo.matches && i >= 0 && i !== activo) irA(i)
  }
  rueda.addEventListener('click', traer)
  rueda.addEventListener('focusin', traer)

  // El clic que cierra un arrastre no es un clic: no trae la card soltada.
  rueda.addEventListener(
    'click',
    (e) => {
      if (e.timeStamp > ignorarClicHasta) return
      e.preventDefault()
      e.stopPropagation()
    },
    true,
  )

  rueda.addEventListener('pointerdown', (e) => {
    if (!anillo.matches || e.button !== 0) return
    // Agarrarla la frena, como a una rueda de verdad.
    detener()
    arrastre = { x: e.clientX, giro, t: e.timeStamp, movido: false, porPx: porPx(ARRASTRE) }
  })

  rueda.addEventListener('pointermove', (e) => {
    if (!arrastre) {
      inclinar(e)
      return
    }
    const dx = e.clientX - arrastre.x
    if (!arrastre.movido) {
      if (Math.abs(dx) < ARRANQUE) return
      arrastre.movido = true
      rueda.setPointerCapture(e.pointerId)
      rueda.classList.add('arrastrando')
      enderezar()
      // Si el gesto empezó como selección de texto, deja de serlo.
      getSelection()?.removeAllRanges()
    }
    const nuevo = arrastre.giro - dx * arrastre.porPx
    const dt = Math.max((e.timeStamp - arrastre.t) / 1000, 0.001)
    velocidad = 0.8 * ((nuevo - giro) / dt) + 0.2 * velocidad
    arrastre.t = e.timeStamp
    giro = objetivo = nuevo
    dibujar()
  })

  function soltar(e) {
    if (!arrastre) return
    const { movido, t } = arrastre
    arrastre = null
    // Sin arrastre, la rueda sigue hacia donde iba.
    if (!movido) {
      animar()
      return
    }
    rueda.classList.remove('arrastrando')
    ignorarClicHasta = e.timeStamp + 100
    // Si se detuvo antes de soltar, no hay impulso que seguir.
    if (e.timeStamp - t > 120) velocidad = 0
    objetivo = Math.round((giro + velocidad * INERCIA) / paso) * paso
    animar()
  }
  rueda.addEventListener('pointerup', soltar)
  rueda.addEventListener('pointercancel', soltar)

  // El trackpad de lado la gira en vivo y, cuando se suelta, se asienta en la
  // card más cercana. No es pasivo porque tiene que quedarse con el gesto: si
  // no, además desplazaría la página o volvería atrás en el historial (macOS).
  rueda.addEventListener(
    'wheel',
    (e) => {
      if (!anillo.matches || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      if (!reposo) porPxTrackpad = porPx(TRACKPAD)
      detener()
      giro += e.deltaX * porPxTrackpad
      objetivo = giro
      dibujar()
      clearTimeout(reposo)
      reposo = setTimeout(() => {
        reposo = 0
        objetivo = Math.round(giro / paso) * paso
        animar()
      }, 140)
    },
    { passive: false },
  )

  // La del frente se inclina hacia el cursor y un brillo lo sigue: solo con un
  // ratón de verdad, y nunca con el movimiento reducido.
  function inclinar(e) {
    if (e.pointerType !== 'mouse' || quieto()) return
    const cara = e.target.closest('.servicio.activo .servicio-cara')
    if (cara !== inclinada) enderezar()
    if (!cara) return
    inclinada = cara
    const { left, top, width, height } = cara.getBoundingClientRect()
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height
    cara.style.setProperty('--brillo-x', `${(x * 100).toFixed(1)}%`)
    cara.style.setProperty('--brillo-y', `${(y * 100).toFixed(1)}%`)
    cara.style.setProperty('--inclina-x', `${((0.5 - y) * 8).toFixed(2)}deg`)
    cara.style.setProperty('--inclina-y', `${((x - 0.5) * 8).toFixed(2)}deg`)
  }

  function enderezar() {
    if (!inclinada) return
    inclinada.style.removeProperty('--inclina-x')
    inclinada.style.removeProperty('--inclina-y')
    inclinada = null
  }
  rueda.addEventListener('pointerleave', enderezar)

  // La primera vez que se ve entera, la rueda se mece un poco y vuelve: dice
  // que gira sin que haya que adivinarlo.
  const vigia = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return
      vigia.disconnect()
      if (!anillo.matches || quieto() || arrastre || cuadro) return
      velocidad = -240
      animar()
    },
    { threshold: 0.6 },
  )
  vigia.observe(rueda)
}
