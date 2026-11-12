import { LineCapStyle, PDFDocument, StandardFonts, rgb, setCharacterSpacing } from 'pdf-lib'
import { FIGURAS } from '../src/lib/brief/figuras.js'
import { LETRAS, OLA_DEL_LOGOTIPO, VIEWBOX, trazoDe } from '../src/lib/logotipo.js'

/**
 * El brief en PDF, el que viaja adjunto en los dos correos (worker/brief.js):
 * una hoja A4 que se lee de corrido. Arriba, el logotipo de Volutus, la
 * referencia y quién lo llenó; después, cada parte con su figura (el libro de
 * Marca o el lápiz de Diseño, con su número) y cada pregunta con lo
 * respondido. Al pie de cada página, de quién es y en qué página va.
 *
 * Usa las fuentes estándar del PDF (Helvetica), que no se incrustan: el
 * archivo pesa unos KB. Solo saben escribir los caracteres de WinAnsi, así que
 * todo texto pasa por `escribible` y lo que no está (un emoji, un ideograma)
 * se quita: un carácter raro no puede dejar el brief sin enviar.
 */

const A4 = [595.28, 841.89]
const MARGEN = 56
const PIE = 40
const ANCHO = A4[0] - 2 * MARGEN

const color = (hex) => rgb(...[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255))
// Un color mezclado con blanco: el tono suave de las figuras.
const aclarar = (hex, cuanto) => rgb(...[1, 3, 5].map((i) => 1 - (1 - parseInt(hex.slice(i, i + 2), 16) / 255) * (1 - cuanto)))

const TINTA = color('#0f1c2b')
const SUAVE = color('#4a5a6c')
const LINEA = color('#d9e1e8')
const BLANCO = rgb(1, 1, 1)
const AREAS = {
  marca: { nombre: 'Marca', hex: '#00588d' },
  diseno: { nombre: 'Diseño', hex: '#af4000' },
}

// Los rótulos en mayúscula van con las letras separadas.
const ESPACIADO = 0.8
function rotulo(hoja, texto, opciones) {
  hoja.pushOperators(setCharacterSpacing(ESPACIADO))
  hoja.drawText(texto, opciones)
  hoja.pushOperators(setCharacterSpacing(0))
}

// Las líneas de un texto en un ancho: respeta sus saltos y corta donde haga
// falta las palabras que no caben enteras (un enlace largo).
function partir(texto, fuente, tamano, ancho) {
  const mide = (t) => fuente.widthOfTextAtSize(t, tamano)
  const lineas = []
  for (const parrafo of texto.split('\n')) {
    let linea = ''
    for (let palabra of parrafo.split(' ').filter(Boolean)) {
      while (mide(palabra) > ancho) {
        let corte = palabra.length - 1
        while (corte > 1 && mide(palabra.slice(0, corte)) > ancho) corte--
        if (linea) lineas.push(linea)
        lineas.push(palabra.slice(0, corte))
        linea = ''
        palabra = palabra.slice(corte)
      }
      const prueba = linea ? `${linea} ${palabra}` : palabra
      if (mide(prueba) <= ancho) {
        linea = prueba
      } else {
        lineas.push(linea)
        linea = palabra
      }
    }
    lineas.push(linea)
  }
  return lineas
}

export async function briefEnPdf({ titulo, nombre, empresa, correo, telefono, referencia, fecha, pasos }) {
  const pdf = await PDFDocument.create()
  const [normal, negrita, titular] = await Promise.all(
    [StandardFonts.Helvetica, StandardFonts.HelveticaBold, StandardFonts.HelveticaBoldOblique].map((f) => pdf.embedFont(f))
  )
  const juego = new Set(normal.getCharacterSet())
  const escribible = (texto) =>
    [...String(texto ?? '').normalize('NFC').replaceAll('\t', ' ')].filter((c) => c === '\n' || juego.has(c.codePointAt(0))).join('')

  pdf.setTitle(`${titulo} · ${nombre} · ${referencia}`)
  pdf.setAuthor('Volutus')
  pdf.setCreator('volutus.cl')
  pdf.setProducer('Volutus')
  pdf.setLanguage('es-CL')

  let pagina
  let y
  const nuevaPagina = () => {
    pagina = pdf.addPage(A4)
    y = A4[1] - MARGEN
  }
  // Pasa a otra página si lo que viene no cabe en esta.
  const reservar = (alto) => {
    if (y - alto < MARGEN + PIE) nuevaPagina()
  }
  const escribir = (texto, { x = MARGEN, fuente = normal, tamano, tinta = TINTA }) => {
    pagina.drawText(texto, { x, y, font: fuente, size: tamano, color: tinta })
  }
  // Un párrafo que puede seguir en la página siguiente.
  const parrafo = (texto, { fuente = normal, tamano, interlinea, tinta = TINTA }) => {
    for (const linea of partir(escribible(texto), fuente, tamano, ANCHO)) {
      reservar(interlinea)
      y -= interlinea
      escribir(linea, { fuente, tamano, tinta })
    }
  }
  const filete = (tinta = LINEA, grosor = 0.75) => {
    pagina.drawLine({ start: { x: MARGEN, y }, end: { x: A4[0] - MARGEN, y }, thickness: grosor, color: tinta })
  }

  nuevaPagina()

  // El logotipo, con su caja de 662 × 119 llevada a 18 pt de alto.
  const [vx, vy, , vAlto] = VIEWBOX.split(' ').map(Number)
  const escala = 18 / vAlto
  const origen = { x: MARGEN - vx * escala, y: y + vy * escala, scale: escala }
  pagina.drawSvgPath(LETRAS.join(''), { ...origen, color: TINTA })
  pagina.drawSvgPath(trazoDe(OLA_DEL_LOGOTIPO), {
    ...origen,
    borderColor: TINTA,
    borderWidth: OLA_DEL_LOGOTIPO.grosor,
    borderLineCap: LineCapStyle.Round,
  })
  const nombreDelBrief = escribible(titulo).toUpperCase()
  rotulo(pagina, nombreDelBrief, {
    x: A4[0] - MARGEN - negrita.widthOfTextAtSize(nombreDelBrief, 7.5) - ESPACIADO * nombreDelBrief.length,
    y: y - 6,
    font: negrita,
    size: 7.5,
    color: SUAVE,
  })
  const datosDelEnvio = escribible(`Referencia ${referencia} · ${fecha}`)
  pagina.drawText(datosDelEnvio, { x: A4[0] - MARGEN - normal.widthOfTextAtSize(datosDelEnvio, 8), y: y - 18, font: normal, size: 8, color: SUAVE })

  // Quién lo llenó.
  y -= 40
  parrafo(nombre, { fuente: titular, tamano: 26, interlinea: 30 })
  if (empresa) parrafo(empresa, { tamano: 13, interlinea: 20, tinta: SUAVE })
  const contacto = [correo && `Correo: ${correo}`, telefono && `WhatsApp o teléfono: ${telefono}`].filter(Boolean).join(' · ')
  if (contacto) parrafo(contacto, { tamano: 9.5, interlinea: 18, tinta: SUAVE })
  y -= 18
  filete(TINTA, 1)

  for (const { numero, titulo: tituloDelPaso, area, respuestas } of pasos) {
    const { nombre: nombreDelArea, hex } = AREAS[area]
    // La cabecera de la parte no queda sola al pie: va con su primera
    // pregunta y dos líneas de respuesta.
    y -= 30
    reservar(42 + 12 + 30)
    const lado = 30
    const figura = FIGURAS[area]
    const arriba = y + 4
    for (const [tono, d] of figura.trazos) {
      pagina.drawSvgPath(d, { x: MARGEN, y: arriba, scale: lado / 40, color: tono === 'fuerte' ? color(hex) : aclarar(hex, 0.55) })
    }
    const cifra = String(numero).padStart(2, '0')
    const tamanoCifra = 9
    const [cx, cy] = figura.centro.map((c) => (c / 40) * lado)
    pagina.drawText(cifra, {
      x: MARGEN + cx - titular.widthOfTextAtSize(cifra, tamanoCifra) / 2,
      y: arriba - cy - tamanoCifra * 0.35,
      font: titular,
      size: tamanoCifra,
      color: BLANCO,
    })
    const xTexto = MARGEN + lado + 12
    rotulo(pagina, escribible(`${nombreDelArea} · Parte ${numero}`).toUpperCase(), { x: xTexto, y: y - 4, font: negrita, size: 7.5, color: color(hex) })
    y -= 22
    escribir(escribible(tituloDelPaso), { x: xTexto, fuente: titular, tamano: 16 })
    y -= 12
    filete()

    for (const [etiqueta, respuesta] of respuestas) {
      y -= 12
      reservar(14 + 2 * 15)
      parrafo(etiqueta, { fuente: negrita, tamano: 9.5, interlinea: 14, tinta: SUAVE })
      y -= 2
      parrafo(respuesta, { tamano: 10.5, interlinea: 15 })
    }
  }

  // El pie de cada página, ya sabiendo cuántas son.
  const paginas = pdf.getPages()
  const pie = partir(escribible(`Volutus · ${titulo} de ${nombre} · ${referencia}`), normal, 7.5, ANCHO - 60)[0]
  for (const [i, hoja] of paginas.entries()) {
    const cuenta = `${i + 1} / ${paginas.length}`
    hoja.drawLine({ start: { x: MARGEN, y: PIE + 10 }, end: { x: A4[0] - MARGEN, y: PIE + 10 }, thickness: 0.5, color: LINEA })
    hoja.drawText(pie, { x: MARGEN, y: PIE - 4, font: normal, size: 7.5, color: SUAVE })
    hoja.drawText(cuenta, { x: A4[0] - MARGEN - normal.widthOfTextAtSize(cuenta, 7.5), y: PIE - 4, font: normal, size: 7.5, color: SUAVE })
  }

  return pdf.save()
}
