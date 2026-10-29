// Las tomas de la escena 6, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 9 (escena9/tomas.mjs), con sus mismos
// cazas. El guion, con sus líneas, está en src/lib/escena6.js; el visor de la
// cámara de duke y la marca en el cielo, en visor.mjs.
//
// Moby y duke vuelan a 300 m sobre el mar, alejándose del sol: lo tienen a la
// espalda. Todo se arma en la formación, con los morros hacia +x, y `VUELO`
// la gira hacia donde vuelan. Duke va a babor de moby y más atrás.

import { el, transformar } from '../pilotos/tres.mjs'
import * as M from '../pilotos/modelos.mjs'
import { RAMPAS as C, ambos, dukeBase, ojosAbiertos } from '../pilotos/modelos.mjs'
import { ACELERADOR, PALANCA, enCabina as conMandos } from '../pilotos/interiores.mjs'
import { PERSONAJES, dukeCerrado, figura, pDuke } from '../pilotos/cuerpos.mjs'
import { MAR, SOL, poner } from '../escena1/lugares.mjs'
import { hablar, silaba, suave } from '../escena1/personajes.mjs'
import { ALTURA, nubes } from '../escena11/tomas.mjs'
import { DUKE, MOBY } from '../escena9/cazas.mjs'
import { grabando, objetivo } from './visor.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const tramo = (u, a, b) => suave((u - a) / (b - a))
const grados = (r) => (r * 180) / Math.PI

const [, MOBY_P, DUKE_P] = PERSONAJES
const MANDOS = { 1: PALANCA, [-1]: ACELERADOR }
const CAZAS = { duke: DUKE, moby: MOBY }

// La formación vuela hacia -SOL: el +x de la formación, girado.
const VUELO = transformar([0, 180 - grados(Math.atan2(SOL[2], SOL[0])), 0])
const EN = { moby: ALTURA, duke: sum(ALTURA, [-22, 1.5, -12]) }
const enVuelo = (quien, p, en = EN[quien]) => VUELO.punto(sum(CAZAS[quien].enCabina(p), en))
const fija = (ojo, mira, campo) => () => [VUELO.punto(ojo), VUELO.punto(mira), campo]

// ── Los cazas ────────────────────────────────────────────────────────────

// Moby: parches de metal sobre el fuselaje y las alas, agujeros de bala y,
// bajo la cabina, una raya blanca por cada derribo.
const PARCHES = [[2.5, 0.2, 1.8], [0, 0.7, 1.5], [-2.8, 0.1, 1.2], [1.0, -0.4, 4.5], [-0.6, -0.1, 6.8]]
const AGUJEROS = [[3.0, -0.2, 1.85], [2.7, 0.5, 1.82], [0.5, 0.1, 1.72], [-1.6, 0.5, 1.4], [0.2, -0.32, 5.6]]
const MARCAS = ambos((s) => [
  ...PARCHES.map(([x, y, z]) => el([x, y, s * z], [0.5, 0.3, 0.12], C.grisOscuro)),
  ...AGUJEROS.map(([x, y, z]) => el([x, y, s * z], [0.09, 0.09, 0.07], null, { flat: '#101216' })),
  ...[0, 1, 2, 3, 4].map((i) => el([5.9 + i * 0.22, 0.25, s * 1.42], [0.05, 0.16, 0.04], null, { flat: '#f4f4f4' })),
]).flat()

// Duke: el sol le saca destellos que van y vienen por el fuselaje y las alas.
const BRILLOS = [[7.6, 0.65, 0], [4.0, 1.5, 0.3], [-1.6, 0.55, 4.4], [-4.6, 2.6, 1.6], [-1.6, 0.55, -4.4]]
const destellos = (puntos, u, tam) =>
  puntos.flatMap((c, i) => ((Math.floor(u * 12) + i) % 3 === 0 ? M.destello(c).map((f) => ({ ...f, r: f.r.map((r) => r * tam) })) : []))

// Cada piloto sentado con las manos en los mandos o en la pose de `pilotos`.
const QUIETOS = { duke: (u) => DUKE_P.sentado(u, MANDOS), moby: (u) => MOBY_P.sentado(u, MANDOS) }
const caza = (quien, pose, u) => [
  ...CAZAS[quien].caza({ motor: true, piloto: conMandos(() => pose(u)) }),
  ...(quien === 'moby' ? MARCAS : destellos(BRILLOS, u, 3)),
]

// El mar y la formación; `en` mueve a quien no esté en su lugar.
const volando = ({ pilotos = {}, en = {} } = {}) => (u) => {
  const pose = { ...QUIETOS, ...pilotos }
  const lugar = { ...EN, ...Object.fromEntries(Object.entries(en).map(([q, f]) => [q, f(u)])) }
  const cazas = Object.keys(CAZAS).flatMap((q) => poner(caza(q, pose[q], u), 0, lugar[q]))
  return [MAR, ...VUELO.formas([...nubes(u), ...cazas])]
}
// Moby grita sin humo cuando duke está en el cuadro: el puro no lo tapa.
const hablando = (quien, estado) => volando({ pilotos: { [quien]: (u) => (quien === 'duke' ? DUKE_P : MOBY_P).hablando(u, estado) } })

// ── Las cámaras de la cabina ─────────────────────────────────────────────

// Desde el tablero, de tres cuartos por el lado sin humo y temblando al ritmo
// de los gritos, como en la escena 9.
const DEL_TABLERO = (quien) => () => [enVuelo(quien, [3.4, 1.0, 0]), enVuelo(quien, [0, 0.1, 0]), 85]
const TRES_CUARTOS = (quien, lado) => () => [enVuelo(quien, [2.8, 0.8, lado * 1.2]), enVuelo(quien, [0, 0.1, -lado * 0.1]), 80]
const TEMBLANDO = (quien) => (u) => {
  const tiembla = 0.06 * Math.sin(Math.floor(u * 24) * 2.3)
  return [enVuelo(quien, [3.6, 0.2 + tiembla, 0.8 + tiembla]), enVuelo(quien, [0, 0.4, 0]), 80]
}
// La cámara de duke, adelante y a su izquierda, a la altura de los ojos.
const SU_CAMARA = () => [enVuelo('duke', [2.7, 0.9, -0.9]), enVuelo('duke', [0.2, 0.4, 0]), 72]

// ── duke ante su cámara ──────────────────────────────────────────────────

// Gira el cuerpo `giro` grados hacia su izquierda (o, en negativo, hacia su
// derecha): las manos siguen en los mandos.
const dukeAbierto = dukeBase({ ojos: ojosAbiertos, menton: 4 }, [])
const girado = (tronco, giro) => transformar([0, giro, 0], [0.1, 0, 0]).formas(tronco)
const sentadoCon = (tronco, giro, extra = []) => figura(pDuke, { tronco: girado(tronco, giro), manos: { 1: pDuke.reposo(1), [-1]: pDuke.reposo(-1) }, extra })
const DE_PERFIL = 32

// Destellos en un anillo alrededor de la cabeza, de cara a la cámara.
const ANILLO = Array.from({ length: 7 }, (_, i) => {
  const a = (i / 7) * Math.PI * 2
  return [0.5, 0.75 + 0.85 * Math.sin(a), -0.2 + 0.9 * Math.cos(a)]
})

// ── Moby se lanza ────────────────────────────────────────────────────────

// Pasa por estribor de duke desde atrás, cada vez más rápido, y duke lo
// sigue con la cabeza hasta donde le da el cuello.
const PASA = (u) => sum(EN.duke, [-50 + 120 * u * u, 6, 16])
const loSigue = (u) => {
  const [dx, , dz] = sum(PASA(u), EN.duke.map((v) => -v))
  return -Math.min(75, grados(Math.atan2(dz, dx)))
}

// Y se va contra quien juega, que está en el medio del cuadro: la cámara mira
// a la marca y moby sube hacia ella, achicándose.
const MARCA = sum(ALTURA, [600, 60, 0])
const SUBIDA = grados(Math.atan2(MARCA[1] - ALTURA[1], MARCA[0]))
const seLanza = (u) => {
  const en = lerp(ALTURA, MARCA, 0.35 * u * u)
  const moby = transformar([0, 0, SUBIDA], [0, 0, 0], en).formas(caza('moby', QUIETOS.moby, u))
  return [MAR, ...VUELO.formas([...nubes(u), ...moby])]
}

// ── La llegada ───────────────────────────────────────────────────────────

// Desde muy lejos, a cada lado del sol, hasta su lugar en la formación,
// virando hacia donde van. La cámara está adelante y mira al sol.
const DESDE = { moby: sum(ALTURA, [-1200, 12, 240]), duke: sum(ALTURA, [-1200, 24, -260]) }
const llegan = (u) => {
  const k = 1 - (1 - u) ** 2
  const cazas = Object.keys(CAZAS).flatMap((q) => {
    const [dx, , dz] = sum(EN[q], DESDE[q].map((v) => -v))
    return transformar([0, -grados(Math.atan2(dz, dx)) * (1 - k), 0], [0, 0, 0], lerp(DESDE[q], EN[q], k)).formas(caza(q, QUIETOS[q], u))
  })
  return [MAR, ...VUELO.formas([...nubes(u), ...cazas])]
}

export const TOMAS_3D = {
  horizonte: { escena: llegan, camara: fija(sum(ALTURA, [55, 2, -6]), sum(ALTURA, [-200, 0, -6]), 40) },
  // De costado y desde abajo, la cámara se adelanta junto a moby.
  moby: {
    escena: volando(),
    camara: (u) => [VUELO.punto(sum(EN.moby, lerp([-18, -3, 22], [10, -2, 22], suave(u)))), VUELO.punto(EN.moby), 48],
  },
  // De costado, un poco desde abajo, duke brillando contra el cielo.
  duke: {
    escena: volando(),
    camara: (u) => [VUELO.punto(sum(EN.duke, lerp([22, -2, -22], [8, -1.5, -26], suave(u)))), VUELO.punto(EN.duke), 42],
  },
  // Los dos de frente, con el sol detrás.
  juntos: {
    escena: volando(),
    camara: (u) => [VUELO.punto(sum(ALTURA, lerp([34, -2, -20], [27, -1, -14], suave(u)))), VUELO.punto(sum(ALTURA, [-11, 1, -6])), 46],
  },

  monstruo: { escena: hablando('moby', { humea: false }), camara: DEL_TABLERO('moby') },
  sensores: { escena: hablando('duke'), camara: DEL_TABLERO('duke') },
  mejor: { escena: hablando('moby', { humea: false }), camara: TEMBLANDO('moby') },
  camaras: { escena: hablando('duke'), camara: TRES_CUARTOS('duke', -1) },
  graben: { escena: hablando('moby'), camara: TRES_CUARTOS('moby', 1) },
  humo: { escena: hablando('duke'), camara: DEL_TABLERO('duke') },

  gira: {
    escena: volando({ pilotos: { duke: (u) => sentadoCon(u < 0.5 ? dukeCerrado : dukeAbierto, DE_PERFIL * tramo(u, 0.1, 0.7)) } }),
    camara: SU_CAMARA,
    encima: grabando,
  },
  presenta: {
    escena: volando({ pilotos: { duke: (u) => sentadoCon(hablar(dukeAbierto, silaba(u) * 0.8), DE_PERFIL) } }),
    camara: SU_CAMARA,
    encima: grabando,
  },
  destellos: {
    escena: volando({ pilotos: { duke: (u) => sentadoCon(dukeCerrado, DE_PERFIL, destellos(ANILLO, u, 2.2)) } }),
    camara: SU_CAMARA,
    encima: grabando,
  },
  pato: { escena: hablando('moby'), camara: TEMBLANDO('moby') },
  indescriptible: {
    escena: volando({ pilotos: { duke: (u) => sentadoCon(hablar(dukeCerrado, silaba(u) * 0.8), DE_PERFIL, destellos(ANILLO.slice(0, 3), u, 2)) } }),
    camara: SU_CAMARA,
    encima: grabando,
  },

  acelera: {
    escena: volando({ pilotos: { duke: (u) => sentadoCon(dukeAbierto, loSigue(u)) }, en: { moby: PASA } }),
    camara: DEL_TABLERO('duke'),
  },
  objetivo: { escena: seLanza, camara: fija(sum(ALTURA, [-22, 3, 0]), MARCA, 50), encima: objetivo },
}
