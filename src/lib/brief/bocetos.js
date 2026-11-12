/**
 * Las direcciones de estilo del brief, cada una con su boceto
 * (/brief/bocetos/<slug>.html, en public/): 24 landing pages de marcas
 * inventadas, una por estilo, para que el cliente vea cada estilo puesto en
 * una página entera. Calificar el boceto es elegir el estilo: los que le
 * gustan son su elección.
 *
 * `estilo` es la clase de su arte (MuestraBrief.jsx y muestras.css), y
 * `titulo` y `detalle` lo nombran. `fondo` es el color del boceto, el que
 * pinta el visor mientras carga.
 *
 * Lo usan la página (la tarjeta de cada estilo y el visor), su script (la
 * revisión) y el Worker (el correo). La calificación que se hace en el boceto
 * abierto aparte la guarda public/brief/bocetos/barra.js, bajo
 * `CLAVE_BOCETOS` de reglas.js.
 */

const b = (slug, nombre, rubro, estilo, titulo, detalle, fondo) => ({ slug, nombre, rubro, estilo, titulo, detalle, fondo })

export const BOCETOS = [
  b('alba', 'Alba Interiores', 'Estudio de interiorismo', 'minimalista', 'Minimalista', 'Poco, preciso, mucho aire', '#fafaf8'),
  b('cauce', 'Cauce', 'Telemetría de riego para viñas y huertos', 'tecnologico', 'Tecnológico', 'Grilla, datos, precisión', '#0d1210'),
  b('basal', 'Basal Ingeniería', 'Aislación sísmica y cálculo estructural', 'corporativo', 'Corporativo', 'Estructura, respaldo, orden', '#ffffff'),
  b('ladera', 'Viña Ladera', 'Vinos de secano del Itata', 'editorial', 'Editorial', 'Como una revista, pausado', '#f2ede3'),
  b('rosa', 'La Mesa de Rosa', 'Cocina casera y banquetería', 'calido', 'Cálido y cercano', 'Tonos tierra, formas suaves', '#3b2418'),
  b('onix', 'Ónix', 'Joyería contemporánea de autor', 'premium', 'Premium', 'Oscuro, dorado, exclusivo', '#0b0a09'),
  b('golpe', 'Golpe', 'Club de boxeo', 'audaz', 'Audaz', 'Contraste, letras enormes', '#0d0d0d'),
  b('pelusa', 'Pelusa', 'Guardería y peluquería de perros', 'ludico', 'Lúdico', 'Color, formas, humor', '#ffd9b8'),
  b('sotano', 'Sótano', 'Cine club y sala independiente', 'brutalista', 'Brutalista', 'Crudo, bordes duros, sin pulir', '#ffffff'),
  b('lucero', 'Pista Lucero', 'Pista de patinaje y disco', 'retro', 'Retro', 'Nostalgia de los 70', '#24140c'),
  b('rumbo', 'Rumbo', 'Señalética y orientación', 'suizo', 'Suizo / gráfico', 'Grilla, rojo, tipografía', '#ffffff'),
  b('quillay', 'Quillay', 'Jabones de plantas nativas', 'natural', 'Natural', 'Formas orgánicas, tonos de tierra', '#f0eadb'),
  b('cenit', 'Cénit', 'Observatorio y astroturismo en el Elqui', 'futurista', 'Futurista', 'Degradados, vidrio, luz', '#0b0c1e'),
  b('libar', 'Libar', 'Miel cruda de colmenas propias', 'artesanal', 'Artesanal', 'Papel, sellos, a mano', '#1c1308'),
  b('kiri', 'Kiri', 'Termas y ryokan junto al volcán Osorno', 'zen', 'Zen / japonés', 'Silencio, aire, calma', '#0e1511'),
  b('remache', 'Remache', 'Maestranza industrial para minería', 'industrial', 'Industrial', 'Fuerte, oscuro, de taller', '#0b0c0c'),
  b('marfil', 'Bar Marfil', 'Coctelería y salón de baile en Valparaíso', 'artdeco', 'Art déco', 'Dorado, simetría, años 20', '#fbf8f1'),
  b('bisagra', 'Bisagra', 'Lámparas de diseño hechas a mano', 'bauhaus', 'Bauhaus', 'Formas puras, colores primarios', '#f2eee7'),
  b('tablero', 'Tablero', 'Café de juegos de mesa', 'memphis', 'Memphis', 'Patrones, color, desorden alegre', '#ffffff'),
  b('destello', 'Destello', 'Cámaras digitales de los 2000, revisadas', 'y2k', 'Y2K', 'Cromo, brillos, años 2000', '#e9dcff'),
  b('parina', 'Parina', 'Lodge y caminatas en el altiplano', 'andino', 'Andino / folclórico', 'Grecas, tejidos, colores de la tierra', '#f3e7d3'),
  b('tilde', 'Prensa Tilde', 'Invitaciones impresas en tipos móviles', 'letterpress', 'Letterpress', 'Papel grueso, tinta hundida', '#f4efe6'),
  b('rampa', 'Rampa', 'Tienda y escuela de skate', 'collage', 'Collage / zine', 'Recortes, fotocopia, cinta', '#e6e3dc'),
  b('iris', 'Iris Centro Visual', 'Oftalmología y óptica', 'clinico', 'Clínico / limpio', 'Blanco, claro, confiable', '#ffffff'),
]

// Dónde vive cada boceto. Con `.html`: así abre igual en `vite` (que sirve
// public/ tal cual) y en Cloudflare (que redirige a la ruta sin extensión).
export const rutaDeBoceto = (slug) => `/brief/bocetos/${slug}.html`

// Las marcas que se eligen viéndolas (un espacio, comida, joyas, un gimnasio,
// perros, un lugar) llevan en su tarjeta una foto de su boceto, recortada a
// 16:9 en dos anchos (320 y 640). Las demás se dibujan (MuestraBrief.jsx).
const CON_FOTO = new Set(['alba', 'rosa', 'onix', 'golpe', 'pelusa', 'kiri', 'parina', 'marfil'])
export const tieneFoto = (slug) => CON_FOTO.has(slug)
export const fotoDeTarjeta = (slug, ancho) => `/image/bocetos/${slug}/tarjeta-${ancho}.webp`
