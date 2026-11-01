/**
 * La barra toma la zona y la hora del día de lo que tiene debajo, y marca la
 * sección que se está leyendo.
 *
 * El vidrio es translúcido, pero no basta: sobre la zona de plano un vidrio
 * claro se lee como una mancha blanca. Aquí solo se decide QUÉ zona hay
 * debajo; el color lo resuelven los tokens de `.zona-cielo`, `.zona-plano` y
 * `.hora-*`, así que la barra no conoce ningún color.
 *
 * Cuatro preguntas, cada una con su franja:
 *
 * - **La barra**, una franja fina a la altura de la cápsula y a todo lo ancho:
 *   la sección que pasa por debajo da el tono al velo.
 * - **El logo y la cápsula**, cada uno lo que tiene detrás: un punto en su
 *   centro, a la altura de las letras. Dentro de una sección clara pasan
 *   tarjetas oscuras, y cada pieza tiene que reaccionar a su propio fondo, no
 *   a la sección. Manda el centro y no un canto: el canto cambiaba el color en
 *   cuanto el fondo nuevo asomaba, y si la página se detenía ahí, la pieza
 *   quedaba en el color de un fondo que aún no tenía detrás.
 * - **Las letras de la cápsula**, columna a columna (ver `initLectura`): cada
 *   letra toma el color que pide lo que tiene detrás, aunque cambie a mitad
 *   de una palabra, y el vidrio se aclara u oscurece bajo ella.
 * - **La sección actual**, a un tercio de la pantalla, para `aria-current`.
 *   Detrás del vidrio no sirve: al saltar a un ancla, `scroll-padding` deja
 *   el final de la sección anterior bajo la barra y se marcaría el enlace
 *   equivocado. El lector de pantalla anuncia el enlace como la ubicación
 *   actual y el indicador de la cápsula (Barra.css) descansa sobre él.
 */

// Recuerda TODOS los elementos dentro de la franja, también los que salen:
// bajando despacio el scroll retrocede a veces unos píxeles, y si solo se
// atendiera a los que entran, se quedaría con uno que ya se fue.
//
// De los que están, manda el que se pinta encima: el último en el orden del
// documento, en el que llegan los `elementos`. Lo que está dentro de otro va
// después de él —las cards de /servicios suben sobre el fundido de la
// cabecera—, y de dos hermanos que se montan, el segundo tapa al primero: el
// formulario claro del contacto sobre el borde de su tarjeta oscura. Por orden
// de llegada mandaba la tarjeta al subir, que asoma después, y la barra iba en
// blanco sobre el formulario blanco.
function vigilarFranja(elementos, rootMargin, alCambiar) {
  const enLaFranja = new Set()
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) enLaFranja.add(target)
        else enLaFranja.delete(target)
      })
      alCambiar(
        [...elementos].findLast((elemento) => enLaFranja.has(elemento)),
        enLaFranja
      )
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
function initGota(capsula, alMover) {
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
      alMover()
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
    capsula.dataset.gotaEn = enlaces.indexOf(enlace)
    donde = enlace
    alMover()
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

// ---- la lectura ----
// Las letras de la cápsula no llevan un color por enlace: cada una toma el
// que pide lo que tiene detrás, y el vidrio ayuda bajo ella, más claro tras
// las letras oscuras y más oscuro tras las blancas. Así detrás del texto nunca
// queda un gris medio, donde ni el blanco ni la tinta se leen. Pasa sobre la
// nube de la portada, blanca a manchas sobre el cielo, y sobre las tarjetas de
// los proyectos, con capturas claras dentro de una lámina oscura.
//
// Se lee una franja a la altura de las letras, en columnas de `COLUMNA` px.
// Cada columna toma lo que se pinta encima en su centro, el último en el orden
// del documento, como `vigilarFranja`:
//
// - Una zona, su tono: el mismo que tomaría la barra sobre ella (`tomarZona`),
//   leído de una sonda.
// - Una imagen con `data-fondo`, su luz en ese punto: se mide una sola vez, en
//   una rejilla chica (`REJILLA`), dentro de lo que deja ver su lámina.
// - La sección sobre el cielo de la portada (`data-barra`), la nube: su pintor
//   lee la franja (`nube-linea`, nubes.js). Hasta que responde, manda el tono
//   de la sección, el del cielo. Si deja de pintar (`null`: lo que se ve es su
//   grabación), la columna es clara: letras oscuras sobre el vidrio aclarado
//   se leen sobre el cielo y sobre la nube.
//
// La luz medida cambia de tono con histéresis, para que una columna en el
// borde no parpadee, y un tramo de menos de `TRAMO` columnas se suma a su
// vecino: una letra suelta que se da vuelta se lee como ruido. Los colores van
// en Barra.css (`--letra-*`, `--vidrio-*`): aquí solo se arman los degradados.
const COLUMNA = 8
const TRAMO = 6
const REJILLA = [32, 20]

const luminancia = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
const letra = (clara) => (clara ? 'var(--letra-oscura)' : 'var(--letra-clara)')
const tinte = (clara) => (clara ? 'var(--vidrio-claro)' : 'var(--vidrio-oscuro)')

// De izquierda a derecha, `ancho` px desde `x0`: cada cambio de tono se funde
// en 10 px.
function degradado(claras, x0, ancho, color) {
  const desde = Math.floor(x0 / COLUMNA)
  const hasta = Math.min(claras.length, Math.ceil((x0 + ancho) / COLUMNA))
  const paradas = [`${color(claras[desde])} 0px`]
  for (let c = desde + 1; c < hasta; c++) {
    if (claras[c] === claras[c - 1]) continue
    const x = Math.round(c * COLUMNA - x0)
    paradas.push(`${color(claras[c - 1])} ${x - 5}px`, `${color(claras[c])} ${x + 5}px`)
  }
  return paradas.length > 1 ? `linear-gradient(to right, ${paradas.join(', ')})` : `linear-gradient(${paradas[0]} 0)`
}

function suavizar(claras) {
  for (let c = 0; c < claras.length; ) {
    let fin = c
    while (fin < claras.length && claras[fin] === claras[c]) fin++
    if (fin - c < TRAMO && fin - c < claras.length) claras.fill(c ? claras[c - 1] : claras[fin], c, fin)
    c = fin
  }
}

function initLectura(barra, fondos) {
  const capsula = barra.querySelector('.barra-capsula')
  const enlaces = [...capsula.querySelectorAll('.barra-enlaces a')]
  const tonos = new WeakMap()
  const luces = new WeakMap()
  const sonda = Object.assign(document.createElement('span'), { hidden: true })
  sonda.style.color = 'var(--texto)'
  barra.append(sonda)
  let presentes = new Set()
  let observador
  let nube
  let previas = []
  let firma = ''
  let pedido = 0

  const pedir = () => {
    pedido ||= requestAnimationFrame(leer)
  }

  // Una zona es clara si la barra, sobre ella, escribiría en tinta.
  const zonaClara = (fondo) => {
    if (!tonos.has(fondo)) {
      tomarZona(sonda, fondo)
      const [r, g, b] = getComputedStyle(sonda).color.match(/[\d.]+/g).map(Number)
      tonos.set(fondo, luminancia(r, g, b) < 0.5)
    }
    return tonos.get(fondo)
  }

  // La luz de una imagen: pintada una vez en un lienzo diminuto, que promedia
  // como el desenfoque del vidrio. Lo que se ve de ella es lo que deja su
  // lámina, el primer ancestro que recorta.
  const luzDe = (imagen) => {
    if (luces.has(imagen)) return luces.get(imagen)
    if (!imagen.complete || !imagen.naturalWidth) {
      imagen.addEventListener('load', pedir, { once: true })
      return null
    }
    const [ancho, alto] = REJILLA
    const lienzo = Object.assign(document.createElement('canvas'), { width: ancho, height: alto })
    const pincel = lienzo.getContext('2d', { willReadFrequently: true })
    pincel.drawImage(imagen, 0, 0, ancho, alto)
    const datos = pincel.getImageData(0, 0, ancho, alto).data
    const luz = Float32Array.from({ length: ancho * alto }, (_, i) => luminancia(datos[i * 4], datos[i * 4 + 1], datos[i * 4 + 2]))
    let marco = imagen.parentElement
    while (marco && getComputedStyle(marco).overflow === 'visible') marco = marco.parentElement
    const medida = { luz, marco }
    luces.set(imagen, medida)
    return medida
  }

  const conHisteresis = (c, luz) => (previas[c] === undefined ? luz > 0.5 : previas[c] ? luz > 0.45 : luz > 0.56)

  function leer() {
    pedido = 0
    const caja = capsula.getBoundingClientRect()
    if (!caja.width) return
    const y = (caja.top + caja.bottom) / 2
    const encima = fondos
      .filter((fondo) => presentes.has(fondo))
      .map((fondo) => {
        const rect = fondo.getBoundingClientRect()
        // Una imagen que aún no llega no cuenta: manda lo que tiene debajo.
        const imagen = 'fondo' in fondo.dataset ? luzDe(fondo) : undefined
        const marco = imagen?.marco?.getBoundingClientRect()
        if (imagen === null || (marco && (y < marco.top || y >= marco.bottom))) return null
        return { fondo, rect, imagen, izq: Math.max(rect.left, marco?.left ?? -Infinity), der: Math.min(rect.right, marco?.right ?? Infinity) }
      })
      .filter(Boolean)

    const claras = []
    for (let c = 0; c < Math.ceil(caja.width / COLUMNA); c++) {
      const x = caja.left + (c + 0.5) * COLUMNA
      const debajo = encima.findLast(({ izq, der }) => x >= izq && x < der)
      if (debajo?.imagen) {
        const [ancho, alto] = REJILLA
        const { rect, imagen } = debajo
        const cx = Math.min(ancho - 1, Math.floor(((x - rect.left) / rect.width) * ancho))
        const cy = Math.min(alto - 1, Math.max(0, Math.floor(((y - rect.top) / rect.height) * alto)))
        claras.push(conHisteresis(c, imagen.luz[cy * ancho + cx]))
      } else if (debajo?.fondo.hasAttribute('data-barra') && nube !== undefined) {
        claras.push(nube?.[c] === undefined ? true : conHisteresis(c, nube[c] / 255))
      } else {
        claras.push(debajo ? zonaClara(debajo.fondo) : (previas[c] ?? true))
      }
    }
    previas = claras.slice()
    suavizar(claras)

    // La gota es una capa más de vidrio, de un solo tono: clara salvo que todo
    // su enlace esté sobre oscuro. Sus letras van en el que contrasta con ella.
    const gotaEn = capsula.dataset.gota === 'visible' ? Number(capsula.dataset.gotaEn) : -1
    let gotaClara = capsula.dataset.gotaTono !== 'oscura'
    const letras = enlaces.map((enlace, i) => {
      const { offsetLeft: x0, offsetWidth: ancho } = enlace
      if (!ancho) return null
      const suyas = claras.slice(Math.floor(x0 / COLUMNA), Math.ceil((x0 + ancho) / COLUMNA))
      if (i !== gotaEn) return [degradado(claras, x0, ancho, letra), letra(suyas[suyas.length >> 1])]
      gotaClara = suyas.some(Boolean)
      return [degradado([gotaClara], 0, 1, letra), letra(gotaClara)]
    })
    const tinteNuevo = degradado(claras, 0, caja.width, tinte)
    const estado = [tinteNuevo, gotaClara, ...letras.flat()].join('|')
    if (estado === firma) return
    firma = estado
    capsula.style.setProperty('--vidrio-tinte', tinteNuevo)
    capsula.dataset.gotaTono = gotaClara ? 'clara' : 'oscura'
    letras.forEach((par, i) => {
      if (!par) return
      enlaces[i].style.setProperty('--letras', par[0])
      enlaces[i].style.setProperty('--tinta', par[1])
    })
    capsula.dataset.lectura = ''
  }

  // La franja es la línea de las letras. El pintor de la nube la recibe en
  // `barra-linea`, y la pide de nuevo (`nube-lista`) cuando monta su lienzo.
  const medir = () => {
    observador?.disconnect()
    const caja = capsula.getBoundingClientRect()
    if (!caja.width) return
    const y = Math.round((caja.top + caja.bottom) / 2)
    const linea = `${-y}px 0px ${y + 1 - document.documentElement.clientHeight}px 0px`
    observador = vigilarFranja(fondos, linea, (_, enLaLinea) => {
      presentes = enLaLinea
      pedir()
    })
    document.dispatchEvent(
      new CustomEvent('barra-linea', { detail: { x: caja.left, y: y - COLUMNA, ancho: caja.width, alto: 2 * COLUMNA, columna: COLUMNA } })
    )
  }

  addEventListener('scroll', pedir, { passive: true })
  addEventListener('resize', medir)
  new ResizeObserver(medir).observe(capsula)
  document.addEventListener('nube-lista', medir)
  document.addEventListener('nube-linea', ({ detail }) => {
    nube = detail
    pedir()
  })
  return pedir
}

export default function initBarra() {
  const barra = document.querySelector('.barra')
  const zonas = document.querySelectorAll('.seccion, .pie')
  if (!barra || !zonas.length) return

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

  const zonasDetras = '.seccion, .seccion :is(.zona-plano, .zona-cielo, .hora-dia, .cabecera-fundido), .pie'
  const fondos = document.querySelectorAll(zonasDetras)
  barra.querySelectorAll('.barra-marca, .barra-capsula').forEach((pieza) => vigilarDetras(pieza, fondos))
  const leerLetras = initLectura(barra, [...document.querySelectorAll(`${zonasDetras}, [data-fondo]`)])
  const reposarGota = initGota(barra.querySelector('.barra-capsula'), leerLetras)

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
