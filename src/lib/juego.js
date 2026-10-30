/**
 * Operación Venganza, el orden del juego: cada escena tiene su página y entre
 * ellas, en su lugar, van los niveles jugables, con sus guiones. Se juega
 * entero en una sola página (src/operacion-venganza.js): la de cada escena o
 * nivel empieza ahí y sigue hasta el final, y las escenas seguidas corren
 * como una sola.
 */

import * as nivel1 from './nivel1.js'
import * as nivel2 from './nivel2.js'
import * as nivel3 from './nivel3.js'

export const NIVELES = { 1: nivel1, 2: nivel2, 3: nivel3 }

export const PAGINAS = {
  '/operacion-venganza': { numero: 1, nombre: 'El portaaviones' },
  '/operacion-venganza/escena-2': { numero: 2, nombre: 'Patoon-4' },
  '/operacion-venganza/escena-3': { numero: 3, nombre: 'Despegue' },
  '/operacion-venganza/nivel-1': { nivel: 1, nombre: 'Duck-One' },
  '/operacion-venganza/escena-5': { numero: 5, nombre: 'Regreso' },
  '/operacion-venganza/escena-6': { numero: 6, nombre: 'Entrada' },
  '/operacion-venganza/nivel-2': { nivel: 2, nombre: 'Moby-Duck y Duke SkyDucker' },
  '/operacion-venganza/escena-9': { numero: 9, nombre: 'Retirada' },
  '/operacion-venganza/escena-10': { numero: 10, nombre: 'La última opción' },
  '/operacion-venganza/escena-11': { numero: 11, nombre: 'Preparativos' },
  '/operacion-venganza/nivel-3': { nivel: 3, nombre: 'Duky' },
  '/operacion-venganza/escena-13': { numero: 13, nombre: 'La sala de mando' },
  '/operacion-venganza/escena-14': { numero: 14, nombre: 'Último ataque' },
  '/operacion-venganza/escena-15': { numero: 15, nombre: 'El regreso del fantasma' },
  '/operacion-venganza/escena-16': { numero: 16, nombre: 'Desolación' },
}

export const ENLACES = Object.keys(PAGINAS)
export const siguienteDe = (enlace) => ENLACES[ENLACES.indexOf(enlace) + 1]

// Lo que se juega desde `enlace` hasta el final, en tramos: las escenas
// seguidas, juntas (`escenas`, sus enlaces), y cada nivel solo (`nivel`).
export const tramosDesde = (enlace) =>
  ENLACES.slice(ENLACES.indexOf(enlace)).reduce((tramos, e) => {
    const ultimo = tramos.at(-1)
    if (PAGINAS[e].nivel) tramos.push({ nivel: PAGINAS[e].nivel, enlace: e })
    else if (ultimo?.escenas) ultimo.escenas.push(e)
    else tramos.push({ escenas: [e] })
    return tramos
  }, [])
