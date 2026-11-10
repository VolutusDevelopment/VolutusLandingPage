/**
 * Las reglas del brief para clientes (/brief): los límites de cada campo, sus
 * nombres y lo que significa cada punto de una escala. Lo usan la página
 * (paginas/Brief.jsx), su script (brief.js) y el Worker (worker/brief.js), que
 * vuelve a aplicar las reglas porque el endpoint es público. Una sola copia,
 * para que el `maxLength` del campo y el recorte del servidor nunca difieran.
 *
 * Los nombres de campo salen de aquí y no se escriben a mano en otro lado: la
 * página los usa para dibujar y el Worker para leer, y si difirieran, una
 * respuesta se perdería sin aviso.
 */

import { LIMITES } from '../contacto.js'

// Una opción de una pregunta: su valor (lo que se envía), su nombre y, si hace
// falta, la línea que la explica.
export const o = (v, l, d) => ({ v, l, d })

export const LIMITES_BRIEF = {
  nombre: LIMITES.nombre,
  correo: LIMITES.correo,
  telefono: 20,
  texto: 200,
  parrafo: 2000,
  celda: 200,
  color: 40,
  nota: 200,
}

// Dígitos, espacios, guiones y paréntesis, con un «+» delante si es
// internacional: +56 9 1234 5678.
export const TELEFONO_VALIDO = /^\+?[\d\s()-]{8,20}$/

// La acción que el widget de Turnstile sella en su token y el Worker exige de
// vuelta: un token del formulario de contacto no sirve para el brief.
export const TURNSTILE_ACCION_BRIEF = 'brief'

// Menos que esto entre abrir la página y enviar no lo hace una persona: el
// Worker descarta el envío en silencio, como el de la trampa.
export const TIEMPO_MINIMO = 8000

// Los puntos de una escala: 1 es el extremo izquierdo; 3, equilibrado.
export const ESCALA = [1, 2, 3, 4, 5]

// Lo que dice cada punto de una escala, en palabras: lo lee el lector de
// pantalla, lo repite el resumen y va en el correo.
export const textoDeEscala = (n, [izquierda], [derecha]) =>
  ({
    1: izquierda,
    2: `Algo ${izquierda.toLowerCase()}`,
    3: 'Equilibrado',
    4: `Algo ${derecha.toLowerCase()}`,
    5: derecha,
  })[n]

// Los avisos de los campos obligatorios, cortos como los del contacto.
export const ERRORES_BRIEF = {
  nombre: 'Falta tu nombre.',
  nombreInvalido: 'Usa solo letras.',
  contacto: 'Déjanos un correo o un WhatsApp.',
  correoInvalido: 'Revisa tu correo.',
  telefonoInvalido: 'Revisa el número.',
}

// ---- Los nombres de campo ----

// El texto libre de «Otro: ___» de una pregunta de opciones.
export const campoOtro = (id) => `${id}_otro`

// Las estrellas de «imprescindible» de una pregunta con `estrella`.
export const campoEstrella = (id) => `${id}_imprescindible`

// Lo que el cliente dice de un boceto (bocetos.js): su reacción y su nota.
export const campoBoceto = (slug) => `boceto_${slug}`
export const campoNotaBoceto = (slug) => `boceto_${slug}_nota`

// Las reacciones a un boceto, con lo que significan en palabras.
export const REACCIONES = [
  ['si', 'Me gusta', '♥'],
  ['medio', 'Más o menos', '~'],
  ['no', 'No me gusta', '✕'],
]

// Donde quedan las calificaciones de los bocetos en el navegador. Las escriben
// el brief (brief.js) y cada boceto (public/brief/bocetos/barra.js, que repite
// el nombre: es un archivo suelto y no importa este módulo). Va aparte de las
// respuestas para que el brief, al guardar, no pise lo que se marcó en otra
// pestaña.
export const CLAVE_BOCETOS = 'volutus:brief:bocetos'

// Una celda de una tabla: la fila empieza en 1.
export const campoCelda = (id, fila, columna) => `${id}_${fila}_${columna}`

// Uno de los colores de una pregunta `colores`: empieza en 1.
export const campoColor = (id, n) => `${id}_${n}`

// Todas las preguntas de una lista, con las de las columnas y las del mockup
// sacadas de su grupo y en su orden.
export const aplanar = (preguntas) =>
  preguntas.flatMap((pregunta) =>
    pregunta.tipo === 'columnas' ? pregunta.columnas.flatMap((columna) => aplanar(columna.preguntas)) : pregunta.tipo === 'mockup' ? pregunta.preguntas : [pregunta]
  )

// Las preguntas que se responden (no los consejos ni las comparaciones).
export const respondibles = (parte) => aplanar(parte.preguntas).filter((pregunta) => pregunta.id)
