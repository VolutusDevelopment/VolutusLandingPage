// Las tomas de la escena 1, en 3D: qué se ve en el instante u ∈ [0, 1) y
// desde dónde. Las usan las láminas del lienzo (laminas.mjs) y las tiras del
// juego (sprites.mjs); el guion, con sus líneas, está en src/lib/escena1.js.
//
// `escena(u, modo)` arma la figura; `camara(u)` da [ojo, mira, campo] en
// metros y grados. `modo` es lo que muestra la pantalla de la sala desde el
// atacante: 'cursor' o 'huella'.

import { ALMIRANTE, OFICIAL, MARINEROS, OFICIOS, silaba, suave } from './personajes.mjs'
import { MAR, PANTALLA, enMarcha, portaaviones, destructor, navegando, poner, colocar } from './lugares.mjs'
import { ASIENTOS, recorrido, reunion } from '../escena2/reunion.mjs'
import { DUKE, MOBY } from '../escena9/cazas.mjs'
import { SUELO as SUELO_DUCK_ONE, caza as cazaDuckOne } from '../escena3/caza.mjs'
import { ALAS_TOMCAT } from '../pilotos/modelos.mjs'
import { alargar } from '../tiras.mjs'

const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const tramo = (u, a, b) => suave((u - a) / (b - a))
const fija = (ojo, mira, campo) => () => [ojo, mira, campo]
const alarma = (u) => Math.floor(u * 12) % 2

// ── Fuera ────────────────────────────────────────────────────────────────

// Los cazas del escuadrón, estacionados en fila a estribor, a popa de la isla
// y con la cola hacia el borde: el F-14 de duck-one, con las alas barridas
// al máximo, el A-10 de moby y el Hornet de duke, con las alas plegadas,
// todos con el motor apagado (sin las estelas, las formas con luz). Quedan
// fuera de la pista en ángulo y del camino de la cámara que sube a la isla.
const ESTACIONADOS = [
  [cazaDuckOne({ alas: ALAS_TOMCAT.estacionadas }).filter((f) => !f.luz), SUELO_DUCK_ONE, -100],
  [MOBY.caza(), MOBY.suelo, -120],
  [DUKE.caza({ alas: 100 }), DUKE.suelo, -140],
].flatMap(([formas, suelo, x]) => poner(formas, 30, [x, 20.8 - suelo, 10]))
// El Sitting Ducks con sus cazas, las alarmas y el radar, que da una vuelta por tira.
const sittingDucks = (u) => [...portaaviones({ alarma: alarma(u), ...enMarcha(u) }), ...ESTACIONADOS]

// Lejos, a ras del agua: el mar vacío mientras se oyen los motores, y el
// Sitting Ducks, una mancha en el horizonte, se viene acercando. Con la
// segunda línea aparece un portaaviones, otro, otro más y la escolta.
const FLOTA = [
  [0.54, portaaviones({ avion: false }), 172, [2900, 0, -950]],
  [0.65, portaaviones({ avion: false }), 188, [3300, 0, 820]],
  [0.77, portaaviones({ avion: false }), 176, [2300, 0, -420]],
  [0.85, destructor(), 165, [1700, 0, -1100]],
  [0.85, destructor(), 195, [1900, 0, 1000]],
  [0.88, destructor(), 180, [2600, 0, 250]],
  [0.92, destructor(), 160, [1300, 0, 700]],
]
const llegada = (u) => [
  MAR,
  ...FLOTA.filter(([desde]) => u >= desde).flatMap(([, formas, giro, en]) => navegando(formas, giro, en)),
  ...(u >= 0.1 ? navegando(sittingDucks(u), 158, [3800 - 3350 * suave((u - 0.1) / 0.83), 0, 300 - 120 * u]) : []),
]

// De cerca, por estribor. La escolta navega lejos, detrás.
const ESCOLTA = [
  [destructor(), 10, [-700, 0, -900]],
  [destructor(), -5, [600, 0, -1400]],
  [portaaviones({ avion: false }), 5, [-200, 0, -2600]],
]
const costado = (u) => [MAR, ...ESCOLTA.flatMap(([formas, giro, en]) => navegando(formas, giro, en)), ...navegando(sittingDucks(u), 0, [0, 0, 0], [168, 6, 10])]

// La órbita: de la popa, a contraluz, por estribor, que se acerca y baja
// hasta la amura. En grados desde la proa hacia estribor.
const ORBITA = { desde: 205, hasta: 35, lejos: [290, 250], alto: [70, 24] }
const enOrbita = (u) => {
  const k = suave(u)
  const a = ((ORBITA.desde + (ORBITA.hasta - ORBITA.desde) * k) * Math.PI) / 180
  const r = ORBITA.lejos[0] + (ORBITA.lejos[1] - ORBITA.lejos[0]) * k
  return [r * Math.cos(a), ORBITA.alto[0] + (ORBITA.alto[1] - ORBITA.alto[0]) * k, r * Math.sin(a)]
}

// En cubierta: siete marineros corren de un lado a otro a lo largo de la
// cubierta, cada uno derecho de `desde` a `hasta` ([x, z]) durante toda la
// toma, y se cruzan de a dos sin chocar; el avión de mantenimiento sigue
// atravesado en la pista. Los pasos siguen lo que avanzan, a 1,6 m por zancada.
const CORREDORES = [
  [OFICIOS.verde, [97, -8], [97.5, 6]],
  [OFICIOS.amarillo, [94, 7], [93, -9]],
  [OFICIOS.rojo, [89, -3], [71, -7]],
  [OFICIOS.morado, [72.3, -13.5], [88.3, 0.5]],
  [OFICIOS.amarillo, [66, 6], [64, -14]],
  [OFICIOS.verde, [61, -13], [63, 5]],
  [OFICIOS.rojo, [57, 4], [49, -11]],
]
// Por la borda de babor, a la derecha del cuadro, otros tres corren
// desesperados a lo largo del borde (z = -19): dos en fila hacia proa, que
// salen de cuadro, y uno, más adentro, hacia popa.
const POR_LA_BORDA = [
  [OFICIOS.morado, [74, -17.6], [100, -17.6]],
  [OFICIOS.amarillo, [99, -15.8], [73, -15.8]],
  [OFICIOS.verde, [68, -17.6], [94, -17.6]],
]
const ZANCADA = 1.6
const cubierta = (u) => [
  MAR,
  ...sittingDucks(u),
  ...[...CORREDORES, ...POR_LA_BORDA].flatMap(([oficio, desde, hasta], i) => {
    const [x, z] = lerp(desde, hasta, u)
    const giro = (Math.atan2(desde[1] - hasta[1], hasta[0] - desde[0]) * 180) / Math.PI
    const fase = ((Math.hypot(hasta[0] - desde[0], hasta[1] - desde[1]) * u) / ZANCADA + i * 0.37) % 1
    return colocar(MARINEROS.corre(oficio, fase), { k: 0.6, giro, en: [x, 20.8, z] })
  }),
]

// ── Dentro: el almirante a la cabecera de la mesa y el oficial de pie junto a la pantalla ──

// La sala de la reunión de la escena 2, con su mesa y sus seis sillones. El
// almirante se sienta en la cabecera de la puerta, de cara a la pantalla.
const CABECERA = ASIENTOS.duckOne
// Se levanta girando el sillón hacia estribor, y ahí lo deja.
const HACIA_LA_VENTANA = -90
// Al final se para en la ventana, en el panel del medio, mirando a estribor.
const ALM_VENTANA = { en: [0.5, 0, 4.2], giro: HACIA_LA_VENTANA }
// El oficial, de pie junto a la pantalla, no le quita los ojos de encima al
// almirante: se gira hacia donde esté, también mientras camina a la ventana.
const OF_EN = [2.4, 0, 2.0]
const haciaElAlmirante = ([x, , z]) => (Math.atan2(OF_EN[2] - z, x - OF_EN[0]) * 180) / Math.PI
// Sentado en la cabecera (`donde`), el sillón gira con él.
export const salaCon = (u, { pantalla, almirante, oficial, donde = CABECERA }) =>
  reunion({
    u,
    pantalla,
    alarma: Math.floor(u * 4) % 2 === 0,
    giros: { duckOne: donde.en === CABECERA.en ? donde.giro : HACIA_LA_VENTANA },
    figuras: [...(almirante ? [[almirante, donde]] : []), ...(oficial ? [[oficial, { en: OF_EN, giro: haciaElAlmirante(donde.en) }]] : [])],
  })
// Un punto `lejos` metros frente al oficial cuando mira al almirante en `donde`.
const frenteAlOficial = (donde, lejos, alto) => {
  const a = (haciaElAlmirante(donde.en) * Math.PI) / 180
  return [OF_EN[0] + lejos * Math.cos(a), alto, OF_EN[2] - lejos * Math.sin(a)]
}

// `pantalla` es un estado fijo o, con 'modo', el que usa quien juega.
const dentro = (pantalla, almirante, oficial = OFICIAL.quieto, donde = CABECERA) => (u, modo) => salaCon(u, { pantalla: pantalla === 'modo' ? modo : pantalla, almirante: almirante(u), oficial: oficial(u), donde })

// Del sillón a la ventana: derecho hacia estribor, para salir de entre los
// apoyabrazos, por detrás de los sillones de estribor y, frente al panel del
// medio, derecho hasta el vidrio. Arranca y se detiene despacio; los pasos
// siguen lo que avanza, uno cada `PASO` m.
const A_LA_VENTANA = recorrido([[CABECERA.en[0], 0], [-2.8, 2.1], [-2.3, 2.5], [0, 2.5], [0.5, 3.0], [0.5, 4.2]])
const PASO = 0.82
const paseo = (u) => {
  const s = A_LA_VENTANA.largo * suave(u / 0.9)
  return { almirante: ALMIRANTE.andando(u < 0.9 ? s / PASO : null), donde: A_LA_VENTANA.donde(s) }
}
const pregunta = (u) => ALMIRANTE.sentado(u, { abrePico: silaba(u) * 0.8, ceño: 0.5 })
const callado = (u) => ALMIRANTE.sentado(u, {})
const gesto = (p, nombre) => p.gestos.find((g) => g.nombre === nombre).pose
const SOBRE_EL_HOMBRO = [-3.85, 1.45, -1.1]

export const TOMAS_3D = {
  llegada: { escena: llegada, camara: fija([0, 6, 0], [1000, -12, 180], 40) },
  orbita: { escena: costado, camara: (u) => [enOrbita(u), [-10, 22, 0], 46] },
  // Hacia popa, con la borda de babor a la derecha.
  cubierta: { escena: cubierta, camara: fija([104, 23.2, 5], [-20, 28, -30], 72) },
  subida: {
    escena: (u) => [MAR, ...sittingDucks(u)],
    camara: (u) => [lerp([20, 23, 6], [-2, 42, 13], suave(u)), lerp([-25, 36, 27], [-30, 41, 27], suave(u)), 62],
  },
  sala: { escena: dentro('bajas', pregunta), camara: fija([-3.8, 2.8, -4.7], [1.5, 0.6, 0.6], 80) },
  pantalla: { escena: dentro('bajas', pregunta), camara: fija(SOBRE_EL_HOMBRO, [4, 1.3, 0.6], 62) },
  oficial: { escena: dentro('bajas', callado, gesto(OFICIAL, 'lee el informe')), camara: fija([0.3, 1.15, 0.05], [2.4, 1.05, 2.0], 44) },
  // Se quita las gafas y, con ellas en la mano, pregunta: desde su línea, a los 0,62.
  gafas: { escena: dentro('bajas', (u) => gesto(ALMIRANTE, 'se quita las gafas')(u, { sentado: true, abrePico: u >= 0.62 ? silaba(u) * 0.8 : 0 })), camara: fija([-1.3, 1.0, 0.3], [-2.75, 1.05, 0], 60) },
  // El oficial, con el brazo arriba, contesta y anuncia la foto (antes de los
  // 0,23 y desde los 0,65, sus líneas); entremedio habla el almirante.
  caidos: {
    escena: dentro('bajas', callado, (u) => gesto(OFICIAL, 'señala la pantalla')(Math.min(u, 0.45), { abre: u < 0.23 || u >= 0.65 ? silaba(u) * 0.5 : 0 })),
    camara: (u) => {
      const gira = tramo(u, 0.72, 0.97)
      const ojo = [1.6 - 0.7 * gira, 1.85 - 0.4 * gira, -1.7 + 3.25 * suave(u / 0.72)]
      return [ojo, lerp([PANTALLA.x, 1.85, ojo[2]], [2.5, 1.15, 1.8], gira), 45 + 7 * gira]
    },
  },
  atacante: { escena: dentro('modo', callado, gesto(OFICIAL, 'señala la pantalla')), camara: fija(SOBRE_EL_HOMBRO, [4, 1.45, 0.6], 56) },
  // Gira el sillón hacia la ventana mientras se levanta y, ya de pie, lleva
  // las manos a la espalda, como camina.
  levanta: alargar(
    {
      escena: (u, modo) => salaCon(u, { pantalla: modo, almirante: gesto(ALMIRANTE, 'se levanta')(u, { atras: tramo(u, 0.75, 1.05) }), oficial: OFICIAL.quieto(u), donde: { ...CABECERA, giro: HACIA_LA_VENTANA * tramo(u, 0, 0.4) } }),
      camara: fija([-3.15, 0.3, 1.6], [-2.8, 1.1, 0], 72),
    },
    0,
    14 / 12,
  ),
  ventana: {
    escena: (u, modo) => salaCon(u, { pantalla: modo, oficial: OFICIAL.quieto(u), ...paseo(u) }),
    // La cámara lo acompaña por los ventanales, por delante, y se aleja un
    // metro mientras él se acerca al vidrio.
    camara: (u) => {
      const [x, , z] = paseo(u).donde.en
      return [[x + 1.6 + suave(u / 0.9), 1.7, 4.7], [x, 0.8, z], 60]
    },
  },
  atardecer: { escena: dentro('modo', gesto(ALMIRANTE, 'mira el atardecer'), OFICIAL.quieto, ALM_VENTANA), camara: fija([1.4, 1.0, 1.9], [-0.1, 1.55, 5], 48) },
  cuatro: { escena: dentro('modo', gesto(ALMIRANTE, 'da la orden'), OFICIAL.quieto, ALM_VENTANA), camara: fija([-2.6, 1.6, 3.4], [1.2, 1.1, 3.0], 62) },
  silencio: { escena: dentro('modo', gesto(ALMIRANTE, 'mira el atardecer'), gesto(OFICIAL, 'se queda callado'), ALM_VENTANA), camara: fija(frenteAlOficial(ALM_VENTANA, 1.63, 1.1), [2.4, 1.12, 2.0], 58) },
}
