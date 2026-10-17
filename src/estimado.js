// El estimado de precio (components/Estimado.jsx). La cuenta es la de
// lib/precios.js, la misma con que el prerender escribió el punto de partida:
// aquí solo se lee lo marcado y se reescriben la boleta y los totales. Lo que
// se puede elegir en este servicio llega en `data-estimado`.

import { estimar, textosDe } from './lib/precios.js'

export default function initEstimado() {
  const form = document.querySelector('.estimado')
  if (!form) return

  const estimado = JSON.parse(form.dataset.estimado)
  const salidas = form.querySelectorAll('[data-salida]')
  const lista = form.querySelector('[data-lineas]')
  // Las líneas nuevas copian la primera que escribió el prerender: así la
  // boleta no arma HTML, solo cambia textos.
  const molde = lista.firstElementChild.cloneNode(true)
  let textos

  // Lo que falta en el FormData —una casilla sin marcar, un grupo que el
  // servicio no tiene— llega como `null`, y `Number(null)` es 0.
  const calcular = () => {
    const datos = new FormData(form)
    textos = textosDe(
      estimar(estimado, {
        base: datos.get('base'),
        extras: Object.fromEntries(estimado.extras.map(({ id }) => [id, Number(datos.get(id))])),
        urgente: datos.has('urgente'),
        plazo: Number(datos.get('plazo')),
        plan: datos.get('plan') ?? '',
      })
    )
    salidas.forEach((salida) => (salida.textContent = textos[salida.dataset.salida]))
    lista.replaceChildren(
      ...textos.lineas.map(({ nombre, monto }) => {
        const linea = molde.cloneNode(true)
        linea.firstElementChild.textContent = nombre
        linea.lastElementChild.textContent = monto
        return linea
      })
    )
  }

  // Los botones − y + de las cantidades: sin JavaScript no sirven, por eso
  // llegan ocultos y el número se escribe en su campo.
  form.querySelectorAll('[data-paso]').forEach((boton) => {
    const campo = document.getElementById(boton.getAttribute('aria-controls'))
    boton.hidden = false
    boton.addEventListener('click', () => {
      const n = (Number(campo.value) || 0) + Number(boton.dataset.paso)
      campo.value = Math.min(Math.max(n, Number(campo.min)), Number(campo.max))
      calcular()
    })
  })

  // «Pedir esta cotización» deja lo marcado escrito en el mensaje del
  // formulario. Solo si el mensaje está vacío o tiene lo que se escribió aquí
  // antes: lo que la persona haya escrito no se toca.
  const mensaje = document.getElementById('proyecto')
  let escrito = ''
  form.querySelector('[data-pedir]')?.addEventListener('click', () => {
    if (!mensaje || (mensaje.value.trim() && mensaje.value !== escrito)) return
    const lineas = textos.lineas.map(({ nombre }) => nombre).join(', ')
    const resumen = `Calculé un estimado de ${form.dataset.servicio}: ${lineas}. ${textos.total} UF + IVA. Pago: ${textos.pago}. Al mes: ${textos.mes}.\n\n`
    mensaje.value = resumen.slice(0, mensaje.maxLength)
    escrito = mensaje.value
    // Así el contador de caracteres del formulario se entera.
    mensaje.dispatchEvent(new Event('input'))
  })

  // `change` además de `input`: hay versiones de Safari que, al marcar una
  // casilla, solo avisan con `change`.
  form.addEventListener('input', calcular)
  form.addEventListener('change', calcular)
  // No hay nada que enviar: Enter en una cantidad no recarga la página.
  form.addEventListener('submit', (evento) => evento.preventDefault())
  // Al volver con «atrás», el navegador puede restaurar lo marcado.
  calcular()
}
