/**
 * Una tarjeta que se inclina hacia el cursor, como una placa en la mano. Aquí
 * solo se escribe dónde está el puntero sobre ella; el giro y el brillo los
 * pinta el CSS de cada tarjeta con estas cuatro variables:
 *
 * - `--brillo-x` y `--brillo-y`: el punto del cursor, en % de la tarjeta.
 * - `--inclina-x` e `--inclina-y`: el giro, de `-grados / 2` a `grados / 2`.
 */
export function inclinar(tarjeta, { clientX, clientY }, grados) {
  const { left, top, width, height } = tarjeta.getBoundingClientRect()
  const x = (clientX - left) / width
  const y = (clientY - top) / height
  tarjeta.style.setProperty('--brillo-x', `${(x * 100).toFixed(1)}%`)
  tarjeta.style.setProperty('--brillo-y', `${(y * 100).toFixed(1)}%`)
  tarjeta.style.setProperty('--inclina-x', `${((0.5 - y) * grados).toFixed(2)}deg`)
  tarjeta.style.setProperty('--inclina-y', `${((x - 0.5) * grados).toFixed(2)}deg`)
}

/** La deja derecha. El brillo se queda donde estaba mientras se apaga. */
export function enderezar(tarjeta) {
  tarjeta.style.removeProperty('--inclina-x')
  tarjeta.style.removeProperty('--inclina-y')
}
