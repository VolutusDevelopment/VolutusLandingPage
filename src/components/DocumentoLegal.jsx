import Barra from './Barra.jsx'
import Pie from './Pie.jsx'
import { PAGINAS } from '../lib/meta.js'

/**
 * Marco de los documentos legales. Hoy lo usa solo /privacidad; existe como
 * marco y no como página suelta porque el día que haya un segundo documento
 * —términos de servicio, cuando Volutus venda algo por la web— será el mismo
 * objeto: un titular, una fecha de vigencia y una lista numerada de apartados.
 *
 * **La numeración la pone el índice del array, no el texto.** Insertar un
 * apartado en el medio no debe obligar a renumerar a mano los de abajo, que es
 * como aparecen los documentos con dos cláusulas «7».
 *
 * Va entero en tema cielo y sin un solo corte de zona. Los dos cortes que fija
 * A.4 son del recorrido de la portada —prometer, demostrar, convertir— y aquí
 * no hay recorrido: hay un texto que se lee seguido. Alternar temas en mitad de
 * un documento legal sería decoración, que es justo lo que el brief prohíbe.
 *
 * El ancho es el de lectura y no el del sitio: son párrafos largos, y la medida
 * cómoda está muy por debajo del contenedor de 1200 px de las secciones de
 * venta.
 */
export default function DocumentoLegal({ ruta, actualizado, apartados }) {
  // La entradilla visible es la misma frase que la meta description. Resume el
  // documento y no hay motivo para escribirla dos veces con dos redacciones que
  // después divergen.
  const { descripcion } = PAGINAS[ruta]

  return (
    <>
      <a className="salto" href="#contenido">
        Saltar al contenido
      </a>

      <Barra />

      <main id="contenido" className="zona-cielo legal">
        <div className="contenedor legal-interior">
          <header className="legal-cabecera">
            <p className="antetitulo">Legal</p>
            <h1>Privacidad y protección de datos</h1>
            <p className="entradilla legal-entradilla">{descripcion}</p>
            <p className="legal-fecha dato">Última actualización: {actualizado}</p>
          </header>

          {apartados.map(({ titulo, contenido }, indice) => (
            <section key={titulo} className="legal-apartado">
              <h2>
                {indice + 1}. {titulo}
              </h2>
              {contenido}
            </section>
          ))}
        </div>
      </main>

      <Pie />
    </>
  )
}
