import Medidor from './Medidor.jsx'
import { ORIGEN } from '../lib/meta.js'

/**
 * Métricas (DESIGN-BRIEF §4, bloque 3). Aquí la página cruza su único corte de
 * claro a oscuro y empieza a caer hacia el mar: es la primera hondura.
 *
 * **Por qué los números son los de esta misma página y no los de un cliente.**
 * §3 fija una regla de la que cuelga toda la credibilidad del sitio: cada
 * afirmación va con su enlace, su número o su repositorio, y lo que no se pueda
 * sostener no se dice. Hoy no hay cliente que haya pagado, así que no hay
 * ningún «-40 % de tiempo de carga» que enseñar sin inventarlo.
 *
 * Lo que sí existe es esta página, y el visitante puede comprobar cada cifra
 * con las herramientas de su propio navegador sin pedirle permiso a nadie. Una
 * empresa de software que publica sus números y acierta está demostrando
 * exactamente lo que dice saber hacer.
 *
 * **La sección gastaba más palabras en explicar los números que los números.**
 * Ahora las cuatro puntuaciones son cuatro medidores que se llenan al entrar, y
 * la explicación de cada prueba cabe en una línea bajo su anillo. Las tres
 * cifras duras que no van sobre cien —lo que tarda, lo que pesa, cuánto se
 * mueve— son las tarjetas que tapan el corte (ver `Corte`).
 *
 * Medido con Lighthouse el 27-09-2026 sobre el build de producción, en móvil
 * con 4G simulado. Si el build engorda, estos números mienten: se vuelven a
 * medir antes de publicar cualquier cambio.
 */

/**
 * Las notas dicen QUÉ TE DA cada prueba, no qué mide.
 *
 * Antes eran definiciones —«Cuánto tarda en poder usarse», «Seguridad y
 * errores de consola»— y eso deja al lector traduciendo. Quien llega aquí no
 * está evaluando una herramienta de Google: acaba de hablar con uno de los dos
 * socios y está comprobando si lo que le contaron es cierto (§2). Lo que
 * necesita de cada anillo es la consecuencia, no el temario.
 *
 * Los nombres sí se quedan en castellano llano. Google los llama «Prácticas
 * recomendadas» y «SEO»; aquí son «Buenas prácticas» y «Posicionamiento»,
 * porque «SEO» es jerga para quien hoy resuelve esto con una planilla.
 *
 * Y la nota de Posicionamiento dice «los buscadores» y no «Google»: el nombre
 * ya está en el titular, que es donde sostiene la afirmación, y repetirlo tres
 * veces en la misma pantalla lo gasta. Dice «saben de qué trata» y no «apareces
 * cuando te buscan» porque esa prueba mide si la página se deja entender, no si
 * sale primera: prometer lo segundo sería justo lo que §3 prohíbe.
 */
const PRUEBAS = [
  { nombre: 'Rendimiento', valor: 100, nota: 'Nadie se va porque tarda.' },
  { nombre: 'Accesibilidad', valor: 100, nota: 'La puede usar quien no ve la pantalla.' },
  { nombre: 'Buenas prácticas', valor: 100, nota: 'Nada inseguro ni roto por dentro.' },
  { nombre: 'Posicionamiento', valor: 100, nota: 'Los buscadores saben de qué trata.' },
]

// La prueba, sobre esta misma página. Es el enlace que el antetítulo promete:
// sin él, «medido» es otra cosa que hay que creerse.
const PRUEBA = `https://pagespeed.web.dev/analyze?url=${encodeURIComponent(`${ORIGEN}/`)}`

// «78 kB» no le dice nada a nadie sin con qué compararlo, y la foto que ese
// mismo teléfono acaba de sacar pesa cuarenta veces más.
const CIFRAS = [
  { dato: '1,2 s', texto: 'en abrir con datos móviles' },
  { dato: '78 kB', texto: 'la página entera, menos que una foto' },
  { dato: '0', texto: 'saltos mientras carga' },
]

/**
 * El corte de claro a oscuro, tapado por las tres cifras (la referencia es
 * surgehq.ai/enterprise). La franja pinta su mitad de arriba del color de
 * Proyectos y deja ver abajo el de esta sección, así que las tarjetas quedan a
 * caballo del corte midan lo que midan: no hay alturas que calcular.
 *
 * Las tarjetas son de cielo: blancas, como un trozo de la página de arriba que
 * cae sobre la de abajo.
 */
function Corte() {
  return (
    <div className="corte">
      <div className="contenedor">
        <ul className="cifras zona-cielo">
          {CIFRAS.map(({ dato, texto }) => (
            <li key={dato} className="cifra entra">
              <b className="dato">{dato}</b> {texto}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Metricas() {
  return (
    <section id="metricas" className="seccion zona-plano hondura-1 metricas">
      <Corte />

      <div className="contenedor">
        <p className="antetitulo entra">Medido, no prometido</p>
        {/* El titular lleva el número y dice de qué página habla. «Las cuatro
            pruebas de Google, llenas» describía un trofeo nuestro y solo se
            entendía después de ver los anillos.

            «100 de 100» y no «100»: quien no conoce estas pruebas no sabe sobre
            qué va la nota, y sin la escala el número no significa nada. Es la
            única vez que se nombra a Google en la sección, y va aquí porque es
            lo que convierte la afirmación en algo que no hay que creerse. */}
        <h2 className="entra">Esta página saca 100 de 100 en las cuatro pruebas de Google.</h2>
        {/* Escrita para quien nunca ha oído «Lighthouse», que es casi todo el
            mundo: gratis y un minuto. Ni el nombre de la herramienta ni el de
            Google hacen falta aquí — el titular ya puso el aval y el pie da la
            puerta.

            Que sirve para cualquier página no hace falta decirlo: «la que
            tengas hoy» ya lo dice, y con el titular ocupando cuatro líneas en
            móvil, una entradilla de otras cuatro dejaba los anillos fuera de la
            primera pantalla.

            La segunda frase es la que trabaja: invita a medir lo que ya tiene.
            Quien llega suele arrastrar un sitio hecho por «un conocido que sabe
            de computación» (§2), y la comparación la hace él solo. «La que
            tengas hoy» no da por hecho que exista. */}
        <p className="entradilla metricas-entradilla entra">
          La prueba es gratis y toma un minuto. Hazla con esta página, y después con la que tengas
          hoy.
        </p>

        <ul className="medidores">
          {PRUEBAS.map((p) => (
            <Medidor key={p.nombre} {...p} />
          ))}
        </ul>

        {/* Una línea y el enlace. «Compruébalo tú» sin decir cómo es una
            invitación que nadie recoge, así que dice lo que quita las dudas de
            quien nunca ha medido una página: que arranca sola y que no pide
            registrarse. Medir la suya ya lo propone la entradilla.

            El enlace lleva la URL puesta y PageSpeed arranca solo al abrirlo,
            así que comprobarlo es un toque. */}
        <p className="metricas-comprobar entra">
          <a href={PRUEBA} target="_blank" rel="noopener noreferrer">
            Abre PageSpeed Insights con esta página
          </a>
          . Arranca sola: no hay que escribir nada ni registrarse.
        </p>

        {/* Las condiciones van escritas porque el resultado de quien repita la
            prueba dependerá de su conexión, y encontrarse un 97 sin saber por
            qué gasta más confianza de la que cuesta esta línea. */}
        <p className="metricas-pie entra">
          Nuestras cuatro notas están medidas en un celular, con una conexión 4G simulada.
        </p>
      </div>
    </section>
  )
}
