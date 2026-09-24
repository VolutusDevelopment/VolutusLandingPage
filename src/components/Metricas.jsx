
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
 * empresa de software que publica el peso de su portada y acierta está
 * demostrando exactamente lo que dice saber hacer.
 *
 * Las cifras se miden sobre `dist/` después del build y se copian aquí a mano.
 * No se calculan en tiempo de ejecución: eso costaría JavaScript en la portada
 * para contar lo poco que pesa la portada.
 *
 * Los plazos del proceso y los objetivos de negocio NO están aquí: son las
 * preguntas abiertas 4 y 6 del brief y las tiene que contestar el equipo.
 */

// Medido sobre dist/ el 2026-09-24. Si el build engorda, estos números mienten:
// se vuelven a medir antes de publicar cualquier cambio.
const MEDICIONES = [
  {
    valor: '72 kB',
    etiqueta: 'Pesa la página entera',
    nota: 'Todo incluido: el texto, la fotografía, las dos tipografías y el código. Una sola imagen de un sitio cualquiera pesa más que esto.',
  },
  {
    valor: '2,3 kB',
    etiqueta: 'Ejecuta tu teléfono',
    nota: 'Es todo el JavaScript que enviamos. La página llega escrita desde el servidor, no se arma en tu móvil.',
  },
  {
    valor: '0',
    etiqueta: 'Saltos mientras carga',
    nota: 'Cada imagen reserva su sitio antes de llegar, así que nada se mueve bajo el dedo cuando vas a tocar.',
  },
]

export default function Metricas() {
  return (
    <section id="metricas" className="seccion zona-plano metricas">
      <div className="contenedor">
        <p className="antetitulo">Medido, no prometido</p>
        <h2>Lo que pesa esta página.</h2>
        <p className="entradilla metricas-entradilla">
          Puedes comprobarlo ahora mismo con las herramientas de tu navegador. Publicamos los
          números porque cumplirlos es la parte difícil.
        </p>

        <dl className="metricas-rejilla">
          {MEDICIONES.map((m) => (
            <div key={m.etiqueta} className="metrica">
              <dt className="solo-lectores">{m.etiqueta}</dt>
              <dd className="metrica-cuerpo">
                <span className="metrica-valor dato">{m.valor}</span>
                <span className="metrica-etiqueta">{m.etiqueta}</span>
                <span className="metrica-nota">{m.nota}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
