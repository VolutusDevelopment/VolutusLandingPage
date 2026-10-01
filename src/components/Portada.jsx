/**
 * Portada (DESIGN-BRIEF §4, bloque 1). Tema cielo: aquí la página promete.
 *
 * Lo que tiene que ver quien no baja nada: el titular, una entradilla corta, la
 * acción principal con su secundaria, la credencial del jurado y la pieza de
 * marca. La regla que manda: si la pieza visual empuja el titular fuera de la
 * pantalla en un móvil de 360 px, la pieza se reduce. El texto gana siempre,
 * porque es lo único que casi todos van a leer.
 *
 * **La primera pantalla es la mañana: una volutus y un mensaje.** La nube en
 * rollo que da nombre a la marca, en volumen y de puntos finos, con luz,
 * sombra y un filo dorado, rodando despacio sobre su eje; el cursor la mueve
 * como viento (ver nubes-lienzo.js). En L y XL cruza la portada en
 * perspectiva, detrás del titular centrado; en M y S va arriba y el texto
 * debajo, sin empujarlo nunca. La página baja por las horas del día hasta la
 * noche del pie (DESIGN-BRIEF A.8).
 *
 * **Ninguna afirmación de aquí cuenta obra.** Es deliberado: contarla era lo
 * que obligaba a andar corrigiendo el plural cada vez que `carflip.cl` se cae.
 * La obra la enseña el índice que viene debajo, con sus enlaces, que es donde
 * §3 quiere que esté — cada afirmación con lo que la sostiene al lado.
 */
export default function Portada() {
  return (
    <section id="portada" className="seccion zona-cielo hora-manana portada">
      <div className="portada-escena">
        <div className="portada-cielo">
          <canvas className="nubes" data-vista="cielo" aria-hidden="true" />
        </div>

        <div className="contenedor portada-interior">
          <div className="portada-texto">
            {/* El gancho va de antetítulo y el titular dice lo que hacemos,
                sin que haya que pensarlo: «Creamos» y el servicio. Rotan los
                de `lib/servicios.js` (menos la ley de datos, que no es algo que
                se cree). Cada uno cabe en una línea a 360 px: por eso
                «automatización» y no «automatizaciones», que no cabe y, como
                una palabra no se parte, desbordaría.

                Buscadores y lectores de pantalla leen la lista entera y fija,
                con los nombres que la gente busca («aplicaciones», «agentes de
                inteligencia artificial»); el rotativo es solo para la vista.
                `data-reserva` es la frase más larga y reserva su alto desde el
                primer pintado, así que el titular no salta al cambiar. */}
            <p className="antetitulo">
              El mundo avanza. <span>No te quedes atrás.</span>
            </p>
            <h1>
              Creamos{' '}
              <span className="solo-lectores">
                páginas web, tiendas online, aplicaciones, agentes de inteligencia artificial y
                automatizaciones
              </span>
              <span
                className="rotativo"
                aria-hidden="true"
                data-reserva="automatización"
                data-palabras="páginas web|tiendas online|apps|agentes de IA|automatización"
              >
                <span className="rotativo-palabra">páginas web</span>
              </span>{' '}
              para tu negocio
            </h1>

            <div className="portada-acciones">
              <a className="boton boton-primario" href="#contacto">
                Cuéntanos tu proyecto
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
