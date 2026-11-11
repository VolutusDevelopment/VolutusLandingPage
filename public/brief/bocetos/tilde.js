/**
 * La prueba de imprenta de Prensa Tilde (tilde.html). Lo que se escribe en el
 * presupuesto se compone en la invitación de al lado y, cuando se deja de
 * escribir, la prensa la vuelve a imprimir (`.imprime`, con su animación en el
 * CSS). Solo copia texto con `textContent`, acotado al largo de cada campo:
 * nunca HTML. El papel, la tinta y la pieza los cambia el CSS con `:has()`.
 *
 * Va como módulo, como cauce.js, para no chocar con las constantes de barra.js.
 */

const form = document.querySelector('form[data-prueba]')
const prueba = document.querySelector('.prueba')
const LARGO = 60
const PAUSA = 700

const fecha = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

const escribirFecha = (valor) => {
  const dia = new Date(`${valor}T00:00:00Z`)
  return Number.isNaN(dia.getTime()) ? '' : fecha.format(dia)
}

// Cada campo de la prueba y cómo se escribe en el papel.
const CAMPOS = { nombres: (valor) => valor, lugar: (valor) => valor, fecha: escribirFecha }

function componer() {
  for (const [nombre, escribir] of Object.entries(CAMPOS)) {
    const campo = form.elements[nombre]
    const destino = prueba.querySelector(`[data-en="${nombre}"]`)
    if (!campo || !destino) continue
    const valor = campo.value.trim().slice(0, campo.maxLength > 0 ? campo.maxLength : LARGO)
    destino.textContent = (valor && escribir(valor)) || destino.dataset.ejemplo
  }
}

function imprimir() {
  prueba.classList.remove('imprime')
  void prueba.offsetWidth
  prueba.classList.add('imprime')
}

if (form && prueba) {
  let espera
  form.addEventListener('input', (evento) => {
    if (!(evento.target.name in CAMPOS)) return
    componer()
    clearTimeout(espera)
    espera = setTimeout(imprimir, PAUSA)
  })
  componer()
}
