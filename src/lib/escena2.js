/**
 * Operación Venganza, escena 2: «Patoon-4». El guion, con la forma del de la
 * escena 1 (lib/escena1.js), de donde salen también las medidas de las
 * tiras: `ms` por cuadro, `cuadros` si no son los de siempre, `unaVez` si la
 * tira corre una sola vez, `segunModo` si se ve la pantalla de la sala, que
 * muestra el cursor o la huella de quien juega (una tira por modo), y sus
 * líneas.
 *
 * Pasa en la misma sala de mando de la escena 1. duck-one escribe como habla:
 * sus faltas de ortografía son suyas y van tal cual. Las frases largas van en
 * dos líneas, para que cada una quepa en el alto fijo del subtítulo.
 *
 * Cada toma tiene a lo más quien hable, y solo a él se le mueve el pico: en
 * un diálogo, cada uno tiene su toma. Las acotaciones de quien calla, o de lo
 * que pasa, van en tomas donde nadie habla.
 */

const ALMIRANTE = 'Almirante'
const DUCK_ONE = 'Duck-One'
const MOBY = 'Moby-Duck'
const DUKE = 'Duke SkyDucker'
const TORRE = 'Torre de control'

export const TOMAS = [
  // La llegada del escuadrón: de a uno, por la puerta del fondo.
  {
    id: 'puerta',
    ms: 200,
    cuadros: 24,
    unaVez: true,
    lineas: [{ texto: 'Una puerta de la torre de comando se abre lentamente.' }, { texto: 'Cuatro siluetas aparecen a contraluz.' }],
  },
  { id: 'medallas', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Duck-One camina al frente con una cantidad absurda de medallas en el pecho.' }] },
  { id: 'puro', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Moby-Duck camina con los brazos cruzados y un puro apagado en la boca.' }] },
  { id: 'reflejo', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Duke SkyDucker avanza mirando su reflejo en el suelo pulido.' }] },
  { id: 'duky', ms: 150, cuadros: 24, unaVez: true, lineas: [{ texto: 'Duky es transportado por un marinero y colocado sobre una silla.' }] },

  // La reunión.
  { id: 'reunion', ms: 150, segunModo: true, lineas: [{ quien: ALMIRANTE, texto: 'Caballeros, gracias por asistir a esta reunión de extrema urgencia.' }] },
  { id: 'lagartijas', ms: 150, lineas: [{ quien: MOBY, texto: 'Estaba haciendo lagartijas a una sola mano.' }] },
  { id: 'sesion', ms: 150, lineas: [{ quien: DUKE, texto: 'A mí me interrumpieron una sesión fotográfica.' }] },
  // Las tres fotos, una tras otra, y a la toma siguiente.
  { id: 'fotos', ms: 1500, cuadros: 3, unaVez: true, lineas: [{ texto: 'Duke muestra las fotos de su sesión.' }] },
  {
    id: 'autobiografias',
    ms: 150,
    lineas: [
      { quien: DUCK_ONE, texto: 'Los sacrificios personales son una parte fundamental de la vida aeronabal.' },
      { quien: DUCK_ONE, texto: 'Deberían leer mis autobiografías.' },
    ],
  },
  { id: 'cuantas', ms: 150, lineas: [{ quien: MOBY, texto: '¿Cuántas autobiografías tienes?' }] },
  { id: 'ocho', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Como 8.' }] },

  // La pantalla.
  { id: 'palo', ms: 150, segunModo: true, lineas: [{ texto: 'El Almirante señala la pantalla con un palo de presentación.' }] },
  // De la cabecera a la pantalla, despacio: lleva más cuadros para que los pasos se lean.
  {
    id: 'cautela',
    ms: 150,
    cuadros: 40,
    unaVez: true,
    lineas: [{ texto: 'Duck-One se acerca y mira cautelosamente con los brazos atrás de la espalda, marcando autoridad.' }],
  },
  {
    id: 'situasion',
    ms: 150,
    segunModo: true,
    lineas: [
      { quien: DUCK_ONE, texto: 'Al parecer nos encontramos ante una situasión' },
      { quien: DUCK_ONE, texto: 'de una complejidad geoestrategica sin presedentes.' },
      { quien: DUCK_ONE, texto: 'Nuestro hadbersario a anikilado a quince patos inocentes' },
      { quien: DUCK_ONE, texto: 'y a demostrado una alarmante carencia de escrúpulos.' },
    ],
  },
  { id: 'observa', ms: 150, segunModo: true, lineas: [{ texto: 'Duck-One observa la pantalla táctica durante varios segundos.' }] },
  { id: 'respuesta', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Por suerte, ya e preparado una respuesta proporcional.' }] },
  { id: 'proporcional', ms: 150, segunModo: true, lineas: [{ quien: ALMIRANTE, texto: '¿Proporcional?' }] },
  { id: 'casas', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Vamos a enviar cuatro casas separados.' }] },
  { id: 'objetivo', ms: 150, lineas: [{ quien: ALMIRANTE, texto: '¿Contra un solo objetivo?' }] },
  { id: 'desbentaja', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Exacto. No podemos arriesgarnos a quedar en desbentaja numérica.' }] },

  // Moby y el puro.
  {
    id: 'despegamos',
    ms: 150,
    lineas: [{ texto: 'Moby-Duck se inclina sobre la mesa.' }, { quien: MOBY, texto: '¿Cuándo despegamos?' }],
  },
  { id: 'exposicion', ms: 150, segunModo: true, lineas: [{ quien: DUCK_ONE, texto: 'Cuando termine la exposición que preparé.' }] },
  { id: 'cuanto', ms: 150, lineas: [{ quien: MOBY, texto: '¿Cuánto tiene?' }] },
  { id: 'diapositivas', ms: 150, segunModo: true, lineas: [{ quien: DUCK_ONE, texto: 'Cuarenta y siete diapositivas.' }] },
  { id: 'mirada', ms: 150, segunModo: true, lineas: [{ texto: 'Moby se queda mirando la pantalla.' }] },
  { id: 'motores', ms: 150, lineas: [{ quien: MOBY, texto: 'Voy calentando motores.' }] },
  { id: 'levanta', ms: 150, unaVez: true, lineas: [{ texto: 'Se levanta.' }] },
  { id: 'nadie', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Nadie se va asta que yo lo diga.' }] },
  {
    id: 'tos',
    ms: 150,
    cuadros: 24,
    unaVez: true,
    lineas: [{ texto: 'Moby vuelve a sentarse.' }, { texto: 'Enciende un puro y empieza a toser descontroladamente, con los ojos llorosos.' }],
  },

  // El fantasma amarillo.
  { id: 'aportar', ms: 150, segunModo: true, lineas: [{ quien: DUCK_ONE, texto: 'Soldado Duky, ¿algo que aportar?' }] },
  { id: 'inmovil', ms: 150, lineas: [{ texto: 'Duky permanece completamente inmóvil.' }] },
  { id: 'fantasma', ms: 150, lineas: [{ quien: ALMIRANTE, texto: 'No le hable al fantasma amarillo.' }] },
  // Lo lee en voz alta.
  {
    id: 'expediente',
    ms: 150,
    segunModo: true,
    lineas: [{ texto: 'Asombrado, Duck-One revisa brevemente su expediente.' }, { quien: DUCK_ONE, texto: 'Ciento doce victorias confirmadas…' }],
  },
  // Giran todos en sus sillas, a la vez.
  { id: 'miran', ms: 150, unaVez: true, lineas: [{ texto: 'Todos miran a Duky.' }] },
  // Dolly zoom: la cámara se acerca mientras abre el campo, y la cara no cambia de tamaño.
  { id: 'noot', ms: 150, cuadros: 40, unaVez: true, lineas: [{ texto: 'Duky sigue inmóvil.' }, { texto: 'Le tiembla un párpado.' }] },
  { id: 'ese', ms: 150, lineas: [{ quien: MOBY, texto: '¿Ese?' }] },

  // La alarma. La torre habla por los parlantes.
  {
    id: 'alarma',
    ms: 150,
    segunModo: true,
    lineas: [{ texto: 'Suena una alarma.' }, { quien: TORRE, texto: '¡Objetivo avistado frente al portaaviones!' }],
  },
  { id: 'carpeta', ms: 150, unaVez: true, lineas: [{ texto: 'Duck-One cierra la carpeta inmediatamente.' }] },
  { id: 'perfecto', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Perfecto. Justo donde lo planeamos.' }] },
  { id: 'vino', ms: 150, lineas: [{ quien: ALMIRANTE, texto: 'Él vino hacia nosotros.' }] },
  { id: 'plan', ms: 150, lineas: [{ quien: DUCK_ONE, texto: 'Parte del plan.' }] },
  { id: 'gira', ms: 150, unaVez: true, segunModo: true, lineas: [{ texto: 'Duck-One se gira hacia el escuadrón.' }] },
  {
    id: 'puestos',
    ms: 150,
    cuadros: 24,
    segunModo: true,
    lineas: [
      { quien: DUCK_ONE, texto: 'Muy bien. Escuadrón Patoon-4, ¡a sus puestos!' },
      { quien: DUCK_ONE, texto: 'Iniciaremos la Operasión Bengansa.' },
    ],
  },
  { id: 'porfin', ms: 150, lineas: [{ quien: MOBY, texto: '¡POR FIN!' }] },
  { id: 'perfil', ms: 150, lineas: [{ quien: DUKE, texto: 'Espero que el sol esté de nuestro perfil.' }] },
  {
    id: 'solo',
    ms: 150,
    cuadros: 40,
    unaVez: true,
    lineas: [{ texto: 'Todos se van, excepto Duky, que se queda sentado sin hacer nada.' }],
  },
  // El texto en pantalla va en la pantalla de la sala, y también en el subtítulo.
  { id: 'iniciada', ms: 300, lineas: [{ texto: 'OPERASIÓN BENGANZA — INICIADA.' }] },
]

export const rutaDeToma = ({ id, segunModo }, modo) => `/operacion-venganza/escena2/${id}${segunModo ? `-${modo}` : ''}.png`
