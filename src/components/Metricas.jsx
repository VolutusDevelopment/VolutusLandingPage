import Medidor from './Medidor.jsx'

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

const PRUEBAS = [
  { nombre: 'Rendimiento', valor: 100, nota: 'Cuánto tarda en poder usarse.' },
  { nombre: 'Accesibilidad', valor: 100, nota: 'Que sirva con teclado y lector de pantalla.' },
  { nombre: 'Buenas prácticas', valor: 100, nota: 'Seguridad y errores de consola.' },
  { nombre: 'Posicionamiento', valor: 100, nota: 'Que los buscadores la entiendan.' },
]

export default function Metricas() {
  return (
    <section id="metricas" className="seccion zona-plano metricas">
      <div className="contenedor">
        <p className="antetitulo entra">Medido, no prometido</p>
        <h2 className="entra">Las cuatro pruebas de Google, llenas.</h2>
        <p className="entradilla metricas-entradilla entra">
          Es la vara pública con la que se mide cualquier sitio, y la puedes correr tú ahora mismo.
        </p>

        <ul className="medidores">
          {PRUEBAS.map((p) => (
            <Medidor key={p.nombre} {...p} />
          ))}
        </ul>

        {/* Las tres cifras que no van sobre cien. En una línea, con separadores
            en vez de tres tarjetas: ninguna necesita su propio párrafo. */}
        <p className="metricas-duras entra">
          <span>
            <b className="dato">1,2 s</b> en abrir con datos móviles
          </span>
          <span>
            <b className="dato">78 kB</b> la página entera
          </span>
          <span>
            <b className="dato">0</b> saltos mientras carga
          </span>
        </p>
      </div>
    </section>
  )
}
