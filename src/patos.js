/**
 * El juego de las páginas de error, la 404 y la de los 5xx: un Duck Hunt con
 * la nube.
 *
 * Al empezar, la volutus se deshace en cúmulos repartidos por el cielo, y los
 * patos salen de dentro de ellos, como los del original desde el pasto. Vuelan
 * por el cielo y, cazados, caen a través de las nubes. La nube no se imita: el
 * pato que cae le sopla su aire de verdad con el evento `soplo` de nubes.js,
 * con la misma física que el cursor, así que la corta a su paso y la nube se
 * vuelve a cerrar sola. Al terminar, los cúmulos se juntan otra vez en la
 * volutus.
 *
 * Los cúmulos son por el juego: el rollo es grueso a la izquierda y un hilo a
 * la derecha, y los patos quedaban todos de un lado. La transición la lleva
 * este archivo y no el pintor: en cada fotograma le dice a la nube, con el
 * evento `forma`, cuánto va (de 0 en la volutus a 1 en los cúmulos) y dónde
 * está cada cúmulo. Así el juego sabe siempre dónde están y no espera a que
 * lleguen: un pato puede salir de una nube que todavía viaja.
 *
 * Lo descarga «Jugar» (src/client.js), y el mismo botón lo termina. En /patos
 * empieza solo, en cuanto la nube pinta.
 *
 * Los patos (src/lib/pato.js) se dibujan en la rejilla de la nube: cada píxel
 * del sprite es un cuadrado de una celda —la misma celda y el mismo origen—.
 * Dentro de ella, los puntos de la nube tapan el centro de cada cuadrado, así
 * que el pato apenas se adivina entre punto y punto, y se le ve entero donde
 * se abre.
 *
 * El pato que se escapa después de que le dispararon se burla antes de irse:
 * vuela al claro del cielo más lejos de las nubes, se agranda y se ríe en un
 * globo, «JA JA JA». Es lo que en el original hace el perro.
 *
 * La partida va por niveles de `POR_NIVEL` patos, de fácil a difícil. Cada uno
 * empieza con su letrero, «NIVEL 1», y el primero dice además cómo se dispara. Al
 * final de cada uno sale uno más a reclamar: vuela al claro y dice, llorando,
 * algo que haga sentir culpable a quien juega, como «FELICIDADES, / MATASTE A
 * / TODA MI / FAMILIA». Después ya no quedan patos en ese cielo: los que
 * sobreviven se van en V a otro, muchísimos la primera vez y cada vez menos, y
 * la vista los sigue. Las nubes pasan, llegan otras y empieza el nivel
 * siguiente. Cuando ya no queda parvada, los cazados suben al cielo con su
 * aureola por un rayo de luz, y sale el último pato, solo, a despedirse, y la partida termina con el letrero «FIN».
 *
 * Las medidas van en altos del lienzo de la nube, como todo lo de la nube: así
 * el juego cuesta lo mismo en cualquier pantalla. El primero sale al doble y
 * lento, y cada pato cazado hace al siguiente más rápido y más chico.
 *
 * Terminar una partida desbloquea «Odio a los patos», el modo sin fin: sigue
 * con la dificultad y las burlas donde quedaron, y cada pato trae casco, así
 * que hay que darle dos veces: la primera se lo vuela.
 *
 * «Terminar» la corta antes. Con movimiento reducido no se ofrece, y si
 * se activa a mitad de partida, termina con el pato siguiente y la volutus
 * vuelve sin transición.
 */

import { DPR_MAXIMO } from './nubes.js'
import { quieto } from './lib/movimiento.js'
import { filasDelGlobo, filasDeTexto, punta } from './lib/globo.js'
import { desbloquear, desbloqueado } from './lib/odio.js'
import {
  BURLAS,
  BURLAS_ODIO,
  DESPEDIDA,
  FIN,
  INSTRUCCION,
  MODO_ODIO,
  NIVELES,
  RECLAMOS,
  RECLAMOS_ODIO,
} from './lib/chistes.js'
import { ABAJO, ARRIBA, AUREOLA, CAE, CASCO, COLORES, HERIDO } from './lib/pato.js'

// A ojo. Las velocidades van en altos por segundo y los tiempos en segundos.
const VELOCIDAD = 0.45
// La dificultad sube con cada pato cazado: el pato tiende a volar `RAPIDO`
// veces más rápido que el primero y a medir `CHICO` del pato normal, blanco y
// disparo a la vez. El primero sale a `INICIAL` veces su tamaño. Tras cada uno
// queda `SUBE` de lo que faltaba: con 3 patos va en el 39 %, con 12 en el
// 86 %. `CHICO` vale con la celda de `CELDA_GRANDE` px: con una más fina, como
// en el teléfono, el pato se achica menos, para no bajar nunca de ese tamaño.
const SUBE = 0.85
const INICIAL = 2
const RAPIDO = 2.5
const CHICO = 0.4
const CELDA_GRANDE = 3
const VIDA = 6
const PASMO = 0.35
const GRAVEDAD = 3
const ALETEO = 8
const VUELTA = 0.12
// Lo que tarda la volutus en deshacerse en cúmulos, o en volver a juntarse, lo
// que tarda el viaje a otro cielo y lo que dura el letrero de cada nivel. El
// primero, que explica cómo se dispara, y el del final duran más.
const TRANSICION = 1.6
const VIAJE = 4
const LETRERO = 2
const LETRERO_LARGO = 3.5
// Hasta dónde baja a volar: por encima del contador, que va abajo.
const SUELO = 0.8
// La tolerancia del disparo, en px. Con el dedo es el doble: tapa justo lo que
// apunta.
const MARGEN = 10
// La burla: lo que tarda en llegar al claro, lo que dura la risa (y el
// reclamo, más largo para alcanzar a leerlo), cuántas veces se agranda como
// mucho y desde qué holgura (ver `claro`) el cielo ya está despejado: el
// relieve de la nube pasa un poco su elipse.
const LLEGADA = 0.5
const RISA = 1.6
const RECLAMO = 3
const GRANDE = 3
const LIBRE = 1.3
// El margen del claro con los costados y con el contador, en puntos.
const AIRE = 4
// Los patos de cada nivel, al cabo de los cuales sale el que reclama, y cómo
// se llama cada nivel: desde el último de la lista, todos igual.
const POR_NIVEL = 3
// Cuántos se van en V a otro cielo al pasar de nivel: muchos la primera vez y
// cada vez menos, hasta que no queda ninguno y se acaba la partida. Van lejos,
// así que se ven más chicos.
const PARVADAS = [13, 10, 7, 4, 0]
const LEJANA = 0.6
// Los textos y su orden de rotación viven en `lib/chistes.js`.
// Cuántas veces se agranda como mucho el que reclama: más que el que se
// burla, para que se le vea llorar.
const GRANDE_RECLAMO = 5
// Lo que tarda cada lágrima del que reclama en caer del ojo hasta las patas.
const LLANTO = 0.6
// La subida de los cazados al final: lo que dura entera, lo que tarda cada uno
// en cruzar el cielo y el ancho del rayo, en altos.
const ASCENSO = 6
const SUBIDA = 3
const RAYO = 0.5

// Los cúmulos, como en una foto de cielo de buen tiempo: grandes, medianos y
// jirones. Cada uno va en su franja del ancho, de izquierda a derecha, corrido
// un poco de su centro (`corre`, en franjas) y alternando alto y bajo (`v`, la
// fracción del alto). `peso` es su tamaño relativo: el de verdad sale de
// `repartir`. Tantos como `cumulos` en nubes-lienzo.js.
const CUMULOS = [
  { peso: 0.8, v: 0.55, corre: 0.1 },
  { peso: 0.45, v: 0.3, corre: -0.15 },
  { peso: 1, v: 0.5, corre: 0 },
  { peso: 0.4, v: 0.72, corre: 0.15 },
  { peso: 0.7, v: 0.4, corre: -0.1 },
  { peso: 0.5, v: 0.65, corre: 0.15 },
  { peso: 0.9, v: 0.48, corre: -0.05 },
  { peso: 0.35, v: 0.28, corre: 0.2 },
  { peso: 0.6, v: 0.62, corre: -0.15 },
  { peso: 0.45, v: 0.35, corre: 0.1 },
]
// Cuántos caben, por el ancho del cielo en px CSS: XL, L, M y S.
const POR_ANCHO = [
  [1280, 10],
  [1024, 8],
  [480, 6],
  [0, 4],
]
// El área de un cúmulo de radio 1: media elipse de 1.6 × 1 arriba y otra de
// 1.6 × 1/1.8 abajo, la base aplanada (ver `cumulo` en nubes-lienzo.js).
const AREA = (Math.PI * 1.6 * (1 + 1 / 1.8)) / 2

// Lo que se mide y se pinta. Se arma con el primer «Jugar».
let escena = null
let jugando = false
let pato = null
let cazados = 0
let burlasMostradas = 0
let burlasOdio = 0
let espera = 0
let bucle = 0
let antes = 0

export function alternar(boton) {
  if (!escena) preparar(boton)
  if (jugando) terminar()
  else empezar()
}

export function odio(boton) {
  if (!escena) preparar(boton)
  if (!jugando) empezar(true)
}

function preparar(boton) {
  const pagina = boton.closest('.pagina-error')
  const cielo = pagina.querySelector('.pagina-error-cielo')
  const lienzo = cielo.querySelector('.patos')
  escena = {
    boton,
    botonOdio: pagina.querySelector('.odio'),
    cielo,
    lienzo,
    ctx: lienzo.getContext('2d'),
    nube: cielo.querySelector('.nubes'),
    forma: { desde: 0, hasta: 0, t0: -Infinity, pendiente: false },
    nivel: 1,
  }
  medir()
  new ResizeObserver(medir).observe(lienzo)
  lienzo.addEventListener('pointerdown', disparar)
}

// La rejilla de la nube (nubes.js): la misma densidad de píxeles y la misma
// celda. Los dos lienzos calzan, así que también el origen. El `techo` es el
// borde de abajo de la barra, en puntos enteros: los patos no vuelan detrás
// de ella, donde el clic caería en el logo o en el menú.
function medir() {
  const { lienzo, cielo, boton } = escena
  const estilo = getComputedStyle(cielo)
  const dpr = Math.min(devicePixelRatio, DPR_MAXIMO)
  const celda = Math.round(parseFloat(estilo.getPropertyValue('--nubes-celda')) * dpr)
  lienzo.width = Math.round(lienzo.clientWidth * dpr)
  lienzo.height = Math.round(lienzo.clientHeight * dpr)
  // El pato que se achica no pasa a la rejilla: sin suavizado, sigue en
  // píxeles. Cambiar el tamaño del lienzo lo reinicia.
  escena.ctx.imageSmoothingEnabled = false
  // La letra de los globos va a 2 puntos por píxel si el reclamo más ancho
  // cabe al lado del pato al doble; si no, como en un teléfono, a 1, y la
  // burla con ella.
  const anchoChiste = Math.max(...[...BURLAS, ...RECLAMOS, ...BURLAS_ODIO, ...RECLAMOS_ODIO, DESPEDIDA].map((lineas) => filasDelGlobo(lineas, 2)[0].length))
  const ocupa = 2 * ARRIBA[0].length + 1 + anchoChiste + 2 * AIRE
  const punto = ocupa * celda <= lienzo.width ? 2 : 1
  if (celda !== escena.celda || punto !== escena.punto) {
    Object.assign(escena, { punto, globo: pintarCuadro(filasDelGlobo(BURLAS[0], punto), celda) })
  }
  if (celda !== escena.celda) {
    const [arriba, abajo, herido, cae, casco, aureola] = [ARRIBA, ABAJO, HERIDO, CAE, CASCO, AUREOLA].map((filas) => pintarCuadro(filas, celda))
    Object.assign(escena, { celda, cuadros: { arriba, abajo, herido, cae, casco, aureola }, grandes: [], contador: null })
  }
  escena.dpr = dpr
  escena.alto = lienzo.height
  escena.techo = Math.ceil((parseFloat(estilo.getPropertyValue('--barra-alto')) * dpr) / celda) * celda
  const izquierda = (boton.parentElement.getBoundingClientRect().left - lienzo.getBoundingClientRect().left) * dpr
  escena.izquierda = Math.round(izquierda / celda) * celda
  repartir()
  avisarForma(performance.now())
  if (!bucle) pintar()
}

// La volutus en la columna x, en altos: la altura de su eje, su radio y el
// área que cubre de 0 a x, que es la integral de su grosor. Es `tubo` en
// nubes-lienzo.js; si cambia allá, cambia aquí.
function rollo(x) {
  const f = Math.exp(-0.9 * Math.min(x, 2.1))
  const area = (0.8 / 0.9) * (1 - f) + 0.8 * f * Math.max(x - 2.1, 0)
  return { y: 0.3 + 0.28 * f, r: 0.4 * f, area }
}

// Dónde va cada cúmulo y de dónde sale. La volutus no pierde material: entre
// todos los cúmulos cubren la misma área que ella a la vista, así que el
// tamaño de cada uno depende de cuántos son. Cada uno nace del tramo de rollo
// de su franja, a la altura del eje y con su grosor, y al menos tan ancho como
// el tramo: los trozos lo cubren entero y no queda nada que se evapore. Cada
// nivel es otro cielo: toma los cúmulos desde otro punto de la lista.
function repartir() {
  const { lienzo, alto, nivel } = escena
  const aspecto = lienzo.width / alto
  const [, cuantos] = POR_ANCHO.find(([desde]) => lienzo.clientWidth >= desde)
  const elegidos = Array.from({ length: cuantos }, (_, i) => CUMULOS[(i + 3 * (nivel - 1)) % CUMULOS.length])
  const pesos = elegidos.reduce((suma, { peso }) => suma + peso ** 2, 0)
  const escala = Math.sqrt(rollo(aspecto).area / (AREA * pesos))
  const franja = aspecto / cuantos
  escena.cumulos = elegidos.map(({ peso, v, corre }, i) => {
    const x = (i + 0.5 + corre) * franja
    const { y, r } = rollo(x)
    return { x, desde: { y, r: Math.max(r, franja / 3.2) }, hasta: { y: v, r: peso * escala } }
  })
}

// Un cúmulo en este punto de la transición: su centro y su radio, en altos.
function cumulo({ x, desde, hasta }, valor) {
  return [x, desde.y + (hasta.y - desde.y) * valor, desde.r + (hasta.r - desde.r) * valor]
}

// La nube cambia de forma desde donde esté, aunque vaya a mitad de camino.
// Con movimiento reducido no hay transición: salta al final.
function cambiarForma(hasta) {
  const ahora = performance.now()
  escena.forma = { desde: valorForma(ahora), hasta, t0: quieto() ? -Infinity : ahora, pendiente: true }
  animar()
}

// De 0 a 1, con aceleración y frenado.
const suave = (s) => (s < 0.5 ? 4 * s ** 3 : 1 - (2 - 2 * s) ** 3 / 2)

// Cuánto va la transición.
function valorForma(ahora) {
  const { desde, hasta, t0 } = escena.forma
  return desde + (hasta - desde) * suave(Math.min(1, (ahora - t0) / 1000 / TRANSICION))
}

function avisarForma(ahora) {
  const corrido = escena.viaje ? viajar(ahora) : 0
  const valor = valorForma(ahora)
  const cumulos = new Float32Array(3 * CUMULOS.length)
  escena.cumulos.forEach((c, i) => {
    cumulos.set(cumulo(c, valor), 3 * i)
    cumulos[3 * i] += corrido
  })
  escena.nube.dispatchEvent(new CustomEvent('forma', { detail: { valor, cumulos } }))
  escena.forma.pendiente = ahora - escena.forma.t0 < TRANSICION * 1000 || Boolean(escena.viaje)
}

// Cuánto se corren los cúmulos en el viaje a otro cielo, en altos. La vista
// sigue a la parvada: los cúmulos de este cielo se van por la izquierda y, ya
// sin ninguno a la vista, llegan por la derecha los del siguiente nivel. Al
// llegar, su letrero.
function viajar(ahora) {
  const { viaje, lienzo, alto } = escena
  const s = Math.min(1, (ahora - viaje.t0) / 1000 / VIAJE)
  const avance = suave(s)
  if (avance >= 0.5 && !viaje.cruzo) {
    viaje.cruzo = true
    escena.nivel++
    repartir()
  }
  if (s === 1) {
    escena.viaje = null
    anunciar()
  }
  const fuera = lienzo.width / alto + 4 * Math.max(...escena.cumulos.map(({ hasta }) => hasta.r))
  return (avance < 0.5 ? -2 * avance : 2 - 2 * avance) * fuera
}

// El modo «Odio a los patos» sigue la dificultad de la partida anterior, al
// menos desde la del último nivel, y numera sus niveles desde ahí.
function empezar(modoOdio = false) {
  jugando = true
  escena.odio = modoOdio
  if (modoOdio) {
    cazados = Math.max(cazados, POR_NIVEL * PARVADAS.length)
    escena.nivel = PARVADAS.length + 1
  } else {
    cazados = 0
    burlasMostradas = 0
    escena.nivel = 1
  }
  escena.botonOdio.hidden = true
  escena.contador = null
  escena.reclamo = false
  escena.boton.lastElementChild.textContent = 'Terminar'
  escena.cielo.classList.add('cazando')
  repartir()
  cambiarForma(1)
  anunciar()
}

function terminar() {
  jugando = false
  clearTimeout(espera)
  Object.assign(escena, { reclamo: false, viaje: null, letrero: null, ascenso: null })
  escena.boton.lastElementChild.textContent = 'Jugar'
  escena.botonOdio.hidden = !desbloqueado()
  escena.botonOdio.classList.remove('desarmado')
  escena.cielo.classList.remove('cazando')
  if (pato?.estado === 'vuela') pato.estado = 'huye'
  cambiarForma(0)
}

// El letrero del nivel, en medio del cielo, y el primer pato cuando se apaga.
// El del primero dice cómo se dispara, con el dedo o con el mouse.
function anunciar() {
  const { nivel, punto, odio } = escena
  if (odio) {
    mostrarLetrero([filasDeTexto(MODO_ODIO, 'n', punto + 1), filasDeTexto(`NIVEL ${nivel - PARVADAS.length}`, 'b')], LETRERO)
    if (!pato) espera = setTimeout(soltar, LETRERO * 1000)
    return
  }
  const nombre = NIVELES[Math.min(nivel, NIVELES.length) - 1]
  const lineas = [filasDeTexto(`NIVEL ${nivel}`, 'b', 3), filasDeTexto(nombre, 'b')]
  if (nivel === 1) {
    const forma = matchMedia('(pointer: coarse)').matches ? 'toque' : 'clic'
    lineas.push(...INSTRUCCION[forma].map((linea) => filasDeTexto(linea, 'n', punto)))
  }
  const dura = nivel === 1 ? LETRERO_LARGO : LETRERO
  mostrarLetrero(lineas, dura)
  if (!pato) espera = setTimeout(soltar, dura * 1000)
}

// Los renglones centrados uno bajo otro, con aire entre ellos.
function mostrarLetrero(lineas, dura) {
  const ancho = Math.max(...lineas.map((filas) => filas[0].length))
  const centrar = (fila) => fila.padStart((ancho + fila.length) >> 1, '.').padEnd(ancho, '.')
  const filas = lineas.flatMap((linea, i) => [...(i ? Array(4).fill('') : []), ...linea]).map(centrar)
  escena.letrero = { t0: performance.now(), dura, cuadro: pintarCuadro(contornear(filas), escena.celda) }
  animar()
}

// No quedan patos: el letrero del final con la cuenta, y la volutus vuelve.
// Desbloquea el modo sin fin: su botón aparece cuando vuelve la volutus.
function finalizar() {
  desbloquear()
  const [titulo, ...resto] = FIN(cazados)
  mostrarLetrero([filasDeTexto(titulo, 'b', 3), ...resto.map((linea) => filasDeTexto(linea, 'b', escena.punto))], LETRERO_LARGO)
  espera = setTimeout(terminar, LETRERO_LARGO * 1000)
}

// Después del que reclama, los que quedan se van en parvada a otro cielo (ver
// `viajar`).
function seguir() {
  if (quieto()) return terminar()
  const parvada = PARVADAS[Math.min(escena.nivel, PARVADAS.length) - 1]
  if (!parvada && !escena.odio) return finalizar()
  escena.viaje = { t0: performance.now(), parvada }
  escena.forma.pendiente = true
  animar()
}

// Sale de un cúmulo cualquiera, donde esté ahora, aunque todavía viaje.
function soltar() {
  if (quieto()) return terminar()
  const { alto, cumulos } = escena
  const [x, y] = cumulo(cumulos[Math.floor(Math.random() * cumulos.length)], valorForma(performance.now()))
  const rumbo = -Math.PI / 2 + (Math.random() - 0.5) * 1.2
  pato = {
    x: x * alto,
    y: y * alto,
    rumbo,
    mira: Math.sign(Math.cos(rumbo)) || 1,
    estado: 'vuela',
    t: 0,
    // El primer giro espera a que haya salido de la nube.
    giro: 1 + Math.random() * 0.6,
    disparos: 0,
    escala: 1,
    armadura: escena.odio,
    tamano: INICIAL - (INICIAL - Math.min(1, (CHICO * CELDA_GRANDE * escena.dpr) / escena.celda)) * dificultad(),
  }
  animar()
}

// De 0, con el primer pato, hacia 1, sin llegar nunca.
const dificultad = () => 1 - SUBE ** cazados

// Antes de la despedida, los cazados suben al cielo (ver `pintarAscenso`).
function ascender() {
  escena.ascenso = { t0: performance.now(), cuantos: cazados }
  animar()
}

// El que reclama por su familia: sale de un cúmulo y va directo al claro a
// decirlo, como la burla. Si no hay un claro para su globo, sigue el juego. En
// el último nivel es el último pato que queda, y se despide.
function soltarReclamo() {
  const { alto, cumulos, cielo, punto, celda, nivel } = escena
  const lista = escena.odio ? RECLAMOS_ODIO : RECLAMOS
  const lineas = nivel === PARVADAS.length ? DESPEDIDA : lista[(cazados / POR_NIVEL - 1) % lista.length]
  const globo = pintarCuadro(filasDelGlobo(lineas, punto), celda)
  const destino = claro(globo, GRANDE_RECLAMO)
  if (!destino) return seguir()
  const [x, y] = cumulo(cumulos[Math.floor(Math.random() * cumulos.length)], valorForma(performance.now()))
  pato = {
    x: x * alto,
    y: y * alto,
    mira: 1,
    estado: 'burla',
    t: 0,
    disparos: 0,
    escala: 1,
    tamano: 1,
    llora: true,
    globo,
    desde: { x: x * alto, y: y * alto },
    ...destino,
  }
  cielo.classList.add('burlando')
  animar()
}

function animar() {
  if (bucle) return
  antes = 0
  bucle = requestAnimationFrame(paso)
}

// Un fotograma, mientras haya un pato, la nube cambie de forma o se vea un
// letrero. El paso de tiempo topa en 50 ms: al volver de una pestaña oculta,
// el pato no salta.
function paso(ahora) {
  const dt = antes ? Math.min((ahora - antes) / 1000, 0.05) : 0
  antes = ahora
  if (pato) mover(dt)
  if (escena.chatarra) caerChatarra(dt)
  if (pato?.estado === 'cae') soplar()
  if (escena.forma.pendiente) avisarForma(ahora)
  if (escena.letrero && ahora - escena.letrero.t0 > escena.letrero.dura * 1000) escena.letrero = null
  if (escena.ascenso && ahora - escena.ascenso.t0 > ASCENSO * 1000) {
    escena.ascenso = null
    soltarReclamo()
  }
  pintar(ahora)
  bucle = pato || escena.chatarra || escena.forma.pendiente || escena.letrero || escena.ascenso ? requestAnimationFrame(paso) : 0
}

function mover(dt) {
  const { alto, lienzo, techo, cuadros } = escena
  const p = pato
  p.t += dt

  if (p.estado === 'herido') {
    if (p.t > PASMO) Object.assign(p, { estado: 'cae', t: 0, vy: 0 })
    return
  }
  if (p.estado === 'cae') {
    p.vy += GRAVEDAD * alto * dt
    p.y += p.vy * dt
    if (p.y > lienzo.height) fin()
    return
  }

  const rapidez = VELOCIDAD * (1 + (RAPIDO - 1) * dificultad()) * alto
  if (p.estado === 'huye') {
    p.y -= 1.5 * rapidez * dt
    if (p.y < -cuadros.arriba.height * p.escala) fin()
    return
  }
  // Se burla: va al claro mientras crece por saltos enteros, que no lo sacan
  // de la rejilla, se ríe y se va, grande.
  if (p.estado === 'burla') {
    const llegada = Math.min(1, p.t / LLEGADA)
    p.x = p.desde.x + (p.hasta.x - p.desde.x) * llegada
    p.y = p.desde.y + (p.hasta.y - p.desde.y) * llegada
    p.escala = Math.max(1, Math.ceil(llegada * p.grande))
    if (p.t > LLEGADA + (p.llora ? RECLAMO : RISA)) Object.assign(p, { estado: 'huye', t: 0 })
    return
  }
  // Se acabó su tiempo. Si le dispararon y no le dieron, se burla antes de
  // irse: se acerca, por eso crece desde su tamaño de siempre, y pasa delante
  // de las nubes.
  if (p.t > VIDA) {
    const chiste = p.disparos && (escena.odio ? BURLAS_ODIO[burlasOdio++ % BURLAS_ODIO.length] : BURLAS[burlasMostradas++ % BURLAS.length])
    const globo = chiste && pintarCuadro(filasDelGlobo(chiste, escena.punto), escena.celda)
    const destino = p.disparos && claro(globo)
    const burla = { estado: 'burla', t: 0, mira: 1, tamano: 1, globo, desde: { x: p.x, y: p.y }, ...destino }
    Object.assign(p, destino ? burla : { estado: 'huye' })
    escena.cielo.classList.toggle('burlando', Boolean(destino))
    return
  }

  // Vuela en diagonales, como los del original, y rebota en los costados, en
  // el suelo de vuelo y bajo la barra. Solo pasa detrás de ella al huir.
  if ((p.giro -= dt) < 0) {
    p.giro = 0.6 + Math.random() * 0.8
    p.rumbo = (Math.random() < 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.6
  }
  const width = cuadros.arriba.width * p.tamano
  const height = cuadros.arriba.height * p.tamano
  let vx = Math.cos(p.rumbo)
  let vy = Math.sin(p.rumbo)
  if ((p.x < width / 2 && vx < 0) || (p.x > lienzo.width - width / 2 && vx > 0)) vx = -vx
  if ((p.y < techo + height / 2 && vy < 0) || (p.y > SUELO * alto && vy > 0)) vy = -vy
  p.rumbo = Math.atan2(vy, vx)
  p.mira = Math.sign(vx) || p.mira
  p.x += vx * rapidez * dt
  p.y += vy * rapidez * dt
}

// El claro donde se burla: el lugar del pato grande con su globo al lado más
// lejos de toda nube. La distancia va en radios de cada nube, desde su centro
// hasta el punto más cercano de la caja, y desde `LIBRE` es cielo despejado.
// La caja va de la barra al borde de abajo del cielo, que suele ser lo más
// despejado, sin tocar los costados ni el contador. Prueba desde `grandeMaximo`
// hasta el doble, achicando de a uno; si en ninguno hay cielo despejado, se
// queda con lo mejor que encontró. En un cielo chico, como el de un teléfono,
// puede que nada quepa sin tocar el contador: entonces prueba también a tamaño
// normal y, si tampoco, lo tapa antes que no salir.
function claro(globo = escena.globo, grandeMaximo = GRANDE) {
  const { lienzo, celda, techo, alto, cuadros } = escena
  const forma = valorForma(performance.now())
  const nubes = escena.cumulos.map((c) => cumulo(c, forma).map((medida) => medida * alto))
  const aire = AIRE * celda
  const [mx, my, contador] = dondeContador()
  const marcador = [mx - aire, my - aire, mx + contador.width + aire, my + contador.height + aire]
  const entre = (valor, desde, hasta) => Math.min(Math.max(valor, desde), hasta)

  let mejor = null
  const libreDelContador = () => mejor?.holgura > -Infinity
  for (let grande = grandeMaximo; grande > (libreDelContador() ? 1 : 0) && !(mejor?.holgura >= LIBRE); grande--) {
    const [gx, gy] = globoJunto(0, 0, grande)
    const ancho = gx + globo.width
    const altoCaja = Math.max(cuadros.arriba.height * grande, gy + globo.height)
    for (let y = techo; y + altoCaja <= lienzo.height; y += aire) {
      for (let x = aire; x + ancho <= lienzo.width - aire; x += aire) {
        const tapa = x < marcador[2] && x + ancho > marcador[0] && y < marcador[3] && y + altoCaja > marcador[1]
        const holgura = tapa
          ? -Infinity
          : Math.min(
              ...nubes.map(([cx, cy, r]) =>
                Math.hypot((entre(cx, x, x + ancho) - cx) / (1.6 * r), (entre(cy, y, y + altoCaja) - cy) / r),
              ),
            )
        if (!mejor || holgura > mejor.holgura) mejor = { holgura, grande, x, y }
      }
    }
  }
  if (!mejor) return null
  const { grande, x, y } = mejor
  const { width, height } = cuadros.arriba
  return { grande, hasta: { x: x + (width * grande) / 2, y: y + (height * grande) / 2 } }
}

// Dónde va el globo, a partir de la esquina del pato: a su derecha, con la
// punta de la cola (la fila de `punta`) junto al pico, que está en la quinta fila
// del cuadro.
function globoJunto(x, y, escala) {
  const { celda } = escena
  return [x + (ARRIBA[0].length * escala + 1) * celda, y + (5 * escala - punta(escena.punto)) * celda]
}

// El pato salió de la pantalla, por arriba o por abajo. Si se sigue jugando,
// sale otro. Al caer el último del nivel, antes sale el que reclama por su
// familia.
function fin() {
  const lloraba = pato.llora
  const cayo = pato.estado === 'cae'
  if (cayo) soplar(true)
  escena.cielo.classList.remove('burlando')
  pato = null
  if (!jugando) {
    escena.reclamo = false
    return
  }
  if (lloraba) return seguir()
  if (escena.reclamo && cayo) {
    escena.reclamo = false
    if (escena.nivel === PARVADAS.length && !escena.odio) ascender()
    else soltarReclamo()
    return
  }
  espera = setTimeout(soltar, 800)
}

// El que se burló ya se escapó: aunque siga a la vista, no se le puede dar.
function disparar(evento) {
  if (!pato || evento.button) return
  pato.disparos++
  if ((pato.estado !== 'vuela' && pato.estado !== 'huye') || pato.escala > 1) return
  const { lienzo, dpr, cuadros } = escena
  const { tamano } = pato
  const caja = lienzo.getBoundingClientRect()
  const margen = MARGEN * dpr * (evento.pointerType === 'touch' ? 2 : 1) * tamano
  const dx = Math.abs((evento.clientX - caja.left) * dpr - pato.x)
  const dy = Math.abs((evento.clientY - caja.top) * dpr - pato.y)
  if (dx > (cuadros.arriba.width / 2) * tamano + margen || dy > (cuadros.arriba.height / 2) * tamano + margen) return
  // Con casco, el primer acierto solo se lo vuela, y el pato da la vuelta.
  if (pato.armadura) {
    const { x, y, mira } = pato
    escena.chatarra = { x, y, mira, tamano, t: 0, vy: -0.5 * escena.alto }
    Object.assign(pato, { armadura: false, rumbo: pato.rumbo + Math.PI, giro: 0.6 })
    return
  }
  Object.assign(pato, { estado: 'herido', t: 0 })
  cazados++
  escena.contador = null
  if (cazados % POR_NIVEL === 0) escena.reclamo = true
}

// El casco volado cae como el pato cazado, dando vueltas, hasta salir del cielo.
function caerChatarra(dt) {
  const c = escena.chatarra
  c.t += dt
  c.vy += GRAVEDAD * escena.alto * dt
  c.y += c.vy * dt
  if (c.y > escena.lienzo.height) escena.chatarra = null
}

// El aire que mueve el pato al caer, para la nube, en coordenadas de la
// ventana. `fuera` avisa que ya salió.
function soplar(fuera) {
  const { lienzo, dpr, nube } = escena
  const caja = lienzo.getBoundingClientRect()
  const detail = fuera ? { fuera } : { x: caja.left + pato.x / dpr, y: caja.top + pato.y / dpr }
  nube.dispatchEvent(new CustomEvent('soplo', { detail }))
}

// Mientras se ve el letrero o suben los cazados, el lienzo pasa delante de la
// nube para que se vea entero: no hay patos que tengan que ir detrás.
function pintar(ahora = performance.now()) {
  const { ctx, lienzo, viaje, letrero, cielo, ascenso } = escena
  cielo.classList.toggle('anunciando', Boolean(letrero || ascenso))
  ctx.clearRect(0, 0, lienzo.width, lienzo.height)
  if (jugando) pintarContador()
  if (viaje) pintarParvada(viaje, ahora)
  if (letrero) pintarLetrero(letrero.cuadro)
  if (ascenso) pintarAscenso(ascenso, ahora)
  if (escena.chatarra) pintarChatarra()
  if (pato) pintarPato()
}

function pintarChatarra() {
  const { ctx, cuadros, celda } = escena
  const { x, y, t, tamano, mira } = escena.chatarra
  const ancho = cuadros.casco.width * tamano
  const lado = Math.floor(t / VUELTA) % 2 ? -mira : mira
  const esquina = [Math.round((x - ancho / 2) / celda) * celda, Math.round((y - (cuadros.casco.height * tamano) / 2) / celda) * celda]
  ctx.setTransform(lado * tamano, 0, 0, tamano, lado < 0 ? esquina[0] + ancho : esquina[0], esquina[1])
  ctx.drawImage(cuadros.casco, 0, 0)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

// La parvada que se va al cielo siguiente, en V como los patos de verdad: el
// primero adelante y los demás en dos brazos abiertos hacia atrás, cada uno
// con su aleteo. Cruza de izquierda a derecha mientras las nubes pasan al
// revés, entera aunque sea larga: el último llega hasta donde llegaría el
// primero de una corta. Al final se mete detrás de las nubes nuevas y se
// pierde.
function pintarParvada({ t0, parvada }, ahora) {
  const { ctx, cuadros, lienzo, alto, techo, celda } = escena
  const s = Math.min(1, (ahora - t0) / 1000 / VIAJE)
  const ancho = cuadros.arriba.width * LEJANA
  const cola = 1.5 * Math.ceil((parvada - 1) / 2) * ancho
  const guia = { x: -ancho + s * (0.7 * lienzo.width + ancho + cola), y: techo + 0.35 * (alto - techo) }
  ctx.globalAlpha = Math.min(1, (1 - s) / 0.2)
  for (let i = 0; i < parvada; i++) {
    const fila = Math.ceil(i / 2)
    const x = guia.x - 1.5 * fila * ancho
    const y = guia.y + (i % 2 ? -0.5 : 0.5) * fila * ancho
    const cuadro = Math.floor(((ahora - t0) / 1000) * ALETEO + i / 3) % 2 ? cuadros.abajo : cuadros.arriba
    ctx.setTransform(LEJANA, 0, 0, LEJANA, Math.round(x / celda) * celda, Math.round(y / celda) * celda)
    ctx.drawImage(cuadro, 0, 0)
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
}

// Un rayo de luz baja del cielo y los cazados suben por él uno tras otro,
// desde abajo, con su aureola y aleteando despacio, hasta perderse arriba. El
// rayo se enciende al empezar y se apaga al final.
function pintarAscenso({ t0, cuantos }, ahora) {
  const { ctx, cuadros, lienzo, alto, celda } = escena
  const t = (ahora - t0) / 1000
  const ancho = RAYO * alto
  const izquierda = (lienzo.width - ancho) / 2
  const luz = ctx.createLinearGradient(izquierda, 0, izquierda + ancho, 0)
  luz.addColorStop(0, 'rgba(248, 216, 120, 0)')
  luz.addColorStop(0.5, 'rgba(252, 252, 252, 0.6)')
  luz.addColorStop(1, 'rgba(248, 216, 120, 0)')
  ctx.globalAlpha = Math.max(0, Math.min(1, t / 0.5, (ASCENSO - t) / 0.5))
  ctx.fillStyle = luz
  ctx.fillRect(izquierda, 0, ancho, lienzo.height)
  ctx.globalAlpha = 1
  const { width, height } = cuadros.arriba
  for (let i = 0; i < cuantos; i++) {
    const s = (t - (i / cuantos) * (ASCENSO - SUBIDA)) / SUBIDA
    if (s < 0 || s > 1) continue
    const x = Math.round((izquierda + ((i * 0.618) % 1) * (ancho - width)) / celda) * celda
    const y = Math.round((lienzo.height - s * (lienzo.height + 2 * height)) / celda) * celda
    ctx.drawImage(Math.floor(((t + i / 3) * ALETEO) / 2) % 2 ? cuadros.abajo : cuadros.arriba, x, y)
    ctx.drawImage(cuadros.aureola, x, y - 2 * celda)
  }
}

function pintarLetrero(cuadro) {
  const { ctx, lienzo, techo, celda } = escena
  const x = Math.round((lienzo.width - cuadro.width) / 2 / celda) * celda
  const y = Math.round(((techo + lienzo.height - cuadro.height) / 2) / celda) * celda
  ctx.drawImage(cuadro, x, y)
}

function pintarPato() {
  const { ctx, cuadros, celda, lienzo, alto } = escena
  const p = pato
  const globo = p.globo ?? escena.globo
  const { arriba, abajo, casco } = p.escala > 1 ? agrandados(p.escala) : cuadros
  let cuadro = cuadros.herido
  let mira = p.mira
  if (p.estado === 'cae') {
    cuadro = cuadros.cae
    mira = Math.floor(p.t / VUELTA) % 2 ? -1 : 1
  } else if (p.estado !== 'herido') {
    cuadro = Math.floor(p.t * ALETEO) % 2 ? abajo : arriba
  }
  // La esquina va sobre la rejilla de la nube, y al caer se desvanece en el
  // último tramo, donde se acaba el cielo.
  const ancho = cuadro.width * p.tamano
  const x = Math.round((p.x - ancho / 2) / celda) * celda
  const y = Math.round((p.y - (cuadro.height * p.tamano) / 2) / celda) * celda
  ctx.globalAlpha = p.estado === 'cae' ? Math.min(1, (lienzo.height - p.y) / (0.15 * alto)) : 1
  ctx.setTransform(mira * p.tamano, 0, 0, p.tamano, mira < 0 ? x + ancho : x, y)
  ctx.drawImage(cuadro, 0, 0)
  if (p.armadura) ctx.drawImage(casco, 0, 0)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  if (p.estado === 'burla' && p.t > LLEGADA) ctx.drawImage(globo, ...globoJunto(x, y, p.escala))
  if (p.llora && p.escala > 1 && (p.estado === 'huye' || p.t > LLEGADA)) pintarLagrimas(x, y, p)
}

// El que reclama llora desde que lo dice hasta que se va: dos lágrimas
// alternadas caen del ojo, punto a punto, hasta las patas. Mira a la derecha.
function pintarLagrimas(x, y, { t, escala }) {
  const { ctx, celda } = escena
  const { lagrima } = agrandados(escala)
  for (const desfase of [0, 0.5]) {
    const caida = Math.floor(((t / LLANTO + desfase) % 1) * 6 * escala)
    ctx.drawImage(lagrima, x + 12 * escala * celda, y + (5 * escala + caida) * celda)
  }
}

// El pato a `escala` puntos por punto, para la burla. Grande solo vuela, así
// que bastan las alas arriba y abajo, el casco y la lágrima del que reclama.
function agrandados(escala) {
  const { grandes, celda } = escena
  grandes[escala] ??= {
    arriba: pintarCuadro(agrandar(ARRIBA, escala), celda),
    abajo: pintarCuadro(agrandar(ABAJO, escala), celda),
    casco: pintarCuadro(agrandar(CASCO, escala), celda),
    lagrima: pintarCuadro(agrandar(['a'], escala), celda),
  }
  return grandes[escala]
}

function agrandar(filas, escala) {
  return filas.flatMap((fila) => Array(escala).fill([...fila].map((letra) => letra.repeat(escala)).join('')))
}

// Abajo del cielo, justo encima del aviso y alineado con su borde: el de los
// botones, que en un teléfono son lo único que queda de él mientras se juega.
function dondeContador() {
  const { celda, alto, izquierda } = escena
  escena.contador ??= pintarCuadro(contornear(filasDeTexto(String(cazados), 'b')), celda)
  const { contador } = escena
  return [izquierda, (Math.floor(alto / celda) - 2) * celda - contador.height, contador]
}

function pintarContador() {
  const [x, y, contador] = dondeContador()
  escena.ctx.drawImage(contador, x, y)
}

// El contador lleva un punto negro alrededor de cada letra: así se lee sobre
// el cielo claro y sobre la nube.
function contornear(filas) {
  const lleno = (x, y) => filas[y]?.[x] !== undefined && filas[y][x] !== '.'
  return Array.from({ length: filas.length + 2 }, (_, y) =>
    Array.from({ length: filas[0].length + 2 }, (_, x) => {
      if (lleno(x - 1, y - 1)) return filas[y - 1][x - 1]
      for (let dy = -2; dy <= 0; dy++) for (let dx = -2; dx <= 0; dx++) if (lleno(x + dx, y + dy)) return 'k'
      return '.'
    }).join(''),
  )
}

// Un cuadro en la rejilla de la nube, en un lienzo chico: un cuadrado lleno
// por celda, el píxel de las consolas que inspiran el juego.
function pintarCuadro(filas, celda) {
  const lienzo = document.createElement('canvas')
  lienzo.width = filas[0].length * celda
  lienzo.height = filas.length * celda
  const ctx = lienzo.getContext('2d')
  filas.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x++) {
      if (!COLORES[fila[x]]) continue
      ctx.fillStyle = COLORES[fila[x]]
      ctx.fillRect(x * celda, y * celda, celda, celda)
    }
  })
  return lienzo
}
