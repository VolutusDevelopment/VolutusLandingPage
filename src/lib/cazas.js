// Las hojas de los cazas del combate (src/combate.js): cada caza visto desde
// `GIROS` giros a su alrededor (de 15° en 15°, desde el frente) y desde las
// `ALTURAS` de cámara (negativa = desde abajo), una fila por altura, en
// cuadros de `LADO` px. Todos con el mismo encuadre de `RADIO` m, para que
// guarden su tamaño entre sí, y con las llamas de los motores. Las pinta
// scripts/operacion-venganza/combate/sprites.mjs.

export const LADO = 56
export const GIROS = 24
export const ALTURAS = [-60, -30, 0, 30, 60]
export const RADIO = 11.5
export const LLENADO = 0.94

export const rutaDeCaza = (nombre) => `/operacion-venganza/combate/${nombre}.png`
