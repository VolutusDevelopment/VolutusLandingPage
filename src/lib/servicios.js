/**
 * Lo que ofrecemos. Una sola lista para toda la página.
 *
 * La leen tres sitios: la sección de servicios (`Servicios.jsx`), el menú
 * del formulario (`Contacto.jsx`) y el Worker que recibe el envío, que solo
 * acepta las opciones de aquí. Vive en un módulo plano porque el Worker no
 * puede importar un `.jsx` sin arrastrar React, y tener la lista copiada en
 * dos sitios es la forma segura de que un día no coincidan.
 *
 * **La prueba va con el servicio que la tiene, y solo con ese** (§3: cada
 * afirmación con su enlace). La web y la app llevan a la vitrina de
 * PonleNota, que está en esta misma página; el agente, a su código; la ley de
 * datos, a la política de privacidad de esta misma página, que ya la cumple.
 * Las tiendas online y las automatizaciones no tienen todavía un proyecto
 * público que enseñar, así que no llevan enlace: un botón que no lleva a
 * ninguna prueba es justo lo que esta página promete no hacer.
 *
 * Tiendas online y ley de datos se sumaron por demanda medida: el comercio
 * electrónico chileno movió casi US$ 10.000 millones en 2025 (CCS) y solo el
 * 23 % de las pymes tiene sitio web; la Ley 21.719 obliga a todas las
 * empresas desde el 1 de diciembre de 2026.
 */
export const SERVICIOS = [
  {
    id: 'web',
    nombre: 'Páginas web',
    opcion: 'Una página web',
    texto: 'Como esta, que saca 100 de 100 en las cuatro pruebas de Google.',
    puntos: ['Abre rápido en el celular', 'Aparece en Google', 'Dice lo que vendes sin rodeos'],
    enlace: { texto: 'Ver la web de PonleNota', href: '#ponlenota' },
  },
  {
    id: 'tienda',
    nombre: 'Tiendas online',
    opcion: 'Una tienda online',
    texto: 'Una tienda rápida en el celular, que administras tú.',
    puntos: ['Tu catálogo', 'El carro de compra', 'El pago con tarjeta'],
    enlace: null,
  },
  {
    id: 'app',
    nombre: 'Aplicaciones',
    opcion: 'Una app',
    texto: 'Para tu equipo o para tus clientes.',
    puntos: ['En el navegador', 'En el celular', 'Conectada a los datos que ya tienes'],
    enlace: { texto: 'Ver la app de PonleNota', href: '#ponlenota' },
  },
  {
    id: 'agente',
    nombre: 'Agentes de IA',
    opcion: 'Un agente de IA',
    texto: 'El nuestro salió segundo en un hackathon con jurado externo.',
    puntos: ['Contesta y resuelve lo repetitivo', 'Con tu información', 'A cualquier hora'],
    enlace: {
      texto: 'Ver el código del agente',
      href: 'https://github.com/DiegoPyLL/Hackathon-Huawei-Cloud-MaaS',
    },
  },
  {
    id: 'automatizacion',
    // Con guion suave: a 300 px la palabra no cabe entera en su ficha y se
    // parte ahí, con guion, en vez de empujar la página hacia el lado.
    nombre: 'Automatiza\u00adciones',
    opcion: 'Una automatización',
    texto: 'Lo que hoy haces a mano pasa solo, sin que nadie lo toque.',
    puntos: ['Lo que copias de una planilla a otra', 'Lo que reenvías por WhatsApp'],
    enlace: null,
  },
  {
    id: 'datos',
    nombre: 'Ley de datos',
    opcion: 'Adaptarme a la ley de datos',
    texto: 'La Ley 21.719 rige desde el 1 de diciembre de 2026. Adaptamos la parte técnica de tu web.',
    puntos: ['Consentimiento', 'Privacidad', 'Solo los datos necesarios'],
    enlace: { texto: 'Ver nuestra política', href: '/privacidad' },
  },
]

/** Las opciones del menú del formulario: un servicio de la lista, u otra cosa. */
export const OPCIONES_DE_CONTACTO = [...SERVICIOS.map((s) => s.opcion), 'Otro']
