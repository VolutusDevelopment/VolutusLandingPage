/**
 * La volutus: una sola nube física, vista desde una cámara por página.
 *
 * Es una Morning Glory al alba, con sus medidas de verdad (Roger K. Smith,
 * «The Morning Glory and related phenomena», LMU München; Atlas Internacional
 * de Nubes, OMM). Un rollo horizontal y sin fin, de sección elíptica, más
 * ancho que alto, que avanza perpendicular a su eje. No gira como un sólido:
 * en el frente el aire sube y condensa, y atrás baja y se evapora. Eso es lo
 * que se ve rodar.
 *
 * El mundo va en metros. `x` corre a lo largo del eje, `y` sube y `z` apunta
 * hacia donde avanza el rollo, así que el frente es el lado de `z` positivo.
 * Lo pinta el worker de las nubes (nubes-lienzo.js) con las constantes de
 * `FISICA`, y el juego de la 404 (patos.js) usa las mismas cuentas para saber
 * dónde se ve.
 *
 * Cada página mira con su cámara (`VISTAS`), y lo que cambia entre ellas es
 * desde dónde se mira: la nube, su aire y su luz son los mismos. La única
 * licencia es la de la portada, que la ve girar al revés (`giro`).
 */

// El rollo. Su sección mide 1,7 km de ancho por 1,2 km de alto, con el eje a
// 700 m: la base queda a 100-200 m y la cima a 1,3 km. `nivel` es el de
// condensación, en semiejes desde el eje: ahí nace la nube en el frente. La
// superficie circula a `circula` m/s, y el viento a lo largo del eje la corre
// `deriva` m/s.
export const ROLLO = { eje: 700, alto: 600, ancho: 850, nivel: -0.85, circula: 4, deriva: 0.8 }

// La distancia a la que juegan los cúmulos del juego de la 404, como mucho, en
// m: a esa distancia, su tamaño en el lienzo es el de un cúmulo de buen tiempo
// de verdad, de unos cientos de metros.
export const JUEGO = 3000

// El sol: alto y detrás de quien mira, el mismo en todas las páginas, para que
// la luz sea pareja: las cimas claras y los vientres apenas más oscuros, sin
// el contraste de un sol rasante. Su altura y su rumbo, en grados, desde hacia
// donde mira la cámara.
const SOL = [60, 180]

// La visibilidad del aire limpio de la mañana sobre el golfo, en m: más allá
// la nube se funde con el cielo (Koschmieder: el contraste cae al 2 %). Con
// 30 km, la volutus se deshacía antes de llegar al borde derecho.
const VISIBILIDAD = 80000

// El tiempo de la nube va en cámara rápida. El factor sale de cada lienzo
// (`lapso`): la superficie del rollo, a `REFERENCIA` m de la cámara, corre
// `RAPIDEZ` px CSS por segundo en cualquier pantalla. Más cerca corre más y
// más lejos, menos, como manda la perspectiva.
const RAPIDEZ = 14
const REFERENCIA = 1500

/**
 * Las cámaras. `ojo` es dónde está: `[x, y, z]` en metros. `rumbo` es hacia
 * dónde mira en el plano, en grados desde el eje del rollo (90: de frente a su
 * avance; -90: de frente a su frente). `cabeceo` cuánto mira hacia arriba, y
 * `campo` el ángulo vertical que cabe en el lienzo. `centro` pone el punto al
 * que mira en el lienzo, en altos desde la izquierda y desde arriba (sin `x`,
 * va al medio del ancho): así el rollo se mide por el alto, como la portada
 * pide. `cubre`, en las que lo miran en diagonal, es cuántos altos de ancho
 * cruza el rollo antes de perderse en su punto de fuga: en un lienzo más
 * ancho que eso, la cámara lo mide por el ancho, como si el lienzo fuera más
 * alto. Sin eso, en una ventana baja el rollo se acababa a media pantalla y
 * dejaba el resto vacío. `apaisado`, si lo hay, es el rumbo en un lienzo más
 * ancho que alto, y `giro: -1` invierte el sentido en que circula la
 * superficie.
 */
export const VISTAS = {
  // La portada: desde el aire, detrás del rollo y a la altura de su cima,
  // mirándolo a lo largo. Entra enorme por la izquierda y se aleja hacia el
  // horizonte de la derecha. A 1,4 km de su espalda, para que su base entre
  // entera en el lienzo: más cerca, el lienzo la cortaba. En un lienzo
  // apaisado mira el rollo más de frente: a 63° se perdía en una cuña hacia la
  // derecha, y en el borde medía la mitad de alto que en un iPad vertical.
  // Gira al revés: la espalda del rollo baja, y la nube se veía caer; así
  // sube, como su frente en las otras páginas.
  aire: { ojo: [0, 1170, -2300], rumbo: 63, apaisado: 80, cabeceo: 0, campo: 52, centro: [0.9, 0.28], cubre: 1.8, giro: -1 },
  // /nosotros: de costado y a la altura del eje, frente a su frente, que
  // sube. Cruza el lienzo casi paralelo a él.
  costado: { ojo: [0, 700, 2500], rumbo: -96, cabeceo: 0, campo: 33, centro: [null, 0.5] },
  // /servicios: desde el suelo, a 2,1 km de su frente, mirando hacia arriba.
  // Cruza el lienzo casi paralelo a él, con su frente y su base plana, y el
  // título va dentro.
  abajo: { ojo: [0, 2, 2100], rumbo: -87, cabeceo: 18, campo: 42, centro: [null, 0.62] },
  // La 404: desde el suelo, viéndola llegar. Pasa alta por la izquierda y se
  // pierde en el horizonte de la derecha, abajo, donde el cielo es blanco.
  suelo: { ojo: [0, 2, 2000], rumbo: -120, cabeceo: 20, campo: 60, centro: [null, 0.5], cubre: 2.5 },
  // La 500: pasando por encima. A 650 m de su frente, mirando hacia arriba:
  // cruza de lado a lado como una ola que se viene encima, con su base plana
  // abajo y cielo arriba y abajo.
  encima: { ojo: [0, 2, 1500], rumbo: -90, cabeceo: 35, campo: 70, centro: [null, 0.5] },
  // /patos: lejos, una franja sobre el horizonte; el cielo queda para jugar.
  horizonte: { ojo: [0, 2, 7000], rumbo: -95, cabeceo: 2, campo: 50, centro: [null, 0.8] },
  // El final de `techo` (ver `RECORRIDOS`): bajo el rollo, mirando arriba.
  techo: { ojo: [0, 40, -1100], rumbo: 88, apaisado: 90, cabeceo: 38, campo: 70, centro: [0.9, 0.62], cubre: 1.8, giro: -1 },
}

// Los recorridos de la cámara de la portada al bajar hasta Proyectos
// (prototipo, se elige con ?camara=). La nube se mira siempre desde abajo y
// nunca se sube sobre ella. `techo` va por paradas (`en`, de 0 a 1, ver
// `recorrer`); los demás son una función de `t` que dice la cámara entera, con
// cada medida en una curva suave: nada salta ni vuelve atrás. `medio` lleva el
// punto al que mira de su lugar en `aire` (0) al centro del lienzo (1).
const AIRE = { ...VISTAS.aire, medio: 0, curva: 0, en: 0 }
const parada = (en, ojo, rumbo, cabeceo, campo, alto, extra) => ({
  en, ojo, rumbo, apaisado: rumbo, cabeceo, campo, centro: [0.9, alto], cubre: 1.8, giro: -1, medio: 1, curva: 0, ...extra,
})

// Cuánto avanzó `t` entre `desde` y `hasta`, de 0 a 1, arrancando y frenando
// despacio.
const suave = (t, desde, hasta) => {
  const k = Math.min(1, Math.max(0, (t - desde) / (hasta - desde)))
  return k * k * (3 - 2 * k)
}
const entre = (a, b, k) => a + (b - a) * k

// Lo que comparten: la portada se va mientras el punto al que mira pasa al
// centro del lienzo (en `hasta`), la nube gira como en la portada y el sol se
// queda donde estaba en ella aunque la cámara gire (`fijo`).
const dejarPortada = (t, hasta, alto) => {
  const k = suave(t, 0, hasta)
  return { centro: [0.9, entre(AIRE.centro[1], alto, k)], medio: k, cubre: 1.8, giro: -1, curva: 0, fijo: true }
}

// Órbita: el punto bajo el borde de atrás que rodea, y a qué distancia.
const EJE_ORBITA = -900
const RADIO_ORBITA = 650

// Planeador: su rapidez, en m por recorrido entero (`t` de 0 a 1), y su
// rumbo a cada `t`: vira a la izquierda de 63° a 180° y sigue a lo largo.
const RAPIDEZ_PLANEO = 4440
const rumboPlaneo = (t) => entre(63, 180, suave(t, 0.02, 0.45))

// Dónde va el planeador: lo que avanzó por su rumbo desde la portada, sumado
// una vez en `PASOS_VUELO` tramos de `t`. A cada `t` se interpola entre dos.
const PASOS_VUELO = 1000
const VUELO = [[AIRE.ojo[0], AIRE.ojo[2]]]
for (let i = 0; i < PASOS_VUELO; i++) {
  const rumbo = (rumboPlaneo((i + 0.5) / PASOS_VUELO) * Math.PI) / 180
  const [x, z] = VUELO[i]
  VUELO.push([x + (RAPIDEZ_PLANEO * Math.cos(rumbo)) / PASOS_VUELO, z + (RAPIDEZ_PLANEO * Math.sin(rumbo)) / PASOS_VUELO])
}
function vuelo(t) {
  const i = Math.min(PASOS_VUELO - 1, Math.floor(t * PASOS_VUELO))
  const k = t * PASOS_VUELO - i
  return [0, 1].map((e) => entre(VUELO[i][e], VUELO[i + 1][e], k))
}

// Costanera: los m que recorre el auto, a velocidad pareja después de
// arrancar.
const RECORRIDO_COSTANERA = 2600
// De 0 a 1 en `t`, a ritmo parejo, salvo al arrancar: hasta `a` acelera.
const arrancar = (t, a) => (t < a ? (t * t) / (2 * a) : t - a / 2) / (1 - a / 2)

export const RECORRIDOS = {
  // Techo: baja al suelo y se acerca hasta quedar bajo su borde, mirando
  // arriba.
  techo: [
    AIRE,
    parada(0.12, [0, 2, -2000], 89, 18, 64, 0.6),
    { ...VISTAS.techo, ojo: [0, 2, -1100], medio: 1, curva: 0, en: 1 },
  ],
  // Planeador (su largo): un velero que deja la portada bajando en espiral,
  // vira a la izquierda inclinando las alas y planea a lo largo de su espalda,
  // a 200 m, con la nube a la derecha y su punto de fuga adelante.
  planeador: (t) => {
    const rumbo = rumboPlaneo(t)
    const giro = (t - 0.02) / 0.43
    const [x, z] = vuelo(t)
    // Mientras vira, la vista se va quedando hacia la nube, a su derecha:
    // menos en un lienzo vertical, donde la pared lo taparía entero.
    const vira = suave(t, 0.02, 0.45)
    return {
      ...dejarPortada(t, 0.2, 0.55),
      ojo: [x, entre(entre(1170, 220, suave(t, 0, 0.3)), 160, suave(t, 0.3, 1)), z],
      rumbo: rumbo - 12 * vira,
      apaisado: rumbo - 25 * vira + (AIRE.apaisado - AIRE.rumbo) * (1 - vira),
      cabeceo: entre(0, 20, suave(t, 0, 0.3)),
      campo: entre(52, 66, suave(t, 0, 0.3)),
      // La inclinación de las alas sigue al viraje: nada al entrar y al salir.
      alabeo: giro > 0 && giro < 1 ? 8 * Math.sin(Math.PI * giro) ** 2 : 0,
    }
  },
  // Órbita (su volumen): un dron baja a 30 m y rodea despacio un punto bajo
  // su borde de atrás, siempre mirándolo. La nube pasa de perderse a la
  // derecha a perderse a la izquierda.
  orbita: (t) => {
    const k = suave(t, 0, 0.16)
    const vuelta = suave(t, 0.02, 1)
    const rumbo = entre(63, 120, vuelta)
    const r = grados(rumbo)
    const [x, z] = [-RADIO_ORBITA * Math.cos(r), EJE_ORBITA - RADIO_ORBITA * Math.sin(r)]
    return {
      ...dejarPortada(t, 0.16, 0.6),
      ojo: [entre(AIRE.ojo[0], x, k), entre(1170, 30, k), entre(AIRE.ojo[2], z, k)],
      rumbo,
      apaisado: entre(AIRE.apaisado, 120, vuelta),
      cabeceo: entre(0, 36, k),
      campo: entre(52, 64, k),
    }
  },
  // Grúa (su altura): la cámara no gira; baja lenta desde la altura de la
  // portada hasta el suelo y su brazo la acerca al pie de la nube, que
  // levanta la vista. La nube crece hasta quedar encima.
  grua: (t) => {
    const baja = suave(t, 0, 0.5)
    const entra = suave(t, 0, 0.95)
    return {
      ...dejarPortada(t, 0.3, 0.6),
      ojo: [0, entre(1170, 2, baja), entre(-2300, -1150, entra)],
      rumbo: 63,
      apaisado: entre(AIRE.apaisado, 70, entra),
      cabeceo: entre(0, 45, entra),
      campo: entre(52, 66, baja),
    }
  },
  // Rueda (su giro): baja a pie hasta cerca de su espalda, se vuelve a
  // mirarla a lo largo y se queda quieta. Desde ahí el scroll la hace rodar:
  // cada pantalla que bajas o subes, la nube da un poco más de vuelta, y
  // siempre hacia arriba (`rueda`, en radianes por recorrido entero).
  rueda: (t) => {
    const k = suave(t, 0, 0.2)
    return {
      ...dejarPortada(t, 0.2, 0.6),
      ojo: [0, entre(1170, 2, suave(t, 0, 0.14)), entre(-2300, -1000, k)],
      rumbo: entre(63, 15, k),
      apaisado: entre(AIRE.apaisado, 20, k),
      cabeceo: entre(0, 40, k),
      campo: entre(52, 70, k),
      rueda: 1.4 * suave(t, 0.1, 0.22),
    }
  },
  // Costanera (su paso): baja a la ruta de la costa y va en auto, a
  // velocidad pareja, mirando por la ventana. Las torres de la nube desfilan:
  // las cercanas más rápido que las lejanas.
  costanera: (t) => {
    const k = suave(t, 0, 0.16)
    return {
      ...dejarPortada(t, 0.16, 0.6),
      ojo: [RECORRIDO_COSTANERA * arrancar(t, 0.16), entre(1170, 2, k), entre(-2300, -1500, k)],
      rumbo: entre(63, 84, k),
      apaisado: entre(AIRE.apaisado, 86, k),
      cabeceo: entre(0, 26, k),
      campo: entre(52, 66, k),
    }
  },
  // Alba (su luz): baja a la playa, lejos, y mira el rollo entero mientras
  // camina muy despacio hacia él. El sol, que en la portada está alto
  // detrás tuyo, baja hasta rozar el horizonte: la luz se vuelve rasante y
  // cada torre de la nube gana su sombra.
  alba: (t) => {
    const k = suave(t, 0, 0.16)
    const sol = suave(t, 0.08, 1)
    return {
      ...dejarPortada(t, 0.16, 0.62),
      ojo: [0, entre(1170, 2, k), entre(-2300, -1700, suave(t, 0, 1))],
      rumbo: entre(63, 76, k),
      apaisado: entre(AIRE.apaisado, 82, k),
      cabeceo: entre(0, 24, k),
      campo: entre(52, 56, k),
      sol: [entre(60, 4, sol), entre(180, 160, sol)],
    }
  },
}

// Las luces de la portada al bajar (prototipo, se eligen con ?luz=): dónde
// está el sol, como `SOL`, en grados desde el frente de la portada. Queda fijo
// en el cielo aunque la cámara gire. Todas valen también para la portada,
// salvo `atardecer`, que parte con la luz de hoy y baja el sol con el scroll.
// La dorada además entibia la luz de la nube (index.html).
export const LUCES = {
  // Bajo, detrás de quien mira: la cara de la nube se enciende entera.
  rasante: [6, 170],
  // Bajo, a la derecha: cada torre tiene su lado de luz y su lado de sombra.
  costado: [12, 110],
  // Bajo, delante a la izquierda: las torres se recortan con luz rasante y el
  // relieve se marca.
  lateral: [8, 330],
  // A media altura, delante a la derecha: la cresta se enciende en el borde
  // y el cuerpo queda en sombra.
  tresCuartos: [20, 60],
  // Como `costado`, con la luz tibia de la primera hora.
  dorada: [8, 120],
  atardecer: (t) => [entre(SOL[0], 6, suave(t, 0, 1)), entre(SOL[1], 170, suave(t, 0, 1))],
}

// La cámara a `t` (0 a 1) de un recorrido, con una curva Catmull-Rom en cada
// medida: pasa por todas las paradas sin detenerse en ninguna.
export function recorrer(paradas, t) {
  if (typeof paradas === 'function') return paradas(t)
  const ultima = paradas.length - 1
  const i = Math.max(0, Math.min(ultima - 1, paradas.findLastIndex((p) => p.en <= t)))
  const u = Math.min(1, Math.max(0, (t - paradas[i].en) / (paradas[i + 1].en - paradas[i].en)))
  const [a, b, c, d] = [i - 1, i, i + 1, i + 2].map((j) => paradas[Math.min(ultima, Math.max(0, j))])
  const curva = (p0, p1, p2, p3) =>
    0.5 * (2 * p1 + (p2 - p0) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (3 * p1 - p0 - 3 * p2 + p3) * u * u * u)
  const vista = {}
  for (const clave of ['rumbo', 'apaisado', 'cabeceo', 'campo', 'cubre', 'giro', 'medio', 'curva']) {
    vista[clave] = curva(...[a, b, c, d].map((p) => p[clave]))
  }
  vista.ojo = [0, 1, 2].map((e) => curva(a.ojo[e], b.ojo[e], c.ojo[e], d.ojo[e]))
  // La curva no baja del suelo al llegar a él desde lo alto.
  vista.ojo[1] = Math.max(2, vista.ojo[1])
  vista.centro = [0, 1].map((e) => curva(a.centro[e], b.centro[e], c.centro[e], d.centro[e]))
  const sol = [a, b, c, d].map((p) => p.sol ?? SOL)
  vista.sol = [0, 1].map((e) => curva(sol[0][e], sol[1][e], sol[2][e], sol[3][e]))
  return vista
}

const grados = (g) => (g * Math.PI) / 180
const punto = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const unir = (a, b, k) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const normal = (a) => {
  const largo = Math.hypot(...a)
  return a.map((x) => x / largo)
}

/**
 * La cámara de `perspectiva` para un lienzo de `ancho` × `alto` px: su ojo,
 * sus ejes (`frente`, `derecha` y `arriba`), la focal y el centro en px del
 * lienzo, hacia dónde está el sol y el sentido del giro.
 */
export function encuadrar(perspectiva, ancho, alto) {
  const vista = typeof perspectiva === 'object' ? perspectiva : (VISTAS[perspectiva] ?? VISTAS.aire)
  const rumboDe = (v) => (ancho > alto ? (v.apaisado ?? v.rumbo) : v.rumbo)
  const rumbo = grados(rumboDe(vista))
  const cabeceo = grados(vista.cabeceo)
  const frente = [Math.cos(cabeceo) * Math.cos(rumbo), Math.sin(cabeceo), Math.cos(cabeceo) * Math.sin(rumbo)]
  const recta = normal(cruz([0, 1, 0], frente))
  const alzada = cruz(frente, recta)
  // `alabeo`, en grados: el ala izquierda baja, como al virar a la izquierda.
  const alabeo = grados(vista.alabeo ?? 0)
  const derecha = recta.map((e, i) => e * Math.cos(alabeo) + alzada[i] * Math.sin(alabeo))
  const arriba = alzada.map((e, i) => e * Math.cos(alabeo) - recta[i] * Math.sin(alabeo))
  // El alto con que se mide el rollo: el del lienzo, o más si no cubre el
  // ancho. Entonces crece alrededor del horizonte, que no se mueve.
  const medida = Math.max(alto, ancho / (vista.cubre ?? Infinity))
  // Con `curva` (0 a 1) la lente pasa de recta a ojo de pez (equidistante):
  // ahí `campo` es el ángulo que cabe a lo largo del lado mayor del lienzo.
  const curva = vista.curva ?? 0
  const plana = medida / 2 / Math.tan(grados(vista.campo) / 2)
  const pez = Math.max(ancho, alto) / 2 / (grados(vista.campo) / 2)
  const focal = plana + (pez - plana) * curva
  const [x, y] = vista.centro
  const medio = vista.medio ?? 0
  const centro = [x === null ? ancho / 2 : x * medida * (1 - medio) + (ancho / 2) * medio, y * alto - focal * (1 - alto / medida) * Math.tan(cabeceo)]
  // El sol: su rumbo desde el frente de la cámara, en el plano. Con `fijo`
  // es el rumbo desde el frente de la portada: el sol no gira con la cámara.
  const [altura, giroSol] = vista.sol ?? SOL
  const giro = grados(giroSol + (vista.fijo ? rumboDe(vista) - rumboDe(VISTAS.aire) : 0))
  const plano = normal([frente[0], 0, frente[2]])
  const lado = normal([recta[0], 0, recta[2]])
  const sol = normal([
    Math.cos(altura) * (Math.cos(giro) * plano[0] + Math.sin(giro) * lado[0]),
    Math.sin(altura),
    Math.cos(altura) * (Math.cos(giro) * plano[2] + Math.sin(giro) * lado[2]),
  ])
  return { ojo: vista.ojo, frente, derecha, arriba, focal, centro, sol, giro: vista.giro ?? 1, curva, rueda: vista.rueda ?? 0 }
}

// Dónde se ve un punto del mundo, en px del lienzo, y a qué hondura (la
// distancia a lo largo del frente). Detrás de la cámara no se ve.
export function proyectar({ ojo, frente, derecha, arriba, focal, centro }, p) {
  const d = [p[0] - ojo[0], p[1] - ojo[1], p[2] - ojo[2]]
  const hondura = punto(d, frente)
  if (hondura <= 0) return null
  return [centro[0] + (focal * punto(d, derecha)) / hondura, centro[1] - (focal * punto(d, arriba)) / hondura, hondura]
}

/**
 * El rollo en la columna `x` del lienzo: la altura de su eje (`y`) y su radio
 * (`r`), en px, y su hondura en m. Es el punto del eje que cae en esa
 * columna: donde el eje corta el plano de los rayos de la columna. `null` si
 * el eje no pasa por ella. Lo usa el juego de la 404 para repartir los
 * cúmulos donde estaba el rollo.
 */
export function rollo(camara, x) {
  const { ojo, frente, derecha, arriba, focal, centro } = camara
  const n = cruz(unir(frente, derecha, (x - centro[0]) / focal), arriba)
  if (Math.abs(n[0]) < 1e-9) return null
  const s = ojo[0] - ((ROLLO.eje - ojo[1]) * n[1] - ojo[2] * n[2]) / n[0]
  const visto = proyectar(camara, [s, ROLLO.eje, 0])
  return visto && { y: visto[1], r: (focal * ROLLO.alto) / visto[2], hondura: visto[2] }
}

// El factor de cámara rápida de un lienzo (ver `RAPIDEZ`): `focal` en px del
// lienzo y `densidad` en px del lienzo por px CSS.
export function lapso(focal, densidad) {
  return (RAPIDEZ * REFERENCIA * densidad) / (ROLLO.circula * focal)
}

function num(numero) {
  const texto = String(Number(numero.toPrecision(7)))
  return /[.e]/.test(texto) ? texto : `${texto}.0`
}

// Las medidas del rollo y del aire, para el shader de la nube.
export const FISICA = `const float EJE = ${num(ROLLO.eje)}, RY = ${num(ROLLO.alto)}, RZ = ${num(ROLLO.ancho)}, NIVEL = ${num(ROLLO.nivel)};
const float VUELTA = ${num(ROLLO.circula / ROLLO.alto)}, DERIVA = ${num(ROLLO.deriva / ROLLO.alto)}, BRUMA = ${num(3.912 / VISIBILIDAD)};`
