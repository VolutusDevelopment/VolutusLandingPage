// La reunión de la escena 2, en la sala de mando de la escena 1
// (escena1/lugares.mjs): una mesa baja al medio, cuatro sillones de mando y
// una puerta doble al fondo, que se abre a contraluz. En metros de la sala:
// la pantalla al frente (x = 4), los ventanales a estribor (z = 5) y la
// puerta al fondo (x = -4).

import { placa } from '../pilotos/tres.mjs'
import { RAMPAS as C, hueso } from '../pilotos/modelos.mjs'
import { SILLON } from '../escena1/personajes.mjs'
import { colocar, sala } from '../escena1/lugares.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const res = (a, b) => a.map((v, i) => v - b[i])
const esc = (a, k) => a.map((v) => v * k)
const uni = (a) => esc(a, 1 / Math.hypot(...a))
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

// Los patos miden lo mismo que en la sala de la escena 1.
export const K = 0.42

// Dónde se sienta cada uno, mirando a la mesa (`giro`, como en colocar), y
// a qué altura de sus unidades pisa: moby es más alto de piernas cortas y
// duky pisa en sus patas de juguete. duky es más largo que el asiento: su
// sillón (`sillon`) va más atrás, para que la cola no atraviese el respaldo.
export const ASIENTOS = {
  duckOne: { en: [-2.8, 0, 0], giro: 0, suelo: -2.3 },
  duke: { en: [-1.0, 0, -1.0], giro: -90, suelo: -2.3 },
  duky: { en: [-1.6, 0, 1.0], giro: 90, suelo: -2.2, sillon: [-1.6, 0, 1.23] },
  moby: { en: [-0.4, 0, 1.1], giro: 90, suelo: -2.55 },
}

// Hacia dónde mira, en grados como colocar, quien está en `de` y mira a `a` ([x, z]).
export const giroHacia = ([x0, z0], [x1, z1]) => (Math.atan2(z0 - z1, x1 - x0) * 180) / Math.PI

// De un giro a otro por el lado corto.
export const girar = (a, b, k) => a + ((((b - a) % 360) + 540) % 360 - 180) * k

// Un punto de la sala en las unidades de quien está en `donde`, a escala `k`: lo contrario de colocar.
export const enUnidades = ([x, y, z], { en, giro, suelo = -2.3, k = K }) => {
  const a = (giro * Math.PI) / 180
  const [dx, dz] = [x - en[0], z - en[2]]
  return [(dx * Math.cos(a) - dz * Math.sin(a)) / k, (y - en[1]) / k + suelo, (dx * Math.sin(a) + dz * Math.cos(a)) / k]
}

// ── Caminando ────────────────────────────────────────────────────────────

// Un recorrido por tramos rectos ([x, z]), a paso parejo: dónde va a los `s`
// metros y hacia dónde mira, que en las esquinas gira de a poco.
export const recorrido = (puntos) => {
  const tramos = puntos.slice(1).map((b, i) => ({ a: puntos[i], b, largo: Math.hypot(b[0] - puntos[i][0], b[1] - puntos[i][1]) }))
  const largo = tramos.reduce((total, t) => total + t.largo, 0)
  const punto = (s) => {
    let resta = Math.min(Math.max(s, 0), largo)
    for (const t of tramos) {
      if (resta <= t.largo) return lerp(t.a, t.b, resta / t.largo)
      resta -= t.largo
    }
    return puntos.at(-1)
  }
  return { largo, donde: (s) => ({ en: [punto(s)[0], 0, punto(s)[1]], giro: giroHacia(punto(s - 0.25), punto(s + 0.25)) }) }
}
// Un ciclo de pasos cada medio metro.
export const fase = (s) => (s / 0.5) % 1

// Por la puerta del fondo, en el carril `z`, hasta la mesa.
export const ENTRADA = (z) => recorrido([[-5.2, z], [-0.8, z]])

// Un punto justo delante de la cámara [ojo, mira, campo]: (x, y) de -1 a 1
// cubren lo que se ve de cada cuadro, la franja del medio en 4:3.
export const anteLaCamara = ([ojo, mira, campo]) => {
  const f = uni(res(mira, ojo))
  const derecha = uni(cruz(f, [0, 1, 0]))
  const arriba = cruz(derecha, f)
  const a = 0.3 * Math.tan((campo * Math.PI) / 360)
  return (x, y) => sum(sum(sum(ojo, esc(f, 0.3)), esc(derecha, x * a)), esc(arriba, y * a * 0.75))
}

// ── La mesa ──────────────────────────────────────────────────────────────

// Baja como los patos: un tablero de madera de 3 × 1,2 m a medio metro del piso.
const MADERA = ['#d8a878', '#a8744a', '#7a5032', '#46301c']
const MESA = { x0: -2.4, x1: 0.6, z: 0.6, alto: 0.5 }
const mesa = (() => {
  const { x0, x1, z, alto } = MESA
  const patas = [[x0 + 0.2, -z + 0.2], [x0 + 0.2, z - 0.2], [x1 - 0.2, -z + 0.2], [x1 - 0.2, z - 0.2]]
  return [placa([[x0, alto, -z], [x0, alto, z], [x1, alto, z], [x1, alto, -z]], 0.06, MADERA), ...patas.map(([x, zp]) => hueso([x, 0, zp], [x, alto - 0.03, zp], 0.05, C.oscuro))]
})()

// ── La puerta ────────────────────────────────────────────────────────────

// Doble y ancha, sobre la pintada en la pared del fondo: con `abre` de 0 a 1
// las hojas se corren hacia los lados y entra la luz del pasillo, que cae en
// el piso de la sala.
export const PUERTA = { z0: 1.3, z1: 4.4, alto: 2.5 }
const MEDIO = (PUERTA.z0 + PUERTA.z1) / 2
const LUZ = '#fff2d2'
export const huecoDePuerta = (abre) => (abre * (PUERTA.z1 - PUERTA.z0 - 0.16)) / 2

const puerta = (abre) => {
  const { z0, z1, alto } = PUERTA
  const hueco = huecoDePuerta(abre)
  const hojas = placa([[-3.94, 0, z0], [-3.94, 0, z1], [-3.94, alto, z1], [-3.94, alto, z0]], 0.04, C.gris, {
    pinta: ([, y, z]) => {
      if (z - z0 < 0.08 || z1 - z < 0.08 || alto - y < 0.08) return '#2a3036'
      const lejos = Math.abs(z - MEDIO)
      if (lejos < hueco) return LUZ
      if (lejos - hueco < 0.04) return '#3a424c'
      return y > 1.0 && y < 1.12 ? '#f2c440' : '#5c6874'
    },
  })
  const charco = placa([[-3.9, 0.01, MEDIO - hueco], [-3.9, 0.01, MEDIO + hueco], [-1.4, 0.01, MEDIO + hueco * 1.7], [-1.4, 0.01, MEDIO - hueco * 1.7]], 0.01, null, { luz: { color: '#ffe0a0', alfa: 0.3, nivel: 1 } })
  return abre > 0.05 ? [hojas, charco] : [hojas]
}

// ── La sala con todo ─────────────────────────────────────────────────────

// La sombra azul de las láminas de los pilotos no va en el piso de la sala.
const SOMBRA = '#4a80e6'

// La sala, la mesa, los sillones (girados como diga `giros`), la puerta y
// quien esté: cada figura va en unidades de pato con su `donde`
// ({ en, giro, suelo }), y con `reflejo`, también de cabeza bajo el piso
// pulido.
export const reunion = ({ pantalla = 'cursor', alarma = false, pulido = false, abre = 0, giros = {}, figuras = [] }) => {
  const patos = figuras.flatMap(([formas, donde]) => colocar(formas.filter((f) => f.flat !== SOMBRA), { k: K, ...donde }))
  return [
    ...sala({ pantalla, alarma, pulido }),
    ...mesa,
    ...puerta(abre),
    ...Object.entries(ASIENTOS).flatMap(([quien, { en, giro, sillon = en }]) => colocar(SILLON, { k: K, en: sillon, giro: giros[quien] ?? giro })),
    ...patos,
    ...(pulido ? reflejar(patos) : []),
  ]
}

// De cabeza bajo el piso: lo que refleja el piso pulido, ya en metros.
const voltea = ([x, y, z]) => [x, -y, z]
const reflejar = (formas) =>
  formas.map((f) => {
    const g = f.k === 'e' ? { ...f, c: voltea(f.c), M: f.M.map((fila, i) => (i === 1 ? fila.map((v) => -v) : fila)) } : { ...f, centro: voltea(f.centro), tris: f.tris.map((t) => ({ a: voltea(t.a), b: voltea(t.b), c: voltea(t.c), ...(t.na ? { na: voltea(t.na), nb: voltea(t.nb), nc: voltea(t.nc) } : {}) })) }
    if (f.pinta) g.pinta = (p, n) => f.pinta(voltea(p), voltea(n))
    return g
  })

// Alguien entra solo por la puerta, a paso lento, de los `desde` a los
// `hasta` metros del camino, con la cámara delante que lo acompaña:
// `camara(x)`, según por dónde va. `quienes(u)`, los que ya estaban en la
// sala; `suelo`, dónde pisa quien entra.
export const entra = (pose, camino, camara, { quienes = () => [], desde = 1.5, hasta = 3.7, suelo, ...extra } = {}) => {
  const s = (u) => desde + (hasta - desde) * u
  return {
    escena: (u, modo) => reunion({ pantalla: modo, abre: 1, ...extra, figuras: [...quienes(u), [pose(fase(s(u))), { ...camino.donde(s(u)), suelo }]] }),
    camara: (u) => camara(camino.donde(s(u)).en[0]),
  }
}
