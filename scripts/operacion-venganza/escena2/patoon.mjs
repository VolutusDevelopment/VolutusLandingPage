// Los patos de la escena 2 en sus poses de la reunión: el escuadrón sentado
// a la mesa, duck-one con todas sus medallas, moby-duck con el puro apagado,
// duky, que se desinfla o resopla, el marinero que lo trae y el almirante con su
// palo de presentación. En unidades de pato, como los pilotos: mira hacia
// +x, su ala derecha hacia +z.

import { el, placa, transformar } from '../pilotos/tres.mjs'
import * as M from '../pilotos/modelos.mjs'
import { RAMPAS as C, ambos, hueso } from '../pilotos/modelos.mjs'
import { PERSONAJES, figura, pDuckOne, pMoby, pDuke, manosAndando, dukyFigura, puntosDeDuky } from '../pilotos/cuerpos.mjs'
import { calada } from '../pilotos/calada.mjs'
import { ALMIRANTE, OFICIOS, MANOS_ATRAS, SENTADO, pAlmirante, almiranteTronco, almiranteCabeza, pMarinero, marineroTronco, hablar, silaba, suave } from '../escena1/personajes.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const esc = (a, k) => a.map((v) => v * k)
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const uni = (a) => esc(a, 1 / Math.hypot(...a))
const tramo = (u, a, b) => suave((u - a) / (b - a))
const vaiven = (u, veces = 2) => Math.sin(u * Math.PI * 2 * veces)

const [DUCK, MOBY, DUKE] = PERSONAJES
const gesto = (p, nombre) => p.gestos.find((g) => g.nombre === nombre).pose

// ── Sentados a la mesa ───────────────────────────────────────────────────

// Sentado en el sillón: el cuerpo baja `agacha` y las piernas van del asiento
// al piso, hacia adelante. Sirve para cualquier pose de pie de `p`.
export const sentar = (p, formas, agacha = SENTADO) => {
  const { grosor, pie, color = C.naranja } = p.pierna
  const piernas = ambos((s) => {
    const z = s * p.cadera[2]
    const cadera = [p.cadera[0], p.cadera[1] - agacha, z]
    const rodilla = [0.85, cadera[1] - 0.05, z]
    const tobillo = [1.0, p.suelo + pie[1] * 1.8, z]
    return [hueso(cadera, rodilla, grosor, color, { brilla: true }), hueso(rodilla, tobillo, grosor, color, { brilla: true }), el([1.0 + pie[0] * 0.45, p.suelo + pie[1], z], pie, color)]
  }).flat()
  return [...transformar([0, 0, 0], [0, 0, 0], [0, -agacha, 0]).formas(formas.filter((f) => !f.pata)), ...piernas]
}

// Las manos sobre la mesa, antes de bajar el cuerpo: el tablero queda a
// medio metro del piso, y el borde a 40 cm del pecho (a 50, el de moby).
const enLaMesa = (x, y, z) => ({ 1: [x, y, z], [-1]: [x, y, -z] })
const MESA_PILOTO = enLaMesa(1.1, -0.49, 0.55)
const MESA_MOBY = enLaMesa(1.35, -0.94, 0.75)
// moby es de piernas cortas: se hunde menos.
const AGACHA_MOBY = 0.2

// ── duck-one ─────────────────────────────────────────────────────────────


// La carpeta del expediente, de lomo al centro y abierta `abre`, de 0
// (cerrada) a 1: una mano en el borde de cada hoja; cerrada, la otra en el
// lomo. Adentro, renglones y la foto de duky.
const MANILA = ['#fff2c8', '#ecd08a', '#bfa05a', '#7a6430']
const LOMO = [0.85, -0.5, 0]
const carpeta = (abre) => {
  const borde = (s) => {
    const a = s > 0 ? 0.25 : 0.25 + (Math.PI - 0.5) * abre
    return sum(LOMO, esc([-Math.sin(a), 0, Math.cos(a)], 0.42))
  }
  const pinta = ([, y, z]) => {
    if (z < -0.15 && z > -0.33 && y > LOMO[1] + 0.04 && y < LOMO[1] + 0.22) return C.hule
    return Math.abs(z) > 0.06 && (((y - LOMO[1]) * 16) % 2 + 2) % 2 < 0.5 ? '#8a7a5a' : null
  }
  const hoja = (s) => placa([sum(LOMO, [0, -0.28, 0]), sum(LOMO, [0, 0.28, 0]), sum(borde(s), [0, 0.28, 0]), sum(borde(s), [0, -0.28, 0])], 0.03, MANILA, { pinta })
  return { formas: ambos(hoja), manos: { 1: borde(1), [-1]: lerp(sum(LOMO, [0, 0, -0.06]), borde(-1), abre) } }
}

export const duckOne = {
  andando: (fase) => DUCK.andando(fase, { tronco: M.DUCK_ONE }),
  // De pie con las manos atrás, marcando autoridad: así camina a la pantalla
  // y así la mira. `abre` le baja el pico; `inclina`, el pecho afuera.
  atras: (fase = null, abre = 0, inclina = 0) => figura(pDuckOne, { tronco: hablar(M.DUCK_ONE, abre), manos: MANOS_ATRAS, fase, inclina }),
  hablando: (u) => DUCK.hablando(u, { tronco: M.DUCK_ONE }),
  señala: (u) => gesto(DUCK, 'señala')(u, { tronco: hablar(M.DUCK_ONE, silaba(u)) }),
  pulgar: (u) => gesto(DUCK, 'pulgar arriba')(u, { tronco: hablar(M.DUCK_ONE, silaba(u)) }),
  carpeta: (abre, abrePico = 0) => {
    const { formas, manos } = carpeta(abre)
    return figura(pDuckOne, { tronco: hablar(M.DUCK_ONE, abrePico), manos, extra: formas, inclina: 4 })
  },
  // Se lleva la carpeta cerrada a la espalda por el costado, `k` de 0 a 1, y
  // queda con las manos atrás.
  guarda: (k) => {
    const { formas, manos } = carpeta(0)
    const lleva = [-1.6 * k, -0.4 * k, 1.3 * Math.sin(Math.PI * k)]
    const conLaCarpeta = lerp(sum(manos[1], lleva), MANOS_ATRAS[1], k)
    return figura(pDuckOne, { tronco: M.DUCK_ONE, manos: { 1: conLaCarpeta, [-1]: lerp(manos[-1], MANOS_ATRAS[-1], k) }, extra: transformar([0, 0, 0], [0, 0, 0], lleva).formas(formas), inclina: 4 * (1 - k) })
  },
  sentado: () => sentar(pDuckOne, figura(pDuckOne, { tronco: M.DUCK_ONE, manos: MESA_PILOTO })),
  sentadoHablando: (u) => sentar(pDuckOne, DUCK.hablando(u, { tronco: M.DUCK_ONE })),
}

// ── moby-duck ────────────────────────────────────────────────────────────

// Hasta que lo enciende, el puro va apagado y moby no llora: lo hace llorar
// el humo. Prendido, llora lo de siempre.
const APAGADO = { apagado: true, llanto: 0 }
export const PRENDIDO = {}
// Prendido, sin el humo, donde taparía la toma.
export const SIN_HUMO = { humea: false }
const mobyTronco = (u, estado = APAGADO) => [...M.MOBY_TORSO, ...M.mobyCabeza({ t: u * 8, ...estado })]

// Inclinado sobre la mesa, con los puños en el tablero: las manos se ponen
// antes de inclinar el cuerpo, así que van giradas al revés.
const INCLINA = -18
const antesDeInclinar = (manos) => {
  const vuelta = transformar([0, 0, -INCLINA], pMoby.pivote)
  return { 1: vuelta.punto(manos[1]), [-1]: vuelta.punto(manos[-1]) }
}

export const moby = {
  // Camina con los brazos cruzados: sin brazos sueltos que balancear.
  cruzado: (fase) => figura({ ...pMoby, brazo: null }, { tronco: [...mobyTronco(fase), ...M.MOBY_BRAZOS_CRUZADOS], fase }),
  sentado: (u, estado) => sentar(pMoby, figura(pMoby, { tronco: mobyTronco(u, estado), manos: MESA_MOBY }), AGACHA_MOBY),
  hablando: (u, estado = APAGADO) => sentar(pMoby, MOBY.hablando(u, estado), AGACHA_MOBY),
  inclinado: (u) => sentar(pMoby, figura(pMoby, { tronco: hablar(mobyTronco(u), silaba(u)), manos: antesDeInclinar(enLaMesa(1.65, -0.94, 0.7)), inclina: INCLINA }), AGACHA_MOBY),
  // Se para apoyado en la mesa, de a poco: las piernas se estiran bajo él.
  levanta: (u) => {
    const k = tramo(u, 0.1, 0.7)
    return figura(pMoby, { tronco: mobyTronco(u), manos: { 1: lerp(MESA_MOBY[1], pMoby.reposo(1), k), [-1]: lerp(MESA_MOBY[-1], pMoby.reposo(-1), k) }, agacha: AGACHA_MOBY * (1 - k), inclina: -12 * Math.sin(k * Math.PI) })
  },
  tose: (u) => sentar(pMoby, calada(u * 24, { antes: 0 }), AGACHA_MOBY),
  // De pie, con el puño en alto y el puro ya prendido.
  grita: (u) => MOBY.hablando(u),
  andando: (fase) => MOBY.andando(fase),
}

// ── duke skyducker ───────────────────────────────────────────────────────

export const duke = {
  // Camina con la cabeza gacha, mirándose en el piso pulido.
  alPiso: (fase) => figura(pDuke, { tronco: M.dukeBase({ ojos: M.ojosAbiertos, menton: -30 }, []), manos: manosAndando(pDuke, fase), fase }),
  sentado: (u) => sentar(pDuke, DUKE.sentado(u, MESA_PILOTO)),
  hablando: (u) => sentar(pDuke, DUKE.hablando(u)),
  // Se habla al espejo de mano.
  alEspejo: (u) => sentar(pDuke, gesto(DUKE, 'al espejo')(u, { abre: silaba(u) * 0.8 })),
}

// ── duky ─────────────────────────────────────────────────────────────────

// Mira al equipo: la cabeza va de frente a cada uno de `vistas` (giros, en
// grados, como desdeDuky en reunion.mjs) y vuelve al frente, con u de 0 a 1.
const mirada = (u, vistas) => {
  const paradas = [0, ...vistas, 0]
  const tramos = paradas.length - 1
  const i = Math.min(tramos - 1, Math.floor(Math.max(0, u) * tramos))
  return paradas[i] + (paradas[i + 1] - paradas[i]) * tramo(u * tramos - i, 0, 0.4)
}

// Sentado no se hunde: sube hasta el asiento y le cuelgan las patas.
const EN_EL_SILLON = 0.15
const enElSillon = ({ salto = 0, ...pose }) => dukyFigura({ ...pose, salto: EN_EL_SILLON + salto })
export const duky = {
  sentado: (puntos = 0) => enElSillon({ extra: puntosDeDuky(puntos) }),
  mira: (u, vistas) => enElSillon({ mira: mirada(u, vistas) }),
  // Se desinfla con la cabeza gacha, y el hule tiembla un poco al quedar en el asiento.
  seDesinfla: (u) => {
    const k = tramo(u, 0.12, 0.6)
    const tirita = u > 0.6 ? 0.1 * Math.sin((u - 0.6) * 18) * (1 - tramo(u, 0.6, 1)) : 0
    return enElSillon({ aire: -k - tirita, cabeza: -8 * k })
  },
  // Desinflado, se vuelve a inflar de golpe con un salto, se pasa un poco y
  // queda como siempre.
  seInfla: (u) => {
    const k = tramo(u, 0, 0.2)
    return enElSillon({ aire: k - 1 + 0.3 * Math.sin(tramo(u, 0.1, 0.5) * Math.PI), cabeza: -8 * (1 - k), salto: 0.25 * Math.sin(tramo(u, 0, 0.4) * Math.PI) })
  },
  // Mira a los que lo miran, pero de la emoción resopla cuatro veces: se
  // desinfla, se infla aleteando y dando un saltito, y queda como siempre.
  resopla: (u, vistas) => {
    const vez = u > 0.36 && u < 0.92 ? Math.sin(((u - 0.36) / 0.56) * 4 * Math.PI * 2) : 0
    const toma = Math.max(0, -vez)
    return enElSillon({ mira: mirada((u - 0.03) / 0.33, vistas), aire: vez > 0 ? -0.4 * vez : 0.7 * toma, aletea: 30 * toma, salto: 0.05 * toma, cabeza: 10 * toma })
  },
  enBrazos: () => dukyFigura({}),
}

// ── El marinero que lo trae ──────────────────────────────────────────────

// Verde, de los que operan las catapultas: lo trae en brazos sin ver por
// dónde va. `manos` son las suyas, donde va la barriga de duky.
export const marinero = (fase, manos) => figura(pMarinero(OFICIOS.verde.color), { tronco: marineroTronco(OFICIOS.verde.color), manos, fase })
// Lo lleva contra el pecho: la barriga de duky sobre las manos.
export const EN_BRAZOS = { duky: [1.2, 1.22, 0], manos: enLaMesa(1.0, -0.55, 0.75) }
// Dónde va duky en brazos de quien está en `donde` ({ en, giro }), a escala `k`.
export const dukyEnBrazos = ({ en, giro }, k) => {
  const a = (giro * Math.PI) / 180
  const [ax, ay] = [EN_BRAZOS.duky[0] * k, (EN_BRAZOS.duky[1] + 0.1) * k]
  return { en: sum(en, [ax * Math.cos(a), ay, -ax * Math.sin(a)]), giro, suelo: -2.2 }
}

// ── El almirante ─────────────────────────────────────────────────────────

const alm = (cfg) => figura(pAlmirante, { sinSombra: true, ...cfg })

export const almirante = {
  quieto: ALMIRANTE.quieto,
  andando: ALMIRANTE.andando,
  habla: gesto(ALMIRANTE, 'pregunta'),
  ordena: gesto(ALMIRANTE, 'da la orden'),
  // Levanta el palo de presentación hacia `hacia` (un punto en sus unidades)
  // y golpea dos veces la pantalla.
  conPalo: (u, hacia) => {
    const hombro = [0, -0.42, 0.95]
    const dir = uni(sum(hacia, esc(hombro, -1)))
    const g = tramo(u, 0, 0.3)
    const mano = lerp(MANOS_ATRAS[1], sum(hombro, esc(dir, 0.8)), g)
    const golpe = 0.15 * Math.max(0, vaiven(u, 2)) * g
    const palo = [hueso(mano, sum(mano, esc(dir, 2.4 + golpe)), 0.07, C.blanco), el(sum(mano, esc(dir, 2.45 + golpe)), [0.06, 0.06, 0.06], C.blanco)]
    return alm({ tronco: almiranteTronco(almiranteCabeza({ ceño: g })), manos: { 1: mano, [-1]: MANOS_ATRAS[-1] }, extra: g > 0.2 ? palo : [] })
  },
}

// ── A contraluz ──────────────────────────────────────────────────────────

// Toda la figura de un solo color oscuro y sin contorno, contra la luz del pasillo.
export const silueta = (formas) => formas.map((f) => ({ ...f, flat: '#1c1826', pinta: undefined, vidrio: false, brilla: true }))
