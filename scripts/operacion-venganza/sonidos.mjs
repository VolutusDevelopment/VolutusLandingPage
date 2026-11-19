// Los sonidos de las escenas (src/lib/operacion-venganza/escena<n>.js), hechos
// con el modelo de efectos de sonido de ElevenLabs: solo efectos, sin voces.
// Los escriben los sonidos.mjs de cada escena, con su lista de sonidos por
// toma, en public/operacion-venganza.
//
// Un sonido de una escena va en su carpeta y empieza en su `cuadro`, o en
// cada uno de sus `cuadros` (los pasos, de pisadas.json). Dura lo que su tira
// desde ahí, o sus `segundos`, y suena entero aunque la toma cambie. Con
// `cada`, vuelve a sonar cada tantos segundos, hasta el cuadro `hasta` o el
// fin de la toma; un sonido que se repite, con `hasta`, se calla ahí, y con
// `tramo`, repite solo esos segundos del archivo. Con `adentro`, suena con
// el eco de la sala en que está. Los de `fondo` son los ambientes del lugar y
// los motores: se repiten sin corte mientras sigan en la toma que viene, y
// entran y salen fundidos. Un efecto solo se repite con `bucle: true`. Los
// `detalles` de un fondo son sonidos sueltos (una gaviota, una silla que
// cruje) que vuelven a cualquier hora, cada `azar` segundos, mientras el
// fondo suena. Cada sonido lleva su `nivel` en NIVELES: lo fuerte que debe
// sonar.
//
// Nada empieza en seco: un efecto entra en una centésima, un fondo en poco
// más de medio segundo, y lo que pida `entra` en esos segundos. Lo que sigue
// sonando en la toma que viene pasa en `entra` a como suena en ella. `lejos`,
// de 0 a 1, es lo lejos que está de la cámara: suena más bajo y más opaco; y
// `tono`, cuánto se acelera (1, tal cual). Los dos pueden ser una curva,
// [[cuadro, valor], …], desde el comienzo de la toma. Así un caza suena
// siempre con su motor: llega del horizonte, pasa junto a la cámara bajando
// de tono, aterriza y se apaga; y la misma ráfaga suena distinta en cada
// toma.
//
// Con `variantes`, se piden tantas versiones del mismo texto (nombre,
// nombre-2, …) y cada vez que suena elige una al azar, nunca la de la vez
// anterior, desde un punto cualquiera si se repite: lo que vuelve a sonar
// nunca suena igual.
//
// Los que suenan en varias escenas están en COMUNES, con su largo, y van en
// una carpeta aparte. Un sonido sin `texto` es uno que ya se pidió:
// uno de COMUNES o uno de antes en la escena.
//
// El SDK lee la clave de ELEVENLABS_API_KEY, que vive en .env.local y nunca en
// el código. Los mp3 se commitean, porque cada sonido gasta créditos: sin
// nombres, la escena pide solo los que faltan; con nombres, rehace esos.

import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { cuadrosDe } from '../../src/lib/operacion-venganza/escena1.js'

const PUBLICO = fileURLToPath(new URL('../../public', import.meta.url))

// En inglés, que es como mejor los sigue el modelo. Duky es un pato de goma:
// cuando lo aprietan, chilla. Los fondos duran 10 s, para que no se note
// dónde vuelven a empezar, y no traen nada suelto adentro: lo suelto va en
// sus `detalles`, que vuelven al azar.
// Un paso de cada uno, adentro (el piso de acero de las salas) y en la
// cubierta, que no es de metal: es una pista, de superficie rugosa. Suenan en
// cada pisada (pisadas.json), y al correr, con su paso de carrera.
const ADENTRO = "on the hard steel floor of a ship's command room"
const EN_LA_CUBIERTA = 'on the rough non-skid surface of an aircraft carrier flight deck outdoors, like on asphalt, gritty, no metal'
const QUIENES = {
  almirante: ['suave', 'a stately admiral in leather dress shoes: a firm, measured heel strike'],
  'duck-one': ['suave', 'a brisk officer in polished military boots: a crisp heel click'],
  moby: ['medio', 'a big, heavy man in combat boots: a loud heavy stomp'],
  duke: ['suave', 'a light, graceful man in fine leather-soled shoes: one short, crisp, dainty heel tap that stops at once, no shuffle, no scrape'],
  marinero: ['suave', 'a sailor in rubber-soled work boots: a soft, muffled step'],
}
const paso = (nivel, quien, donde) => ({ nivel, segundos: 0.5, texto: `Starting right away: one single footstep of ${quien}, ${donde}, one step only` })
const carrera = (quien) => ({ nivel: 'medio', segundos: 0.5, texto: `Starting right away: one single fast, hard running footstep of ${quien}, ${EN_LA_CUBIERTA}, one step only` })
const PASOS = {
  ...Object.fromEntries(Object.entries(QUIENES).flatMap(([nombre, [nivel, quien]]) => [[`paso-${nombre}`, paso(nivel, quien, ADENTRO)], [`paso-${nombre}-cubierta`, paso(nivel, quien, EN_LA_CUBIERTA)]])),
  'carrera-almirante': carrera('a heavy admiral in leather dress shoes'),
  'carrera-marinero': carrera('a panicked sailor in rubber-soled work boots'),
}

const ambiente = (nivel, texto, detalles) => ({ nivel, segundos: 10, bucle: true, fondo: true, texto, detalles })
const SIN_EVENTOS = 'steady and even, with no distinct events'
const EN_CUBIERTA = ['gaviota-1', 'gaviota-2', 'gaviota-3', 'rafaga-en-cubierta']

// Cada caza suena como el de verdad, en todo lo que se oye de él: volando
// junto a la cámara, al pasar y al aterrizar. El A-10 de moby silba.
export const CAZAS = {
  a10: "an A-10 Warthog military attack jet's two TF34 turbofan jet engines: a powerful, loud, broadband jet roar with a deep thundering rumble and the Warthog's famous piercing, high-pitched turbine whistle on top, a real fighter jet, jet turbines only, never a propeller or piston engine",
  hornet: "an F/A-18 Hornet's two F404 turbofans: a powerful, sharp, smooth jet roar with a clean high turbine whine",
  f22: "an F-22 Raptor's two F119 engines: a deep, thunderous, crackling roar, enormously powerful",
  tomcat: "an F-14 Tomcat's two TF30 turbofans: a deep, throaty roar with a rising metallic howl",
}
const motor = (caza) => ({
  nivel: 'fuerte',
  segundos: 6,
  bucle: true,
  fondo: true,
  texto: `The sound of ${caza}, heard from a camera flying right alongside the jet: a steady, constant, powerful roar, no fly-by, no doppler, ${SIN_EVENTOS}`,
})
// La ropa y las sillas, cuando alguien se mueve.
const roce = (texto) => ({ nivel: 'susurro', segundos: 0.8, texto: `Starting right away: ${texto}` })
// Sin nombrar a nadie: con una persona en el texto, el modelo le pone voz.
const deDuckOne = (segundos, variantes, texto) => ({ nivel: 'suave', segundos, variantes, texto: `Starting right away: ${texto}` })
// Lo que se oye del portaaviones desde adentro, a cualquier hora.
const lejano = (azar, texto) => ({ nivel: 'susurro', segundos: 2, azar, texto: `${texto}, far away inside a huge steel ship, muffled through bulkheads` })

export const COMUNES = {
  // El barco trabaja: nada de aviones despegando ni de tonos sostenidos, que
  // se oyen como voces. Lo que pasa, pasa en sus detalles.
  'sala-de-mando': ambiente(
    'susurro',
    'Steady room noise inside a closed steel control room on a huge ship under way: a constant low rumble of distant engines and a soft airflow hiss from the vents, like brown noise, completely uniform from the first second to the last, no events, no swells, no waves, no creaks, no tones, no voices',
    ['silla-cruje-1', 'silla-cruje-2', 'escotilla-lejana', 'cadenas-lejanas', 'tractor-lejano'],
  ),
  'escotilla-lejana': lejano([9, 22], 'A heavy steel hatch slams shut with a dull metallic thud and its latch clanks'),
  'cadenas-lejanas': lejano([11, 26], 'Tie-down chains rattle and clink as deck crews move them'),
  'tractor-lejano': lejano([14, 30], 'A small aircraft tow tractor drives slowly past on the flight deck above, its diesel engine puttering'),
  ropa: roce('the short rustle of a uniform sleeve as someone moves their arm, soft fabric, close'),
  // Duck-One se mueve con todas sus medallas: un sonido por movimiento, y
  // varias versiones de cada uno, que nunca suenan dos veces seguidas igual.
  'duck-one-brazo': deDuckOne(0.8, 4, 'the short stiff rustle of a uniform sleeve moving, and many small light medals clinking and tinkling'),
  'duck-one-gira': deDuckOne(1.2, 3, 'a crisp uniform fabric rustle, a soft leather heel scuff on a hard floor and many small medals swinging and jingling together'),
  'duck-one-pecho': deDuckOne(0.8, 3, 'stiff uniform fabric stretching tight, and many small light medals rattling all at once in one bright little shake'),
  'silla-cruje': roce('a leather office chair creaks once as the person sitting in it shifts their weight'),
  cubierta: ambiente(
    'suave',
    `Aircraft carrier flight deck at sunset on the open ocean: strong gusty sea wind, flags and cables flapping and humming in the wind, distant deck machinery, a far-off jet engine idling, ${SIN_EVENTOS}`,
    EN_CUBIERTA,
  ),
  'mar-desde-cubierta': ambiente(
    'suave',
    `High up on the edge of an aircraft carrier deck over the open ocean: strong steady sea wind and the deep wash of waves breaking against the huge hull far below, no birds, ${SIN_EVENTOS}`,
    EN_CUBIERTA,
  ),
  mar: ambiente(
    'suave',
    `The open ocean far from any coast at sunset: deep rolling swells, wind blowing over the water, waves slapping against each other, vast and empty, no shore, no birds, ${SIN_EVENTOS}`,
  ),
  'cabina-en-cubierta': ambiente(
    'alto',
    `Inside a fighter jet cockpit parked on an aircraft carrier deck: the engine idling with a steady turbine whine, soft avionics hum, sea wind muffled through the canopy, ${SIN_EVENTOS}`,
  ),
  // La cabina de cada uno suena como su caza: la de duck-one, vieja y
  // destartalada; la de moby, un A-10 que ruge; la de duke, pulida, y la de
  // duky, un caza experimental.
  cabina: ambiente('alto', `Inside an old fighter jet cockpit in flight: a slightly uneven engine drone, the airframe rattling and creaking, a soft radio static hiss, ${SIN_EVENTOS}`),
  'cabina-moby': ambiente(
    'alto',
    `Inside the cockpit of a heavy A-10 attack jet in flight: a loud high-pitched turbofan whine, the rugged airframe vibrating and rattling, heavy and rough, ${SIN_EVENTOS}`,
  ),
  'cabina-duke': ambiente(
    'alto',
    `Inside the cockpit of a sleek modern fighter jet in smooth flight: a quiet refined engine hum, smooth air, soft clean avionics tones, calm and polished, ${SIN_EVENTOS}`,
  ),
  'cabina-duky': ambiente(
    'alto',
    `Inside the cockpit of an experimental stealth fighter jet in flight: a deep powerful engine rumble with an eerie low pulsing energy hum underneath, futuristic, ${SIN_EVENTOS}`,
  ),
  sala: ambiente(
    'suave',
    'Busy naval combat information center inside a warship: a steady electronic hum, regular soft radar sweep beeps, consoles chirping, keyboards typing, muffled radio static, no voices',
    ['radio-estatica'],
  ),
  cielo: ambiente('suave', `High altitude open sky: a steady powerful wind rushing past and a distant jet engine drone, airy and wide, ${SIN_EVENTOS}`),
  // Cuando vuelan juntos suenan los dos motores a la vez: nunca un tercero.
  'motor-a10': motor(CAZAS.a10),
  'motor-hornet': motor(CAZAS.hornet),
  'motor-f22': motor(CAZAS.f22),

  'gaviota-1': { nivel: 'suave', segundos: 1.5, azar: [10, 26], texto: 'A single seagull cries twice overhead, outdoors with sea wind' },
  'gaviota-2': { nivel: 'suave', segundos: 1.5, azar: [12, 30], texto: 'Two seagulls squawk briefly in the distance over the sea' },
  'gaviota-3': { nivel: 'suave', segundos: 2, azar: [14, 32], texto: 'A seagull calls out loudly as it glides past, a long laughing cry' },
  'rafaga-en-cubierta': { nivel: 'suave', segundos: 2.5, azar: [7, 16], texto: "A strong gust of sea wind sweeps across a ship's open deck and fades" },
  'silla-cruje-1': { nivel: 'susurro', segundos: 1, azar: [8, 20], texto: 'A leather office chair creaks softly as someone shifts their weight in it' },
  'silla-cruje-2': { nivel: 'susurro', segundos: 1, azar: [9, 22], texto: 'A swivel chair turns slightly with a short squeak and a soft leather creak' },
  'radio-estatica': { nivel: 'susurro', segundos: 1, azar: [5, 12], texto: 'A short burst of crackling military radio static with a squelch click, no voice' },

  // La alarma del portaaviones: en la cubierta, tal cual; en una sala, con
  // `adentro`; desde el mar, `lejos`. Solo la alarma: los pasos son de
  // quienes se ven correr.
  alarma: {
    nivel: 'fuerte',
    segundos: 3,
    bucle: true,
    fondo: true,
    texto: "A warship's general quarters alarm: a loud, harsh electronic klaxon tone repeating at a steady rhythm over the ship's loudspeakers, only the alarm, no footsteps, no voices, no other sounds",
  },
  encendedor: { nivel: 'medio', segundos: 2, texto: 'A single flick of a metal lighter: one click, the flame catches with a soft whoosh, then one slow puff on a cigar' },
  // Las de duck-one: muchas, chicas y livianas, que se mueven mientras camina.
  medallas: {
    nivel: 'medio',
    segundos: 6,
    bucle: true,
    variantes: 4,
    texto: 'Many small, light military medals tinkling and jingling delicately on a uniform as someone walks: a long, continuous, airy shimmer of little metal pieces, light and bright, never heavy',
  },
  // En bucle, ElevenLabs deja un silencio entre ráfagas: se pide sin bucle y se
  // repite solo su `tramo` parejo.
  disparos: {
    nivel: 'alto',
    segundos: 4,
    bucle: true,
    tramo: [0.2, 2.2],
    texto: "Constant, steady, sustained machine gun fire from the very first instant to the very last: a fighter jet's rotary cannon roaring in one unbroken stream, no silence, no pauses, no build-up, spent casings rattling, realistic",
  },
  gafas: { nivel: 'susurro', segundos: 2.5, texto: 'Sunglasses folded and unfolded with a crisp plastic hinge click' },
  silla: { nivel: 'suave', segundos: 2.1, texto: 'A heavy office chair swivels and rolls back on a hard floor as someone stands up' },
  'silla-gira': { nivel: 'suave', segundos: 1, texto: 'A leather office swivel chair turning around with a creaking squeak' },
  'sillas-giran': { nivel: 'medio', segundos: 1.5, texto: 'Several leather swivel chairs turning around at the same time, overlapping creaks and squeaks' },
  'se-sienta': {
    nivel: 'alto',
    segundos: 1.5,
    texto: 'Starting right away: a heavy man flops back down into a leather office chair, a loud thump of the cushion and a long squeaky creak of the chair springs',
  },
  ...PASOS,
  destello: { nivel: 'medio', segundos: 3.5, texto: 'A bright magical sparkle ding with a glittering shimmer tail' },
}

const rutaComun = (nombre) => `/operacion-venganza/sonidos/${nombre}.mp3`
// Lo fuerte que suena cada sonido, en LUFS: quien lo reproduce lo lleva a eso,
// porque ElevenLabs los entrega a cualquier volumen. Un ambiente de sala es
// un susurro y el portaaviones partido en dos, un estruendo.
export const NIVELES = { apenas: -42, susurro: -36, suave: -30, medio: -24, alto: -19, fuerte: -15, estruendo: -11 }

// Las pisadas de `quien` en una toma (pisadas.json): su paso en cada una, y
// lo que dura su caminata, desde la primera hasta un poco después de la
// última (para las medallas de duck-one, que se mueven mientras camina).
const PISADAS = JSON.parse(readFileSync(new URL('./pisadas.json', import.meta.url), 'utf8'))
const pisadasDe = (numero, toma, quien) => {
  const cuadros = Object.entries(PISADAS[numero]?.[toma] ?? {})
    .filter(([clave]) => clave.replace(/\d+$/, '') === quien)
    .flatMap(([, deUno]) => deUno)
    .sort((a, b) => a - b)
  if (!cuadros.length) throw new Error(`${quien} no camina en la toma ${toma} de la escena ${numero}`)
  return cuadros
}
export const pasosDe = (numero) => (toma, quien, nombre) => ({ toma, nombre, cuadros: pisadasDe(numero, toma, quien) })
export const caminataDe = (numero) => (toma, quien) => {
  const cuadros = pisadasDe(numero, toma, quien)
  return { toma, cuadro: cuadros[0], hasta: cuadros.at(-1) + 2 }
}

export const rutaDeSonido = (numero, nombre) => (COMUNES[nombre] ? rutaComun(nombre) : `/operacion-venganza/escena${numero}/sonidos/${nombre}.mp3`)
export const rutaDeSonidoDeCombate = (nombre) => (COMUNES[nombre] ? rutaComun(nombre) : `/operacion-venganza/combate/sonidos/${nombre}.mp3`)

// Cada sonido de la lista, en cada una de sus `tomas` (o en su `toma`), con lo
// que hay que pedir y cómo suena: cuánto dura, si se repite y desde qué cuadro.
// Un sonido sin `texto` es el que ya se pidió, el común o el de la escena, y
// suena como se pidió: con su nivel, su largo y, si se repetía, repitiéndose.
// Los `detalles` de un fondo común van en las mismas tomas que él.
export const sonidosDe = (TOMAS, SONIDOS) => {
  const pedidos = Object.fromEntries(SONIDOS.filter((s) => s.texto).map((s) => [s.nombre ?? s.toma, s]))
  const conDetalles = SONIDOS.flatMap((sonido) => [
    sonido,
    ...(COMUNES[sonido.nombre]?.detalles ?? []).map((nombre) => ({ tomas: sonido.tomas ?? [sonido.toma], nombre })),
  ])
  return conDetalles.flatMap((sonido) =>
    (sonido.tomas ?? [sonido.toma]).map((id) => {
      const toma = TOMAS.find((t) => t.id === id)
      const { nombre = id, cuadro = 0, cuadros, cada, hasta, adentro, entra, lejos, tono } = sonido
      const pedido = COMUNES[nombre] ?? pedidos[nombre] ?? sonido
      return {
        toma: id,
        nombre,
        cuadro,
        cuadros,
        cada,
        hasta,
        adentro,
        entra,
        lejos,
        tono,
        tramo: sonido.tramo ?? pedido.tramo,
        variantes: pedido.variantes,
        azar: pedido.azar,
        texto: pedido.texto,
        segundos: pedido.segundos ?? sonido.segundos ?? ((cuadrosDe(toma) - cuadro) * toma.ms) / 1000,
        bucle: Boolean(sonido.bucle ?? pedido.bucle),
        fondo: Boolean(pedido.fondo ?? sonido.fondo),
        nivel: pedido.nivel ?? 'medio',
      }
    }),
  )
}

// Nada de voces: el modelo las pone donde hay alguien o algo con vida.
const SIN_VOCES = '; no human voice, no speech, no shouting'

const pedir = (cliente, { texto, segundos, bucle, tramo }) =>
  cliente.textToSoundEffects.convert({
    text: texto + SIN_VOCES,
    modelId: 'eleven_text_to_sound_v3',
    durationSeconds: segundos,
    loop: bucle && !tramo,
    promptInfluence: 0.5,
    outputFormat: 'mp3_44100_96',
  })

// Pide cada sonido de la lista (con su `ruta` en public) una vez: sin nombres
// en la línea de comandos, los que faltan; con nombres, esos.
// Las rutas de las versiones de un sonido: la primera es la suya.
export const variantesDe = (ruta, variantes = 1) => Array.from({ length: variantes }, (_, i) => (i ? ruta.replace(/\.mp3$/, `-${i + 1}.mp3`) : ruta))

export async function escribir(sonidos) {
  const nombres = process.argv.slice(2)
  const cliente = new ElevenLabsClient()
  const hechos = new Set()
  for (const sonido of sonidos) {
    if (!sonido.texto) continue
    for (const [i, ruta] of variantesDe(sonido.ruta, sonido.variantes).entries()) {
      const archivo = PUBLICO + ruta
      const nombre = i ? `${sonido.nombre}-${i + 1}` : sonido.nombre
      if (hechos.has(archivo)) continue
      hechos.add(archivo)
      if (nombres.length ? !nombres.includes(nombre) : existsSync(archivo)) continue
      await mkdir(dirname(archivo), { recursive: true })
      await writeFile(archivo, await pedir(cliente, sonido))
      console.log(nombre)
    }
  }
}

export const escribirSonidos = (numero, TOMAS, SONIDOS) =>
  escribir(sonidosDe(TOMAS, SONIDOS).map((sonido) => ({ ...sonido, ruta: rutaDeSonido(numero, sonido.nombre) })))
