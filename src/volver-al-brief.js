// «¿Quieres volver?». Quien deja el brief (paginas/Brief.jsx) sin enviarlo por
// otra página del sitio encuentra abajo un aviso que lo lleva a la parte en
// que quedó. Sale una vez por salida: brief.js marca la pestaña al irse y aquí
// se consume, así que no persigue a nadie de página en página.
//
// Se arma aquí y no viene en el HTML: el brief solo se enlaza desde la página
// de desarrollo web (lib/meta.js), y un enlace escondido en cada página se lo
// mostraría a los buscadores y a los agentes. Los textos son fijos; de lo guardado solo se
// toma el paso, y solo si tiene la forma de uno.

import { almacen, sesion } from './lib/almacen.js'
import { CLAVE_BRIEF, CLAVE_VISITA } from './lib/brief/reglas.js'

const PANTALLA = /^(paso-\d{1,2}|revisar)$/

const AVISO = `
  <p class="volver-brief-titulo" id="volver-brief-titulo">¿Quieres volver al brief?</p>
  <p class="volver-brief-texto">Tus respuestas siguen guardadas en este equipo.</p>
  <a class="volver-brief-ir">Volver al brief <span aria-hidden="true">→</span></a>
  <button class="boton-cuadro volver-brief-cerrar" type="button" aria-label="Cerrar aviso">
    <span aria-hidden="true">✕</span>
  </button>`

export default function initVolverAlBrief() {
  if (document.querySelector('.brief') || sesion.leer(CLAVE_VISITA) !== 'dejado') return
  sesion.escribir(CLAVE_VISITA, 'ofrecido')

  // Sin respuestas guardadas (lo envió, o solo miró) no hay a qué volver.
  let paso
  try {
    paso = JSON.parse(almacen.leer(CLAVE_BRIEF))?.paso
  } catch {
    return
  }
  if (paso === undefined) return

  const aviso = document.createElement('aside')
  aviso.className = 'volver-brief'
  aviso.setAttribute('aria-labelledby', 'volver-brief-titulo')
  aviso.innerHTML = AVISO
  aviso.querySelector('a').href = PANTALLA.test(paso) ? `/brief-web#${paso}` : '/brief-web'
  aviso.querySelector('button').addEventListener('click', () => aviso.remove())

  // Después del enlace de salto, que sigue siendo lo primero al tabular.
  const salto = document.querySelector('.salto')
  if (salto) salto.after(aviso)
  else document.body.prepend(aviso)
}
