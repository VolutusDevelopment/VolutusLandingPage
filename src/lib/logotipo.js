/**
 * Geometría del logotipo: la palabra y la ola en una sola pieza.
 *
 * Las letras son Archivo 800 itálica convertida a trazo, así que el logotipo
 * no depende de cargar esa fuente. Salen de un script, no de la mano: no
 * editarlas a ojo. `LETRAS` va letra por letra, V-O-L-U-T-U-S. La O lleva su
 * contraforma en el mismo trazo: separada, el hueco se pintaría lleno encima
 * de la letra.
 *
 * La ola es también el símbolo: tres líneas que corren paralelas y se enrollan
 * en voluta, cada una 240° alrededor del mismo centro. Se dibuja en la rejilla
 * de 64 del favicon (`OLA`), y el logotipo la lleva 2.5 veces más grande junto
 * a la S (`OLA_DEL_LOGOTIPO`): la línea de abajo apoya en la línea de base
 * (y = 170) y la cola queda a 5 unidades de la letra. Es un trazo de punta
 * redonda, así que el mismo dibujo sirve de los 16 px de la pestaña al ancho
 * entero del pie.
 */

export const LETRAS = [
  'M41.5 170.0 28.9 101.3H47.4L52.7 136.5Q53.0 138.7 53.4 141.3Q53.8 144.1 54.1 146.6Q54.5 149.1 54.7 151.0H55.3Q56.4 148.7 57.7 146.0Q59.0 143.4 60.3 140.8Q61.6 138.2 62.6 136.1L80.0 101.3H99.0L62.3 170.0Z',
  'M135.8 171.2Q125.7 171.2 118.5 168.1Q111.4 165.1 107.6 159.0Q103.9 153.0 103.9 144.0Q103.9 141.7 104.1 139.4Q104.4 137.2 104.8 134.9Q106.7 123.6 111.8 115.9Q117.0 108.1 125.4 104.1Q133.9 100.1 145.7 100.1Q155.9 100.1 163.0 103.1Q170.2 106.1 173.9 112.3Q177.7 118.4 177.7 127.5Q177.7 129.6 177.5 131.8Q177.3 134.0 176.9 136.2Q175.0 147.5 169.7 155.3Q164.5 163.1 156.0 167.1Q147.5 171.2 135.8 171.2ZM136.7 157.2Q141.2 157.2 144.8 155.8Q148.4 154.5 151.0 152.0Q153.7 149.5 155.4 145.9Q157.2 142.3 158.0 137.7Q158.4 135.4 158.6 133.8Q158.9 132.2 159.0 131.1Q159.2 130.1 159.2 129.3Q159.3 128.7 159.3 128.0Q159.3 123.6 157.6 120.5Q156.0 117.4 152.7 115.7Q149.5 114.1 144.7 114.1Q140.3 114.1 136.7 115.3Q133.1 116.6 130.4 119.2Q127.8 121.8 126.0 125.4Q124.3 129.0 123.5 133.5Q123.1 135.9 122.8 137.5Q122.6 139.1 122.5 140.1Q122.4 141.2 122.3 141.8Q122.3 142.6 122.3 143.3Q122.3 147.6 123.9 150.7Q125.5 153.8 128.7 155.5Q131.9 157.2 136.7 157.2Z',
  'M188.8 170.0 200.9 101.3H218.8L209.3 155.3H243.7L241.1 170.0Z',
  'M289.9 171.2Q276.3 171.2 268.7 165.6Q261.1 160.1 261.1 149.1Q261.1 147.6 261.2 146.0Q261.4 144.4 261.7 142.7L269.0 101.3H286.9L279.6 142.9Q279.5 143.7 279.3 144.7Q279.2 145.7 279.2 146.6Q279.2 151.6 282.1 154.3Q285.0 157.2 290.9 157.2Q297.7 157.2 301.9 153.3Q306.2 149.6 307.4 143.0L314.8 101.3H332.7L325.2 143.9Q323.6 153.0 319.0 159.1Q314.4 165.2 307.1 168.2Q299.8 171.2 289.9 171.2Z',
  'M358.6 170.0 368.2 116.0H345.9L348.5 101.3H411.0L408.4 116.0H386.1L376.6 170.0Z',
  'M447.7 171.2Q434.1 171.2 426.5 165.6Q418.9 160.1 418.9 149.1Q418.9 147.6 419.0 146.0Q419.2 144.4 419.5 142.7L426.8 101.3H444.7L437.4 142.9Q437.3 143.7 437.1 144.7Q437.0 145.7 437.0 146.6Q437.0 151.6 439.9 154.3Q442.8 157.2 448.7 157.2Q455.5 157.2 459.7 153.3Q464.0 149.6 465.2 143.0L472.6 101.3H490.5L483.0 143.9Q481.4 153.0 476.7 159.1Q472.2 165.2 464.9 168.2Q457.6 171.2 447.7 171.2Z',
  'M529.3 171.2Q522.9 171.2 517.3 170.2Q511.7 169.3 507.5 167.2Q503.4 165.2 501.0 161.7Q498.7 158.3 498.7 153.3Q498.7 151.9 498.9 150.2Q499.1 148.6 499.5 147.3H516.8Q516.6 148.0 516.4 148.9Q516.2 149.8 516.2 150.5Q516.2 153.0 517.7 154.5Q519.2 156.1 521.9 156.8Q524.6 157.5 528.2 157.5Q531.1 157.5 533.5 157.1Q536.0 156.7 537.8 155.8Q539.7 155.1 540.7 153.7Q541.8 152.3 541.8 150.3Q541.8 148.4 540.4 147.1Q539.0 145.8 536.6 144.8Q534.3 143.9 531.3 143.1Q528.4 142.4 525.2 141.5Q521.6 140.5 518.0 139.2Q514.4 137.9 511.5 135.9Q508.6 133.9 506.8 130.8Q505.1 127.8 505.1 123.4Q505.1 117.1 507.7 112.7Q510.3 108.4 514.7 105.5Q519.1 102.7 524.6 101.4Q530.2 100.1 536.1 100.1Q542.0 100.1 547.0 101.1Q552.1 102.1 555.8 104.1Q559.6 106.3 561.7 109.5Q563.8 112.6 563.8 117.1Q563.8 118.0 563.7 119.0Q563.6 120.1 563.3 121.9H546.2Q546.4 121.1 546.4 120.6Q546.4 120.1 546.4 119.8Q546.4 116.9 543.9 115.1Q541.4 113.3 536.5 113.3Q532.6 113.3 529.7 114.1Q526.9 115.0 525.4 116.4Q523.9 117.9 523.9 119.9Q523.9 121.4 524.8 122.5Q525.8 123.6 527.5 124.4Q529.2 125.3 531.4 126.0Q533.7 126.6 536.4 127.3Q540.3 128.3 544.5 129.5Q548.8 130.8 552.5 132.9Q556.2 135.0 558.4 138.2Q560.7 141.5 560.7 146.3Q560.7 152.8 558.1 157.5Q555.5 162.2 551.0 165.2Q546.6 168.3 541.0 169.7Q535.4 171.2 529.3 171.2Z',
]

/** El logotipo entero, de la V a la punta de la voluta, que se alza sobre las letras. */
export const VIEWBOX = '28 53 662 119'

/**
 * La ola en la rejilla de 64: cada línea sale de x = `cola`, corre hasta
 * debajo de `centro` a la distancia de su radio y gira por la derecha hacia
 * arriba, `giro` radianes.
 */
export const OLA = { cola: 10, centro: [33, 32], radios: [21, 13, 5], giro: (4 * Math.PI) / 3, grosor: 4.5 }

const ESCALA = 2.5
const [DX, DY] = [549, 31.875]

export const OLA_DEL_LOGOTIPO = {
  ...OLA,
  cola: DX + ESCALA * OLA.cola,
  centro: [DX + ESCALA * OLA.centro[0], DY + ESCALA * OLA.centro[1]],
  radios: OLA.radios.map((r) => ESCALA * r),
  grosor: ESCALA * OLA.grosor,
}

/** Las tres líneas de una ola en un solo trazo SVG. */
export function trazoDe({ cola, centro: [x, y], radios, giro }) {
  const redondo = (n) => Math.round(n * 100) / 100
  return radios
    .map((r) => `M${cola} ${y + r}H${x}A${r} ${r} 0 1 0 ${redondo(x + r * Math.sin(giro))} ${redondo(y + r * Math.cos(giro))}`)
    .join('')
}
