import Medidor from './Medidor.jsx'
import { ORIGEN } from '../lib/meta.js'

/**
 * Métricas (DESIGN-BRIEF §4, bloque 3). Sigue en plano: la página todavía está
 * demostrando.
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
 * mueve— quedan en una sola línea al pie, que es donde no estorban.
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

export default function Metricas() {
  return (
    <section id="metricas" className="seccion zona-plano metricas">
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
        <p className="entradilla metricas-entradilla entra">
          Compruébalo tú: es gratis y toma un minuto.
        </p>

        <ul className="medidores">
          {PRUEBAS.map((p) => (
            <Medidor key={p.nombre} {...p} />
          ))}
        </ul>

        {/* Las tres cifras que no van sobre cien. En una línea, con separadores
            en vez de tres tarjetas: ninguna necesita su propio párrafo.

            «78 kB» no le dice nada a nadie sin con qué compararlo, y la foto
            que ese mismo teléfono acaba de sacar pesa cuarenta veces más. */}
        <p className="metricas-duras entra">
          <span>
            <b className="dato">1,2 s</b> en abrir con datos móviles
          </span>
          <span>
            <b className="dato">78 kB</b> la página entera, menos que una foto
          </span>
          <span>
            <b className="dato">0</b> saltos mientras carga
          </span>
        </p>

        {/* Un solo enlace: PageSpeed arranca solo con la URL puesta, así que
            comprobarlo es un toque. Las condiciones van al lado porque quien
            repita la prueba verá notas según su conexión. */}
        <p className="metricas-pie entra">
          <a href={PRUEBA} target="_blank" rel="noopener noreferrer">
            Mídela en PageSpeed Insights
          </a>{' '}
          · medido en celular con 4G simulada
        </p>
      </div>
    </section>
  )
}
