/**
 * La barra toma la zona y la hora del día de lo que tiene debajo, y marca la
 * sección que se está leyendo.
 *
 * El vidrio es translúcido, pero no basta: sobre la zona de plano un vidrio
 * claro se lee como una mancha blanca. Aquí solo se decide QUÉ zona hay
 * debajo; el color lo resuelven los tokens de `.zona-cielo`, `.zona-plano` y
 * `.hora-*`, así que la barra no conoce ningún color.
 *
 * Tres preguntas, cada una con su franja:
 *
 * - **La barra**, una franja fina a la altura de la cápsula y a todo lo ancho:
 *   la sección que pasa por debajo da el tono al velo.
 * - **El logo, la cápsula y cada enlace**, cada uno lo que tiene detrás: un
 *   punto en su centro, a la altura de las letras. Dentro de una sección
 *   clara pasan tarjetas oscuras, y cada pieza tiene que reaccionar a su
 *   propio fondo, no a la sección: con el canto de una tarjeta cruzando la
 *   cápsula, «Nosotros» puede ir en blanco y «Servicios» en tinta. La cápsula
 *   solo tiñe su indicador; las letras son de cada enlace. Manda el centro y
 *   no un canto: el canto cambiaba el color en cuanto el fondo nuevo asomaba,
 *   y si la página se detenía ahí, las letras quedaban en el color de un
 *   fondo que aún no tenían detrás (blanco sobre blanco, bajo la cabecera de
 *   un artículo).
 * - **La sección actual**, a un tercio de la pantalla, para `aria-current`.
 *   Detrás del vidrio no sirve: al saltar a un ancla, `scroll-padding` deja
 *   el final de la sección anterior bajo la barra y se marcaría el enlace
 *   equivocado. El lector de pantalla anuncia el enlace como la ubicación
 *   actual y el indicador de la cápsula (Barra.css) descansa sobre él.
 */

// Recuerda TODOS los elementos dentro de la franja, también los que salen:
// bajando despacio el scroll retrocede a veces unos píxeles, y si solo se
// atendiera a los que entran, se quedaría con uno que ya se fue. El Set guarda
// el orden de entrada, así que el último es el que acaba de asomar.
//
// Pero manda el más hondo: lo que está dentro de otro se pinta encima. Una
// tarjeta puede asomar antes que su sección —las cards de /servicios suben
// sobre el fundido de la cabecera— y la sección, al entrar después, no puede
// quitarle la barra.
function masHondo(elementos) {
  return elementos.filter((elemento) => !elementos.some((otro) => otro !== elemento && elemento.contains(otro))).at(-1)
}

function vigilarFranja(elementos, rootMargin, alCambiar) {
  const enLaFranja = new Set()
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) enLaFranja.add(target)
        else enLaFranja.delete(target)
      })
      alCambiar(masHondo([...enLaFranja]))
    },
    { rootMargin }
  )
  elementos.forEach((elemento) => observador.observe(elemento))
  return observador
}

// Copia la zona y la hora de lo que hay detrás. Una tarjeta no lleva hora
// propia: la hereda de su sección. Una franja de día dentro de una sección
// (`.alba`) sí la lleva, y manda la suya; el final del fundido de una
// cabecera no lleva ninguna, porque ya es el blanco de la página.
function tomarZona(destino, debajo) {
  if (!debajo) return
  const plano = debajo.classList.contains('zona-plano')
  destino.classList.toggle('zona-plano', plano)
  destino.classList.toggle('zona-cielo', !plano)
  const esHora = (clase) => clase.startsWith('hora-')
  destino.classList.remove(...[...destino.classList].filter(esHora))
  // Sobre la nube fija de la home (Portada.css) el cielo detrás de la barra es
  // siempre el azul hondo: lo dice la sección con `data-barra`.
  const hora =
    debajo.closest('[data-barra]')?.dataset.barra ??
    [...(debajo.closest('.hora-dia, .cabecera-fundido, .seccion, .pie')?.classList ?? [])].find(esHora)
  if (hora) destino.classList.add(hora)
}

// El margen negativo recorta la pantalla hasta dejar un punto de 1 px en el
// centro de la pieza: manda el fondo que tienen detrás sus letras, no el
// canto de una tarjeta que apenas roza un extremo. La barra es fija arriba,
// así que el punto solo se mueve al cambiar el tamaño de la ventana; una
// pieza oculta (la cápsula en S) no mide nada y no se vigila.
function vigilarDetras(pieza, fondos) {
  let observador
  const medir = () => {
    observador?.disconnect()
    const caja = pieza.getBoundingClientRect()
    if (!caja.width) return
    const { clientWidth: ancho, clientHeight: alto } = document.documentElement
    const x = Math.round((caja.left + caja.right) / 2)
    const y = Math.round((caja.top + caja.bottom) / 2)
    const punto = [y, ancho - x - 1, alto - y - 1, x].map((px) => `${-px}px`).join(' ')
    observador = vigilarFranja(fondos, punto, (debajo) => tomarZona(pieza, debajo))
  }
  medir()
  addEventListener('resize', medir)
}

// La gota de la cápsula (Barra.css) va al enlace que se señala, con el cursor
// o con el teclado, y si no hay ninguno al de la página o la sección actual.
// Aquí solo se mide: la cápsula recibe los bordes del enlace y hacia dónde
// viaja, y el CSS hace el resto. Con el dedo no viaja: un toque no señala, y
// la gota iría y volvería con cada roce al desplazar.
function initGota(capsula) {
  const enlaces = [...capsula.querySelectorAll('.barra-enlaces a')]
  let donde
  let bajoElCursor

  // En la sección de contacto de una página de servicio hay dos actuales, la
  // página y la sección: manda la sección, que es la última.
  const actual = () => enlaces.findLast((enlace) => enlace.hasAttribute('aria-current'))

  const ir = (enlace) => {
    // Mientras la gota está en otro enlace, el actual lleva la gotita.
    const casa = actual()
    enlaces.forEach((otro) => otro.toggleAttribute('data-gotita', otro === casa && otro !== enlace))
    // Un enlace oculto (el contacto en S) no mide nada: la gota se apaga ahí
    // mismo.
    if (!enlace?.offsetWidth) {
      capsula.dataset.gota = 'oculta'
      donde = undefined
      return
    }
    // Viaja solo de un enlace a otro: si estaba apagada, aparece en su sitio.
    if (!donde) delete capsula.dataset.hacia
    else if (enlace !== donde) {
      capsula.dataset.hacia = enlaces.indexOf(enlace) > enlaces.indexOf(donde) ? 'derecha' : 'izquierda'
    }
    capsula.style.setProperty('--gota-izq', `${enlace.offsetLeft}px`)
    capsula.style.setProperty('--gota-der', `${capsula.clientWidth - enlace.offsetLeft - enlace.offsetWidth}px`)
    capsula.dataset.gota = 'visible'
    donde = enlace
  }

  const reposar = () => ir(bajoElCursor ?? capsula.querySelector('a:focus-visible') ?? actual())

  capsula.addEventListener('pointerover', ({ target, pointerType }) => {
    if (pointerType === 'touch') return
    bajoElCursor = target.closest('a') ?? bajoElCursor
    reposar()
  })
  capsula.addEventListener('pointerleave', () => {
    bajoElCursor = undefined
    reposar()
  })
  capsula.addEventListener('focusin', reposar)
  capsula.addEventListener('focusout', ({ relatedTarget }) => {
    if (!capsula.contains(relatedTarget)) ir(bajoElCursor ?? actual())
  })
  // Los enlaces cambian de ancho al cargar la letra y en cada punto de
  // quiebre, y con ellos la cápsula.
  new ResizeObserver(reposar).observe(capsula)

  reposar()
  return reposar
}

export default function initBarra() {
  const barra = document.querySelector('.barra')
  const zonas = document.querySelectorAll('.seccion, .pie')
  if (!barra || !zonas.length) return

  const reposarGota = initGota(barra.querySelector('.barra-capsula'))

  // La lente (Barra.jsx) va en `backdrop-filter`, y un filtro SVG ahí solo lo
  // pinta Chromium. CSS no puede preguntarlo —`@supports` dice que sí también
  // donde no se pinta— y `userAgentData` solo existe en Chromium.
  if (navigator.userAgentData) barra.classList.add('barra-refracta')

  vigilarFranja(zonas, '-4% 0px -95% 0px', (debajo) => tomarZona(barra, debajo))

  // La franja va en cada cabecera desde aquí y no en cada página: así ninguna
  // cabecera nueva se queda sin ella. Va antes de buscar los fondos.
  document
    .querySelectorAll('.cabecera-cielo')
    .forEach((cabecera) => cabecera.append(Object.assign(document.createElement('div'), { className: 'cabecera-fundido' })))

  const fondos = document.querySelectorAll('.seccion, .seccion :is(.zona-plano, .hora-dia, .cabecera-fundido), .pie')
  barra
    .querySelectorAll('.barra-marca, .barra-capsula, .barra-enlaces a')
    .forEach((pieza) => vigilarDetras(pieza, fondos))

  // Solo las secciones que tienen enlace: fuera de ellas no se marca ninguno.
  // El enlace a otra página no es una sección: su `aria-current` viene del HTML.
  const enlaces = [...barra.querySelectorAll('.barra-enlaces a[href*="#"]')]
  const destinos = enlaces.map((enlace) => document.getElementById(enlace.hash.slice(1)))
  vigilarFranja(destinos.filter(Boolean), '-33% 0px -66% 0px', (actual) => {
    enlaces.forEach((enlace, i) => {
      if (destinos[i] && destinos[i] === actual) enlace.setAttribute('aria-current', 'location')
      else enlace.removeAttribute('aria-current')
    })
    reposarGota()
  })
}
