/**
 * La Mesa de Rosa (rosa.html): los pedidos son para mañana, así que la
 * tarjeta de la portada muestra el plato de mañana y la pizarra de la carta
 * lo deja marcado. El sábado y el domingo, mañana es el lunes. Sin
 * JavaScript, las dos muestran el lunes.
 */

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
const NOMBRES = { lunes: 'lunes', martes: 'martes', miercoles: 'miércoles', jueves: 'jueves', viernes: 'viernes' }
const PLATOS = {
  lunes: ['Pollo arvejado en olla de greda', '$6.900 · con arroz y leche asada'],
  martes: ['Cazuela de vacuno', '$6.900 · con pan amasado y pebre'],
  miercoles: ['Carbonada con pan amasado', '$6.900 · con sémola con leche'],
  jueves: ['Estofado de cordero al romero', '$7.400 · con puré y kuchen'],
  viernes: ['Plateada al jugo', '$7.900 · con papas doradas y flan'],
}

const manana = DIAS[(new Date().getDay() + 1) % 7]
const dia = PLATOS[manana] ? manana : 'lunes'
const tarjeta = document.querySelector('[data-manana]')
const opcion = document.querySelector(`.pizarra input[value="${dia}"]`)

if (tarjeta && opcion) {
  const [plato, precio] = PLATOS[dia]
  tarjeta.querySelector('[data-manana-cuando]').textContent = dia === manana ? `Para mañana, ${NOMBRES[dia]}` : 'Para el lunes'
  tarjeta.querySelector('[data-manana-plato]').textContent = plato
  tarjeta.querySelector('[data-manana-precio]').textContent = precio
  tarjeta.querySelector('[data-manana-foto]').src = `/image/bocetos/rosa/${dia}-400.webp`
  opcion.checked = true
}
