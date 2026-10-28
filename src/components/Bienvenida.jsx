import { Logotipo, OlaLienzo } from './Marca.jsx'

/**
 * La bienvenida del home, una carga de 4 s: el cielo de la portada con el
 * logotipo, que se escribe como el de la barra y después, hasta que la
 * bienvenida se va, deja pasar los colores por la ola y no por las letras
 * (ola.js).
 *
 * La sostiene y la retira el CSS (Bienvenida.css): a los 4 s ya no está,
 * llegue o no el JavaScript. Es decorativa: el contenido está debajo desde el
 * primer pintado, y lectores de pantalla y buscadores lo leen sin esperarla.
 */
export default function Bienvenida() {
  return (
    <div className="bienvenida" aria-hidden="true">
      <span className="bienvenida-marca">
        <Logotipo className="bienvenida-logotipo" />
        <OlaLienzo repite />
      </span>
    </div>
  )
}
