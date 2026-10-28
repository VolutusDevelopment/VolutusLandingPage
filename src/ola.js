// La ola y su estela de color: en la barra, en el pie y en /nosotros.
//
// Cada `canvas.ola-lienzo` va sobre el SVG de su caja y vuelve a trazar su ola
// (`.ola-trazo`): tres líneas que corren desde la cola y se enrollan en voluta.
// La estela es un chicle del color de su línea —el mar, el atardecer y el coral
// de las cards, encendidos—: su cola va donde estuvo la punta `CHICLE` ms
// antes, así que se estira con la rapidez y se recoge al frenar, y cuando la
// línea se posa ya no queda color. Al terminar, el lienzo se limpia y vuelve el
// SVG, que es la ola quieta.
//
// El logotipo (`data-ola="logotipo"`, en la barra y en el pie) se escribe la
// primera vez que asoma: las líneas entran desde fuera de la pantalla, la de
// abajo más atrás, cruzan la palabra estiradas y cada letra aparece al paso de
// la cola; pasada la S se enrollan en la ola, se pasan un poco de la punta y
// vuelven. Mientras, la caja lleva `barriendo` y el lienzo pinta las letras.
// La ola de /nosotros, que no lleva letras, sale de su cola en cascada.
//
// Con el ratón encima la ola no se borra ni toca las letras: los colores pasan
// por ella en cascada, de la cola a la punta, la línea de arriba primero. En la
// bienvenida del home (`data-repite`, Bienvenida.jsx) pasan una vez tras otra,
// sin ratón, hasta que la bienvenida sale del documento.
//
// Cada línea se pinta de un solo trazo, del color de la ola quieta, y el
// chicle se tiñe encima (`source-atop`): el color no engruesa el borde, y el
// último cuadro calza con el SVG que lo reemplaza.
//
// Es un canvas 2D porque el chicle se funde a lo largo del trazo, que SVG no
// sabe pintar. Sin JavaScript, con movimiento reducido o al imprimir queda el
// SVG.

import { OLA, OLA_DEL_LOGOTIPO } from './lib/logotipo.js'
import { quieto } from './lib/movimiento.js'

// De la línea de afuera a la de adentro. No son los de las cards, que son
// hondos para llevar letras blancas: sobre la ola oscura no se veían, y sobre
// la blanca se destiñen al pastel. Encendidos, resaltan sobre las dos.
const COLORES = ['#00b2f0', '#ff7a1a', '#ff4d40'].map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)))

// El chicle: su color es pleno desde `PLENO` de largo y se destiñe parejo al
// recogerse, y donde se funde lo hace en tramos de `TRAMO`. Los dos en unidades
// de la rejilla de 64: en el logotipo crecen con la ola.
const CHICLE = 170
const PLENO = 24
const TRAMO = 0.6

// Los colores por la ola: cada chicle sale de la cola y llega a la punta en
// `PASA` ms. La línea de arriba sale primero y cada una espera `CASCADA` ms
// más que la de encima. Hace la mitad del largo en el primer `CUARTO`,
// acelerando, y el resto frenando desde la rapidez que traía (`FRENO`).
const PASA = 1200
const CASCADA = 120
const FRENO = 6
const CUARTO = 1 / (1 + FRENO / 2)
const empuje = (u) => (u <= CUARTO ? 0.5 * (u / CUARTO) ** 2 : 1 - 0.5 * (1 - (u - CUARTO) / (1 - CUARTO)) ** FRENO)
const PASADA = PASA + (OLA.radios.length - 1) * CASCADA

// El barrido, en unidades del logotipo, que es el único que barre. Las líneas
// salen con la punta fuera del borde izquierdo de la pantalla, cada una
// `ESCALON` más atrás que la de encima, a `ARRANQUE` de la rapidez con que la
// de arriba llega a su voluta (`RAPIDEZ`), y aceleran parejo. Si el borde
// queda más lejos que en el lienzo de Design (`REFERENCIA`, de él a la
// voluta), vienen más rápido, con la raíz de lo que sobra: así no se demoran
// en una pantalla ancha. Desde la voluta frenan con un `REBOTE`: se pasan de
// la punta y vuelven. Al dar paso a las letras, el final del chicle se funde
// al color del texto en `DEGRADADO` de largo; el degradado se ahonda desde la
// V a lo largo de `RAMPA` y pasada la S se apaga en el mismo largo. Las letras
// aparecen con un borde de `FUNDIDO`.
const RAPIDEZ = 2.4
const ARRANQUE = 0.3
const REFERENCIA = 855
const ESCALON = 60
const REBOTE = 1.7
const DEGRADADO = 40
const RAMPA = 200
const FUNDIDO = 10

// Las líneas de una ola que ya está en su lugar: los chicles salen de la cola.
function olaDe({ cola, centro, radios, giro }) {
  const recta = centro[0] - cola
  return radios.map((r, i) => {
    const largo = recta + r * giro
    const espera = (radios.length - 1 - i) * CASCADA
    const avance = (t) => largo * empuje(Math.min(Math.max((t - espera) / PASA, 0), 1))
    return { r, inicio: cola, recta, fija: 0, largo, avance, color: COLORES[i] }
  })
}

// Las líneas del barrido, que salen de `borde`. Cada una llega a su voluta con
// la rapidez que trae y frena con la curva de rebote, que parte de esa misma
// rapidez. `fija` es desde dónde la línea se queda: la cola de la ola.
function barridoDe({ cola, centro: [cx], radios, giro }, borde) {
  const distancia = cx - borde
  const rapidez = RAPIDEZ * Math.sqrt(Math.max(1, distancia / REFERENCIA))
  const inicial = ARRANQUE * rapidez
  const aceleracion = (rapidez ** 2 - inicial ** 2) / (2 * distancia)
  return radios.map((r, i) => {
    const inicio = borde - (radios.length - 1 - i) * ESCALON
    const recta = cx - inicio
    const llegada = Math.sqrt(inicial ** 2 + 2 * aceleracion * recta)
    const llega = (llegada - inicial) / aceleracion
    const curva = r * giro
    const frena = ((REBOTE + 3) * curva) / llegada
    const avance = (t) => {
      const u = Math.max(t, 0)
      if (u <= llega) return inicial * u + (aceleracion * u * u) / 2
      const v = Math.min((u - llega) / frena, 1) - 1
      return recta + curva * (1 + (REBOTE + 1) * v ** 3 + REBOTE * v ** 2)
    }
    return { r, inicio, recta, fija: cola - inicio, largo: recta + curva, avance, dura: llega + frena, color: COLORES[i] }
  })
}

// La línea entre los largos `desde` y `hasta`: la recta y después el arco, que
// en el canvas gira al revés que el reloj desde abajo del centro.
function trazar(ctx, { centro: [cx, cy] }, { r, inicio, recta }, desde, hasta) {
  if (hasta <= desde) return
  ctx.beginPath()
  if (desde < recta) {
    ctx.moveTo(inicio + desde, cy + r)
    ctx.lineTo(inicio + Math.min(hasta, recta), cy + r)
  }
  if (hasta > recta) {
    const angulo = (s) => Math.PI / 2 - (Math.max(s, recta) - recta) / r
    ctx.arc(cx, cy, r, angulo(desde), angulo(hasta), true)
  }
  ctx.stroke()
}

const rgb = (color, alfa = 1) => `rgb(${color.join(' ')} / ${alfa})`
const mezcla = (color, base, cuanto) => rgb(base.map((b, i) => b + (color[i] - b) * cuanto))
const colorDe = (trazo) => getComputedStyle(trazo).stroke.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number)

// Cuánto se funde el final del chicle, de 0 a 1, con la cola en `x`: nada fuera
// de las letras, que van de `izquierda` a `derecha`. La cola se mide por su
// recorrido, como si la línea fuera recta, para que se apague en la voluta.
const hondo = ([izquierda, derecha], x) =>
  Math.min(Math.max((x - izquierda) / RAMPA, 0), Math.max((derecha + RAMPA - x) / RAMPA, 0), 1)

// Las líneas en el momento `t`, cada una desde su cola —o desde la cola de la
// ola, que se queda— hasta la punta, con el chicle encima. Con `letras`, que
// van a lo ancho de `texto`, estas aparecen al paso de la cola más atrasada;
// con `entera`, la ola ya está dibujada y solo pasan los colores.
function pintar(ctx, ola, lineas, base, t, { letras, texto, entera = false }) {
  const escala = ola.grosor / OLA.grosor
  const colas = lineas.map((linea) => linea.avance(t - CHICLE))
  ctx.globalCompositeOperation = 'source-over'
  if (letras) {
    const frente = Math.min(...lineas.map((linea, i) => linea.inicio + colas[i]))
    const fundido = ctx.createLinearGradient(frente - FUNDIDO, 0, frente, 0)
    fundido.addColorStop(0, rgb(base))
    fundido.addColorStop(1, rgb(base, 0))
    ctx.fillStyle = fundido
    ctx.fill(letras)
  }
  ctx.strokeStyle = rgb(base)
  const puntas = lineas.map((linea, i) => {
    const punta = linea.avance(t)
    trazar(ctx, ola, linea, Math.min(colas[i], linea.fija), entera ? linea.largo : punta)
    return punta
  })
  ctx.globalCompositeOperation = 'source-atop'
  lineas.forEach((linea, i) => {
    const cola = colas[i]
    // Al volver del rebote la punta retrocede y la cola la alcanza.
    const largo = Math.max(puntas[i] - cola, 0)
    const fuerza = Math.min(largo / (PLENO * escala), 1)
    const fundir = letras ? hondo(texto, linea.inicio + cola) : 0
    const corto = fundir ? Math.min(DEGRADADO, largo) : 0
    ctx.strokeStyle = mezcla(linea.color, base, fuerza)
    trazar(ctx, ola, linea, cola + corto, cola + largo)
    for (let s = cola; s < cola + corto; s += TRAMO * escala) {
      const hasta = Math.min(s + TRAMO * escala, cola + corto)
      ctx.strokeStyle = mezcla(linea.color, base, fuerza * (1 - fundir * (1 - (hasta - cola) / corto)))
      trazar(ctx, ola, linea, s, hasta)
    }
  })
}

function montar(lienzo) {
  const ctx = lienzo.getContext('2d')
  if (!ctx) return
  const caja = lienzo.parentElement
  const svg = caja.querySelector('svg')
  const trazo = svg.querySelector('.ola-trazo')
  const vista = svg.viewBox.baseVal
  const ola = lienzo.dataset.ola === 'logotipo' ? OLA_DEL_LOGOTIPO : OLA
  const quieta = olaDe(ola)
  const palabra = ola === OLA_DEL_LOGOTIPO && svg.querySelector('path:not(.ola-trazo)')
  const letras = palabra && new Path2D(palabra.getAttribute('d'))
  const ancho = palabra && palabra.getBBox()
  const texto = palabra && [ancho.x, ancho.x + ancho.width]
  // La primera vez el logotipo se escribe y la ola sola sale de su cola;
  // después, con el ratón encima, pasan los colores.
  let modo = palabra ? 'barre' : 'traza'
  const repite = 'repite' in lienzo.dataset
  let barrido = []
  let corriendo = false

  // Hasta que asoma, la ola espera escondida —y las letras, si las hay—: así
  // se la ve nacer.
  caja.classList.add('trazando')
  if (palabra) caja.classList.add('barriendo')

  // Del viewBox a los píxeles del lienzo: el SVG lo encaja centrado
  // (`xMidYMid meet`) en su caja, que se mide tal como se pinta. Mientras
  // barre, el lienzo se estira hasta el borde izquierdo de la pantalla, de
  // donde salen las líneas.
  function medir() {
    const izquierda = modo === 'barre' ? Math.max(caja.getBoundingClientRect().left, 0) : 0
    lienzo.style.left = `${-izquierda}px`
    lienzo.style.width = `calc(100% + ${izquierda}px)`
    const densidad = Math.min(devicePixelRatio, 3)
    const marco = lienzo.getBoundingClientRect()
    const dibujo = svg.getBoundingClientRect()
    lienzo.width = Math.round(marco.width * densidad)
    lienzo.height = Math.round(marco.height * densidad)
    const [sx, sy] = [lienzo.width / marco.width, lienzo.height / marco.height]
    const s = Math.min(dibujo.width / vista.width, dibujo.height / vista.height)
    const x = dibujo.left - marco.left + (dibujo.width - vista.width * s) / 2 - vista.x * s
    const y = dibujo.top - marco.top + (dibujo.height - vista.height * s) / 2 - vista.y * s
    if (modo === 'barre') barrido = barridoDe(ola, -x / s - ola.grosor / 2)
    ctx.lineWidth = ola.grosor
    ctx.lineCap = 'round'
    return [s * sx, 0, 0, s * sy, x * sx, y * sy]
  }

  function limpiar() {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, lienzo.width, lienzo.height)
  }

  function terminar() {
    corriendo = false
    modo = 'pasa'
    caja.classList.remove('trazando', 'barriendo')
    limpiar()
    // Con movimiento reducido `correr` termina sin empezar: no se repite.
    if (repite && lienzo.isConnected && !quieto()) correr()
  }

  function correr() {
    if (corriendo) return
    if (quieto()) return terminar()
    corriendo = true
    caja.classList.add('trazando')
    const matriz = medir()
    const barre = modo === 'barre'
    const lineas = barre ? barrido : quieta
    const fin = barre ? Math.max(...barrido.map((linea) => linea.dura)) : PASADA
    const como = barre ? { letras, texto } : { entera: modo === 'pasa' }
    let t = 0
    let antes = performance.now()
    const cuadro = (ahora) => {
      t += Math.max(ahora - antes, 0)
      antes = ahora
      limpiar()
      // Fuera del documento ya no hay color que leer.
      if (t >= fin || !lienzo.isConnected) return terminar()
      ctx.setTransform(...matriz)
      // El color de la ola quieta, que puede cambiar con la zona bajo la barra.
      pintar(ctx, ola, lineas, colorDe(trazo), t, como)
      requestAnimationFrame(cuadro)
    }
    // El primero va ya: al repetir, `correr` se llama desde un cuadro, y
    // esperar al siguiente dejaba uno sin ola.
    cuadro(antes)
  }

  const asomo = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return
      asomo.disconnect()
      correr()
    },
    { threshold: 0.5 },
  )
  asomo.observe(caja)
  // Con el ratón encima pasan los colores, si la ola ya llegó y no están pasando.
  caja.addEventListener('pointerenter', ({ pointerType }) => pointerType === 'mouse' && modo === 'pasa' && correr())
}

export default function initOla() {
  if (quieto()) return
  document.querySelectorAll('canvas.ola-lienzo').forEach(montar)
}
