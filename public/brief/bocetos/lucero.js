// Pista Lucero: la cinta de cuatro franjas escribe la marca al llegar y se va
// por el pie, como la ola del logotipo de Volutus (src/ola.js).
//
// En la cabecera (`data-estela="entra"`) las franjas entran desde fuera de la
// pantalla, la de abajo más atrás, cruzan la palabra estiradas y cada letra
// aparece al paso de la cola. Pasada la última letra se enrollan, se pasan un
// poco de la punta y vuelven. La cola va donde estuvo la cabeza `CHICLE` ms
// antes: la franja se estira con la rapidez y se recoge al frenar.
//
// En el pie (`data-estela="sale"`), la primera vez que asoma, la cinta grande
// se va: su cola corre hasta salir por la derecha, la franja de afuera
// primero, y el saludo aparece a su paso.
//
// Sin JavaScript, con el movimiento reducido o al imprimir, el CSS deja todo
// quieto: la marca con su remolino y la cinta del pie entera.

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches
const raiz = document.documentElement

const CHICLE = 170
const RAPIDEZ = 0.85
const ARRANQUE = 0.3
const REFERENCIA = 420
const ESCALON = 44
const REBOTE = 1.7
const FUNDIDO = 12

// Espera a que la página esté a la vista: la pestaña visible y, dentro del
// visor del brief, la carta ya no en espera.
const cuandoSeVea = (hacer) => {
  const lista = () => !document.hidden && !raiz.classList.contains('en-espera')
  if (lista()) return hacer()
  const revisar = () => {
    if (!lista()) return
    observador.disconnect()
    document.removeEventListener('visibilitychange', revisar)
    hacer()
  }
  const observador = new MutationObserver(revisar)
  observador.observe(raiz, { attributes: true, attributeFilter: ['class'] })
  document.addEventListener('visibilitychange', revisar)
}

const mostrar = (franja, desde, hasta) => {
  franja.style.strokeDasharray = `0 ${Math.max(desde, 0)} ${Math.max(hasta - desde, 0)} 100000`
}

function entra(svg) {
  const caja = svg.closest('.logo')
  const letras = caja.querySelector('.logo-marca')
  const franjas = [...svg.querySelectorAll('path')]
  const recta = Number(svg.dataset.recta)
  const asiento = Number(svg.dataset.asiento)

  // El borde izquierdo de la pantalla, medido desde el centro del remolino.
  const centro = svg.getBoundingClientRect().left
  const borde = recta - centro
  const izquierda = letras.getBoundingClientRect().left - centro + recta

  const lineas = franjas.map((franja, i) => {
    const largo = franja.getTotalLength()
    const curva = largo - recta - Number(franja.dataset.pasa)
    const inicio = borde - FUNDIDO - (franjas.length - 1 - i) * ESCALON
    const distancia = recta - inicio
    const rapidez = RAPIDEZ * Math.sqrt(Math.max(1, distancia / REFERENCIA))
    const inicial = ARRANQUE * rapidez
    const aceleracion = (rapidez ** 2 - inicial ** 2) / (2 * distancia)
    const llega = (rapidez - inicial) / aceleracion
    const frena = ((REBOTE + 3) * curva) / rapidez
    const avance = (t) => {
      const u = Math.max(t, 0)
      if (u <= llega) return inicio + inicial * u + (aceleracion * u * u) / 2
      const v = Math.min((u - llega) / frena, 1) - 1
      return recta + curva * (1 + (REBOTE + 1) * v ** 3 + REBOTE * v ** 2)
    }
    return { franja, inicio, avance, dura: llega + frena }
  })

  const fin = Math.max(...lineas.map((linea) => linea.dura)) + CHICLE
  franjas.forEach((franja) => mostrar(franja, 0, 0))
  caja.classList.replace('esperando', 'barriendo')
  let empezo

  const cuadro = (ahora) => {
    empezo ??= ahora
    const t = ahora - empezo
    let frente = Infinity
    for (const { franja, inicio, avance } of lineas) {
      const cabeza = avance(t)
      const cola = Math.max(Math.min(avance(t - CHICLE), asiento), inicio)
      frente = Math.min(frente, cola)
      mostrar(franja, cola, cabeza)
    }
    letras.style.setProperty('--barrido', `${frente - izquierda}px`)
    if (t < fin) return requestAnimationFrame(cuadro)
    caja.classList.remove('barriendo')
    letras.style.removeProperty('--barrido')
    franjas.forEach((franja) => franja.style.removeProperty('stroke-dasharray'))
  }
  requestAnimationFrame(cuadro)
}

function sale(svg) {
  const pie = svg.closest('footer')
  const saludo = pie.querySelector('.pie-adios')
  const franjas = [...svg.querySelectorAll('path')]
  const largo = franjas[0].getTotalLength()
  const DURA = 1900
  const CASCADA = 140
  // Arranca desde quieta y se va acelerando, como quien se impulsa.
  const empuje = (u) => u ** 2.4

  // Dónde queda la cola en la pantalla, para destapar el saludo a su paso.
  const escala = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width
  const xDe = (s) => svg.getBoundingClientRect().left + franjas[0].getPointAtLength(Math.min(s, largo)).x * escala

  const empezar = () => {
    pie.classList.add('barriendo')
    let empezo
    const cuadro = (ahora) => {
      empezo ??= ahora
      const t = ahora - empezo
      let atras = largo
      franjas.forEach((franja, i) => {
        const u = Math.min(Math.max((t - i * CASCADA) / DURA, 0), 1)
        const cola = largo * 1.02 * empuje(u)
        atras = Math.min(atras, cola)
        mostrar(franja, cola, largo + 10)
      })
      saludo.style.setProperty('--barrido', `${xDe(atras) - saludo.getBoundingClientRect().left}px`)
      if (t < DURA + (franjas.length - 1) * CASCADA) return requestAnimationFrame(cuadro)
      pie.classList.remove('barriendo')
      saludo.style.removeProperty('--barrido')
    }
    requestAnimationFrame(cuadro)
  }

  pie.classList.add('esperando')
  const observador = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return
      observador.disconnect()
      pie.classList.remove('esperando')
      cuandoSeVea(empezar)
    },
    { threshold: 0.45 }
  )
  observador.observe(pie)
}

if (!quieto && 'IntersectionObserver' in window) {
  const listas = document.fonts?.ready ?? Promise.resolve()
  const cabecera = document.querySelector('[data-estela="entra"]')
  const pie = document.querySelector('[data-estela="sale"]')
  if (cabecera) {
    cabecera.closest('.logo').classList.add('esperando')
    listas.then(() => cuandoSeVea(() => entra(cabecera)))
  }
  if (pie) sale(pie)
}
