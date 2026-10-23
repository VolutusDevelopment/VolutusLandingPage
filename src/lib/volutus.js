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

// El sol: alto y detrás de quien mira, el mismo en todas las páginas salvo la
// portada (ver `aire`), para que la luz sea pareja: las cimas claras y los
// vientres apenas más oscuros, sin el contraste de un sol rasante. Su altura y
// su rumbo, en grados, desde hacia donde mira la cámara.
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
 * ancho que alto, `giro: -1` invierte el sentido en que circula la superficie
 * y `sol`, el sol de esa vista en vez de `SOL`.
 */
export const VISTAS = {
  // La portada: desde el aire, detrás del rollo y a la altura de su cima,
  // mirándolo a lo largo. Entra enorme por la izquierda y se aleja hacia el
  // horizonte de la derecha. A 1,4 km de su espalda, para que su base entre
  // entera en el lienzo: más cerca, el lienzo la cortaba. En un lienzo
  // apaisado mira el rollo más de frente: a 63° se perdía en una cuña hacia la
  // derecha, y en el borde medía la mitad de alto que en un iPad vertical.
  // Gira al revés: la espalda del rollo baja, y la nube se veía caer; así
  // sube, como su frente en las otras páginas. El sol va bajo, a ras del
  // horizonte, delante a la izquierda: la luz rasante recorta cada torre de la
  // nube y le marca el relieve, también al bajar con la grúa (`bajar`).
  aire: {
    ojo: [0, 1170, -2300],
    rumbo: 63,
    apaisado: 80,
    cabeceo: 0,
    campo: 52,
    centro: [0.9, 0.28],
    cubre: 1.8,
    giro: -1,
    sol: [8, 330],
  },
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
}

// Cuánto avanzó `t` entre `desde` y `hasta`, de 0 a 1, arrancando y frenando
// despacio.
const suave = (t, desde, hasta) => {
  const k = Math.min(1, Math.max(0, (t - desde) / (hasta - desde)))
  return k * k * (3 - 2 * k)
}
const entre = (a, b, k) => a + (b - a) * k

/**
 * La cámara de la portada a `t` (de 0 a 1) del scroll hasta Proyectos, que la
 * tapa (`recorrer` en nubes.js). Es una grúa: no gira, baja lenta de la altura de la cima al
 * suelo mientras su brazo la acerca al pie del rollo y levanta la vista, hasta
 * tenerlo encima. Nunca sube sobre la nube: se la mira siempre desde abajo. En
 * 0 es `aire`. El punto al que mira pasa a la mitad del lienzo (`medio`) y el
 * sol se queda donde estaba en la portada aunque la cámara gire (`fijo`).
 */
export function bajar(t) {
  const { aire } = VISTAS
  const baja = suave(t, 0, 0.5)
  const entra = suave(t, 0, 0.95)
  const centra = suave(t, 0, 0.3)
  return {
    ...aire,
    ojo: [0, entre(aire.ojo[1], 2, baja), entre(aire.ojo[2], -1150, entra)],
    apaisado: entre(aire.apaisado, 70, entra),
    cabeceo: entre(aire.cabeceo, 45, entra),
    campo: entre(aire.campo, 66, baja),
    centro: [aire.centro[0], entre(aire.centro[1], 0.6, centra)],
    medio: centra,
    fijo: true,
  }
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
 * lienzo, hacia dónde está el sol y el sentido del giro. `perspectiva` es el
 * nombre de una de las `VISTAS` o, al bajar por la portada, la vista misma
 * (`bajar`).
 */
export function encuadrar(perspectiva, ancho, alto) {
  const vista = typeof perspectiva === 'object' ? perspectiva : (VISTAS[perspectiva] ?? VISTAS.aire)
  const rumboDe = (v) => (ancho > alto ? (v.apaisado ?? v.rumbo) : v.rumbo)
  const rumbo = grados(rumboDe(vista))
  const cabeceo = grados(vista.cabeceo)
  const frente = [Math.cos(cabeceo) * Math.cos(rumbo), Math.sin(cabeceo), Math.cos(cabeceo) * Math.sin(rumbo)]
  const derecha = normal(cruz([0, 1, 0], frente))
  const arriba = cruz(frente, derecha)
  // El alto con que se mide el rollo: el del lienzo, o más si no cubre el
  // ancho. Entonces crece alrededor del horizonte, que no se mueve.
  const medida = Math.max(alto, ancho / (vista.cubre ?? Infinity))
  const focal = medida / 2 / Math.tan(grados(vista.campo) / 2)
  // Con `medio` (0 a 1), el punto al que mira va de su `x` a la mitad del
  // ancho.
  const [x, y] = vista.centro
  const medio = vista.medio ?? 0
  const centro = [
    x === null ? ancho / 2 : entre(x * medida, ancho / 2, medio),
    y * alto - focal * (1 - alto / medida) * Math.tan(cabeceo),
  ]
  // El sol: su rumbo desde el frente de la cámara, en el plano. Con `fijo`,
  // desde el frente de la portada: no gira con la cámara.
  const [altura, giroSol] = vista.sol ?? SOL
  const giro = grados(giroSol + (vista.fijo ? rumboDe(vista) - rumboDe(VISTAS.aire) : 0))
  const plano = normal([frente[0], 0, frente[2]])
  const lado = normal([derecha[0], 0, derecha[2]])
  const sol = normal([
    Math.cos(altura) * (Math.cos(giro) * plano[0] + Math.sin(giro) * lado[0]),
    Math.sin(altura),
    Math.cos(altura) * (Math.cos(giro) * plano[2] + Math.sin(giro) * lado[2]),
  ])
  return { ojo: vista.ojo, frente, derecha, arriba, focal, centro, sol, giro: vista.giro ?? 1 }
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
