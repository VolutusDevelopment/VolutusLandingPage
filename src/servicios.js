/**
 * Los servicios: cambiar de un panel a otro.
 *
 * Toda la maqueta —paneles superpuestos en escritorio, apilados en el
 * celular— es CSS y funciona igual en las dos. Esto solo mueve la clase
 * `activo` y dice lo que pasa a quien no ve la pantalla, con el patrón de
 * acordeón de ARIA: el botón dice si su panel está abierto y cuál es.
 *
 * El panel abierto no se puede cerrar: siempre hay uno a la vista, como en la
 * original. Su botón queda marcado como `aria-disabled` y no hace nada.
 *
 * En escritorio, además, los paneles se arrastran: se mueve el que está bajo
 * el puntero y, al soltar pasado el umbral, se abre el que corresponde. Es un
 * atajo; el clic sigue haciendo lo mismo.
 */
const UMBRAL = 60
const ARRANQUE = 6

export default function initServicios() {
  const servicios = [...document.querySelectorAll('.servicio')]
  if (!servicios.length) return

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
    boton.addEventListener('click', () => {
      if (!servicio.classList.contains('activo')) abrir(servicio)
    })
  }

  abrir(servicios.find((s) => s.classList.contains('activo')) ?? servicios[0])
  arrastrar(servicios, abrir)
}

function arrastrar(servicios, abrir) {
  const lista = servicios[0].parentElement
  const escritorio = matchMedia('(min-width: 1024px)')
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
    for (const pieza of gesto.piezas) pieza.style.transform = ''
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
