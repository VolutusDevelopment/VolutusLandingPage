// Cénit: lo que se mueve con la mano.
//
// En la portada, una retícula de telescopio sigue al cursor con un resorte
// corto, sin pasarse, y lee hacia dónde apunta: el azimut de este a oeste por
// el sur y la altura sobre los cerros. El cielo se corre apenas al revés,
// como si uno moviera el tubo. Con el dedo no aparece: no hay cursor.
//
// En el ocular, el foco: cada objeto enfoca en un punto de la perilla y el
// campo se desenfoca según cuánto falte.
//
// Va como módulo para no chocar con las constantes de barra.js. Con el
// movimiento reducido la retícula no sigue: salta a su lugar.

const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches

function montarReticula() {
  const portada = document.querySelector('.portada')
  const reticula = portada?.querySelector('.reticula')
  if (!reticula) return
  const lectura = reticula.querySelector('.lectura')
  const cielo = portada.querySelector('.cielo-video')
  // Resorte con amortiguación crítica: llega en unos 150 ms y no se pasa.
  const OMEGA = 26
  let destino = null
  let pos = null
  let vel = { x: 0, y: 0 }
  let antes = 0
  let andando = false

  const pintar = () => {
    const { width, height } = portada.getBoundingClientRect()
    const az = Math.round(180 + (pos.x / width - 0.5) * 140)
    const alt = Math.round(6 + (1 - pos.y / height) * 80)
    reticula.style.translate = `${pos.x}px ${pos.y}px`
    lectura.textContent = `AZ ${String(az).padStart(3, '0')}°  ALT ${String(Math.max(alt, 0)).padStart(2, '0')}°`
    cielo.style.translate = `${(0.5 - pos.x / width) * 24}px ${(0.5 - pos.y / height) * 16}px`
  }

  const paso = (ahora) => {
    const dt = Math.min((ahora - antes) / 1000, 0.05)
    antes = ahora
    for (const eje of ['x', 'y']) {
      const a = OMEGA * OMEGA * (destino[eje] - pos[eje]) - 2 * OMEGA * vel[eje]
      vel[eje] += a * dt
      pos[eje] += vel[eje] * dt
    }
    pintar()
    const quieta = Math.hypot(destino.x - pos.x, destino.y - pos.y) < 0.3 && Math.hypot(vel.x, vel.y) < 2
    if (quieta) andando = false
    else requestAnimationFrame(paso)
  }

  portada.addEventListener('pointermove', (evento) => {
    if (evento.pointerType === 'touch') return
    const caja = portada.getBoundingClientRect()
    destino = { x: evento.clientX - caja.left, y: evento.clientY - caja.top }
    portada.classList.add('apuntando')
    if (!pos || quieto) {
      pos = { ...destino }
      pintar()
      return
    }
    if (andando) return
    andando = true
    antes = performance.now()
    requestAnimationFrame(paso)
  })
  portada.addEventListener('pointerleave', () => portada.classList.remove('apuntando'))
}

function montarOcular() {
  const ocular = document.querySelector('.ocular')
  if (!ocular) return
  const campo = ocular.querySelector('.campo')
  const perilla = ocular.querySelector('#foco')
  const estado = ocular.querySelector('.estado-foco')
  const enfocar = () => {
    const meta = Number(ocular.querySelector('[name="objeto"]:checked')?.dataset.foco ?? perilla.value)
    const falta = Math.abs(Number(perilla.value) - meta)
    campo.style.setProperty('--desenfoque', `${Math.min(falta * 0.22, 12).toFixed(1)}px`)
    estado.textContent = falta <= 3 ? 'Nítido' : falta <= 12 ? 'Casi' : 'Desenfocado'
  }
  ocular.addEventListener('input', enfocar)
  enfocar()
}

montarReticula()
montarOcular()
