/**
 * Movimiento reducido, tal como lo tiene configurado el sistema operativo.
 *
 * Se consulta en el momento y no se guarda: se puede cambiar con la página
 * abierta.
 */
export const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches
