// La hoja de las pasadas de /patos (src/lib/cazas.js): cada caza de perfil,
// un poco desde abajo, con la postcombustión encendida; el A-10 de Moby no
// tiene, y pasa con su llama de siempre. Una fila por caza y una columna por
// cada largo de la llama, para que parpadee.
//
//   node scripts/operacion-venganza/combate/pasadas.mjs
//
// Se corre a mano cuando cambia un caza, como sprites.mjs.

import { marco } from '../pilotos/tres.mjs'
import { cerrarGpu } from '../pilotos/gpu.mjs'
import { ALAS_TOMCAT, CAZA_DUCK_ONE, CAZA_DUKE, CAZA_DUKY, CAZA_MOBY, POSTCOMBUSTION_HORNET, POSTCOMBUSTION_TOMCAT, barrerAlas } from '../pilotos/modelos.mjs'
import { escribir, pixel3dGpu, png, rejilla } from '../tiras.mjs'
import { LLAMAS, PASADA, PASADAS, rutaDePasadas } from '../../../src/lib/cazas.js'

const sinLlama = (caza) => caza.filter((f) => !f.luz)

const MODELOS = {
  // El Tomcat, con las alas barridas, como va a toda velocidad.
  'duck-one': [...barrerAlas(sinLlama(CAZA_DUCK_ONE), ALAS_TOMCAT.barridas), ...POSTCOMBUSTION_TOMCAT],
  moby: CAZA_MOBY,
  duke: [...sinLlama(CAZA_DUKE), ...POSTCOMBUSTION_HORNET],
  duky: CAZA_DUKY,
}
const CAZAS = PASADAS.map((nombre) => MODELOS[nombre])

// Estira la llama desde la tobera: las estelas y los diamantes se alejan de
// ella `k` veces.
const estirar = (formas, k) => {
  const luces = formas.filter((f) => f.luz)
  const tobera = Math.max(...luces.flatMap((f) => (f.k === 'e' ? [] : f.tris.flatMap((t) => [t.a[0], t.b[0], t.c[0]]))))
  const p = ([x, y, z]) => [tobera + (x - tobera) * k, y, z]
  return formas.map((f) => {
    if (!f.luz) return f
    if (f.k === 'e') return { ...f, c: p(f.c) }
    return { ...f, centro: p(f.centro), radio: f.radio * Math.max(1, k), tris: f.tris.map((t) => ({ ...t, a: p(t.a), b: p(t.b), c: p(t.c) })) }
  })
}

// Todos con la misma escala y centrados en el cuerpo, la llama hacia la
// izquierda; al final se recorta lo que sobra alrededor de todos los cuadros.
const RADIO = 20
const N = Math.round((2 * RADIO * PASADA.pixelesPorMetro) / 0.94)
const cuadros = []
for (const caza of CAZAS) {
  const encuadre = { c: marco(caza).c, radio: RADIO }
  for (const k of LLAMAS) cuadros.push(rejilla(await pixel3dGpu(estirar(caza, k), { giro: 90, altura: PASADA.altura }, N, encuadre), N))
}
const lleno = (eje) => cuadros.flatMap((c) => c.flatMap((fila, y) => fila.flatMap((color, x) => (color ? [eje ? y : x] : []))))
const [x0, x1, y0, y1] = [Math.min(...lleno(0)), Math.max(...lleno(0)), Math.min(...lleno(1)), Math.max(...lleno(1))]
const recortados = cuadros.map((c) => c.slice(y0, y1 + 1).map((fila) => fila.slice(x0, x1 + 1)))

const hoja = []
CAZAS.forEach((_, fila) => recortados[0].forEach((_, y) => hoja.push(LLAMAS.flatMap((_, k) => recortados[fila * LLAMAS.length + k][y]))))
escribir(rutaDePasadas, png([hoja]))

await cerrarGpu()
