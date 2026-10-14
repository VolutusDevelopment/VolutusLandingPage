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
 * solo desde dónde se mira: la nube, su aire y su luz son los mismos.
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
 * pide.
 */
export const VISTAS = {
  // La portada: desde el aire, detrás del rollo y a la altura de su cima,
  // mirándolo a lo largo. Entra enorme por la izquierda y se aleja hacia el
  // horizonte de la derecha. A 1,4 km de su espalda, para que su base entre
  // entera en el lienzo: más cerca, el lienzo la cortaba.
  aire: { ojo: [0, 1170, -2300], rumbo: 63, cabeceo: 0, campo: 52, centro: [0.9, 0.28] },
  // /nosotros: de costado y a la altura del eje, frente a su frente, que
  // sube. Cruza el lienzo casi paralelo a él.
  costado: { ojo: [0, 700, 2500], rumbo: -96, cabeceo: 0, campo: 33, centro: [null, 0.5] },
  // La 404: desde el suelo, viéndola llegar. Pasa alta por la izquierda y se
  // pierde en el horizonte de la derecha, abajo, donde el cielo es blanco.
  suelo: { ojo: [0, 2, 2000], rumbo: -120, cabeceo: 20, campo: 60, centro: [null, 0.5] },
  // La 500: pasando por encima. A 650 m de su frente, mirando hacia arriba:
  // cruza de lado a lado como una ola que se viene encima, con su base plana
  // abajo y cielo arriba y abajo.
  encima: { ojo: [0, 2, 1500], rumbo: -90, cabeceo: 35, campo: 70, centro: [null, 0.5] },
  // /patos: lejos, una franja sobre el horizonte; el cielo queda para jugar.
  horizonte: { ojo: [0, 2, 7000], rumbo: -95, cabeceo: 2, campo: 50, centro: [null, 0.8] },
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
 * lienzo, y hacia dónde está el sol.
 */
export function encuadrar(perspectiva, ancho, alto) {
  const vista = VISTAS[perspectiva] ?? VISTAS.aire
  const rumbo = grados(vista.rumbo)
  const cabeceo = grados(vista.cabeceo)
  const frente = [Math.cos(cabeceo) * Math.cos(rumbo), Math.sin(cabeceo), Math.cos(cabeceo) * Math.sin(rumbo)]
  const derecha = normal(cruz([0, 1, 0], frente))
  const arriba = cruz(frente, derecha)
  const focal = alto / 2 / Math.tan(grados(vista.campo) / 2)
  const [x, y] = vista.centro
  const centro = [x === null ? ancho / 2 : x * alto, y * alto]
  // El sol: su rumbo desde el frente de la cámara, en el plano.
  const [altura, giro] = SOL.map(grados)
  const plano = normal([frente[0], 0, frente[2]])
  const lado = normal([derecha[0], 0, derecha[2]])
  const sol = normal([
    Math.cos(altura) * (Math.cos(giro) * plano[0] + Math.sin(giro) * lado[0]),
    Math.sin(altura),
    Math.cos(altura) * (Math.cos(giro) * plano[2] + Math.sin(giro) * lado[2]),
  ])
  return { ojo: vista.ojo, frente, derecha, arriba, focal, centro, sol }
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
