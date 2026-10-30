// Las pantallas de carga del juego, cada una en su página para verla sola.
// `tira` son los cuadros de lado a lado, de `LADO` px (los pinta
// scripts/operacion-venganza/cargas/sprites.mjs); en el juego, que carga una
// sola vez, camina uno de ellos al azar. `escenas`, las escenas cuyas tiras
// baja su página para llenar la barra. Los marineros, en cambio, cruzan la
// pantalla: cada uno con su oficio, su toma, su altura (`alto`, en fracción
// de la vista), lo que tarda en cruzar (`s`), su desfase y su sentido. `paso`
// es lo que dura un ciclo de la tira, en segundos (0,8 si no lo dice), y
// `destellos`, dónde brillan alrededor de la cara: [x, y] en porcentaje de la
// caja.

export const LADO = 72
export const CUADROS = 8

const marinero = (k, datos) => ({ tira: `/operacion-venganza/cargas/marinero-${k}.png`, ...datos })

export const CARGAS = {
  '/operacion-venganza/carga-duck-one': { nombre: 'duck-one camina', tira: '/operacion-venganza/carga.png', escenas: [1, 2, 3] },
  '/operacion-venganza/carga-duke': {
    nombre: 'Duke camina',
    tira: '/operacion-venganza/cargas/duke.png',
    escenas: [5, 6],
    destellos: [
      [30, 12],
      [76, 8],
      [26, 40],
      [78, 24],
      [54, 0],
    ],
  },
  '/operacion-venganza/carga-moby-duck': { nombre: 'Moby camina', tira: '/operacion-venganza/cargas/moby-duck.png' },
  '/operacion-venganza/carga-duky': { nombre: 'Duky, quieto', tira: '/operacion-venganza/cargas/duky.png', quieto: true, escenas: [9, 10, 11, 13] },
  '/operacion-venganza/carga-almirante': { nombre: 'El almirante camina', tira: '/operacion-venganza/cargas/almirante.png', paso: 1.8, escenas: [14, 15, 16] },
  '/operacion-venganza/carga-marineros': {
    nombre: 'Los marineros corren',
    corredores: [
      marinero(1, { oficio: 'amarillo', giro: 90, altura: 0, alto: 0.12, s: 5.2, demora: 0, derecha: true }),
      marinero(2, { oficio: 'rojo', giro: -40, altura: 8, alto: 0.3, s: 4.4, demora: 1.6, derecha: false }),
      marinero(3, { oficio: 'verde', giro: 40, altura: 8, alto: 0.6, s: 3.8, demora: 0.8, derecha: true }),
      marinero(4, { oficio: 'morado', giro: -90, altura: 0, alto: 0.76, s: 4.8, demora: 2.4, derecha: false }),
      marinero(5, { oficio: 'amarillo', giro: -30, altura: 8, alto: 0.44, s: 6, demora: 3.2, derecha: false }),
    ],
  },
}
