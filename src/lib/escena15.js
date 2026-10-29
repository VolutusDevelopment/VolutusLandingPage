/**
 * Operación Venganza, escena 15: «El regreso del fantasma». El guion que
 * reproduce src/operacion-venganza.js en /operacion-venganza/escena-15, con la
 * forma del de la escena 1 (lib/escena1.js), de donde salen también las
 * medidas de las tiras: `ms` por cuadro, `cuadros` si no son los de siempre,
 * `unaVez` si la tira corre una sola vez, y sus líneas. Las tiras las escribe
 * scripts/operacion-venganza/escena15/sprites.mjs, desde las tomas en 3D.
 *
 * Duky vuelve al Sitting Ducks y el escuadrón mira con él el atardecer, donde
 * sigue quien juega: esas tomas van `segunModo`, y la línea que lo nombra dice
 * cursor o dedo. Después, la caja, el almirante y los dos marineros.
 */

const ALMIRANTE = 'Almirante'
const MARINERO_1 = 'Marinero 1'
const MARINERO_2 = 'Marinero 2'

// Una línea que nombra a quien juega: `el` cursor o dedo, en `frase`.
const segunQuien = (frase) => ({ cursor: frase('cursor'), huella: frase('dedo') })

export const TOMAS = [
  // En la cubierta, al atardecer.
  { id: 'aterriza', ms: 150, cuadros: 32, unaVez: true, lineas: [{ texto: 'El caza de Duky aterriza en el Sitting Ducks.' }] },
  { id: 'saca', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Un marinero sube y saca a Duky de la cabina.' }] },
  { id: 'cubierta', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Lo lleva en brazos por la cubierta…' }] },
  { id: 'borde', ms: 150, cuadros: 32, unaVez: true, lineas: [{ texto: '…y lo deja en el borde, mirando al atardecer.' }] },
  { id: 'lejos', segunModo: true, ms: 200, lineas: [{ texto: segunQuien((el) => `A lo lejos, sobre el mar, sigue el ${el}.`) }] },
  { id: 'acercan', ms: 150, cuadros: 32, unaVez: true, lineas: [{ texto: 'Duck-One, Moby y Duke se acercan.' }] },
  { id: 'atardecer', segunModo: true, ms: 200, lineas: [{ texto: 'El escuadrón Patoon-4, junto, mira el atardecer.' }] },
  { id: 'manos', segunModo: true, ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Los cuatro, en línea, se toman de las manos.' }] },
  { id: 'bonito', ms: 200, lineas: [{ texto: 'Es una escena muy bonita.' }] },

  // La caja.
  { id: 'recoge', ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: 'Llega un marinero y recoge a Duky.' }] },
  { id: 'caja', ms: 150, cuadros: 32, unaVez: true, lineas: [{ texto: 'Lo deja en una caja de madera…' }] },
  {
    id: 'cinta',
    ms: 150,
    cuadros: 41,
    unaVez: true,
    lineas: [{ texto: '…la sella con cinta de peligro, amarilla y negra…' }, { texto: '…y le pega un gran sticker rojo: «CLASIFICADO».' }],
  },
  { id: 'almirante', ms: 150, cuadros: 32, unaVez: true, lineas: [{ texto: 'El Almirante se acerca a la caja.' }] },
  { id: 'destino', ms: 150, lineas: [{ quien: MARINERO_1, texto: '¿Cuál es el destino?' }] },
  { id: 'myanmar', ms: 150, lineas: [{ quien: ALMIRANTE, texto: 'Myanmar.' }] },
  { id: 'porque', ms: 150, lineas: [{ quien: MARINERO_2, texto: '¿Por qué Myanmar?' }] },
  { id: 'clasificada', ms: 150, lineas: [{ quien: ALMIRANTE, texto: 'Eso es información clasificada, Cabo.' }] },
  { id: 'proteccion', ms: 150, lineas: [{ quien: MARINERO_1, texto: '¿Y por qué tanta protección para el Amarillento?' }] },

  // El miedo.
  { id: 'patea', ms: 150, cuadros: 28, unaVez: true, lineas: [{ texto: 'El primer marinero patea la caja, para asegurarse de que esté bien protegida.' }] },
  { id: 'tiembla', ms: 100, cuadros: 24, lineas: [{ texto: 'El segundo marinero mira la caja y niega con la cabeza, tembloroso.' }] },
  { id: 'corre', ms: 150, cuadros: 32, unaVez: true, lineas: [{ texto: 'Sale corriendo y, del miedo, se cae por la borda.' }] },
  {
    id: 'flota',
    ms: 200,
    cuadros: 40,
    unaVez: true,
    lineas: [{ texto: 'Flota de espaldas en el mar, tranquilo…' }, { texto: '…cada vez más lejos del fantasma amarillo.' }],
  },
]

export const rutaDeToma = ({ id, segunModo }, modo) => `/operacion-venganza/escena15/${id}${segunModo ? `-${modo}` : ''}.png`
