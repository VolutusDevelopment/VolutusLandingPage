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
 * rollo que da nombre a la marca, de puntos, con luz, sombra y un filo dorado,
 * girando despacio sobre su eje (ver nubes-lienzo.js). En L y XL ocupa el lado derecho y el texto va a la
 * izquierda; en M y S va arriba y el texto debajo, sin empujarlo nunca. La
 * página baja por las horas del día hasta la noche del pie (DESIGN-BRIEF
 * A.8).
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
            {/* El titular anterior —«Eso que hoy haces a mano, funcionando
                solo»— nombraba la herramienta y no el trabajo: nadie se
                reconocía en «eso». Este nombra las dos cosas —«tus pedidos por
                WhatsApp»—, que es lo que contesta la primera objeción de §2:
                «¿eso me sirve a mí?». «Sistema» es la palabra con que el
                cliente pide esto. Pasa el test de «Ahora puedes…»: «ahora
                puedes tener tus pedidos en un sistema que trabaja solo».

                Que no diga a qué se dedica Volutus es deliberado, no un olvido:
                §2 dice que el visitante llega sabiéndolo porque acaba de hablar
                con uno de los socios. Gastar el titular en explicar el rubro es
                gastarlo en lo único que ya sabe.

                Rotan cuatro trabajos, cada uno con la herramienta de su ruta en
                el dibujo y en el mismo orden (`data-ruta`). «Tus» va dentro de
                cada frase: el rotativo es un bloque propio y, suelto, ocuparía
                una línea entera. El HTML trae una sola frase completa —la que
                leen buscadores y lectores de pantalla—; las demás viven en
                `data-palabras` y las pone `titular-rotativo.js`.
                `data-reserva` es la más larga y reserva su alto desde el primer
                pintado, así que el titular no salta al cambiar de frase. */}
            <h1>
              <span
                className="rotativo"
                data-reserva="Tus planillas de inventario,"
                data-palabras="Tus cotizaciones a mano,|Tus planillas de inventario,|Tus pedidos por WhatsApp,|Tus fichas de papel,"
              >
                <span className="rotativo-palabra">Tus cotizaciones a mano,</span>
              </span>{' '}
              en un sistema que trabaja solo.
            </h1>

            <div className="portada-acciones">
              <a className="boton boton-primario" href="#contacto">
                Cuéntanos tu proyecto
              </a>
              <a className="boton boton-secundario" href="#proyectos">
                Ver los tres proyectos
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
