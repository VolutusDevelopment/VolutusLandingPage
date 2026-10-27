// Los cazas de la escena 9: el F-15EX perla de duke y el A-10 negro de moby
// (pilotos/interiores.mjs), con su tren de aterrizaje, la cúpula que se abre
// y la alarma de combustible, que tiñe de rojo la cabina.
//
// Cada caza va en sus metros (morro hacia +x, ruedas en `suelo`) y su piloto,
// en unidades de pato a la escala `k` de la cabina; enCabina() las lleva a
// los metros del caza.

import { el } from '../pilotos/tres.mjs'
import { RAMPAS as C, ambos, hueso } from '../pilotos/modelos.mjs'
import { CABINAS, aCaza, avion, cabinaCon, conCupula } from '../pilotos/interiores.mjs'
import { TREN as TREN_F15 } from '../escena3/caza.mjs'

// Las ruedas principales cuelgan de las góndolas bajo el ala; la de proa, bajo el cañón.
const TREN_A10 = [
  hueso([6.5, -0.4, 0.3], [6.5, -1.8, 0.3], 0.07, C.grisOscuro),
  el([6.5, -1.8, 0.3], [0.3, 0.3, 0.12], C.negro),
  ...ambos((s) => [hueso([1.2, -1.1, s * 2.9], [1.2, -1.75, s * 2.9], 0.09, C.grisOscuro), el([1.2, -1.75, s * 2.9], [0.35, 0.35, 0.15], C.negro)]).flat(),
]

// `hueco(p)`, en metros del caza, abre el fuselaje donde dé verdadero: por
// ahí se ve lo que haya dentro (el reflejo de duke).
const conHueco = (formas, hueco) => (hueco ? formas.map((f) => (f.k === 'm' ? { ...f, hueco: (p) => f.hueco?.(p) || hueco(p) } : f)) : formas)

const armar = (nombre, tren, suelo) => {
  const cfg = { ...CABINAS[nombre] }
  cfg.avion = avion(cfg)
  const enCabina = (p) => aCaza(cfg, p)
  const cupula = cfg.caza.find((f) => f.vidrio)
  // El rojo de la alarma llena la cúpula.
  const alarma = el(cupula.c, cupula.r.map((r) => r * 1.08), null, { luz: { color: '#ff2a1a', alfa: 0.8, nivel: 3 } })
  return {
    suelo,
    k: cfg.k,
    enCabina,
    // `piloto`, la figura sentada; `cupula`, los grados que tiene abierta; sin
    // `motor`, con las toberas apagadas (las estelas son las formas con luz).
    caza: ({ piloto = [], cupula: abre = 0, motor = false, tren: conTren = !motor, alarma: prendida = false, hueco } = {}) => [
      ...conHueco(cabinaCon(conCupula(cfg, abre), piloto), hueco).filter((f) => motor || !f.luz),
      ...(conTren ? tren : []),
      ...(prendida ? [alarma] : []),
    ],
  }
}

export const DUKE = armar('duke', TREN_F15, -2.2)
export const MOBY = armar('moby-duck', TREN_A10, -2.1)
