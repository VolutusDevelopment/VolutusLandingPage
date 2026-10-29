// Escena 2, «Patoon-4»: las tomas en láminas animadas del lienzo de Design,
// con el motor de las cabinas, para revisarlas antes de pasarlas al juego.
//
//   node scripts/operacion-venganza/escena2/laminas.mjs <carpeta> <hoja.html>
//
// Escribe <carpeta>/project/E2-*.dc.html y, en la hoja, el cuadro quieto de
// cada toma para revisarlas de una vez. Con PRUEBA=1 solo arma la hoja. La
// pantalla de la sala muestra el cursor, como en escritorio.

import { pixel3d } from '../pilotos/tres.mjs'
import { celdaDeToma, fila, pagina } from '../pilotos/tablero.mjs'
import { TOMAS_3D } from './tomas.mjs'
import { cielo } from '../escena1/lugares.mjs'
import { TOMAS } from '../../../src/lib/escena2.js'
import { mkdirSync, writeFileSync } from 'node:fs'

const [RAIZ, HOJA] = process.argv.slice(2)
const PRUEBA = Boolean(process.env.PRUEBA)

// Doce cuadros por toma, de 96 px y la franja del medio en 4:3, como en el juego.
const CUADROS = 12
const DURACION = 3.6
const N = 96
const ALTO = (N * 3) / 4
const TAM = 4
const ANIMACIONES = `.t12{animation:cuadro12 ${DURACION}s step-end infinite}
@keyframes cuadro12{0%{opacity:1}8.333%{opacity:0}100%{opacity:0}}`

const cuadro = (figura, [ojo, mira, campo]) =>
  pixel3d(figura, { ojo, mira, campo, cielo }, N, TAM, { c: [0, 0, 0], radio: 1 }).replace(`height="${N * TAM}" viewBox="0 0 ${N} ${N}"`, `height="${ALTO * TAM}" viewBox="0 ${(N - ALTO) / 2} ${N} ${ALTO}"`)

// Cada celda dice su toma y sus líneas, del guion del juego (src/lib/escena2.js).
const NOMBRES = {
  puerta: 'la puerta',
  medallas: 'las medallas',
  puro: 'el puro apagado',
  reflejo: 'el reflejo',
  duky: 'duky en brazos',
  reunion: 'la reunión',
  lagartijas: 'las lagartijas',
  sesion: 'la sesión de fotos',
  fotos: 'las fotos',
  autobiografias: 'las autobiografías',
  cuantas: '¿cuántas tienes?',
  ocho: 'como 8',
  palo: 'el palo',
  cautela: 'a la pantalla',
  situasion: 'la situasión',
  observa: 'observa',
  respuesta: 'una respuesta',
  proporcional: '¿proporcional?',
  casas: 'cuatro casas',
  objetivo: '¿contra uno solo?',
  desbentaja: 'la desbentaja',
  despegamos: '¿cuándo despegamos?',
  exposicion: 'la exposición',
  cuanto: '¿cuánto tiene?',
  diapositivas: 'cuarenta y siete',
  mirada: 'mira la pantalla',
  motores: 'calentando motores',
  levanta: 'se levanta',
  nadie: 'nadie se va',
  tos: 'el puro encendido',
  aportar: '¿algo que aportar?',
  inmovil: 'inmóvil',
  fantasma: 'el fantasma amarillo',
  expediente: 'el expediente',
  miran: 'todos miran',
  noot: 'dolly zoom',
  ese: '¿ese?',
  alarma: 'la alarma',
  carpeta: 'la carpeta',
  perfecto: 'perfecto',
  vino: 'él vino',
  plan: 'parte del plan',
  gira: 'se gira',
  puestos: 'a sus puestos',
  porfin: '¡por fin!',
  perfil: 'de perfil',
  solo: 'duky se queda',
  iniciada: 'operasión iniciada',
}
const dialogo = ({ lineas }) => lineas.map(({ quien, texto }) => (quien ? `${quien.toUpperCase()}: ${texto}` : `<i>${texto}</i>`)).join('<br>')

const hoja = []
const celda = (id) => {
  const numero = TOMAS.findIndex((t) => t.id === id)
  const toma = TOMAS[numero]
  const { escena, camara } = TOMAS_3D[id]
  const svgs = Array.from({ length: PRUEBA ? 1 : CUADROS }, (_, k) => {
    const u = k / CUADROS
    return cuadro(escena(u, 'cursor'), camara(u))
  })
  const quieto = PRUEBA ? 0 : toma.unaVez ? CUADROS - 1 : CUADROS / 2
  hoja.push(`<div style="background:#5c94fc">${svgs[quieto]}</div>`)
  return celdaDeToma(`${numero + 1} · ${NOMBRES[id]}`, svgs, 't12', DURACION, quieto, [N * TAM, ALTO * TAM], dialogo(toma))
}

const lamina = (archivo, datos) => {
  const html = pagina({ ...datos, animaciones: ANIMACIONES, alto: 360 + 480 * datos.filas.length })
  if (!PRUEBA) writeFileSync(`${RAIZ}/project/${archivo}.dc.html`, html)
}

if (!PRUEBA) mkdirSync(`${RAIZ}/project`, { recursive: true })

lamina('E2-tomas-llegada', {
  titulo: 'Escena 2 · la llegada',
  papel: 'Escena 2 · tomas 1 a 5',
  nombre: 'La llegada',
  bajada: 'El escuadrón Patoon-4 entra a la sala de mando',
  detalle: 'La misma sala de la escena 1, al atardecer, con una mesa baja al medio y cuatro sillones. La puerta doble del fondo se corre y entra la luz del pasillo: cuatro siluetas. Entran de a uno, cada uno en su toma y una sola vez: duck-one con el pecho tapizado de medallas, moby-duck de brazos cruzados y con el puro apagado, duke mirándose en el piso pulido, que lo refleja. A duky lo trae un marinero en brazos, sin ver por dónde va, y lo deja en su sillón.',
  filas: [fila('Por la puerta', ['puerta', 'medallas', 'puro'].map(celda), 3), fila('Los últimos', ['reflejo', 'duky'].map(celda), 3)],
})

lamina('E2-tomas-reunion', {
  titulo: 'Escena 2 · la reunión',
  papel: 'Escena 2 · tomas 6 a 12',
  nombre: 'La reunión',
  bajada: 'Lagartijas, una sesión de fotos y ocho autobiografías',
  detalle: 'El almirante abre la reunión desde la cabecera de la pantalla, que sigue mostrando al atacante (cursor en escritorio, huella en teléfono). Moby habla a los gritos y todavía no llora: el puro está apagado. Duke habla sin abrir los ojos. Sus fotos son instantáneas, con su marco blanco, y pasan una vez cada una: posa sobre su Hornet en la cubierta, como la aviadora de las fotos de antes, tendido en el morro y de cerca, con el sol detrás. duck-one dicta cátedra con el índice en alto. Cada uno habla en su toma.',
  filas: [fila('Caballeros', ['reunion', 'lagartijas', 'sesion'].map(celda), 3), fila('Las fotos', ['fotos', 'autobiografias'].map(celda), 3), fila('Como 8', ['cuantas', 'ocho'].map(celda), 3)],
})

lamina('E2-tomas-pantalla', {
  titulo: 'Escena 2 · la pantalla',
  papel: 'Escena 2 · tomas 13 a 21',
  nombre: 'La pantalla',
  bajada: 'Una situasión de complejidad geoestrategica',
  detalle: 'El almirante se arrima a la pantalla y señala al atacante con un palo de presentación. duck-one se levanta, bordea la mesa con las manos atrás, marcando autoridad, y se planta frente a la pantalla a analizarla. Después discute con el almirante, frente a frente, su respuesta proporcional, en plano y contraplano: cuatro cazas ¿Contra un solo objetivo? A cada uno se le mueve el pico solo en su toma.',
  filas: [fila('El atacante', ['palo', 'cautela', 'situasion'].map(celda), 3), fila('Proporcional', ['observa', 'respuesta', 'proporcional'].map(celda), 3), fila('Cuatro casas', ['casas', 'objetivo', 'desbentaja'].map(celda), 3)],
})

lamina('E2-tomas-puro', {
  titulo: 'Escena 2 · el puro',
  papel: 'Escena 2 · tomas 22 a 30',
  nombre: 'Cuarenta y siete diapositivas',
  bajada: 'moby-duck se impacienta, se levanta y enciende el puro',
  detalle: 'Moby se inclina sobre la mesa con los puños en el tablero. duck-one contesta con el índice en alto y con el pulgar arriba. Moby gira el sillón hacia la pantalla, se para apoyado en la mesa y duck-one lo apunta: nadie se va. Vuelve a sentarse y enciende el puro: la calada de la lámina v17, sentado. Hasta ahí no lloraba; ahora tose sin control y llora a chorros, y le quedan los ojos llorosos.',
  filas: [fila('La exposición', ['despegamos', 'exposicion', 'cuanto'].map(celda), 3), fila('Calentando motores', ['diapositivas', 'mirada', 'motores'].map(celda), 3), fila('Nadie se va', ['levanta', 'nadie', 'tos'].map(celda), 3)],
})

lamina('E2-tomas-fantasma', {
  titulo: 'Escena 2 · el fantasma amarillo',
  papel: 'Escena 2 · tomas 31 a 37',
  nombre: 'El fantasma amarillo',
  bajada: 'Ciento doce victorias confirmadas',
  detalle: 'Duky no se mueve. duck-one abre su expediente, con la foto de duky adentro, y lo lee en voz alta. Todos giran sus sillones hacia él a la vez. Dolly zoom: la cámara se acerca de 4,5 a 0,8 m mientras abre el campo, y la cara de duky no cambia de tamaño mientras el atardecer se abre detrás. Tiene la cara del meme de Pingu: el pico abierto de par en par, los ojos redondos con la pupila chiquita y una lágrima, y de vez en cuando le tiembla el párpado. Moby ya fuma el puro.',
  filas: [fila('Inmóvil', ['aportar', 'inmovil', 'fantasma'].map(celda), 3), fila('Noot noot', ['expediente', 'miran', 'noot'].map(celda), 3), fila('¿Ese?', ['ese'].map(celda), 3)],
})

lamina('E2-tomas-operacion', {
  titulo: 'Escena 2 · la operación',
  papel: 'Escena 2 · tomas 38 a 48',
  nombre: 'Operasión Bengansa',
  bajada: 'Objetivo avistado frente al portaaviones',
  detalle: 'Suena la alarma: la baliza gira y la sala se enciende de rojo a cada vuelta. duck-one cierra la carpeta: todo fue parte del plan, en plano y contraplano con el almirante. Se gira hacia el escuadrón y les señala sus puestos. Moby se para con el puño en alto y duke se habla a su espejo de mano. Se van todos por la puerta, cada uno por su lado de la mesa; duky se queda sentado, y le salen los tres puntos. El texto en pantalla va en la pantalla de la sala, en letras de cuadritos, con «INICIADA» parpadeando.',
  filas: [
    fila('La alarma', ['alarma', 'carpeta', 'perfecto'].map(celda), 3),
    fila('Parte del plan', ['vino', 'plan', 'gira'].map(celda), 3),
    fila('A sus puestos', ['puestos', 'porfin', 'perfil'].map(celda), 3),
    fila('Iniciada', ['solo', 'iniciada'].map(celda), 3),
  ],
})

writeFileSync(HOJA, `<html><body style="margin:0;background:#fff;display:flex;flex-wrap:wrap;gap:4px">${hoja.join('')}</body></html>`)
