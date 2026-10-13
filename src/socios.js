// El orden de los socios en /nosotros (Nosotros.jsx). Ninguno va siempre
// primero: en cada visita sale un número de tres dígitos al azar; si es par,
// queda el orden del HTML (Diego primero), y si es impar, Rodrigo pasa
// adelante. Sin JavaScript queda el del HTML.

/** Un número entero al azar entre 100 y 999: 450 pares y 450 impares. */
function numeroDeTresDigitos() {
  return 100 + Math.floor(Math.random() * 900)
}

export default function initSocios() {
  const lista = document.querySelector('.socios')
  if (!lista) return
  if (numeroDeTresDigitos() % 2 === 1) lista.prepend(lista.lastElementChild)
}
