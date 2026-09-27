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
 * bien, pero no argumentaba nada. La sustituye el símbolo con su construcción
 * geométrica a la vista, que dice sobre la propia marca lo mismo que la página
 * dice de su obra: está construida y puedes comprobar cómo. De paso es SVG
 * dentro del HTML, así que es una petición menos y 6 kB menos.
 *
 * **Ninguna afirmación de aquí cuenta obra.** Es deliberado: contarla era lo
 * que obligaba a andar corrigiendo el plural cada vez que `carflip.cl` se cae.
 * La obra la enseña el índice que viene debajo, con sus enlaces, que es donde
 * §3 quiere que esté — cada afirmación con lo que la sostiene al lado.
 */
export default function Portada() {
  return (
    <section id="portada" className="seccion zona-cielo portada">
      <div className="contenedor portada-interior">
        <div className="portada-texto">
          {/* El titular anterior —«Construimos software que puedes abrir y
              revisar»— describía lo que hacemos NOSOTROS. Pasado por el test de
              «Ahora puedes…» no cuadra: «ahora puedes construir software que
              puedes revisar» no es una capacidad que gane quien lee.

              Este nombra la incomodidad con las palabras que el propio equipo
              recogió en §2 —«lo resuelve a mano, con una planilla, con un
              conocido que sabe de computación, o no lo resuelve»— y le pone
              enfrente la visión. Ahora sí pasa el test: «ahora puedes tener
              funcionando solo eso que hoy haces a mano».

              Que no diga a qué se dedica Volutus es deliberado, no un olvido:
              §2 dice que el visitante llega sabiéndolo porque acaba de hablar
              con uno de los socios. Gastar el titular en explicar el rubro es
              gastarlo en lo único que ya sabe.

              El «cómo» rota entre las formas en que ese trabajo se hace hoy.
              El HTML trae una sola frase completa —la que leen buscadores y
              lectores de pantalla—; las demás viven en `data-palabras` y las
              pone `titular-rotativo.js`. `data-reserva` es la más larga y
              reserva su alto desde el primer pintado, así que el titular no
              salta al cambiar de palabra. */}
          <h1>
            Eso que hoy haces{' '}
            <span
              className="rotativo"
              data-reserva="en una planilla,"
              data-palabras="a mano,|en una planilla,|por WhatsApp,|en papel,"
            >
              <span className="rotativo-palabra">a mano,</span>
            </span>{' '}
            funcionando solo.
          </h1>

          {/* La entradilla contesta tres de las cuatro preocupaciones de §2 en
              dos frases: qué tengo que entregar yo («en tus palabras»), en
              cuánto tiempo, y cuánto cuesta. La cuarta —qué hacen— la contesta
              el índice de obra que viene justo debajo. */}
          <p className="entradilla portada-entradilla">
            Cuéntanos el problema en tus palabras. En menos de 48 horas hábiles tienes alcance,
            plazo y un precio real.
          </p>

          <div className="portada-acciones">
            <a className="boton boton-primario" href="#contacto">
              Cuéntanos tu proyecto
            </a>
            <a className="boton boton-secundario" href="#proyectos">
              Ver los tres proyectos
            </a>
          </div>

          {/* La única credencial que validó un tercero. Va DEBAJO de los
              botones y no encima: no compite con la acción principal, la
              respalda.

              Una línea, no un párrafo. Railway resuelve la confianza con una
              rejilla de logos que se lee de un vistazo; nosotros no tenemos
              logos que poner, pero sí podemos dejar de contarlo en prosa.
              «Jurado externo» se queda porque es lo que la separa de una
              medalla que cualquiera se dibuja. */}
          <p className="portada-credencial">
            <span className="portada-credencial-marca dato" aria-hidden="true">
              2.º
            </span>
            <span>
              Hackathon de IA agéntica, jurado externo.{' '}
              <a href="https://github.com/DiegoPyLL/Hackathon-Huawei-Cloud-MaaS" rel="noopener">
                Ver el código
              </a>
            </span>
          </p>
        </div>

        {/* Aquí había una fotografía de una nube. Se fue porque no argumentaba
            nada: una foto bonita no demuestra que sepas construir.

            Lo que la sustituye es el símbolo con su construcción a la vista.
            No hay que descargar nada —es SVG dentro del HTML— y hace sobre la
            marca la misma demostración que el índice de obra hace sobre el
            trabajo: está construido y puedes comprobar cómo. */}
        <figure className="portada-figura">
          <ConstruccionDeLaOnda className="portada-construccion" />
          {/* La pista del gesto va aquí y no como globo flotante: quien no la
              lea no se pierde nada, porque el dibujo acaba completo igual.
              Solo se muestra donde hay puntero fino; en táctil el CSS la
              esconde, porque ahí el gesto es arrastrar. */}
          <figcaption className="portada-pie dato">
            Una recta y cuatro arcos de radios 8, 5, 3 y 2: la serie de Fibonacci. Nuestro
            símbolo, con la construcción a la vista.
            <span className="portada-pie-gesto"> Muévete sobre él y lo construyes tú.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
