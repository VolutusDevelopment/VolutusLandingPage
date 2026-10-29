/**
 * Operación Venganza, escena 10: «La última opción». El guion que reproduce
 * src/operacion-venganza.js en /operacion-venganza/escena-10, con la forma del
 * de la escena 1 (lib/escena1.js), de donde salen también las medidas de las
 * tiras: `ms` por cuadro, `cuadros` si no son los de siempre, `unaVez` si la
 * tira corre una sola vez, y sus líneas. Las tiras las escribe
 * scripts/operacion-venganza/escena10/sprites.mjs, desde las tomas en 3D.
 *
 * Pasa en la sala de mando de la escena 2. duck-one escribe como habla: sus
 * faltas de ortografía son suyas y van tal cual. Cada toma tiene a lo más
 * quien hable, y solo a él se le mueve el pico.
 */

const DUCK_ONE = 'Duck-One'
const MOBY = 'Moby-Duck'
const DUKE = 'Duke SkyDucker'

export const TOMAS = [
  { id: 'espera', ms: 150, lineas: [{ texto: 'En la sala de mando, Duck-One espera con una carpeta.' }] },
  { id: 'furioso', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Moby-Duck entra furioso.' }] },
  { id: 'reflejo', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Duke SkyDucker entra mirando su reflejo.' }] },
  {
    id: 'evaluasion',
    ms: 150,
    lineas: [
      { quien: DUCK_ONE, texto: 'Caballeros, tras una exaustiba evaluasión de los resultados,' },
      { quien: DUCK_ONE, texto: 'e determinado que la situación requiere la aplicación de una medida extraordinal.' },
    ],
  },
  { id: 'maldita', ms: 150, lineas: [{ quien: MOBY, texto: '¡MALDITA SEA!' }] },
  {
    id: 'tos',
    ms: 150,
    cuadros: 24,
    unaVez: true,
    lineas: [{ texto: 'Moby intenta fumar un puro, pero vuelve a toser descontroladamente.' }, { texto: 'Se le llenan los ojos de lágrimas.' }],
  },
  { id: 'indicador', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Eso es un indicador de rendimiento, no una conclusión definitiva.' }] },
  // Agitando la cabellera.
  { id: 'pintura', ms: 150, lineas: [{ quien: DUKE, texto: 'Mi avión necesita pintura nueva.' }] },
  { id: 'perfecto', ms: 150, lineas: [{ quien: MOBY, texto: '¡TU AVIÓN ESTÁ PERFECTO!' }] },
  { id: 'sigue', ms: 150, lineas: [{ texto: 'Moby sigue tosiendo.' }] },
  { id: 'reparar', ms: 150, lineas: [{ quien: DUKE, texto: 'Entonces no debería ser difícil repararlo.' }] },
  { id: 'mirada', ms: 150, lineas: [{ texto: 'Duke mira fijamente a la cámara, con sus ojos muy azules.' }] },
  { id: 'recurso', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Ha llegado el momento de recurrir a nuestro último recurso.' }] },
  { id: 'nuclear', ms: 150, lineas: [{ quien: MOBY, texto: '¿Bomba nuclear?' }] },
  { id: 'especializado', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Algo mucho más especializado.' }] },
  { id: 'guapo', ms: 150, lineas: [{ quien: DUKE, texto: '¿Un piloto extranjero y guapo?' }] },
  { id: 'chiyar', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Un piloto que no necesita chiyar para cumplir sus objetivos.' }] },
  // Giran todos en sus sillones, a la vez.
  { id: 'miran', ms: 150, unaVez: true, lineas: [{ texto: 'Los tres miran a Duky.' }] },
  { id: 'enserio', ms: 150, lineas: [{ quien: MOBY, texto: 'No puede ser en serio.' }] },
  {
    id: 'eficacia',
    ms: 150,
    lineas: [
      { quien: DUCK_ONE, texto: 'La eficacia militar a veces, exige decisiones que, en ocasiones,' },
      { quien: DUCK_ONE, texto: 'exseden los límites de la comprensión internacional.' },
    ],
  },
  // El dolly de la escena 2, más brusco.
  { id: 'noot', ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: 'La cámara se lanza otra vez sobre Duky.' }, { texto: 'Le tiembla el párpado, y ahora también el cuerpo.' }] },
]

export const rutaDeToma = ({ id }) => `/operacion-venganza/escena10/${id}.png`
