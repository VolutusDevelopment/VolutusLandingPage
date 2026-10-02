/**
 * Los servicios: cambiar de un panel a otro.
 *
 * Toda la maqueta —paneles superpuestos en escritorio, apilados en el
 * celular— es CSS y funciona igual en las dos. Esto solo mueve la clase
 * `activo` y dice lo que pasa a quien no ve la pantalla, con el patrón de
 * acordeón de ARIA: el botón dice si su panel está abierto y cuál es.
 *
 * El panel abierto no se puede cerrar: siempre hay uno a la vista, como en la
 * original. Su botón queda marcado como `aria-disabled` y no hace nada. Uno
 * cerrado se abre con un clic en cualquier parte, no solo en su botón: en
 * escritorio se asoma al pasar el cursor (Servicios.css), y lo que deja ver
 * también es la pieza.
 *
 * En escritorio, además, los paneles se arrastran: se mueve el que está bajo
 * el puntero y, al soltar pasado el umbral, se abre el que corresponde. Es un
 * atajo; el clic sigue haciendo lo mismo. Y la cartera que los guarda se
 * inclina hacia el cursor.
 */
import { quieto } from './lib/movimiento.js'

const UMBRAL = 60
const ARRANQUE = 6

// Los grados de la inclinación y hasta dónde llega el gesto, en mitades de la
// cartera medidas desde su centro: a 1.25 mitades ya está inclinada del todo.
// La tarjeta de PonleNota llega a 12°, pero es chica; esto es un bloque de
// casi 1200 px, y sobre las franjas de la derecha basta con unos 3°.
const INCLINACION_MAX = 4
const ALCANCE = 1.25

const acotar = (valor) => Math.min(1, Math.max(-1, valor))

export default function initServicios() {
  const servicios = [...document.querySelectorAll('.servicio')]
  if (!servicios.length) return
  const escritorio = matchMedia('(min-width: 1024px)')

  function abrir(elegido) {
    for (const servicio of servicios) {
      const abierto = servicio === elegido
      const boton = servicio.querySelector('.servicio-boton')
      servicio.classList.toggle('activo', abierto)
      boton.setAttribute('aria-expanded', String(abierto))
      if (abierto) boton.setAttribute('aria-disabled', 'true')
      else boton.removeAttribute('aria-disabled')
    }
  }

  for (const servicio of servicios) {
    const boton = servicio.querySelector('.servicio-boton')
    const panel = servicio.querySelector('.servicio-panel')
    boton.setAttribute('aria-controls', panel.id)
    panel.setAttribute('role', 'region')
    panel.setAttribute('aria-labelledby', boton.id)
    // En la pieza y no en el botón; con el teclado, el clic del botón sube
    // hasta aquí.
    servicio.addEventListener('click', () => {
      if (!servicio.classList.contains('activo')) abrir(servicio)
    })
  }

  abrir(servicios.find((s) => s.classList.contains('activo')) ?? servicios[0])
  arrastrar(servicios, abrir, escritorio)
  inclinar(document.querySelector('.cartera'), escritorio)
}

function arrastrar(servicios, abrir, escritorio) {
  const lista = servicios[0].parentElement
  let inicio = null
  let dx = 0
  let arrastrando = false
  let gesto = null

  // Lo que recorre un panel entre abierto y corrido: su ancho menos la franja
  // que asoma y el canto que se mete bajo el anterior.
  function recorrido(panel) {
    const franja = panel.querySelector('.servicio-boton').offsetWidth
    const canto = parseFloat(getComputedStyle(panel).borderTopRightRadius)
    return panel.offsetWidth - franja - canto
  }

  // Se mueve la pieza que se agarró, solo en el sentido en que puede ir, y la
  // siguen las que cambian de sitio al abrir el destino:
  // - una franja de la izquierda (corrida) vuelve a la derecha y se abre; las
  //   franjas entre ella y el abierto vuelven con ella;
  // - el panel abierto se corre a la izquierda y deja ver el siguiente;
  // - una franja de la derecha está debajo del abierto: al tirar de ella a la
  //   izquierda se llevan las piezas que la tapan, y se abre ella.
  function gestoPara(agarrado) {
    if (!agarrado) return null
    const g = servicios.indexOf(agarrado)
    const a = servicios.findIndex((s) => s.classList.contains('activo'))
    const destino = g === a ? a + 1 : g
    if (destino >= servicios.length) return null
    // Las que se corren son las que quedan entre el abierto y el destino; la
    // más cercana al puntero es la que se agarró o, si esa no se mueve, la
    // que la tapa.
    const piezas = servicios.slice(Math.min(a, destino), Math.max(a, destino))
    return {
      piezas,
      sentido: destino < a ? 1 : -1,
      destino: servicios[destino],
      ancla: Math.min(g, destino - (destino > a ? 1 : 0)),
    }
  }

  function seguir() {
    // Hacia el lado contrario no se mueve: la pieza queda en su sitio.
    const d = dx * gesto.sentido > 0 ? dx : 0
    for (const pieza of gesto.piezas) {
      // Cada pieza que sigue va un poco a la zaga de la anterior, como una
      // baraja que se arrastra; al soltar, la transición las junta.
      const lejania = Math.abs(servicios.indexOf(pieza) - gesto.ancla)
      const paso = d * Math.max(0.6, 1 - 0.12 * lejania)
      const r = recorrido(pieza)
      const x = gesto.sentido < 0 ? Math.max(paso, -r) : Math.min(paso, r) - r
      pieza.style.transform = `translateX(${x}px)`
    }
  }

  lista.addEventListener('pointerdown', (e) => {
    arrastrando = false
    if (!escritorio.matches || e.button !== 0) return
    gesto = gestoPara(e.target.closest('.servicio'))
    if (!gesto) return
    inicio = e.clientX
    dx = 0
  })

  lista.addEventListener('pointermove', (e) => {
    if (inicio === null) return
    dx = e.clientX - inicio
    if (!arrastrando) {
      if (Math.abs(dx) < ARRANQUE) return
      arrastrando = true
      // El asomo (Servicios.css) se queda donde está. Lo sostiene el :hover,
      // que se va con la captura del puntero, y soltarlo haría recular la
      // pieza contra el gesto: el asomo va hacia el mismo lado que el arrastre.
      // Se lee antes de capturar, mientras aún vale.
      for (const pieza of gesto.piezas) pieza.style.translate = getComputedStyle(pieza).translate
      lista.setPointerCapture(e.pointerId)
      lista.classList.add('arrastrando')
      // Si el gesto empezó como selección de texto, deja de serlo.
      getSelection()?.removeAllRanges()
    }
    seguir()
  })

  function soltar() {
    if (inicio === null) return
    inicio = null
    if (!arrastrando) return
    // Quitar la clase y los estilos en el mismo paso: la transición vuelve y
    // lleva el panel desde donde lo dejó el puntero hasta su sitio.
    lista.classList.remove('arrastrando')
    for (const pieza of gesto.piezas) {
      pieza.style.transform = ''
      pieza.style.translate = ''
    }
    if (dx * gesto.sentido >= UMBRAL) abrir(gesto.destino)
  }

  lista.addEventListener('pointerup', soltar)
  lista.addEventListener('pointercancel', soltar)

  // El clic que cierra un arrastre no es un clic: no abre la franja soltada.
  lista.addEventListener(
    'click',
    (e) => {
      if (!arrastrando) return
      arrastrando = false
      e.stopPropagation()
      e.preventDefault()
    },
    true,
  )
}

/**
 * La cartera se inclina hacia el cursor, con la lógica de la tarjeta NFC de
 * ponlenota.cl: se hunde el punto al que apunta. La posición se mide contra
 * el alcance y no contra el borde, así que el gesto empieza antes de llegar a
 * ella y crece de forma continua: nada salta al cruzar el borde. Se recalcula
 * también al desplazar la página, que cambia dónde queda el cursor respecto
 * de ella.
 *
 * Solo se engancha con un cursor de verdad: en táctil no hay hacia dónde
 * inclinarse, y el CSS tampoco le da capa.
 */
function inclinar(cartera, escritorio) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return

  let cuadro = 0
  let cursor = null
  let previoX = null
  let previoY = null
  // Lejos de la pantalla no hay nada que inclinar, y cada escritura obliga a
  // recalcular estilos. El margen de media ventana deja que llegue ya
  // inclinada.
  let cerca = false
  new IntersectionObserver(([entrada]) => (cerca = entrada.isIntersecting), {
    rootMargin: '50% 0px',
  }).observe(cartera)

  function actualizar() {
    cuadro = 0
    if (!cursor || !escritorio.matches || quieto()) return
    const { left, top, width, height } = cartera.getBoundingClientRect()
    const x = acotar((cursor.x - left - width / 2) / ((width / 2) * ALCANCE))
    const y = acotar((cursor.y - top - height / 2) / ((height / 2) * ALCANCE))
    // Lejos, los valores se repiten acotados: no hay nada que escribir.
    if (x === previoX && y === previoY) return
    previoX = x
    previoY = y
    // Un `rotateX` positivo hunde el borde de arriba y uno de `rotateY`, el de
    // la derecha: por eso el eje vertical va invertido y el horizontal no.
    cartera.style.setProperty('--giro-x', `${-y * INCLINACION_MAX}deg`)
    cartera.style.setProperty('--giro-y', `${x * INCLINACION_MAX}deg`)
  }

  function programar() {
    if (cerca && !cuadro) cuadro = requestAnimationFrame(actualizar)
  }

  const pasivo = { passive: true }
  addEventListener(
    'pointermove',
    ({ clientX, clientY }) => {
      cursor = { x: clientX, y: clientY }
      programar()
    },
    pasivo,
  )
  addEventListener('scroll', programar, pasivo)
}
