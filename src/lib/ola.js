/**
 * La ola del logotipo, para pintarla con la trama de la nube (nubes-lienzo.js).
 *
 * La ola de `TRAMAS` (lib/logotipo.js) ya es una trama: una rejilla de puntos,
 * cada uno con su radio. Aquí se lee del SVG que la página ya trae —su `d`
 * (`puntos`) y su viewBox (`caja`)— y se vuelve una textura de `celdas` ×
 * `celdas`, un texel por punto: en `a` va el área del punto, como la lee
 * `TRAMA` (radio = celda · ½ · √área), y en `r`, cuándo se dibuja, de 0 a 1.
 *
 * El orden del dibujo sale de la propia trama, no de una curva aparte. Es un
 * recorrido en anchura por los puntos grandes (área sobre `UMBRAL`), los que
 * van sobre las líneas, desde donde las tres nacen en la S: las tres primeras
 * columnas de la ola. Así cada línea avanza desde la izquierda y se enrolla en
 * voluta. Los puntos chicos, los del borde de cada línea, toman el orden de su
 * vecino grande más temprano. Las celdas vacías van con orden 0, para que la
 * textura, que se lee interpolada, no retrase a sus vecinas.
 */

const UMBRAL = 0.3
const PUNTO = /M([\d.]+) ([\d.]+)a([\d.]+)/g

export function texturaDeLaOla({ puntos, caja: [x0, y0, lado], celdas }) {
  const paso = lado / celdas
  const total = celdas * celdas
  const area = new Float32Array(total)
  // Cada punto es un círculo que empieza en su borde izquierdo: el centro
  // está un radio a la derecha.
  for (const [, x, y, r] of puntos.matchAll(PUNTO)) {
    const i = Math.floor((+x + +r - x0) / paso)
    const j = Math.floor((+y - y0) / paso)
    area[j * celdas + i] = (r / (paso / 2)) ** 2
  }

  const vecinas = (k) => {
    const i = k % celdas
    const j = (k - i) / celdas
    const lista = []
    for (let b = j - 1; b <= j + 1; b++) {
      for (let a = i - 1; a <= i + 1; a++) {
        if ((a !== i || b !== j) && a >= 0 && b >= 0 && a < celdas && b < celdas) lista.push(b * celdas + a)
      }
    }
    return lista
  }

  let primera = celdas
  area.forEach((a, k) => {
    if (a) primera = Math.min(primera, k % celdas)
  })
  const orden = new Float32Array(total).fill(Infinity)
  const cola = []
  for (let j = 0; j < celdas; j++) {
    for (let i = primera; i < primera + 3; i++) {
      const k = j * celdas + i
      if (area[k] > UMBRAL) {
        orden[k] = 0
        cola.push(k)
        break
      }
    }
  }
  for (let c = 0; c < cola.length; c++) {
    for (const n of vecinas(cola[c])) {
      if (area[n] > UMBRAL && orden[n] === Infinity) {
        orden[n] = orden[cola[c]] + 1
        cola.push(n)
      }
    }
  }

  const ordenDe = (k) => (orden[k] < Infinity ? orden[k] : Math.min(...vecinas(k).map((n) => orden[n])))
  const ordenes = Array.from(area, (a, k) => (a ? ordenDe(k) : 0))
  const ultimo = Math.max(1, ...ordenes.filter(Number.isFinite))
  const datos = new Uint8Array(total * 4)
  ordenes.forEach((o, k) => {
    datos[k * 4] = Number.isFinite(o) ? Math.round((255 * o) / ultimo) : 255
    datos[k * 4 + 3] = Math.round(255 * Math.min(area[k], 1))
  })
  return datos
}
