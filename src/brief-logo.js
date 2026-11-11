// El logo en el brief (paginas/Brief.jsx, «Cómo se ve»):
//
// - las muestras de cada tipo de logo (MuestraBrief.jsx) se dibujan con el
//   nombre del negocio que se escribió en la primera parte, y con sus
//   iniciales donde van; sin nombre, «Tu marca»;
// - el logo propio que se sube (`logo_archivo`): se revisa su peso y su
//   formato por sus bytes (las mismas reglas que aplica el Worker), se muestra
//   y se puede quitar. Lo que no pasa se borra del campo y se dice por qué.
//
// El archivo no se guarda en el equipo con las demás respuestas: el estado lo
// avisa mientras no hay archivo.

import { ARCHIVO_BRIEF, SVG_CON_CODIGO, peso, tipoDeArchivo } from './lib/brief/reglas.js'

const SIN_NOMBRE = 'Tu marca'

// Las iniciales de un nombre: la primera letra de sus dos primeras palabras
// (o las dos primeras de una sola palabra).
function iniciales(nombre) {
  const palabras = nombre.split(/\s+/).filter(Boolean)
  const letras = palabras.length > 1 ? palabras[0][0] + palabras[1][0] : palabras[0].slice(0, 2)
  return letras.toUpperCase()
}

function montarNombre(form) {
  const empresa = form.elements.namedItem('empresa')
  const muestras = form.querySelector('.brief-muestras-logo')
  if (!empresa || !muestras) return

  const escribir = () => {
    const nombre = empresa.value.trim().replace(/\s+/g, ' ').slice(0, 28) || SIN_NOMBRE
    const [inicial, ...resto] = nombre
    muestras.style.setProperty('--largo', Math.max(6, nombre.length))
    muestras.querySelectorAll('[data-nombre-marca]').forEach((nodo) => (nodo.textContent = nombre))
    muestras.querySelectorAll('[data-iniciales]').forEach((nodo) => (nodo.textContent = iniciales(nombre)))
    muestras.querySelectorAll('[data-inicial]').forEach((nodo) => (nodo.textContent = inicial.toUpperCase()))
    muestras.querySelectorAll('[data-resto]').forEach((nodo) => (nodo.textContent = resto.join('')))
  }
  empresa.addEventListener('input', escribir)
  form.addEventListener('reset', () => setTimeout(escribir))
  escribir()
}

const ERRORES = {
  peso: (bytes) => `Pesa ${peso(bytes)}: el máximo es 5 MB. Prueba con una versión más liviana.`,
  formato: 'No reconocemos ese formato. Súbelo en SVG, PDF, AI, EPS, PNG, JPG o WEBP.',
  codigo: 'Ese SVG trae código y no lo podemos recibir. Súbelo en PDF o PNG.',
}

// Lo que impide recibir un archivo, o nada si se puede.
async function problemaDe(archivo) {
  if (archivo.size > ARCHIVO_BRIEF.tope) return { error: ERRORES.peso(archivo.size) }
  const tipo = tipoDeArchivo(new Uint8Array(await archivo.slice(0, 1024).arrayBuffer()))
  if (!tipo) return { error: ERRORES.formato }
  if (tipo.ext === 'svg' && SVG_CON_CODIGO.test(await archivo.text())) return { error: ERRORES.codigo }
  return { tipo }
}

function montarArchivo(form) {
  const campo = form.elements.namedItem('logo_archivo')
  if (!campo) return
  const caja = campo.closest('.brief-archivo')
  const zona = caja.querySelector('.brief-archivo-zona')
  const vista = caja.querySelector('img')
  const icono = caja.querySelector('.brief-archivo-icono')
  const estado = caja.querySelector('.brief-archivo-estado')
  const quitar = caja.querySelector('.brief-archivo-quitar')
  const aviso = estado.textContent
  let vuelta = 0

  async function revisar() {
    const esta = ++vuelta
    const [archivo] = campo.files
    vista.hidden = true
    vista.removeAttribute('src')
    icono.textContent = ''
    caja.classList.remove('con-archivo', 'con-error')
    quitar.hidden = true
    if (!archivo) {
      estado.textContent = aviso
      return
    }

    const { error, tipo } = await problemaDe(archivo)
    // Si mientras tanto se eligió otro, este ya no importa.
    if (esta !== vuelta) return
    if (error) {
      campo.value = ''
      caja.classList.add('con-error')
      estado.textContent = error
      return
    }

    caja.classList.add('con-archivo')
    estado.textContent = `${archivo.name} · ${peso(archivo.size)} · listo para enviar`
    quitar.hidden = false
    if (['png', 'jpg', 'webp', 'svg'].includes(tipo.ext)) {
      const lector = new FileReader()
      lector.addEventListener('load', () => {
        if (esta !== vuelta) return
        vista.src = lector.result
        vista.hidden = false
      })
      lector.readAsDataURL(archivo)
    } else {
      icono.textContent = tipo.ext.toUpperCase()
    }
  }

  campo.addEventListener('change', revisar)
  form.addEventListener('reset', () => setTimeout(revisar))
  quitar.addEventListener('click', () => {
    campo.value = ''
    campo.dispatchEvent(new Event('change', { bubbles: true }))
    campo.focus()
  })

  // Al arrastrar un archivo encima, la zona lo dice.
  for (const tipo of ['dragenter', 'dragover']) zona.addEventListener(tipo, () => zona.classList.add('encima'))
  for (const tipo of ['dragleave', 'drop']) zona.addEventListener(tipo, () => zona.classList.remove('encima'))
}

export default function montarLogo(form) {
  montarNombre(form)
  montarArchivo(form)
}
