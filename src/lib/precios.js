/**
 * El estimado de precio de cada servicio (components/Estimado.jsx, y
 * estimado.js en el navegador). Es la parte del estándar de precios que usa el
 * sitio: el estándar entero, con todas sus variables y la fórmula, está en el
 * Vault, «2. Areas/Estándar de precios». Las variables de aquí llevan sus
 * mismos nombres, y si una cambia allá, cambia aquí.
 *
 * Todo va en UF y neto: el IVA se suma aparte. Cada hora del catálogo vale
 * `tarifa` UF. Es un estimado: el precio final sale de la cotización. La UF
 * con que se pasan los montos a pesos es la del día (data/uf.js).
 */

import { UF } from '../data/uf.js'

export const VARIABLES = {
  tarifa: 1,
  f_urgencia: 1.25,
  anticipo: 0.5,
  umbral_hitos: 100,
  recargo_mes: 0.015,
  pie_pct: 0.2,
  minimo_suscripcion: 30,
}

const PLANES_WEB = [
  { id: 'basico', nombre: 'Plan Básico', uf: 0.5 },
  { id: 'activo', nombre: 'Plan Activo', uf: 1 },
]

const PLANES = [
  { id: 'mantencion', nombre: 'Mantención', pct: 0.015, min: 1 },
  { id: 'terceros', nombre: 'Con fallas de terceros', pct: 0.025, min: 2 },
]

const CUOTAS = [6, 12, 24]

/**
 * Lo que se puede elegir en cada servicio, por el `id` de lib/servicios.js.
 *
 * - `bases`: el punto de partida. Si hay más de uno, se elige uno.
 * - `extras`: lo que se suma. Por defecto, una casilla de `horas`. Con
 *   `cantidad`, un número de 0 a `max` que parte en `inicial`. Con `recargo`,
 *   un porcentaje sobre las horas. Con `porPagina`, horas por cada página.
 *   Con `mensual`, UF al mes que no son desarrollo.
 * - `cuotas`: los plazos de la suscripción. La web paga su mensualidad sin
 *   el mínimo (`sinMinimo`), y en cuotas lleva al menos su plan Básico
 *   (`planEnCuotas`).
 * - `planes`: la mantención que se puede sumar. Con `uf`, un monto fijo; con
 *   `pct`, un porcentaje del desarrollo, con su mínimo.
 * - `terceros`: lo que se paga aparte, a costo.
 */
export const ESTIMADOS = {
  web: {
    bases: [
      { id: 'landing', nombre: 'Landing de una página', horas: 10, paginas: 1 },
      { id: 'sitio', nombre: 'Sitio de hasta 5 páginas', horas: 25, paginas: 5 },
    ],
    extras: [
      { id: 'paginas', nombre: 'Páginas extra', horas: 3, cantidad: true, max: 20 },
      { id: 'blog', nombre: 'Blog administrable', horas: 8 },
      { id: 'textos', nombre: 'Textos escritos por nosotros', horas: 1, porPagina: true },
      { id: 'idioma', nombre: 'Segundo idioma', recargo: 0.4 },
    ],
    cuotas: [12],
    sinMinimo: true,
    planEnCuotas: 'basico',
    planes: PLANES_WEB,
    terceros: 'El dominio va aparte y a tu nombre.',
  },
  tienda: {
    bases: [{ id: 'tienda', nombre: 'Hasta 50 productos, carrito, pago, pedidos y tu panel', horas: 55 }],
    extras: [
      { id: 'productos', nombre: '50 productos más', horas: 2, cantidad: true, max: 20 },
      { id: 'despacho', nombre: 'Despacho por zona', horas: 8 },
      { id: 'cupones', nombre: 'Cupones de descuento', horas: 5 },
      { id: 'boleta', nombre: 'Boleta o factura electrónica', horas: 15 },
    ],
    cuotas: CUOTAS,
    planes: PLANES,
    terceros: 'La plataforma de pago cobra su comisión por venta.',
  },
  app: {
    bases: [{ id: 'app', nombre: 'App web con usuarios, servidor y panel', horas: 60 }],
    extras: [
      { id: 'flujos', nombre: 'Tareas que resuelve', horas: 12, cantidad: true, inicial: 1, max: 20 },
      { id: 'tiendas', nombre: 'Publicar en iOS y Android', horas: 60 },
      { id: 'offline', nombre: 'Funcionar sin internet', horas: 20 },
    ],
    cuotas: CUOTAS,
    planes: PLANES,
    terceros: 'Las tiendas de Apple y Google cobran su propia cuenta de desarrollador.',
  },
  agente: {
    bases: [{ id: 'agente', nombre: 'Agente en tu web que responde con tu información', horas: 35 }],
    extras: [
      { id: 'whatsapp', nombre: 'Atiende por WhatsApp', horas: 10 },
      { id: 'agenda', nombre: 'Agenda', horas: 10 },
      { id: 'pedidos', nombre: 'Toma pedidos', horas: 10 },
      { id: 'cotiza', nombre: 'Cotiza', horas: 10 },
    ],
    cuotas: CUOTAS,
    planes: PLANES,
    terceros: 'El modelo de IA y los mensajes de WhatsApp se pagan aparte, según el uso.',
  },
  automatizacion: {
    bases: [{ id: 'flujo', nombre: 'Un flujo entre dos herramientas, con registro y avisos', horas: 10 }],
    extras: [
      { id: 'flujos', nombre: 'Flujos adicionales', horas: 8, cantidad: true, max: 20 },
      { id: 'herramientas', nombre: 'Herramientas adicionales', horas: 5, cantidad: true, max: 20 },
      { id: 'documentos', nombre: 'Lectura de documentos', horas: 8 },
    ],
    cuotas: CUOTAS,
    planes: PLANES,
    terceros: 'Si una herramienta cobra por uso, ese costo va aparte.',
  },
  gestion: {
    bases: [{ id: 'gestion', nombre: 'Usuarios, permisos por rol y panel de números', horas: 40 }],
    extras: [
      { id: 'inventario', nombre: 'Inventario', horas: 15 },
      { id: 'clientes', nombre: 'Clientes', horas: 15 },
      { id: 'agenda', nombre: 'Agenda', horas: 15 },
      { id: 'cotizaciones', nombre: 'Cotizaciones', horas: 15 },
      { id: 'planillas', nombre: 'Traspaso de tus planillas', horas: 6 },
      { id: 'facturacion', nombre: 'Conexión con tu facturación', horas: 15 },
    ],
    cuotas: CUOTAS,
    planes: PLANES,
    terceros: 'El hosting va aparte, a costo y a tu nombre.',
  },
  prospeccion: {
    bases: [{ id: 'busqueda', nombre: 'Una zona y hasta tres rubros, hasta 1.000 negocios', horas: 3 }],
    extras: [
      { id: 'zonas', nombre: 'Rubros o comunas extra', horas: 1, cantidad: true, max: 20 },
      { id: 'mensual', nombre: 'Repetirla cada mes', mensual: 2 },
    ],
    cuotas: [],
    planes: [],
  },
  datos: {
    bases: [{ id: 'diagnostico', nombre: 'Diagnóstico: qué datos tienes, dónde y qué falta', horas: 10 }],
    extras: [
      { id: 'consentimiento', nombre: 'Consentimiento', horas: 8 },
      { id: 'derechos', nombre: 'Canal para los derechos', horas: 10 },
      { id: 'borrado', nombre: 'Conservación y borrado a tiempo', horas: 6 },
    ],
    cuotas: CUOTAS,
    planes: PLANES,
    terceros: 'Si lo implementamos dentro de 30 días, el diagnóstico se descuenta.',
  },
}

/** Lo que llega marcado: la primera base, las cantidades en su inicial y pago total. */
export function eleccionInicial({ bases, extras }) {
  return {
    base: bases[0].id,
    extras: Object.fromEntries(extras.map((e) => [e.id, e.inicial ?? 0])),
    urgente: false,
    plazo: 0,
    plan: '',
  }
}

/** La fórmula del estándar, con la elección de la persona. Montos en UF, netos. */
export function estimar(servicio, { base, extras, urgente, plazo, plan }) {
  const v = VARIABLES
  const elegida = servicio.bases.find((b) => b.id === base) ?? servicio.bases[0]
  // Lo que llega del formulario se acota: una casilla vale 0 o 1, y una cantidad, de 0 a su `max`.
  const cuantos = Object.fromEntries(
    servicio.extras.map((e) => [e.id, Math.min(Math.max(Math.round(extras[e.id]) || 0, 0), e.max ?? 1)])
  )

  // Solo la web cuenta páginas: las de su base más las extra.
  const paginas = (elegida.paginas ?? 0) + (cuantos.paginas ?? 0)

  // Las líneas de la boleta: cada cosa marcada con lo que suma, en UF.
  const lineas = [{ nombre: elegida.nombre, monto: elegida.horas * v.tarifa }]
  let mensual = 0
  for (const extra of servicio.extras) {
    const n = cuantos[extra.id]
    if (!n || extra.recargo) continue
    if (extra.mensual) mensual += extra.mensual
    else lineas.push({ nombre: nombreDeLinea(extra, n, paginas), monto: extra.horas * (extra.porPagina ? paginas : n) * v.tarifa })
  }
  const suma = () => lineas.reduce((total, { monto }) => total + monto, 0)

  // Los recargos van sobre lo sumado, y la urgencia, sobre todo lo demás.
  const subtotal = suma()
  for (const extra of servicio.extras) {
    if (extra.recargo && cuantos[extra.id]) {
      lineas.push({ nombre: `${extra.nombre}, ${numero(extra.recargo * 100)} %`, monto: subtotal * extra.recargo })
    }
  }
  if (urgente) lineas.push({ nombre: `Urgencia, ${numero((v.f_urgencia - 1) * 100)} %`, monto: suma() * (v.f_urgencia - 1) })

  const desarrollo = suma()
  const enCuotas = servicio.cuotas.includes(plazo) && (servicio.sinMinimo || desarrollo >= v.minimo_suscripcion)

  const elegido = servicio.planes.find((p) => p.id === (plan || (enCuotas && servicio.planEnCuotas)))
  const mantencion = elegido ? (elegido.uf ?? Math.max(elegido.min, desarrollo * elegido.pct)) : 0

  let cuotas = null
  if (enCuotas) {
    const total = desarrollo * (1 + v.recargo_mes * plazo)
    const pie = total * v.pie_pct
    cuotas = { plazo, pie, cuota: (total - pie) / plazo + mantencion }
  }

  return { desarrollo, lineas, cuotas, alMes: mensual + mantencion, sinCuotas: plazo > 0 && !enCuotas }
}

/** El nombre de una línea de la boleta: cuántas, o de cuántas páginas. */
function nombreDeLinea({ nombre, cantidad, porPagina }, n, paginas) {
  if (porPagina) return `${nombre} (${paginas} pág.)`
  return cantidad ? `${nombre} × ${n}` : nombre
}

/** El precio de partida de un servicio: lo que llega marcado. */
export const desde = (servicio) => estimar(servicio, eleccionInicial(servicio)).desarrollo

const NUMERO = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 })
const PESOS = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

export const numero = (n) => NUMERO.format(n)
// Con espacio duro: el número no se separa de «UF», ni «≈» del monto.
export const uf = (monto) => `${numero(monto)}\u00a0UF`
export const pesos = (monto) => `≈\u00a0${PESOS.format(Math.round((monto * UF.valor) / 1000) * 1000)}`

/**
 * Los textos del estimado. Los usan el HTML servido y el navegador, para que
 * digan lo mismo. `total` es solo el número: «UF» lo pone el marcado.
 */
export function textosDe({ desarrollo, lineas, cuotas, alMes, sinCuotas }) {
  const { anticipo, umbral_hitos, minimo_suscripcion } = VARIABLES
  const contado =
    desarrollo > umbral_hitos
      ? '40 % al empezar, 30 % en la demo y 30 % a la entrega'
      : `${anticipo * 100} % al aceptar y ${anticipo * 100} % a la entrega`

  let pago = contado
  if (cuotas) pago = `Pie de ${uf(cuotas.pie)} y ${cuotas.plazo} cuotas de ${uf(cuotas.cuota)} (${pesos(cuotas.cuota)})`
  else if (sinCuotas) pago = `${contado}. Las cuotas parten en ${uf(minimo_suscripcion)}`

  let mes = 'Sin costo mensual'
  if (alMes) mes = `${uf(alMes)} (${pesos(alMes)})${cuotas ? ', dentro de la cuota' : ''}`

  return {
    total: numero(desarrollo),
    pesos: `${pesos(desarrollo)} + IVA`,
    pago,
    mes,
    lineas: lineas.map(({ nombre, monto }, i) => ({ nombre, monto: `${i ? '+' : ''}${uf(monto)}` })),
  }
}
