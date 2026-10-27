// moby-duck y el puro: da una calada sacando pecho para hacerse el duro, el
// puro le gana: tose sin control, el ceño se le da vuelta y llora a chorros.
// Se seca con el antebrazo, vuelve a sacar pecho y otra calada. La usan la
// lámina v17 (puro.mjs) y la escena 2, donde no llora `antes` de la calada:
// después le queda el llanto de siempre.

import { el } from './tres.mjs'
import { RAMPAS as C, MOBY_H, MOBY_TORSO, hueso, humareda, mobyCabeza } from './modelos.mjs'
import { figura, pMoby } from './cuerpos.mjs'

const sum = (a, b) => a.map((v, i) => v + b[i])
const esc = (a, k) => a.map((v) => v * k)
const lerp = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k)
const uni = (a) => esc(a, 1 / Math.hypot(...a))
const suave = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))
const tramo = (t, a, b) => suave((t - a) / (b - a))
const enCabeza = (d) => sum(MOBY_H, d)

// Toses: rápidas al principio, se van espaciando.
const TOSES = [5, 6.1, 7.0, 7.8, 8.6, 9.5, 10.5, 11.7, 13.2]
const golpe = (t) => TOSES.reduce((m, tc) => (t >= tc ? Math.max(m, Math.exp(-(t - tc) * 2.4)) : m), 0)

// En el pico el puro apunta al frente y arriba, de matón; la mano lo toma por la boquilla.
const DIR_PICO = uni([0.75, 0.2, -0.6])
const MANO_EN_PICO = sum(enCabeza([1.2, -0.32, -0.15]), esc(DIR_PICO, 0.3))
// La otra mano: el puño a la boca al toser.
const BOCA = enCabeza([1.2, -0.62, 0.5])

// La escena en cuadros de 0 a 24.
export const calada = (t, { antes = 0.4 } = {}) => {
  const tos = tramo(t, 4.6, 5.2) * (1 - tramo(t, 14, 16))
  const pena = tramo(t, 5, 7) * (1 - tramo(t, 18, 21))
  const llanto = antes + (1 - antes) * tramo(t, 5.5, 7.5) - 0.6 * tramo(t, 17, 21)
  const g = golpe(t)
  const enPico = suave(1 - tramo(t, 3, 4.6) + tramo(t, 21, 23.5))
  // Al secarse pasa el antebrazo por los ojos, de un lado al otro.
  const seca = sum(enCabeza([1.0, 0.25, 0.75]), [0, 0, -1.3 * tramo(t, 16.5, 19)])
  const otra = t < 15.5 ? lerp(pMoby.reposo(1), BOCA, tramo(t, 5, 6.2) * (1 - tramo(t, 14, 15.5))) : lerp(lerp(pMoby.reposo(1), seca, tramo(t, 15.5, 16.5)), pMoby.reposo(1), tramo(t, 19, 21))
  // Saca pecho al chupar y al recuperarse; se dobla con cada tos.
  const orgullo = tramo(t, 0, 2) * (1 - tramo(t, 3, 4.6)) + tramo(t, 20.5, 22.5) * (1 - tramo(t, 23, 24))
  const brillo = Math.max(0, Math.sin((Math.min(t, 3) / 3) * Math.PI))
  const puro = (b) => {
    const dir = uni(lerp([1, 0.2, 0.1], DIR_PICO, enPico))
    const punta = sum(b.mano, esc(dir, 0.62))
    return [
      hueso(sum(b.mano, esc(dir, -0.3)), punta, 0.12, C.puro),
      hueso(sum(b.mano, esc(dir, 0.3)), sum(b.mano, esc(dir, 0.36)), 0.135, C.oro),
      el(punta, esc([0.08, 0.08, 0.08], 1 + 0.7 * brillo), C.naranja, { flat: brillo > 0.4 ? '#ffd04a' : '#ff7a2a', brilla: true }),
      ...(enPico < 0.5 ? humareda(punta, t / 12) : []),
    ]
  }
  // Una bocanada por tos, que sale del pico y se deshace.
  const humo = TOSES.filter((tc) => t >= tc && t - tc < 3.5).map((tc) => {
    const a = t - tc
    return el(sum(enCabeza([1.55, -0.25, 0]), [0.42 * a, 0.12 * a + 0.04 * a * a, -0.06 * a]), esc([0.17, 0.14, 0.16], 1 + 0.5 * a - 0.12 * a * a), C.humo)
  })
  const p = { ...pMoby, mano: (b, s) => [...pMoby.mano(b, s), ...(s < 0 ? puro(b) : [])], dobla: (s) => (s > 0 && t > 15.5 && t < 20 ? [-0.3, -1, 0.6] : pMoby.dobla(s)) }
  return figura(p, {
    tronco: [...MOBY_TORSO, ...mobyCabeza({ t, abre: Math.max(g * tos, 0.25 * brillo), pena, llanto, puroEnPico: false }), ...humo],
    manos: { 1: otra, [-1]: lerp(pMoby.reposo(-1), MANO_EN_PICO, enPico) },
    inclina: 5 * orgullo - (10 + 8 * g) * tos,
    salto: 0.06 * orgullo - 0.05 * g * tos,
  })
}
