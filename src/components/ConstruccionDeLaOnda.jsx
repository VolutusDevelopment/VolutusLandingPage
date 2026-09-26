/**
 * La onda, dibujada con su construcción a la vista.
 *
 * Sustituye a la fotografía de la portada. El motivo no es estético sino de
 * argumento: el titular promete software **que puedes abrir y revisar**, y una
 * foto de una nube no dice nada de eso. Esto sí — es la marca enseñando cómo
 * está hecha, con los círculos y las tangentes que la generan todavía puestos.
 * La misma idea que la página vende, aplicada a su propio símbolo.
 *
 * Está permitido por §6, que autoriza «gráfica vectorial propia: la onda de
 * marca, diagramas e iconos de trazo, en SVG inline, de un solo color, sin
 * degradados». Y evita lo que A.1 prohíbe: no hay estética de terminal ni
 * adorno, solo geometría.
 *
 * Todo lo que se dibuja es la construcción real de `Marca.jsx`, no un adorno
 * que se le parece:
 *
 *   · circunferencia mayor  centro (12.75, 12)     radio 7.5
 *   · circunferencia menor  centro (12.75, 8.25)   radio 3.75  — la mitad
 *   · la recta y = 19.5, tangente a la mayor en su punto más bajo
 *
 * Si alguien mide el dibujo, cuadra. Esa es la gracia.
 *
 * Pesa alrededor de 1 kB dentro del HTML y sustituye a una imagen de 7 kB con
 * su petición: la portada carga menos que antes.
 */

const MAYOR = { cx: 12.75, cy: 12, r: 7.5 }
const MENOR = { cx: 12.75, cy: 8.25, r: 3.75 }

const TRAZO = 'M3.75 19.5 H12.75 A7.5 7.5 0 0 0 12.75 4.5 A3.75 3.75 0 0 0 12.75 12'

export default function ConstruccionDeLaOnda({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 25.5 24"
      fill="none"
      role="img"
      aria-label="El símbolo de Volutus dibujado con su construcción geométrica: dos circunferencias, una del doble de radio que la otra, y la recta tangente que las enlaza en un solo trazo."
    >
      {/* La retícula de construcción. Va en el color de línea y muy fina: está
          para que se vea que existe, no para competir con el trazo. */}
      <g className="onda-guias">
        <line x1="0.75" y1="19.5" x2="24.75" y2="19.5" strokeDasharray="1 1.5" />
        <line x1={MAYOR.cx} y1="1.2" x2={MAYOR.cx} y2="22.8" strokeDasharray="1 1.5" />

        {/* Cada circunferencia lleva su clase porque cada una se traza sola, y
            en orden: primero la que define el arco grande. Si aquí cambian los
            radios, hay que recalcular su longitud (2πr) en Portada.css. */}
        <circle className="onda-circulo-mayor" cx={MAYOR.cx} cy={MAYOR.cy} r={MAYOR.r} />
        <circle className="onda-circulo-menor" cx={MENOR.cx} cy={MENOR.cy} r={MENOR.r} />

        {/* Los radios que fijan cada arco. Verticales los dos, que es justo lo
            que hace que los empalmes no tengan esquina. */}
        <line x1={MAYOR.cx} y1={MAYOR.cy} x2={MAYOR.cx} y2={MAYOR.cy + MAYOR.r} />
        <line x1={MENOR.cx} y1={MENOR.cy} x2={MENOR.cx - MENOR.r} y2={MENOR.cy} />
      </g>

      <g className="onda-centros">
        <circle cx={MAYOR.cx} cy={MAYOR.cy} r="0.42" />
        <circle cx={MENOR.cx} cy={MENOR.cy} r="0.42" />
      </g>

      {/* El trazo definitivo, encima de todo y en el color de marca. */}
      <path className="onda-trazo" d={TRAZO} strokeLinecap="round" />

      {/* Las cotas de los dos radios, en la familia de datos. Son los únicos
          números del dibujo y son los de verdad. */}
      <text className="onda-cota" x={MAYOR.cx + 0.6} y={MAYOR.cy + 4.6}>
        r
      </text>
      <text className="onda-cota" x={MENOR.cx - 2.9} y={MENOR.cy - 0.5}>
        r/2
      </text>
    </svg>
  )
}
