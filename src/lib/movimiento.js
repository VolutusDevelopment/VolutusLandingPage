/**
 * Movimiento reducido, por cualquiera de sus dos vías: quien lo tiene
 * configurado en el sistema operativo y quien lo pide en el panel de
 * accesibilidad de esta página (`data-movimiento` en <html>).
 *
 * Se consulta en el momento y no se guarda: el panel lo puede cambiar con la
 * página abierta.
 */
export const quieto = () =>
  document.documentElement.dataset.movimiento === 'reducido' ||
  matchMedia('(prefers-reduced-motion: reduce)').matches
