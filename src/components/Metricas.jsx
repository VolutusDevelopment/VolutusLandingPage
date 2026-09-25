
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

// Medido con Lighthouse el 2026-09-25 contra el build de producción, en móvil
// con 4G simulado. Si el build engorda, estos números mienten: se vuelven a
// medir antes de publicar cualquier cambio.
//
// **Las cifras están en el idioma del cliente, no en el nuestro.** «72 kB» es
// la prueba, pero a quien llega a esta página no le dice nada: lo que le dice
// algo es cuánto tarda en abrirse con datos y si el sitio aguanta la vara con
// la que Google mide a todo el mundo. El dato técnico baja a la nota, que es
// donde lo busca quien sabe leerlo. §2 lo pide sin rodeos — el visitante no es
// ingeniero — y §5 prohíbe la jerga.
const MEDICIONES = [
  {
    valor: '1,2 s',
    etiqueta: 'Tarda en abrirse con datos',
    nota: 'Medido en una conexión móvil 4G, que es como se abre un enlace que llega por WhatsApp. La página entera pesa 78 kB.',
  },
  {
    valor: '100',
    etiqueta: 'En las cuatro pruebas de Google',
    nota: 'Rendimiento, accesibilidad, buenas prácticas y posicionamiento. Es la vara pública con la que se mide cualquier sitio, y la puedes correr tú.',
  },
  {
    valor: '0',
    etiqueta: 'Saltos mientras carga',
    nota: 'Cada imagen reserva su sitio antes de llegar, así que nada se mueve bajo el dedo justo cuando vas a tocar.',
  },
]

export default function Metricas() {
  return (
    <section id="metricas" className="seccion zona-plano metricas">
      <div className="contenedor">
        <p className="antetitulo entra">Medido, no prometido</p>
        <h2 className="entra">Lo que pesa esta página.</h2>
        <p className="entradilla metricas-entradilla entra">
          Puedes comprobarlo ahora mismo con las herramientas de tu navegador. Publicamos los
          números porque cumplirlos es la parte difícil.
        </p>

        <dl className="metricas-rejilla">
          {MEDICIONES.map((m) => (
            <div key={m.etiqueta} className="metrica entra">
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
