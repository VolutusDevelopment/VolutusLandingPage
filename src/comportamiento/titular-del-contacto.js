/**
 * El titular del contacto: una frase de varias, elegida al azar cada vez que
 * se carga la página. No rota mientras se mira: queda esa.
 *
 * El HTML trae la primera, que es la que se lee sin JavaScript, y cada frase en
 * el `data-titulo` de una copia invisible que mide su alto (Contacto.css), así
 * que cambiarla no mueve nada.
 */
export default function initTitularDelContacto() {
  const titulos = [...document.querySelectorAll('.contacto-titular [data-titulo]')].map(
    (copia) => copia.dataset.titulo
  )
  if (!titulos.length) return
  document.getElementById('contacto-titulo').textContent = titulos[Math.floor(Math.random() * titulos.length)]
}
