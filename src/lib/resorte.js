/**
 * Un paso de `dt` s de algo que sigue al scroll (`meta`), `arrastre` s detrás
 * de él: la cámara de la portada (lib/volutus.js), el sol de /nosotros y el
 * recorte de la nube en la vitrina de Proyectos (nubes.js). Es un cuerpo con
 * masa tirado por un resorte con amortiguación crítica: arranca y frena sin
 * golpes, porque su velocidad `v` nunca cambia de golpe, y no se pasa de
 * largo. Es la solución exacta del resorte, estable con cualquier paso.
 */
export function arrastrar({ x, v }, meta, dt, arrastre = 0.15) {
  const w = 2 / arrastre
  const lejos = x - meta
  const empuje = v + w * lejos
  const decae = Math.exp(-w * dt)
  return { x: meta + (lejos + empuje * dt) * decae, v: (v - w * empuje * dt) * decae }
}
