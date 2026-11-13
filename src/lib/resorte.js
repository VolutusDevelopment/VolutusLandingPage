/**
 * Un paso de `dt` s de algo que sigue al scroll (`meta`), `arrastre` s detrás
 * de él: la cámara de la portada (lib/volutus.js), el sol de /nosotros y el
 * recorte de la nube en la vitrina de Proyectos (nubes.js). Es un cuerpo con
 * masa tirado por un resorte: arranca y frena sin golpes, porque su velocidad
 * `v` nunca cambia de golpe. Con `amortiguacion` en 1 (crítica) no se pasa de
 * largo; por debajo de 1 se pasa un poco y vuelve, como un resorte. Es la
 * solución exacta del resorte, estable con cualquier paso.
 */
export function arrastrar({ x, v }, meta, dt, arrastre = 0.15, amortiguacion = 1) {
  const w = 2 / arrastre
  const lejos = x - meta
  if (amortiguacion >= 1) {
    const empuje = v + w * lejos
    const decae = Math.exp(-w * dt)
    return { x: meta + (lejos + empuje * dt) * decae, v: (v - w * empuje * dt) * decae }
  }
  const z = amortiguacion
  const oscila = w * Math.sqrt(1 - z * z)
  const decae = Math.exp(-z * w * dt)
  const [cos, sen] = [Math.cos(oscila * dt), Math.sin(oscila * dt)]
  return {
    x: meta + decae * (lejos * cos + ((v + z * w * lejos) / oscila) * sen),
    v: decae * (v * cos - ((z * w * v + w * w * lejos) / oscila) * sen),
  }
}
