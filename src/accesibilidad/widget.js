/**
 * Widget de accesibilidad — portable entre proyectos de la marca.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │ CÓMO SE LLEVA A OTRO PROYECTO                                             │
 * │                                                                           │
 * │ 1. Copia esta carpeta entera (`widget.js`, `widget.css`, `preflight.js`). │
 * │ 2. Importa el CSS y llama a `montarAccesibilidad()` una vez.              │
 * │ 3. Pega el contenido de `preflight.js` en un <script> dentro del <head>,  │
 * │    antes de los estilos. Sin eso la página parpadea: se pinta en claro y  │
 * │    salta a oscuro cuando arranca el JavaScript.                           │
 * │ 4. En tu CSS, haz que los tamaños de texto se multipliquen por            │
 * │    `var(--escala, 1)` y define qué significan `[data-tema]` claro y       │
 * │    oscuro. El widget no impone paleta: solo mueve tres atributos.         │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * **Qué hace y qué no.** Mueve tres atributos sobre `<html>` y los recuerda:
 * `--escala` (tamaño del texto), `data-tema` y `data-movimiento`. No sabe nada
 * de colores, tipografías ni de la marca — eso lo decide el CSS de cada
 * proyecto. Por eso es portable: no hay nada de Volutus aquí dentro.
 *
 * **Por qué no usa un modal.** Un `role="dialog"` obliga a atrapar el foco, a
 * devolverlo al cerrar y a gestionar el fondo inerte, y a cambio no aporta
 * nada: esto es un panel de ajustes, no una interrupción. Se resuelve como un
 * *disclosure* —botón con `aria-expanded` más una región— que es el patrón más
 * simple que funciona bien con lector de pantalla y con teclado.
 *
 * **Por qué los controles son `<input type="radio">` de verdad.** Un grupo de
 * botones con `aria-checked` exige reimplementar a mano las flechas, el
 * recorrido y el anuncio. Los radios nativos ya traen todo eso, y en un widget
 * cuyo único propósito es la accesibilidad, reimplementar semántica nativa
 * sería exactamente el error que viene a corregir.
 */

import './widget.css'

// Tres pasos y no un deslizador continuo: quien necesita el texto más grande no
// necesita elegir entre 47 valores, necesita acertar al primer toque. El tope
// es 1.5 porque por encima la portada deja de caber en un móvil de 360 px.
const ESCALAS = [
  { valor: '1', etiqueta: 'Normal' },
  { valor: '1.25', etiqueta: 'Grande' },
  { valor: '1.5', etiqueta: 'Enorme' },
]

const TEMAS = [
  { valor: 'auto', etiqueta: 'Automático' },
  { valor: 'claro', etiqueta: 'Claro' },
  { valor: 'oscuro', etiqueta: 'Oscuro' },
]

const MOVIMIENTOS = [
  { valor: 'normal', etiqueta: 'Normal' },
  { valor: 'reducido', etiqueta: 'Reducido' },
]

// Una sola clave, con prefijo, para no chocar con lo que guarde el proyecto que
// aloje el widget.
const CLAVE = 'a11y-preferencias'

const POR_DEFECTO = { escala: '1', tema: 'auto', movimiento: 'normal' }

function leer() {
  try {
    return { ...POR_DEFECTO, ...JSON.parse(localStorage.getItem(CLAVE) ?? '{}') }
  } catch {
    // localStorage puede lanzar, no solo devolver vacío: en modo privado de
    // algunos navegadores y con las cookies bloqueadas, leerlo es una excepción.
    // El widget tiene que seguir funcionando sin memoria, no caerse.
    return { ...POR_DEFECTO }
  }
}

function guardar(preferencias) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(preferencias))
  } catch {
    // Sin memoria entre visitas, pero la sesión actual funciona igual.
  }
}

/**
 * Vuelca las preferencias sobre <html>.
 *
 * Es la única función que toca el documento, y la comparte `preflight.js`: si
 * cambia lo que significa una preferencia, cambia en un solo sitio.
 */
export function aplicar({ escala, tema, movimiento }) {
  const raiz = document.documentElement
  raiz.style.setProperty('--escala', escala)

  // `auto` no pone atributo: deja que mande el diseño del sitio, que es lo
  // correcto por defecto. Un atributo vacío obligaría a filtrarlo en el CSS.
  if (tema === 'auto') raiz.removeAttribute('data-tema')
  else raiz.setAttribute('data-tema', tema)

  if (movimiento === 'normal') raiz.removeAttribute('data-movimiento')
  else raiz.setAttribute('data-movimiento', movimiento)
}

function grupo(nombre, leyenda, opciones, seleccionado) {
  const campos = opciones
    .map(
      ({ valor, etiqueta }) => `
      <label class="a11y-opcion">
        <input type="radio" name="a11y-${nombre}" value="${valor}"${
          valor === seleccionado ? ' checked' : ''
        }>
        <span>${etiqueta}</span>
      </label>`
    )
    .join('')

  return `<fieldset class="a11y-grupo">
    <legend>${leyenda}</legend>
    <div class="a11y-opciones">${campos}</div>
  </fieldset>`
}

export function montarAccesibilidad() {
  if (document.querySelector('.a11y')) return

  const preferencias = leer()
  aplicar(preferencias)

  const raiz = document.createElement('div')
  raiz.className = 'a11y'
  raiz.innerHTML = `
    <button class="a11y-boton" type="button" aria-expanded="false" aria-controls="a11y-panel">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none"/>
        <path d="M4 8.5h16M12 8.5v5.5M12 14l-3.2 6M12 14l3.2 6"/>
      </svg>
      <span class="a11y-solo-lectores">Opciones de accesibilidad</span>
    </button>

    <div class="a11y-panel" id="a11y-panel" hidden>
      <h2 class="a11y-titulo">Accesibilidad</h2>
      ${grupo('escala', 'Tamaño del texto', ESCALAS, preferencias.escala)}
      ${grupo('tema', 'Tema', TEMAS, preferencias.tema)}
      ${grupo('movimiento', 'Movimiento', MOVIMIENTOS, preferencias.movimiento)}
      <button class="a11y-restablecer" type="button">Restablecer</button>
    </div>`

  document.body.append(raiz)

  const boton = raiz.querySelector('.a11y-boton')
  const panel = raiz.querySelector('.a11y-panel')

  function abrir(abierto) {
    boton.setAttribute('aria-expanded', String(abierto))
    panel.hidden = !abierto
  }

  boton.addEventListener('click', () => {
    abrir(panel.hidden)
  })

  raiz.addEventListener('change', (evento) => {
    const campo = evento.target
    if (campo.type !== 'radio') return

    preferencias[campo.name.replace('a11y-', '')] = campo.value
    aplicar(preferencias)
    guardar(preferencias)
  })

  raiz.querySelector('.a11y-restablecer').addEventListener('click', () => {
    Object.assign(preferencias, POR_DEFECTO)
    aplicar(preferencias)
    guardar(preferencias)
    raiz.querySelectorAll('input[type=radio]').forEach((campo) => {
      campo.checked = POR_DEFECTO[campo.name.replace('a11y-', '')] === campo.value
    })
  })

  // Escape cierra y devuelve el foco al botón. Sin lo segundo, quien cierra con
  // el teclado se queda con el foco en un panel que ya no está.
  raiz.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape' || panel.hidden) return
    abrir(false)
    boton.focus()
  })

  // Clic fuera. No se devuelve el foco aquí: si alguien cerró tocando otra
  // parte de la página, moverle el foco al botón sería arrastrarlo de vuelta.
  document.addEventListener('click', (evento) => {
    if (!panel.hidden && !raiz.contains(evento.target)) abrir(false)
  })
}
