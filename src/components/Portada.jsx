import ConstruccionDeLaOnda from './ConstruccionDeLaOnda.jsx'


/**
 * Portada (DESIGN-BRIEF §4, bloque 1). Tema cielo: aquí la página promete.
 *
 * Lo que tiene que ver quien no baja nada: el titular, una entradilla corta, la
 * acción principal con su secundaria, la credencial del jurado y la pieza de
 * marca. La regla que manda: si la pieza visual empuja el titular fuera de la
 * pantalla en un móvil de 360 px, la pieza se reduce. El texto gana siempre,
 * porque es lo único que casi todos van a leer.
 *
 * **La fotografía se fue.** Era una nube volutus real, y bien recortada se veía
 * bien, pero no argumentaba nada: el titular promete obra que se puede abrir y
 * revisar, y una foto no enseña obra. La sustituye el símbolo con su
 * construcción geométrica a la vista, que dice exactamente eso sobre la propia
 * marca. De paso es SVG dentro del HTML: una petición menos y 6 kB menos.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * OJO CON LA ENTRADILLA. El brief propone «Dos productos en línea y un agente
 * de IA premiado». Verificado el 2026-09-24, `carflip.cl` responde 500, así que
 * productos en línea hay UNO. La regla de §3 es que cada afirmación va con su
 * enlace o no se hace, y esa regla pesa más que la redacción propuesta: se
 * escribe lo que hoy se sostiene. En cuanto CarFlip vuelva a responder, esta
 * frase recupera el plural y el titular no cambia.
 * ────────────────────────────────────────────────────────────────────────────
 */
export default function Portada() {
  return (
    <section id="portada" className="seccion zona-cielo portada">
      <div className="contenedor portada-interior">
        <div className="portada-texto">
          <h1>Construimos software que puedes abrir y revisar.</h1>

          {/* Tres líneas, no siete. Medido con Playwright: la versión anterior
              ocupaba 223 px y, con el titular, se comía el 51 % de la pantalla
              de un móvil de 390 px — el doble de lo que gastan Linear, Resend
              o Railway. Lo que se fue no fue información: era la misma promesa
              dicha con más palabras. El plazo de respuesta se queda porque es
              un compromiso concreto; el resto lo cuenta la página. */}
          <p className="entradilla portada-entradilla">
            Obra abierta, con su enlace o su código a la vista. Cuéntanos qué necesitas y te
            respondemos en menos de 48 horas hábiles.
          </p>

          <div className="portada-acciones">
            <a className="boton boton-primario" href="#contacto">
              Cuéntanos tu proyecto
            </a>
            <a className="boton boton-secundario" href="#proyectos">
              Ver proyectos
            </a>
          </div>

          {/* La única credencial que validó un tercero. Va DEBAJO de los
              botones y no encima: no compite con la acción principal, la
              respalda.

              Una línea, no un párrafo. Railway resuelve la confianza con una
              rejilla de logos que se lee de un vistazo; nosotros no tenemos
              logos que poner, pero sí podemos dejar de contarlo en prosa. Lo
              que se fue —«con jurado externo»— no se pierde: está en la ficha
              del proyecto, y aquí lo que importa es que se lea sin detenerse. */}
          <p className="portada-credencial">
            <span className="portada-credencial-marca dato" aria-hidden="true">
              2.º
            </span>
            <span>
              Hackathon de IA agéntica.{' '}
              <a href="https://github.com/DiegoPyLL/Hackathon-Huawei-Cloud-MaaS" rel="noopener">
                Ver el código
              </a>
            </span>
          </p>
        </div>

        {/* Aquí había una fotografía de una nube. Se fue porque no argumentaba:
            el titular promete obra que se puede abrir y revisar, y una foto
            bonita no enseña nada de eso.

            Lo que la sustituye es el símbolo con su construcción a la vista.
            No hay que descargar nada —es SVG dentro del HTML— y dice lo mismo
            que el titular aplicado a la propia marca: esto está construido y
            puedes comprobar cómo. */}
        <figure className="portada-figura">
          <ConstruccionDeLaOnda className="portada-construccion" />
          {/* La pista del gesto va aquí y no como globo flotante: quien no la
              lea no se pierde nada, porque el dibujo ya está completo. Solo se
              muestra donde hay puntero fino; en táctil el CSS la esconde. */}
          <figcaption className="portada-pie dato">
            Una recta, dos circunferencias. Nuestro símbolo, con la construcción a la vista.
            <span className="portada-pie-gesto"> Arrástralo para deshacerlo.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
