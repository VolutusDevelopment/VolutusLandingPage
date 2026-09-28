import Conexiones from './Conexiones.jsx'

/**
 * Portada (DESIGN-BRIEF §4, bloque 1). Tema cielo: aquí la página promete.
 *
 * Lo que tiene que ver quien no baja nada: el titular, una entradilla corta, la
 * acción principal con su secundaria, la credencial del jurado y la pieza de
 * marca. La regla que manda: si la pieza visual empuja el titular fuera de la
 * pantalla en un móvil de 360 px, la pieza se reduce. El texto gana siempre,
 * porque es lo único que casi todos van a leer.
 *
 * **La composición es centrada y la pieza visual va debajo, a lo ancho.** El
 * titular manda solo en la primera pantalla y el dibujo lo continúa: las
 * formas manuales que la frase va nombrando, conectadas al símbolo. Cuando la
 * palabra cambia, se enciende su ruta, así que el dibujo no decora el titular:
 * lo ilustra.
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

          {/* La entradilla dice qué hacemos y qué pasa al escribirnos: dos
              frases y ninguna más. */}
          <p className="entradilla portada-entradilla">
            Hacemos webs, apps y agentes de IA a medida. Nos cuentas el problema y en 48 horas
            hábiles tienes alcance, plazo y precio.
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
      </div>

      <div className="portada-dibujo">
        <Conexiones />
      </div>
    </section>
  )
}
