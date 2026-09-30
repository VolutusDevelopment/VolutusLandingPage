/**
 * La voluta de Fibonacci, calculada y no dibujada a mano.
 *
 * Es la construcción clásica de la voluta jónica: arcos de un cuarto de
 * circunferencia cuyos radios siguen la serie de Fibonacci (cada uno es la suma
 * de los dos anteriores, y la razón entre vecinos tiende a φ ≈ 1,618). Cada arco
 * vive en un cuadrado de lado igual a su radio; juntos forman el rectángulo
 * áureo que la portada enseña.
 *
 * El trazo no tiene esquinas por construcción: el centro de cada arco está
 * sobre el radio que termina el anterior, así que en cada empalme la tangente
 * es la misma a los dos lados.
 *
 * Todo sale de aquí —la marca, el favicon, la construcción de la portada y las
 * longitudes que usan sus animaciones— para que nadie tenga que recalcular un
 * número a mano cuando la espiral cambie.
 */

const redondear = (n) => Math.round(n * 100) / 100

/**
 * @param {number[]} radios  Radios de cada cuarto, de fuera hacia dentro.
 * @param {object}   opciones
 * @param {number}   opciones.recta  Largo de la recta de entrada, en las mismas
 *                                   unidades que los radios.
 * @param {number}   opciones.lado   Lado del cuadrado donde se encaja el dibujo.
 * @param {number}   opciones.margen Aire alrededor, para que el trazo no se corte.
 */
export function espiralFibonacci(radios, { recta = 0, lado = 24, margen = 2 } = {}) {
  // Se empieza avanzando hacia la derecha por la parte de abajo y se gira en
  // sentido antihorario: la espiral se enrolla hacia arriba y hacia dentro.
  let punto = [0, 0]
  let direccion = [1, 0]
  const puntos = [punto]
  const arcos = []

  if (recta) {
    punto = [recta, 0]
    puntos.push(punto)
  }

  for (const r of radios) {
    // La normal hacia el interior de la curva. En pantalla la y crece hacia
    // abajo, así que girar a la izquierda es (x, y) → (y, −x).
    const normal = [direccion[1], -direccion[0]]
    const centro = [punto[0] + normal[0] * r, punto[1] + normal[1] * r]
    // Un cuarto de vuelta después, el punto está donde apuntaba la dirección
    // vista desde el centro, y la nueva dirección es la normal de antes.
    const fin = [centro[0] + direccion[0] * r, centro[1] + direccion[1] * r]
    arcos.push({ centro, r, fin })
    puntos.push(fin)
    punto = fin
    direccion = normal
  }

  // Encaje: los cuartos de arco van de eje a eje, así que la caja de la curva
  // es la caja de sus extremos.
  const xs = puntos.map((p) => p[0])
  const ys = puntos.map((p) => p[1])
  const [minX, minY] = [Math.min(...xs), Math.min(...ys)]
  const ancho = Math.max(...xs) - minX
  const alto = Math.max(...ys) - minY
  const escala = (lado - margen * 2) / Math.max(ancho, alto)
  const dx = margen + ((lado - margen * 2) - ancho * escala) / 2
  const dy = margen + ((lado - margen * 2) - alto * escala) / 2
  const ajustar = ([x, y]) => [redondear((x - minX) * escala + dx), redondear((y - minY) * escala + dy)]

  const [x0, y0] = ajustar(puntos[0])
  let d = `M${x0} ${y0}`
  if (recta) {
    const [x, y] = ajustar(puntos[1])
    d += ` L${x} ${y}`
  }

  const arcosAjustados = arcos.map(({ centro, r, fin }) => {
    const radio = redondear(r * escala)
    const [x, y] = ajustar(fin)
    d += ` A${radio} ${radio} 0 0 0 ${x} ${y}`
    return { centro: ajustar(centro), r: radio, serie: r }
  })

  const longitud = recta * escala + arcosAjustados.reduce((total, { r }) => total + (Math.PI * r) / 2, 0)

  return { d, puntos: puntos.map(ajustar), arcos: arcosAjustados, longitud: Math.ceil(longitud), escala }
}

/**
 * El símbolo de Volutus. Se queda en 8·5·3·2 a propósito: los arcos 1 y 1 del
 * final completan la serie, pero a 16 px se empastan en una mancha; una vuelta
 * completa se sigue leyendo como una ola que rompe.
 */
export const VOLUTA = espiralFibonacci([8, 5, 3, 2], { recta: 5 })
