// Las hojas de los cazas del combate (src/combate.js): cada caza visto desde
// `GIROS` giros a su alrededor (de 15° en 15°, desde el frente) y desde las
// `ALTURAS` de cámara (negativa = desde abajo), una fila por altura, en
// cuadros de `LADO` px. Todos con el mismo encuadre de `RADIO` m, para que
// guarden su tamaño entre sí, y con las llamas de los motores. Las pinta
// scripts/operacion-venganza/combate/sprites.mjs.

export const LADO = 56
export const GIROS = 24
export const ALTURAS = [-60, -30, 0, 30, 60]
export const RADIO = 12.4
export const LLENADO = 0.94

export const rutaDeCaza = (nombre) => `/operacion-venganza/combate/${nombre}.png`

// Las pasadas de /patos (src/patos.js): los mismos cazas de perfil, un poco
// desde abajo, a `pixelesPorMetro`, uno por fila en el orden de `PASADAS`, con
// la llama de los motores estirada a los largos de `LLAMAS`, uno por columna.
// Los pinta scripts/operacion-venganza/combate/pasadas.mjs.
export const PASADAS = ['duck-one', 'moby', 'duke', 'duky']
export const PASADA = { pixelesPorMetro: 4, altura: -20 }
export const LLAMAS = [1.25, 1.1, 1.4]
export const rutaDePasadas = '/operacion-venganza/pasadas.png'

// Los retratos del cuadro de comunicaciones: quien habla en los niveles, una
// fila por cada uno en este orden, con `CUADROS_DE_RETRATO` cuadros de
// `LADO_DE_RETRATO` px hablando (el primero, callado). Los pinta
// scripts/operacion-venganza/combate/retratos.mjs.
export const RETRATOS = [
  { quien: 'Duck-One', retrato: 'duck-one' },
  { quien: 'Moby-Duck', retrato: 'moby' },
  { quien: 'Duke SkyDucker', retrato: 'duke' },
  { quien: 'Duky', retrato: 'duky' },
  { quien: 'Torre de control', retrato: 'torre' },
]
export const LADO_DE_RETRATO = 48
export const CUADROS_DE_RETRATO = 12
export const rutaDeRetratos = '/operacion-venganza/combate/retratos.png'
