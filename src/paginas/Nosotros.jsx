import Pagina from '../components/Pagina.jsx'
import { VOLUTA } from '../components/Marca.jsx'
import { PAGINAS } from '../lib/meta.js'

/**
 * Quiénes somos. Cae como la portada: arriba claro, y desde el nombre hacia
 * abajo cada sección un poco más honda, hasta el mar del pie.
 *
 * Todo lo que dice se puede comprobar: el origen del nombre está en el Atlas
 * Internacional de Nubes, la construcción del símbolo está en el código de la
 * marca (`lib/espiral.js`) y la obra, en la portada con sus enlaces. No hay
 * fecha de fundación ni anécdota, porque no hay de dónde sacarlas.
 */

// Las respuestas del equipo en «Volutus entra a una sala» (DESIGN-BRIEF A.1),
// dichas en plural. La última es la regla de §3, que rige toda la página.
const RASGOS = [
  'No buscamos llamar la atención, pero tampoco pasar desapercibidos.',
  'Damos nuestra opinión cuando nos la piden, sin cerrarnos a la tuya.',
  'Aterrizamos las ideas hasta que entiendas lo mismo que nosotros.',
  'Lo que decimos va con su enlace, su número o su código. Lo que no se puede comprobar, no lo decimos.',
]

// Las tres piezas de la marca que salen de la nube.
const MARCA = [
  {
    titulo: 'El símbolo',
    texto: 'Una sola línea que entra recta y se enrolla en cuatro cuartos de circunferencia, con radios 8, 5, 3 y 2: la serie de Fibonacci.',
  },
  { titulo: 'La palabra', texto: 'La ola nace en la S de VOLUTUS y rompe en voluta.' },
  { titulo: 'Esta página', texto: 'Empieza en la nube y termina en el mar.' },
]

/**
 * El símbolo con su construcción a la vista: cada cuarto de vuelta en su
 * cuadrado, con el radio que le toca. Son los números que `espiralFibonacci`
 * calcula para la marca, no un dibujo aparte: si la marca cambia, cambia esto.
 *
 * El cuadrado de cada arco tiene una esquina en el centro y dos en los extremos
 * del arco; la cuarta es la suma de los extremos menos el centro.
 */
function Construccion() {
  const tramos = VOLUTA.arcos.map(({ centro, serie }, k) => {
    const [inicio, fin] = VOLUTA.puntos.slice(k + 1, k + 3)
    const opuesta = [inicio[0] + fin[0] - centro[0], inicio[1] + fin[1] - centro[1]]
    const esquinas = [centro, inicio, opuesta, fin]
    const medio = [(centro[0] + opuesta[0]) / 2, (centro[1] + opuesta[1]) / 2]
    return { serie, puntos: esquinas.map((p) => p.join(',')).join(' '), medio }
  })

  return (
    <svg className="construccion" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      {tramos.map(({ serie, puntos, medio }) => (
        <g key={serie}>
          <polygon className="construccion-cuadrado" points={puntos} vectorEffect="non-scaling-stroke" />
          <text className="construccion-radio" x={medio[0]} y={medio[1]}>
            {serie}
          </text>
        </g>
      ))}
      {/* Sin `non-scaling-stroke`: con él, el navegador mide el guion en
          píxeles de pantalla, ignora `pathLength` y el trazo sale a tramos. */}
      <path className="construccion-voluta" d={VOLUTA.d} pathLength="1" />
    </svg>
  )
}

export default function Nosotros() {
  // La entradilla visible es la misma frase que la meta description, como en
  // el documento legal: un resumen, escrito una vez.
  const { descripcion } = PAGINAS['/nosotros']

  return (
    <Pagina ruta="/nosotros" className="nosotros">
      <section className="seccion zona-cielo nosotros-cabecera">
        <div className="contenedor">
          <p className="antetitulo">Nosotros</p>
          <h1>Quiénes somos</h1>
          <p className="entradilla nosotros-entradilla">{descripcion}</p>
        </div>
      </section>

      <section id="origen" className="seccion zona-plano hondura-1" aria-labelledby="origen-titulo">
        <div className="contenedor nosotros-origen">
          <div>
            <p className="antetitulo entra">De dónde viene el nombre</p>
            <h2 id="origen-titulo" className="entra">
              Volutus es una nube.
            </h2>
            <p className="nosotros-parrafo entra">
              Es la nube en rollo: un tubo largo y bajo que parece girar sobre su propio eje mientras
              avanza. La más conocida es la Morning Glory, en el norte de Australia.
            </p>
            <p className="nosotros-parrafo entra">
              Su nombre viene del latín <i lang="la">volutus</i>, «enrollado». La Organización
              Meteorológica Mundial la reconoció como especie propia en 2017, en su Atlas Internacional
              de Nubes.
            </p>
          </div>
          <Construccion />
        </div>

        <div className="contenedor">
          <ul className="nosotros-marca">
            {MARCA.map(({ titulo, texto }) => (
              <li key={titulo} className="entra">
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="seccion zona-plano hondura-2" aria-labelledby="como-titulo">
        <div className="contenedor">
          <p className="antetitulo entra">Cómo somos</p>
          <h2 id="como-titulo" className="entra">
            Conversamos al mismo nivel.
          </h2>
          <ul className="nosotros-rasgos">
            {RASGOS.map((rasgo) => (
              <li key={rasgo} className="entra">
                {rasgo}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="seccion zona-plano hondura-3" aria-labelledby="cierre-titulo">
        <div className="contenedor">
          <h2 id="cierre-titulo" className="entra">
            Lo que hacemos se puede abrir y revisar.
          </h2>
          <p className="entradilla nosotros-parrafo entra">
            PonleNota está en línea, y el agente de IA que salió segundo en el hackathon de Huawei Cloud
            y Kostra AI tiene su código abierto.
          </p>
          <p className="nosotros-acciones entra">
            <a className="boton boton-primario" href="/#contacto">
              Cuéntanos tu proyecto
            </a>
            <a className="boton boton-secundario" href="/#proyectos">
              Ver proyectos
            </a>
          </p>
        </div>
      </section>
    </Pagina>
  )
}
