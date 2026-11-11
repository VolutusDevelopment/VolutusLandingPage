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
  b('nodo', 'Nodo', 'Software de despacho para pymes', 'tecnologico', 'Tecnológico', 'Grilla, datos, precisión', '#06121b'),
  b('roble', 'Roble & Asociados', 'Estudio contable y tributario', 'corporativo', 'Corporativo', 'Estructura, respaldo, orden', '#f3f6fa'),
  b('marea', 'Marea', 'Viajes por la costa chilena', 'editorial', 'Editorial', 'Como una revista, pausado', '#f2ede3'),
  b('rosa', 'La Mesa de Rosa', 'Cocina casera y banquetería', 'calido', 'Cálido y cercano', 'Tonos tierra, formas suaves', '#f6e4d0'),
  b('onix', 'Ónix', 'Joyería contemporánea de autor', 'premium', 'Premium', 'Oscuro, dorado, exclusivo', '#0b0a09'),
  b('golpe', 'Golpe', 'Club de boxeo', 'audaz', 'Audaz', 'Contraste, letras enormes', '#ffe14d'),
  b('pinpon', 'Pinpón', 'Heladería de barrio', 'ludico', 'Lúdico', 'Color, formas, humor', '#ffe0ea'),
  b('bloque', 'Bloque', 'Galería de arte independiente', 'brutalista', 'Brutalista', 'Crudo, bordes duros, sin pulir', '#d9d9d4'),
  b('disco', 'Disco Sur', 'Tienda de vinilos', 'retro', 'Retro', 'Nostalgia de los 70', '#f3e1bf'),
  b('grilla', 'Grilla', 'Escuela de diseño gráfico', 'suizo', 'Suizo / gráfico', 'Grilla, rojo, tipografía', '#ffffff'),
  b('raiz', 'Raíz', 'Vivero y paisajismo', 'natural', 'Natural', 'Formas orgánicas, tonos de tierra', '#e9ecdf'),
  b('helio', 'Helio', 'Energía solar para casas', 'futurista', 'Futurista', 'Degradados, vidrio, luz', '#0b0c1e'),
  b('bruma', 'Bruma', 'Café de especialidad y tostaduría', 'artesanal', 'Artesanal', 'Papel, sellos, a mano', '#e9dcc4'),
  b('koen', 'Kōen', 'Yoga y casa de té', 'zen', 'Zen / japonés', 'Silencio, aire, calma', '#f2efe8'),
  b('galpon', 'Galpón 9', 'Cervecería y taller de metal', 'industrial', 'Industrial', 'Fuerte, oscuro, de taller', '#1b1d1f'),
  b('mirador', 'Hotel Mirador', 'Hotel boutique en Valparaíso', 'artdeco', 'Art déco', 'Dorado, simetría, años 20', '#0f1f1c'),
  b('forma', 'Forma', 'Mueblería de diseño', 'bauhaus', 'Bauhaus', 'Formas puras, colores primarios', '#f1ead8'),
  b('garabato', 'Garabato', 'Papelería y regalos', 'memphis', 'Memphis', 'Patrones, color, desorden alegre', '#ffffff'),
  b('brillo', 'Brillo', 'Accesorios y bisutería', 'y2k', 'Y2K', 'Cromo, brillos, años 2000', '#e9dcff'),
  b('telar', 'Telar', 'Textiles de alpaca del norte', 'andino', 'Andino / folclórico', 'Grecas, tejidos, colores de la tierra', '#b5442b'),
  b('valdes', 'Imprenta Valdés', 'Invitaciones y papelería fina', 'letterpress', 'Letterpress', 'Papel grueso, tinta hundida', '#f4efe6'),
  b('ruido', 'Ruido', 'Sello de música independiente', 'collage', 'Collage / zine', 'Recortes, fotocopia, cinta', '#e6e3dc'),
  b('andes', 'Andes Dental', 'Clínica dental', 'clinico', 'Clínico / limpio', 'Blanco, claro, confiable', '#ffffff'),
]

// Dónde vive cada boceto. Con `.html`: así abre igual en `vite` (que sirve
// public/ tal cual) y en Cloudflare (que redirige a la ruta sin extensión).
export const rutaDeBoceto = (slug) => `/brief/bocetos/${slug}.html`
