// Las tomas de la escena 2, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde, como las de la escena 1 (escena1/tomas.mjs). El guion, con sus
// líneas, está en src/lib/escena2.js.
//
// `escena(u, modo)` arma la figura en metros de la sala; `camara(u)` da
// [ojo, mira, campo] en metros y grados. `modo` es lo que muestra la pantalla:
// 'cursor' o 'huella', como desde el atacante en la escena 1.

import { ASIENTOS, ENTRADA, K, PUERTA, anteLaCamara, desdeDuky, enUnidades, entra, fase, girar, giroHacia, huecoDePuerta, recorrido, reunion } from './reunion.mjs'
import { EN_BRAZOS, PRENDIDO, SIN_HUMO, almirante, duckOne, duke, duky, dukyEnBrazos, marinero, moby, silueta } from './patoon.mjs'
import { FOTOS_3D } from './fotos.mjs'
import { PANTALLA } from '../escena1/lugares.mjs'
import { silaba, suave } from '../escena1/personajes.mjs'
import { placa } from '../pilotos/tres.mjs'
import { alargar } from '../tiras.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]

// ── Quién está y dónde ───────────────────────────────────────────────────

// De pie: el almirante junto a la pantalla, mirando a la mesa, y duck-one
// frente a ella, desde que se acerca a mirarla.
const ALMIRANTE = { en: [2.6, 0, 1.6], giro: 155 }
const FRENTE = { en: [2.75, 0, -1.0], giro: 0 }
const xz = ({ en }) => [en[0], en[2]]
const mirando = (donde, a) => ({ ...donde, giro: giroHacia(xz(donde), xz(a)) })
// Frente a frente, junto a la pantalla.
const ALMIRANTE_A_DUCK = mirando(ALMIRANTE, FRENTE)
const DUCK_AL_ALMIRANTE = mirando(FRENTE, ALMIRANTE)
const DUCK_A_LA_MESA = { ...FRENTE, giro: 180 }

// Con el palo se arrima a la pantalla, a su lado, y apunta a la foto del atacante.
const CON_PALO = { en: [3.35, 0, 1.6], giro: 160 }
const EN_LA_FOTO = enUnidades([PANTALLA.x, 1.9, 0.6], CON_PALO)

// El elenco de la reunión: cada uno sentado en su lugar y el almirante de pie,
// salvo lo que diga `cambios` por nombre: una figura (va a su lugar), una
// figura con su `donde`, o null si no está.
const elenco = (u, cambios = {}) => {
  const de = {
    duckOne: [duckOne.sentado(), ASIENTOS.duckOne],
    duke: [duke.sentado(u), ASIENTOS.duke],
    duky: [duky.sentado(), ASIENTOS.duky],
    moby: [moby.sentado(u), ASIENTOS.moby],
    almirante: [almirante.quieto(u), ALMIRANTE],
  }
  return Object.entries({ ...de, ...cambios })
    .filter(([, v]) => v)
    .map(([quien, v]) => (Array.isArray(v[0]) ? v : [v, de[quien][1]]))
}

// La reunión con la pantalla de quien juega y el elenco.
const sala = (cambios, extra = {}) => (u, modo) => reunion({ pantalla: modo, figuras: elenco(u, cambios(u)), ...extra })
// Desde que lo enciende, moby fuma el puro.
const conPuro = (cambios) => (u) => ({ moby: moby.sentado(u, PRENDIDO), ...cambios(u) })

// duck-one de pie con las manos atrás: firme, o hablando.
const firme = () => duckOne.atras()
const conAutoridad = (u) => duckOne.atras(null, 0.8 * silaba(u))
const conLaCarpeta = (u) => duckOne.carpeta(0, 0.8 * silaba(u))

// Entran de a uno por la puerta del fondo, cada uno por su carril.
const DE_DUCK = ENTRADA(2.7)
const DE_MOBY = ENTRADA(2.95)
const DE_DUKE = ENTRADA(2.6)

// ── La puerta ────────────────────────────────────────────────────────────

// Las cuatro siluetas en la puerta, con su medio ancho y dónde pisan: se ven
// cuando la luz las alcanza entera.
const SILUETAS = [
  [() => duke.alPiso(null), [-3.75, 1.85], 0.32],
  [() => duckOne.atras(), [-3.55, 2.55], 0.36],
  [() => moby.cruzado(null), [-3.75, 3.3], 0.6, ASIENTOS.moby.suelo],
  [() => duky.enBrazos(), [-3.75, 4.0], 0.45, ASIENTOS.duky.suelo],
]
const MEDIO = (PUERTA.z0 + PUERTA.z1) / 2
const puerta = (u, modo) => {
  const abre = tramo(u, 0, 0.6)
  const figuras = SILUETAS.filter(([, [, z], ancho]) => huecoDePuerta(abre) > Math.abs(z - MEDIO) + ancho).map(([pose, [x, z], , suelo]) => [silueta(pose()), { en: [x, 0, z], giro: 0, suelo }])
  return reunion({ pantalla: modo, abre, figuras })
}

// ── duky llega en brazos ─────────────────────────────────────────────────

// El marinero entra hasta detrás del sillón de duky, gira y lo deja en él,
// estirando los brazos por sobre el respaldo.
const DE_MARINERO = recorrido([[-4.6, 2.8], [-1.6, 2.18]])
const DETRAS_DEL_SILLON = { en: [-1.6, 0, 2.18], giro: 90 }
const traeADuky = (u) => {
  const s = DE_MARINERO.largo * tramo(u, 0, 0.5)
  const andando = u < 0.5
  const donde = andando ? DE_MARINERO.donde(s) : { ...DETRAS_DEL_SILLON, giro: girar(DE_MARINERO.donde(s).giro, 90, tramo(u, 0.5, 0.6)) }
  const enBrazos = dukyEnBrazos(donde, K).en
  const deja = tramo(u, 0.62, 0.86)
  const sentado = sum(ASIENTOS.duky.en, [0, 0.15 * K, 0])
  const suelta = tramo(u, 0.88, 1)
  const manos = Object.fromEntries([1, -1].map((s) => [s, lerp(lerp(EN_BRAZOS.manos[s], sum(EN_BRAZOS.manos[s], [1.55, -0.45, 0]), deja), [0.08, -1.1, s * 1.3], suelta)]))
  return [
    [marinero(andando ? fase(s) : null, manos), donde],
    [duky.enBrazos(), { en: lerp(enBrazos, sentado, deja), giro: girar(donde.giro, ASIENTOS.duky.giro, deja), suelo: ASIENTOS.duky.suelo }],
  ]
}

// ── duck-one se acerca a la pantalla ─────────────────────────────────────

// Bordea la consola por babor y se para frente a la pantalla, despacio.
const A_LA_PANTALLA = recorrido([[-0.4, -2.15], [2.0, -2.15], [2.75, -1.0]])
const seAcerca = (u) => {
  const s = A_LA_PANTALLA.largo * tramo(u, 0, 0.88)
  const donde = A_LA_PANTALLA.donde(s)
  return [duckOne.atras(u < 0.88 ? fase(s) : null), { ...donde, giro: girar(donde.giro, 0, tramo(u, 0.8, 0.95)) }]
}

// ── Todos miran a duky ───────────────────────────────────────────────────

const DUKY = xz(ASIENTOS.duky)
const hacia = (donde, k) => ({ ...donde, giro: girar(donde.giro, giroHacia(xz(donde), DUKY), k) })
const aDuky = (quien, k) => hacia(ASIENTOS[quien], k)
// Y él los mira: a duke, a duck-one y a moby.
const AL_EQUIPO = [ASIENTOS.duke, FRENTE, ASIENTOS.moby].map(desdeDuky)
// Todos girados hacia él, y duck-one con el expediente abierto.
const anteDuky = (cambios) =>
  sala((u) => ({ duckOne: [duckOne.carpeta(1), hacia(DUCK_A_LA_MESA, 1)], moby: [moby.sentado(u, PRENDIDO), aDuky('moby', 1)], duke: [duke.sentado(u), aDuky('duke', 1)], ...cambios(u) }), { giros: { moby: aDuky('moby', 1).giro, duke: aDuky('duke', 1).giro } })
// Duky de frente, por sobre la mesa.
const A_DUKY = fija([-1.75, 1.3, -1.6], [-1.6, 0.8, 0.95], 40)

// ── Se van ───────────────────────────────────────────────────────────────

// Todos a la puerta, cada uno por su lado de la mesa y a su hora; duky se
// queda, y le salen los puntos.
const SALIDAS = [
  [(f) => moby.andando(f), recorrido([[-0.4, 1.45], [-0.6, 2.4], [-5.0, 2.7]]), 0, ASIENTOS.moby.suelo],
  [(f) => duckOne.andando(f), recorrido([[2.75, -1.0], [2.2, 2.4], [-5.0, 2.8]]), 0.1],
  [(f) => duke.alPiso(f), recorrido([[-1.0, -1.0], [-1.6, -1.75], [-3.5, -1.5], [-3.55, 2.2], [-5.0, 2.9]]), 0.05],
  [(f) => almirante.andando(f), recorrido([[2.6, 1.6], [1.9, 2.6], [-5.0, 2.9]]), 0.3],
]
const seVan = (u) =>
  SALIDAS.map(([pose, camino, desde, suelo]) => {
    const s = Math.max(0, (u - desde) * 9.5)
    return [pose(fase(s)), { ...camino.donde(s), suelo }]
  })

// ── Frente a frente ──────────────────────────────────────────────────────

// duck-one y el almirante junto a la pantalla, cada uno con su pose, en plano
// y contraplano: por sobre el hombro del almirante a duck-one, por sobre el de
// duck-one al almirante, duck-one de cerca y los dos, con la pantalla detrás.
const careo = (duck, alm = almirante.quieto) => (u) => ({ duckOne: [duck(u), DUCK_AL_ALMIRANTE], almirante: [alm(u), ALMIRANTE_A_DUCK] })
const A_DUCK = fija([3.4, 1.35, 0.9], [2.75, 1.1, -1.0], 50)
const AL_ALMIRANTE = fija([2.2, 1.5, -2.1], [2.6, 1.25, 1.6], 36)
const DUCK_DE_CERCA = fija([2.6, 1.3, 0.4], [2.75, 1.1, -1.0], 46)
const LOS_DOS = fija([0.4, 1.45, 0.3], [2.7, 1.2, 0.3], 66)

// ── La alarma ────────────────────────────────────────────────────────────

// Con cada vuelta de la baliza, la sala se enciende de rojo: un velo
// translúcido delante de la cámara.
const ALARMA = [-3.5, 2.3, 4.2]
const CAMARA_DE_LA_ALARMA = [ALARMA, [2.5, 1.0, -2.0], 72]
const velo = (prendida) => {
  const p = anteLaCamara(CAMARA_DE_LA_ALARMA)
  return prendida ? [placa([p(-1.3, -1.3), p(1.3, -1.3), p(1.3, 1.3), p(-1.3, 1.3)], 0.001, null, { luz: { color: '#ff2a1a', alfa: 0.22, nivel: 1 } })] : []
}

// ── Las tomas ────────────────────────────────────────────────────────────

// duck-one se gira hacia el escuadrón y les señala sus puestos.
const AL_ESCUADRON = fija([0.2, 1.3, -0.6], [2.75, 1.1, -1.0], 50)

export const TOMAS_3D = {
  // La puerta cerrada, un momento, antes de abrirse.
  puerta: alargar({ escena: puerta, camara: fija([1.2, 1.7, 2.6], [-4, 1.0, 2.85], 46) }, -0.25, 0.92),
  // Duck-One y Moby salen de la luz de la puerta, al paso de duke.
  medallas: entra(duckOne.andando, DE_DUCK, (x) => [[x + 2.6, 1.15, 2.2], [x, 0.85, 2.7], 40], { desde: 1.13 }),
  puro: entra(moby.cruzado, DE_MOBY, (x) => [[x + 2.4, 1.3, 1.9], [x, 0.85, 2.95], 44], { desde: 1.13, suelo: ASIENTOS.moby.suelo }),
  reflejo: entra(duke.alPiso, DE_DUKE, (x) => [[x + 3.0, 0.9, 3.7], [x + 0.2, 0.45, 2.6], 50], { pulido: true }),
  // Hasta que el marinero lo suelta y se endereza.
  duky: alargar(
    {
      escena: (u, modo) => reunion({ pantalla: modo, abre: 1, figuras: [...elenco(u, { duky: null, almirante: null, duke: null, moby: null, duckOne: null }), ...traeADuky(u)] }),
      camara: fija([0.3, 1.6, -1.2], [-2.2, 0.6, 1.9], 58),
    },
    0,
    25 / 24,
  ),

  reunion: { escena: sala((u) => ({ almirante: almirante.habla(u) })), camara: fija([-3.7, 2.4, -2.6], [2.4, 0.8, 1.2], 58) },
  lagartijas: { escena: sala((u) => ({ moby: moby.hablando(u) })), camara: fija([-0.3, 1.05, -0.9], [-0.4, 0.85, 1.05], 50) },
  sesion: { escena: sala((u) => ({ duke: duke.hablando(u) })), camara: fija([-0.9, 1.05, 0.9], [-1.0, 0.85, -1.0], 50) },
  fotos: FOTOS_3D,
  autobiografias: { escena: sala((u) => ({ duckOne: duckOne.sentadoHablando(u) })), camara: fija([-1.0, 1.25, -0.5], [-2.8, 0.85, 0], 44) },
  // Uno frente al otro, a lo largo de la mesa.
  cuantas: { escena: sala((u) => ({ moby: moby.hablando(u) })), camara: fija([-2.0, 1.25, -0.5], [-0.4, 0.95, 1.1], 42) },
  ocho: { escena: sala((u) => ({ duckOne: duckOne.sentadoHablando(u) })), camara: fija([0.2, 1.3, 0.5], [-2.8, 0.9, 0], 30) },

  palo: {
    escena: sala((u) => ({ almirante: [almirante.conPalo(u, EN_LA_FOTO), CON_PALO] })),
    camara: fija([1.4, 1.5, 2.6], [3.5, 1.6, 0.9], 50),
  },
  cautela: { escena: sala((u) => ({ duckOne: seAcerca(u) })), camara: fija([3.6, 1.6, -4.2], [1.6, 0.9, -1.2], 62) },
  situasion: { escena: sala((u) => ({ duckOne: [conAutoridad(u), FRENTE] })), camara: fija([3.6, 1.3, -3.0], [2.9, 1.2, -0.8], 58) },
  observa: { escena: sala(() => ({ duckOne: [firme(), FRENTE] })), camara: fija([1.3, 1.6, -1.8], [3.94, 1.7, 0.3], 55) },
  respuesta: { escena: sala(careo(conAutoridad)), camara: DUCK_DE_CERCA },
  proporcional: { escena: sala(careo(firme, almirante.habla)), camara: LOS_DOS },
  casas: { escena: sala(careo(duckOne.hablando)), camara: A_DUCK },
  objetivo: { escena: sala(careo(firme, almirante.habla)), camara: AL_ALMIRANTE },
  desbentaja: { escena: sala(careo(duckOne.hablando)), camara: DUCK_DE_CERCA },

  despegamos: { escena: sala((u) => ({ duckOne: [firme(), DUCK_A_LA_MESA], moby: moby.inclinado(u) })), camara: fija([-0.1, 1.35, -1.3], [-0.4, 0.8, 1.0], 55) },
  exposicion: { escena: sala((u) => ({ duckOne: [duckOne.hablando(u), DUCK_A_LA_MESA], moby: moby.inclinado(0) })), camara: fija([0.4, 1.35, 0.6], [2.75, 1.15, -1.0], 38) },
  cuanto: { escena: sala((u) => ({ duckOne: [firme(), DUCK_A_LA_MESA], moby: moby.inclinado(u) })), camara: fija([1.3, 1.4, -0.9], [-0.4, 0.95, 1.1], 36) },
  diapositivas: { escena: sala((u) => ({ duckOne: [duckOne.pulgar(u), DUCK_A_LA_MESA] })), camara: fija([0.4, 1.2, -0.9], [2.75, 1.1, -1.0], 50) },
  // moby gira el sillón hacia la pantalla.
  mirada: {
    escena: sala((u) => ({ duckOne: [firme(), FRENTE], moby: [moby.sentado(u), { ...ASIENTOS.moby, giro: 20 }] }), { giros: { moby: 20 } }),
    camara: fija([-1.3, 1.35, 1.6], [3.9, 1.5, 0.2], 50),
  },
  motores: {
    escena: sala((u) => ({ duckOne: [firme(), FRENTE], moby: [moby.hablando(u), { ...ASIENTOS.moby, giro: 20 }] }), { giros: { moby: 20 } }),
    camara: fija([1.6, 1.3, 0.5], [-0.4, 0.95, 1.1], 44),
  },
  levanta: { escena: sala((u) => ({ duckOne: [firme(), FRENTE], moby: [moby.levanta(u), { ...ASIENTOS.moby, giro: 20 }] }), { giros: { moby: 20 } }), camara: fija([0.9, 1.2, -0.4], [-0.4, 1.0, 1.1], 55) },
  nadie: {
    escena: sala((u) => ({ duckOne: [duckOne.señala(u), mirando(FRENTE, ASIENTOS.moby)], moby: [moby.levanta(1), { ...ASIENTOS.moby, giro: 20 }] }), { giros: { moby: 20 } }),
    camara: fija([0.6, 1.5, 0.6], [2.75, 1.2, -1.0], 38),
  },
  tos: { escena: sala((u) => ({ duckOne: [firme(), FRENTE], moby: moby.tose(u) })), camara: fija([-0.3, 1.05, -0.9], [-0.4, 0.85, 1.05], 50) },

  aportar: { escena: sala(conPuro((u) => ({ duckOne: [conAutoridad(u), hacia(DUCK_A_LA_MESA, 1)] }))), camara: fija([0.4, 1.4, 0.2], [2.75, 1.2, -1.0], 36) },
  inmovil: { escena: sala(conPuro(() => ({ duckOne: [firme(), hacia(DUCK_A_LA_MESA, 1)] }))), camara: fija([-2.6, 1.25, -0.6], [-1.6, 0.95, 0.9], 34) },
  fantasma: { escena: sala(conPuro(careo(firme, almirante.ordena))), camara: fija([3.6, 1.3, 0.4], [2.6, 1.2, 1.6], 52) },
  expediente: { escena: sala(conPuro((u) => ({ duckOne: [duckOne.carpeta(1, 0.8 * silaba(u)), DUCK_A_LA_MESA] }))), camara: fija([1.2, 1.25, -0.9], [2.75, 1.05, -1.0], 54) },
  // Giran en cadena, desde duck-one, que leía: cada uno un cuadro después del anterior.
  miran: {
    escena: (u, modo) => {
      const k = Object.fromEntries(['duckOne', 'moby', 'duke', 'almirante'].map((quien, i) => [quien, tramo(u, 0.07 * (i + 1), 0.07 * (i + 1) + 0.34)]))
      const giros = Object.fromEntries(['duckOne', 'duke', 'moby'].map((quien) => [quien, aDuky(quien, k[quien]).giro]))
      const figuras = elenco(u, {
        duckOne: [duckOne.carpeta(1), hacia(DUCK_A_LA_MESA, k.duckOne)],
        duke: [duke.sentado(u), aDuky('duke', k.duke)],
        moby: [moby.sentado(u, PRENDIDO), aDuky('moby', k.moby)],
        almirante: [almirante.quieto(u), hacia(ALMIRANTE, k.almirante)],
      })
      return reunion({ pantalla: modo, giros, figuras })
    },
    camara: fija([1.1, 1.7, -0.6], [-1.8, 0.7, 0.4], 68),
  },
  // Los mira de a uno y vuelve al frente.
  noot: { escena: anteDuky((u) => ({ duky: duky.mira((u - 0.08) / 0.84, AL_EQUIPO) })), camara: A_DUKY },
  ese: { escena: anteDuky((u) => ({ moby: [moby.hablando(u, PRENDIDO), aDuky('moby', 1)] })), camara: fija([-0.1, 1.75, -2.1], [-1.0, 0.95, 1.0], 50) },
  desinfla: { escena: anteDuky((u) => ({ duky: duky.seDesinfla(u) })), camara: A_DUKY },

  // La baliza sigue girando, al ritmo de siempre, mientras duky se vuelve a
  // inflar del susto.
  alarma: alargar(
    {
      escena: (u, modo) => {
        const prendida = Math.floor(u * 8) % 2 === 0
        return [...reunion({ pantalla: modo, alarma: prendida, figuras: elenco(u, { duckOne: [duckOne.carpeta(1), DUCK_A_LA_MESA], moby: moby.sentado(u, PRENDIDO), duky: duky.seInfla(u) }) }), ...velo(prendida)]
      },
      camara: () => CAMARA_DE_LA_ALARMA,
    },
    0,
    27 / 12,
  ),
  // La cierra y se gira hacia el almirante.
  carpeta: {
    escena: sala(conPuro((u) => ({ duckOne: [duckOne.carpeta(1 - tramo(u, 0, 0.32)), { ...FRENTE, giro: girar(180, DUCK_AL_ALMIRANTE.giro, tramo(u, 0.4, 0.8)) }] }))),
    camara: fija([2.5, 1.35, 1.2], [2.65, 0.95, -1.0], 48),
  },
  perfecto: { escena: sala(conPuro(careo(conLaCarpeta))), camara: DUCK_DE_CERCA },
  vino: { escena: sala(conPuro(careo(() => duckOne.carpeta(0), almirante.habla))), camara: AL_ALMIRANTE },
  plan: { escena: sala(conPuro(careo(conLaCarpeta))), camara: A_DUCK },
  // Se lleva la carpeta a la espalda, se gira hacia el escuadrón y saca pecho.
  gira: {
    escena: sala(
      conPuro((u) => {
        const guarda = tramo(u, 0, 0.18)
        const pose = guarda < 1 ? duckOne.guarda(guarda) : duckOne.atras(null, 0, 6 * tramo(u, 0.78, 0.9))
        return { duckOne: [pose, { ...FRENTE, giro: girar(DUCK_AL_ALMIRANTE.giro, 180, tramo(u, 0.18, 0.745)) }] }
      }),
    ),
    camara: AL_ESCUADRON,
  },
  puestos: { escena: sala(conPuro((u) => ({ duckOne: [duckOne.señala(u), DUCK_A_LA_MESA] }))), camara: AL_ESCUADRON },
  porfin: { escena: sala((u) => ({ duckOne: [firme(), DUCK_A_LA_MESA], moby: [moby.grita(u), { ...ASIENTOS.moby, en: [-0.4, 0, 1.45] }] })), camara: fija([-0.5, 1.1, -0.9], [-0.4, 1.2, 1.2], 55) },
  // El humo del puro de moby pasaría por delante de duke.
  perfil: { escena: sala((u) => ({ moby: moby.sentado(u, SIN_HUMO), duckOne: [firme(), DUCK_A_LA_MESA], duke: duke.alEspejo(u) })), camara: fija([-1.0, 1.1, 0.6], [-1.0, 1.0, -1.0], 46) },
  solo: {
    escena: (u, modo) => {
      const figuras = seVan(u).filter(([, { en }]) => en[0] > -3.9)
      return reunion({ pantalla: modo, abre: 1, figuras: [...figuras, [duky.sentado(Math.floor(tramo(u, 0.55, 0.95) * 3.99)), ASIENTOS.duky]] })
    },
    camara: fija([2.6, 1.9, -2.6], [-3.4, 0.8, 1.9], 64),
  },
  // La pantalla dice la operación, con «INICIADA» parpadeando.
  iniciada: {
    escena: (u) => reunion({ pantalla: Math.floor(u * 4) % 2 ? 'operacion' : 'iniciada', abre: 1, figuras: [[duky.sentado(3), ASIENTOS.duky]] }),
    camara: fija([0.9, 1.75, 0], [3.94, 1.85, 0], 70),
  },
}
