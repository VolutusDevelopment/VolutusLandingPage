/**
 * El brief para clientes (/brief): lo que Volutus necesita saber de un
 * negocio para construir su marca y su sitio web. Junta los dos briefs para
 * imprimir, el de marca y el visual del sitio, en un solo recorrido y sin
 * preguntar dos veces lo mismo: va de lo invisible (quién eres, a quién le
 * hablas, qué prometes) a lo visible (cómo se ve, qué piezas, para cuándo).
 *
 * Cada pregunta tiene un `tipo` (ver PreguntaBrief.jsx y worker/brief.js):
 * - texto, correo, telefono, parrafo: se escriben;
 * - una, varias: se eligen. Con `max`, hasta ese número; con `otro`, suman
 *   «Otro: ___»; con `estrella`, cada opción puede ser imprescindible. Las
 *   opciones con `img` muestran su miniatura (public/image/brief/), y las de
 *   color, su `muestra`;
 * - escala: cinco puntos entre dos extremos;
 * - tabla: filas numeradas con sus columnas;
 * - frase: una frase con huecos;
 * - colores: el código o el nombre de cada color;
 * - archivo: un archivo para subir (el logo), que viaja adjunto en el correo;
 * - bocetos: las direcciones de estilo de bocetos.js, cada una con su boceto
 *   y su reacción;
 * - consejo y comparar: no se responden, orientan.
 *
 * Cada paso es de un `area`, marca o diseño: el índice los agrupa así y la
 * página toma su color.
 *
 * `columnas(...)` pone preguntas en dos columnas que crecen cada una por su
 * lado; `conMockup(...)` junta escalas con la portada de muestra que las
 * sigue; `escena(...)` encierra en un cuadro las que se responden en un
 * juego de rol, con su contexto. `clave` marca lo que más nos sirve: lleva
 * una pastilla y la revisión lo pide si quedó en blanco. `muestras` dibuja
 * las opciones de una pregunta
 * en su propia letra o en su tipo de logo (MuestraBrief.jsx), y `marca`
 * viste la pastilla de una empresa con sus colores al marcarla.
 */

import { o } from './reglas.js'

// Una opción con miniatura: `public/image/brief/<img>.svg`.
const conImagen = (img, v, l, d) => ({ ...o(v, l, d), img })

// Una opción que es una empresa: su pastilla, al marcarse, se viste como ella
// (MuestraBrief.jsx).
const deMarca = (v, l) => ({ ...o(v, l), marca: true })

// Opciones de una palabra, para las pastillas.
const palabras = (...lista) => lista.map((palabra) => o(palabra.toLowerCase(), palabra))

// Las familias de color, con sus tres tonos de oscuro a claro.
const FAMILIAS = [
  { ...o('azules', 'Azules'), muestra: ['#0c3a66', '#116492', '#9cc3dc'] },
  { ...o('verdes', 'Verdes'), muestra: ['#1f4d3a', '#3f8f63', '#bfe0c8'] },
  { ...o('tierra', 'Tierra'), muestra: ['#5a3622', '#c8643b', '#e9cfb4'] },
  { ...o('blanco-y-negro', 'Blanco y negro'), muestra: ['#111111', '#8a8a8a', '#f2f2f2'] },
  { ...o('pasteles', 'Pasteles'), muestra: ['#f6c7d4', '#c7dff6', '#f8edb8'] },
  { ...o('vibrantes', 'Vibrantes'), muestra: ['#3b6cff', '#ff6fb5', '#ffe45c'] },
  { ...o('rojos', 'Rojos y naranjos'), muestra: ['#a3201b', '#e8562a', '#ffb36b'] },
  { ...o('morados', 'Morados'), muestra: ['#3a1f5c', '#7b3fa0', '#d6bdf0'] },
  { ...o('negro-y-dorado', 'Negro y dorado'), muestra: ['#121110', '#b89b5e', '#f3ead8'] },
  { ...o('turquesas', 'Turquesas'), muestra: ['#0e4a52', '#1aa3a3', '#bdeeea'] },
]

const escala = (id, etiqueta, izquierda, derecha) => ({ id, tipo: 'escala', etiqueta, izquierda, derecha })

// Dos columnas por tema, que crecen cada una por su lado: si un cuadro de
// texto se agranda, solo baja lo que está debajo de él. El orden de lectura
// (y el del tabulador) baja por una columna y después por la otra. `titulos`,
// si van, nombran cada columna, y su `pastilla` suma una nota de color.
const columnas = (izquierda, derecha, titulos = []) => ({
  tipo: 'columnas',
  columnas: [izquierda, derecha].map((preguntas, i) => ({ ...titulos[i], preguntas })),
})

// Las escalas de «Cómo se ve», con la portada de muestra que las sigue.
const conMockup = (...preguntas) => ({ tipo: 'mockup', preguntas })

// Preguntas que se responden metido en un papel, en un cuadro con el
// contexto del juego arriba.
const escena = (titulo, texto, ...preguntas) => ({ tipo: 'escena', titulo, texto, preguntas })

export const BRIEF = {
  nombre: 'Brief de marca y sitio',
  intro: {
    texto:
      'Estas preguntas nos ayudan a decidir contigo quién eres, a quién le hablas, qué prometes y cómo debe verse tu marca. No hay respuestas correctas, solo honestas: si dudas entre dos opciones, marca las dos.',
    // El título dice para qué es el brief, y `acento` (parte del título) va
    // en el color de Marca.
    titulo: 'Tu página web empieza por tu negocio',
    acento: 'página web',
    datos: [
      ['35 a 45 min', 'Puedes hacerlo en partes: se guarda solo en este equipo.'],
      ['9 partes', 'De lo invisible (estrategia) a lo visible (logo, sitio y plazos).'],
      ['2 obligatorios', 'Tu nombre y un contacto. Lo demás, lo que sepas.'],
    ],
  },
  toolname: 'enviar_brief',
  tooldescription:
    'Envía a Volutus el brief de marca y sitio web de un negocio: quién es, su cliente y su competencia, su promesa y su personalidad, su nombre y su voz, qué debe lograr su sitio, cómo debe verse, qué imágenes y bloques necesita, y sus plazos. Solo el nombre y un correo o WhatsApp son obligatorios. Responde si el envío llegó y si se mandó la copia al correo del cliente. La persona lo revisa y lo envía.',
  pasos: [
    {
      corto: 'Tú y tu negocio',
      area: 'marca',
      tiempo: '≈ 4 min',
      titulo: 'Tú y tu negocio',
      entrada: 'Lo básico para conocerte y saber desde dónde partimos.',
      preguntas: [
        columnas(
          [
            { id: 'nombre', tipo: 'texto', etiqueta: 'Tu nombre', obligatorio: true, ph: 'Nombre y apellido', autocompletar: 'name' },
            { id: 'cargo', tipo: 'texto', etiqueta: 'Tu rol en el negocio', ph: 'Dueño, socia, gerente…' },
          ],
          [
            { id: 'correo', tipo: 'correo', etiqueta: 'Correo', ph: 'tu@correo.cl', autocompletar: 'email' },
            { id: 'telefono', tipo: 'telefono', etiqueta: 'WhatsApp o teléfono', ph: '+56 9 1234 5678', autocompletar: 'tel' },
          ],
          [{ titulo: 'Tú' }, { titulo: 'Cómo te respondemos', pastilla: 'Con uno basta' }]
        ),
        columnas(
          [
            { id: 'empresa', tipo: 'texto', etiqueta: 'Nombre del negocio (si ya tiene)', ph: 'Puede ser provisorio', autocompletar: 'organization' },
            { id: 'rubro', tipo: 'texto', etiqueta: '¿A qué se dedica?', ph: 'Repuestos, pastelería, asesoría contable…' },
            { id: 'ciudad', tipo: 'texto', etiqueta: 'Ciudad o zona donde trabajas', ph: 'Santiago oriente, todo Chile…' },
          ],
          [
            {
              id: 'antiguedad',
              tipo: 'una',
              etiqueta: '¿Hace cuánto funciona?',
              opciones: [o('idea', 'Es una idea'), o('menos-de-1', 'Menos de 1 año'), o('1-a-5', '1 a 5 años'), o('mas-de-5', 'Más de 5 años')],
            },
            {
              id: 'equipo',
              tipo: 'una',
              etiqueta: '¿Cuántas personas trabajan en él?',
              opciones: [o('solo', 'Solo yo'), o('2-a-5', '2 a 5'), o('6-a-20', '6 a 20'), o('mas-de-20', 'Más de 20')],
            },
          ]
        ),
        {
          id: 'punto',
          tipo: 'una',
          etiqueta: '¿Desde dónde partimos?',
          clave: true,
          opciones: [
            o('cero', 'Desde cero', 'No tengo nombre ni logo todavía'),
            o('renovar', 'Renovar', 'Tengo marca, pero ya no me representa'),
            o('ordenar', 'Ordenar', 'Me gusta lo que tengo, pero está disperso'),
          ],
        },
        columnas(
          [
            {
              id: 'actual',
              tipo: 'parrafo',
              etiqueta: 'Si ya tienes algo, ¿dónde podemos verlo?',
              filas: 2,
              ph: 'Tu sitio, Instagram, una foto del letrero o de la tarjeta…',
            },
          ],
          [
            {
              id: 'motivo',
              tipo: 'parrafo',
              etiqueta: '¿Por qué quieres trabajar tu marca ahora?',
              filas: 2,
              ph: 'Qué pasó o qué quieres que pase',
              ejemplo: 'Abrimos una segunda sucursal y la gente no sabe que somos los mismos.',
            },
          ]
        ),
      ],
    },
    {
      corto: 'Dónde estás hoy',
      area: 'marca',
      tiempo: '≈ 5 min',
      titulo: 'Dónde estás parado hoy',
      entrada: 'Escribe puntos concretos y verificables, no adjetivos sueltos.',
      preguntas: [
        {
          tipo: 'consejo',
          titulo: 'Concreto, no genérico.',
          texto: '«Respondemos en menos de 2 horas» sirve. «Calidad» o «responsabilidad» no, porque todos lo dicen.',
        },
        columnas(
          [
            { id: 'fortalezas', tipo: 'parrafo', etiqueta: '¿En qué eres bueno hoy?', ph: 'Una por línea', ejemplo: 'Trato directo con el dueño, entrega en 48 h.' },
            { id: 'fortaleza_clave', tipo: 'texto', etiqueta: 'La fortaleza que más te distingue', ph: 'Solo una' },
            { id: 'oportunidades', tipo: 'parrafo', etiqueta: '¿Qué pasa afuera que te conviene?', ph: 'Tendencias, cambios, clientes nuevos', ejemplo: 'Muchas pymes de la zona aún no venden en línea.' },
          ],
          [
            { id: 'debilidades', tipo: 'parrafo', etiqueta: '¿Qué te falta o te frena?', ph: 'Una por línea', ejemplo: 'No tenemos fotos de nuestros trabajos.' },
            { id: 'debilidad_clave', tipo: 'texto', etiqueta: 'La debilidad que más dinero te cuesta hoy', ph: 'Solo una' },
            { id: 'amenazas', tipo: 'parrafo', etiqueta: '¿Qué pasa afuera que te perjudica?', ph: 'Competencia, precios, regulación', ejemplo: 'Llegó una cadena grande al barrio.' },
          ],
          [{ titulo: 'A tu favor' }, { titulo: 'En tu contra' }]
        ),
      ],
    },
    {
      corto: 'Cliente y competencia',
      area: 'marca',
      tiempo: '≈ 8 min',
      titulo: 'Tu cliente y tu competencia',
      entrada:
        'Vender a todos es no venderle a nadie: piensa en el cliente que más quieres tener. Y tu marca ocupa un lugar en su cabeza; para elegir el tuyo, hay que saber cuáles ya están ocupados.',
      preguntas: [
        {
          id: 'tipo_cliente',
          tipo: 'una',
          etiqueta: '¿A quién le vendes principalmente?',
          opciones: [
            o('personas', 'Personas', 'Consumidor final'),
            o('empresas', 'Empresas', 'Otras empresas o instituciones'),
            o('ambos', 'Ambos', 'Personas y empresas'),
          ],
        },
        columnas(
          [
            {
              id: 'quien',
              tipo: 'parrafo',
              etiqueta: 'Describe a tu cliente ideal',
              clave: true,
              ph: 'Edad, tipo de negocio, tamaño, dónde vive o trabaja',
              ejemplo: 'Dueños de restaurantes de 1 a 3 locales en Santiago, entre 35 y 55 años.',
            },
          ],
          [{ id: 'decide', tipo: 'texto', etiqueta: '¿Quién decide la compra y quién paga?', ph: 'Rara vez es quien te contacta' }]
        ),
        escena(
          'Ponte en los zapatos de tu cliente',
          'Estas tres preguntas son un juego de rol. Inventa a una persona que represente a tu cliente ideal: dale nombre, edad y un día normal. Después responde como si fueras ella: qué le molesta y qué dudas tiene, con sus palabras, como te lo diría por WhatsApp o en el mesón. No tiene que ser exacto; nos sirve para escribir tu sitio en su idioma.',
          columnas(
            [
              {
                id: 'persona',
                tipo: 'parrafo',
                etiqueta: 'Ponle nombre y cara: un día de su vida',
                ph: 'Inventa a una persona que represente a tu cliente',
                ejemplo: 'Roberto, 47, dueño de 2 locales de repuestos. Vende bien en mesón, pero no aparece en Google.',
              },
            ],
            [
              {
                id: 'dolor',
                tipo: 'texto',
                etiqueta: '¿Qué le duele? Con sus palabras, no con las tuyas',
                clave: true,
                ph: '«Pido cotización a tres y ninguno me contesta.»',
              },
            ]
          ),
          {
            id: 'objeciones',
            tipo: 'tabla',
            etiqueta: 'Las 3 dudas que te pone antes de comprarte',
            filas: 3,
            columnas: [{ id: 'duda', etiqueta: 'Duda u objeción', ph: '¿Y si después nadie me responde?' }],
          }
        ),
        {
          id: 'canales',
          tipo: 'varias',
          etiqueta: '¿Dónde está tu cliente? ¿Dónde te encuentra?',
          otro: true,
          opciones: [
            deMarca('google', 'Google'),
            deMarca('instagram', 'Instagram'),
            deMarca('facebook', 'Facebook'),
            deMarca('tiktok', 'TikTok'),
            deMarca('linkedin', 'LinkedIn'),
            deMarca('whatsapp', 'Whatsapp'),
            o('recomendaciones', 'Recomendaciones'),
            o('local', 'Pasa por fuera del local'),
            o('ferias', 'Ferias y eventos'),
            o('marketplaces', 'Marketplaces'),
          ],
        },
        {
          id: 'competidores',
          tipo: 'tabla',
          etiqueta: 'Hasta 4 competidores (o alternativas que tu cliente usa en vez de ti)',
          filas: 4,
          columnas: [
            { id: 'nombre', etiqueta: 'Nombre', ph: 'Nombre o link' },
            { id: 'bien', etiqueta: 'Qué hace bien', ph: 'Lo que le envidias' },
            { id: 'falla', etiqueta: 'Dónde falla', ph: 'De qué se quejan sus clientes' },
          ],
        },
        columnas(
          [
            {
              id: 'precio',
              tipo: 'una',
              etiqueta: 'Comparado con ellos, tu precio es…',
              opciones: [o('mas-bajo', 'Más bajo'), o('parecido', 'Parecido'), o('mas-alto', 'Más alto'), o('no-se', 'No lo sé')],
            },
          ],
          [
            {
              id: 'admirada',
              tipo: 'texto',
              etiqueta: 'Una marca (de cualquier rubro) que admires, y por qué',
              ph: 'Mercado Libre: nunca me deja con la duda de mi pedido',
            },
          ]
        ),
        { id: 'no_parecer', tipo: 'texto', etiqueta: '¿A qué NO quieres parecerte?', ph: 'Un tipo de negocio, una actitud, un estilo' },
      ],
    },
    {
      corto: 'Promesa y esencia',
      area: 'marca',
      tiempo: '≈ 7 min',
      titulo: 'Lo que prometes y lo que eres',
      entrada:
        '¿Por qué tú y no el de al lado? Esta es la frase que tu cliente debería poder repetir de memoria, y el documento del que sale todo lo demás. Una frase por pregunta, sin adjetivos de relleno.',
      preguntas: [
        {
          tipo: 'comparar',
          filas: [
            ['Soluciones de calidad', 'Sitios para pymes entregados en 15 días, con soporte el primer año'],
            ['Atención personalizada', 'Hablas siempre con quien hace el trabajo, no con un vendedor'],
            ['Los mejores precios', 'Cotización en 24 horas y precio cerrado, sin cobros sorpresa'],
          ],
        },
        columnas(
          [{ id: 'por_que', tipo: 'parrafo', etiqueta: '¿Por qué te eligen tus clientes hoy?', clave: true, filas: 2, ph: 'Lo que te dicen cuando vuelven o te recomiendan' }],
          [
            {
              id: 'promesa',
              tipo: 'parrafo',
              etiqueta: '¿Qué puedes prometer con un número, un plazo o una condición?',
              clave: true,
              filas: 2,
              ph: 'Respuesta en 2 horas, garantía de 6 meses, despacho el mismo día…',
            },
          ]
        ),
        {
          id: 'frase',
          tipo: 'frase',
          etiqueta: 'Completa la frase (no tiene que quedar perfecta)',
          partes: [
            'Para ',
            { id: 'frase_publico', etiqueta: 'Para quién', ph: 'tu cliente ideal' },
            ', ',
            { id: 'frase_marca', etiqueta: 'Marca', ph: 'tu marca' },
            ' es el/la ',
            { id: 'frase_categoria', etiqueta: 'Categoría', ph: 'qué eres' },
            ' que ',
            { id: 'frase_beneficio', etiqueta: 'Beneficio', ph: 'tu beneficio único' },
            ', porque ',
            { id: 'frase_razon', etiqueta: 'Razón para creer', ph: 'la prueba de que es cierto' },
            '.',
          ],
          ejemplo:
            'Para dueños de pymes sin equipo técnico, Nodo es el estudio de desarrollo que entrega un sitio funcionando en 15 días con soporte incluido, porque trabaja con un solo cliente a la vez y lo garantiza por contrato.',
        },
        { id: 'proposito', tipo: 'texto', etiqueta: 'Propósito: ¿por qué existe tu negocio, más allá del dinero?', ph: 'Una frase' },
        columnas(
          [{ id: 'mision', tipo: 'texto', etiqueta: 'Misión: ¿qué haces hoy, en concreto?', ph: 'Una frase' }],
          [{ id: 'vision', tipo: 'texto', etiqueta: 'Visión: ¿dónde quieres estar en 5 años?', ph: 'Una frase' }]
        ),
        {
          id: 'valores',
          tipo: 'tabla',
          etiqueta: 'Hasta 3 valores, traducidos a conductas',
          ayuda: 'Si no puedes decir qué haces SIEMPRE y qué NUNCA, no es un valor, es un adorno.',
          filas: 3,
          columnas: [
            { id: 'valor', etiqueta: 'Valor', ph: 'Transparencia' },
            { id: 'siempre', etiqueta: 'Siempre…', ph: 'mostramos el precio final antes de empezar' },
            { id: 'nunca', etiqueta: 'Nunca…', ph: 'cobramos algo que no avisamos' },
          ],
        },
        {
          id: 'arquetipo',
          tipo: 'una',
          etiqueta: 'Si tu marca fuera una persona, ¿cuál se parece más?',
          otro: true,
          opciones: [
            conImagen('arquetipo-sabio', 'sabio', 'El Sabio', 'Enseña y explica. Genera confianza por lo que sabe.'),
            conImagen('arquetipo-creador', 'creador', 'El Creador', 'Construye cosas nuevas. Cuida el oficio y el detalle.'),
            conImagen('arquetipo-mago', 'mago', 'El Mago', 'Hace simple lo complicado. Efecto «wow».'),
            conImagen('arquetipo-cuidador', 'cuidador', 'El Cuidador', 'Protege y acompaña. Cercano y servicial.'),
            conImagen('arquetipo-heroe', 'heroe', 'El Héroe', 'Resuelve lo difícil. Directo, valiente, eficaz.'),
            conImagen('arquetipo-explorador', 'explorador', 'El Explorador', 'Abre caminos. Libre, curioso, distinto.'),
            conImagen('arquetipo-no-se', 'no-se', 'No sé', 'Lo conversamos en la reunión.'),
          ],
        },
        {
          id: 'personalidad',
          tipo: 'varias',
          etiqueta: 'Elige 3 palabras que describan su personalidad',
          max: 3,
          otro: true,
          opciones: palabras(
            'Cercana', 'Seria', 'Experta', 'Divertida', 'Cálida', 'Directa', 'Elegante', 'Moderna',
            'Tradicional', 'Rebelde', 'Tranquila', 'Enérgica', 'Confiable', 'Ingeniosa', 'Sencilla', 'Audaz'
          ),
        },
      ],
    },
    {
      corto: 'Nombre y voz',
      area: 'marca',
      tiempo: '≈ 4 min',
      titulo: 'Nombre y voz',
      entrada:
        'El nombre es lo primero que se dice y lo último que se cambia. La voz aparece en cada correo, cotización y página.',
      preguntas: [
        {
          id: 'tiene_nombre',
          tipo: 'una',
          etiqueta: '¿Tienes nombre?',
          opciones: [o('mantener', 'Sí, y lo mantengo'), o('abierto', 'Sí, pero estoy abierto a cambiarlo'), o('no', 'No, necesito uno')],
        },
        {
          id: 'tipo_nombre',
          tipo: 'varias',
          etiqueta: 'Si buscas nombre, ¿qué tipo te gusta más? Elige hasta 2',
          max: 2,
          opciones: [
            o('descriptivo', 'Descriptivo', 'Dice lo que haces. Ej.: «Repuestos del Sur»'),
            o('evocativo', 'Evocativo', 'Sugiere una idea. Ej.: «Brújula», «Nimbus»'),
            o('inventado', 'Inventado', 'Sin significado previo. Ej.: «Zentra», «Kaleo»'),
            o('siglas', 'Siglas', 'Iniciales. Ej.: «IBM», «SAP»'),
            o('homofono', 'Homófono', 'Suena a una frase, se escribe distinto. Ej.: «tuReviu»'),
            o('fusion', 'Fusión de palabras', 'Dos palabras unidas en una. Ej.: «Mercadolibre», «Netflix»'),
          ],
        },
        { id: 'ideas_nombre', tipo: 'texto', etiqueta: 'Ideas, palabras o sensaciones que el nombre debería evocar', ph: 'Palabras sueltas, en cualquier idioma' },
        escala('tono_cercania', '¿Cómo le hablas a tu cliente?', ['Cercano', 'como un amigo'], ['Formal', 'como una institución']),
        escala('tono_tecnico', '¿Cuánto detalle técnico usas?', ['Simple', 'sin jerga'], ['Técnico', 'para expertos']),
        escala('tono_energia', '¿Qué energía tiene tu marca?', ['Calmada', 'serena, pausada'], ['Enérgica', 'intensa, con ritmo']),
        { id: 'prohibidas', tipo: 'texto', etiqueta: 'Frases o palabras que tu marca NUNCA diría', ph: '«Soluciones integrales 360», «sinergia»…' },
        {
          id: 'frase_tipo',
          tipo: 'una',
          etiqueta: 'Si tuvieras una frase junto al logo, ¿de qué tipo sería?',
          opciones: [
            o('funcional', 'Funcional', 'Dice lo que haces: «Sitios web que sí venden»'),
            o('emocional', 'Emocional', 'Apela a lo que se siente: «Tu negocio, por fin en línea»'),
            o('actitud', 'Actitud', 'Declara una postura: «Sin jerga. Sin sorpresas.»'),
          ],
        },
        { id: 'frase_idea', tipo: 'texto', etiqueta: '¿Se te ocurre alguna?', ph: 'Aunque sea en borrador' },
      ],
    },
    {
      corto: 'Qué debe lograr el sitio',
      area: 'diseno',
      tiempo: '≈ 3 min',
      titulo: 'Qué debe lograr tu sitio',
      entrada: 'Un sitio no es una vitrina: es una herramienta para que alguien haga algo. Empecemos por ahí.',
      preguntas: [
        {
          id: 'objetivo',
          tipo: 'una',
          etiqueta: '¿Qué es lo PRIMERO que debe hacer un visitante?',
          clave: true,
          opciones: [
            o('whatsapp', 'Escribirme por WhatsApp', 'Conversación directa'),
            o('cotizar', 'Pedir una cotización', 'Formulario con detalles'),
            o('comprar', 'Comprar en línea', 'Tienda con pago'),
            o('agendar', 'Agendar una hora', 'Reserva en calendario'),
            o('llamar', 'Llamarme o visitarme', 'Teléfono y dirección'),
            o('conocer', 'Conocerme y confiar', 'Credibilidad, trayectoria'),
          ],
        },
        columnas(
          [
            {
              id: 'cinco_segundos',
              tipo: 'texto',
              etiqueta: 'En 5 segundos, ¿qué debe entender alguien que entra?',
              clave: true,
              ph: 'Reparamos tu notebook en 24 horas, con garantía',
            },
          ],
          [{ id: 'boton', tipo: 'texto', etiqueta: '¿Qué diría el botón principal?', ph: 'Cotiza por WhatsApp, Agenda tu hora…' }]
        ),
        columnas(
          [
            {
              id: 'sentir',
              tipo: 'varias',
              etiqueta: '¿Qué debe SENTIR el visitante? Elige 3',
              max: 3,
              otro: true,
              opciones: palabras(
                'Confianza', 'Cercanía', 'Exclusividad', 'Rapidez', 'Innovación', 'Solidez', 'Simplicidad', 'Calidez',
                'Experiencia', 'Energía', 'Tranquilidad', 'Diversión', 'Profesionalismo', 'Orgullo local', 'Cuidado', 'Precisión'
              ),
            },
          ],
          [
            {
              id: 'no_sentir',
              tipo: 'varias',
              etiqueta: '¿Qué NO debe sentir nunca? Elige hasta 3',
              max: 3,
              opciones: palabras(
                'Barato', 'Frío', 'Anticuado', 'Complicado', 'Desordenado', 'Genérico',
                'Agresivo', 'Infantil', 'Pretencioso', 'Aburrido', 'Poco serio', 'Corporativo'
              ),
            },
          ]
        ),
      ],
    },
    {
      corto: 'Cómo se ve',
      area: 'diseno',
      tiempo: '≈ 7 min',
      titulo: 'Cómo se ve',
      entrada:
        'Aquí eliges con imágenes, no con jerga: tú marcas lo que te gusta y nosotros lo traducimos a diseño. Las imágenes son referencias, no diseños finales.',
      preguntas: [
        conMockup(
          escala('luz', 'Luz', ['Claro', 'fondos blancos, aire'], ['Oscuro', 'fondos profundos, contraste']),
          escala('densidad', 'Cantidad de cosas en pantalla', ['Minimalista', 'poco y grande'], ['Completo', 'mucha información']),
          escala('color', 'Color', ['Sobrio', 'neutros, un color'], ['Colorido', 'varios colores vivos']),
          escala('formas', 'Formas', ['Rectas', 'esquinas duras, precisión'], ['Redondeadas', 'curvas, suavidad']),
          escala('epoca', 'Época', ['Clásico', 'tradición, atemporal'], ['Vanguardista', 'actual, experimental']),
          escala('actitud', 'Actitud', ['Serio', 'formal, sobrio'], ['Lúdico', 'juguetón, con humor']),
          escala('movimiento_escala', 'Movimiento', ['Quieto', 'nada se mueve'], ['Dinámico', 'animaciones protagonistas'])
        ),
        {
          id: 'bocetos',
          tipo: 'bocetos',
          etiqueta: 'Direcciones de estilo: ¿cuáles te gustan?',
          ayuda:
            'Cada estilo tiene su boceto: la página entera de una marca inventada. Ábrelo, recórrelo y dinos qué te parece. Los que te gustan son tu elección.',
          clave: true,
        },
        {
          id: 'portada',
          tipo: 'varias',
          etiqueta: '¿Cómo te imaginas la portada del sitio? Elige hasta 2',
          max: 2,
          opciones: [
            conImagen('portada-centrada', 'centrada', 'Centrada', 'Frase al medio, simple y directa'),
            conImagen('portada-dividida', 'dividida', 'Dividida', 'Texto a un lado, imagen al otro'),
            conImagen('portada-imagen-completa', 'imagen-completa', 'Imagen completa', 'Foto de borde a borde, texto encima'),
            conImagen('portada-asimetrica', 'asimetrica', 'Editorial asimétrica', 'Como una revista, bloques desfasados'),
            conImagen('portada-mosaico', 'mosaico', 'Mosaico', 'Bloques de distintos tamaños'),
            conImagen('portada-historia', 'historia', 'Historia al bajar', 'Secciones que se alternan al hacer scroll'),
          ],
        },
        columnas(
          [
            {
              id: 'logo',
              tipo: 'una',
              etiqueta: '¿Ya tienes logo?',
              opciones: [o('si', 'Sí, en buena calidad (SVG, AI o PDF)'), o('imagen', 'Solo en imagen (PNG o JPG)'), o('no', 'No tengo logo')],
            },
          ],
          [
            {
              id: 'logo_archivo',
              tipo: 'archivo',
              etiqueta: 'Si lo tienes, súbelo',
              ayuda: 'SVG, PDF, AI, EPS, PNG, JPG o WEBP, hasta 5 MB. Nos llega adjunto con tu brief.',
            },
          ]
        ),
        {
          id: 'tipo_logo',
          tipo: 'varias',
          etiqueta: '¿Qué tipo de logo imaginas? Elige hasta 2',
          ayuda: 'Las muestras usan el nombre de tu negocio. Si mantienes tu logo actual, puedes saltarla.',
          max: 2,
          muestras: 'logo',
          opciones: [
            o('nombre', 'Logotipo', 'Solo el nombre, con su letra'),
            o('monograma', 'Monograma', 'Las iniciales, entrelazadas'),
            o('simbolo', 'Símbolo', 'Un dibujo que se reconoce solo'),
            o('abstracto', 'Abstracto', 'Una forma propia, sin dibujo literal'),
            o('simbolo-y-nombre', 'Símbolo + nombre', 'Separados, funcionan aparte'),
            o('fundidos', 'Fundidos', 'Símbolo y texto en una pieza'),
            o('emblema', 'Emblema', 'El nombre dentro de un sello o escudo'),
            o('mascota', 'Mascota', 'Un personaje que da la cara'),
            o('firma', 'Firma', 'Escrito a mano, personal'),
            o('variable', 'Variable', 'Cambia de forma o color según dónde va'),
          ],
        },
        {
          id: 'tiene_colores',
          tipo: 'una',
          etiqueta: '¿Tu marca ya tiene colores definidos?',
          opciones: [o('si', 'Sí, y se mantienen'), o('flexibles', 'Sí, pero son flexibles'), o('no', 'No, hay que definirlos')],
        },
        {
          id: 'colores',
          tipo: 'colores',
          etiqueta: 'Tus colores, si los tienes',
          ayuda: 'El código (ej.: #116492), el más parecido en el selector o su nombre.',
          espacios: ['Principal', 'Secundario', 'Acento', 'Neutro'],
        },
        columnas(
          [{ id: 'familias_si', tipo: 'varias', etiqueta: 'Familias de color que te atraen', max: 3, opciones: FAMILIAS }],
          [{ id: 'familias_no', tipo: 'varias', etiqueta: 'Familias que NO quieres ver', max: 3, opciones: FAMILIAS }]
        ),
        {
          id: 'tipografia',
          tipo: 'varias',
          etiqueta: '¿Qué letra se parece más a tu marca? Elige hasta 2',
          max: 2,
          muestras: 'tipografia',
          opciones: [
            o('moderna', 'Moderna', 'Sans moderna: limpia, actual, neutra'),
            o('geometrica', 'Geométrica', 'Técnica, con carácter'),
            o('serif', 'Serif', 'Editorial, clásica, confiable'),
            o('redondeada', 'Redondeada', 'Amable, cercana'),
            o('display', 'Display', 'Impacto, energía'),
            o('tecnica', 'Técnica', 'Monoespaciada: código, precisión'),
            o('didona', 'Didona', 'Elegante, de revista'),
            o('clasica-fina', 'Clásica fina', 'Lujo, delicadeza'),
            o('slab', 'Slab', 'Sólida, de oficio'),
            o('condensada', 'Condensada', 'Fuerte, industrial'),
            o('manuscrita', 'Manuscrita', 'Artesanal, personal'),
            o('script', 'Script retro', 'Nostalgia, cercanía'),
            o('expresiva', 'Expresiva', 'Creativa, de estudio'),
            o('ancha', 'Ancha futurista', 'Tecnología, audacia'),
          ],
        },
        {
          id: 'referencias',
          tipo: 'tabla',
          etiqueta: '3 sitios que te gusten (de cualquier rubro) y qué te gusta de cada uno',
          filas: 3,
          columnas: [
            { id: 'sitio', etiqueta: 'Sitio o marca', ph: 'Nombre o link' },
            { id: 'que', etiqueta: 'Qué te gusta', ph: 'Los colores, lo simple, las fotos…' },
          ],
        },
        { id: 'no_gusta', tipo: 'texto', etiqueta: 'Un sitio que NO te gusta, y por qué', ph: 'También ayuda muchísimo' },
        {
          id: 'vision_detalle',
          tipo: 'parrafo',
          etiqueta: 'Con todo a la vista, cuéntanos tu visión',
          ayuda: 'Lo que te gustó, lo que no soportas y por qué. Nos sirve más una queja concreta que un «me gusta todo».',
          filas: 7,
          ph: 'Me gustó Bruma porque se siente de barrio sin ser rústico. No soporto los sitios oscuros con letras doradas…',
          guias: ['Lo que más me gustó fue ', 'No soporto ', 'Mi marca nunca debería verse ', 'Quien entre debería sentir '],
        },
      ],
    },
    {
      corto: 'Imágenes y estructura',
      area: 'diseno',
      tiempo: '≈ 5 min',
      titulo: 'Imágenes y estructura',
      entrada:
        'Las imágenes dicen más que los textos, y son lo que más cuesta conseguir. Después, los bloques: así se arma una página. Marca los que quieres y la estrella en los imprescindibles.',
      preguntas: [
        {
          id: 'imagenes',
          tipo: 'varias',
          etiqueta: '¿Qué tipo de imágenes quieres? Elige hasta 3',
          max: 3,
          opciones: [
            conImagen('imagen-fotos-reales', 'fotos-reales', 'Fotos reales', 'Tu equipo, tu local, tus clientes'),
            conImagen('imagen-producto', 'producto', 'Fotos de producto', 'Lo que vendes, bien iluminado'),
            conImagen('imagen-banco', 'banco', 'Fotos de banco', 'Imágenes compradas o gratuitas'),
            conImagen('imagen-ilustracion', 'ilustracion', 'Ilustración', 'Dibujos hechos a medida'),
            conImagen('imagen-iconos', 'iconos', 'Íconos', 'Simples, para explicar servicios'),
            conImagen('imagen-abstracto', 'abstracto', '3D o abstracto', 'Formas, texturas, degradados'),
            conImagen('imagen-capturas', 'capturas', 'Capturas de pantalla', 'Si vendes software o apps'),
            conImagen('imagen-tipografia', 'tipografia', 'Solo tipografía', 'Las palabras son la imagen'),
          ],
        },
        columnas(
          [
            {
              id: 'fotos_propias',
              tipo: 'una',
              etiqueta: '¿Tienes fotos propias?',
              opciones: [o('profesionales', 'Sí, profesionales'), o('celular', 'Sí, con celular'), o('algunas', 'Algunas'), o('no', 'No, hay que conseguirlas')],
            },
            {
              id: 'video',
              tipo: 'una',
              etiqueta: '¿Tienes video o te interesa tenerlo?',
              opciones: [o('tengo', 'Tengo video'), o('me-interesa', 'Me interesa'), o('no', 'No por ahora')],
            },
          ],
          [
            {
              id: 'personas',
              tipo: 'varias',
              etiqueta: '¿Quién aparece en el sitio?',
              opciones: [o('dueno', 'Yo, el dueño'), o('equipo', 'El equipo'), o('clientes', 'Clientes reales'), o('nadie', 'Nadie, sin rostros')],
            },
          ]
        ),
        {
          id: 'movimiento',
          tipo: 'una',
          etiqueta: '¿Cuánto movimiento quieres?',
          opciones: [
            conImagen('movimiento-quieto', 'quieto', 'Quieto', 'Rápido y directo. Nada distrae.'),
            conImagen('movimiento-sutil', 'sutil', 'Sutil', 'Aparece suave al hacer scroll.'),
            conImagen('movimiento-protagonista', 'protagonista', 'Protagonista', 'Animaciones que cuentan algo.'),
          ],
        },
        {
          id: 'paginas',
          tipo: 'varias',
          etiqueta: '¿Qué páginas necesita tu sitio?',
          otro: true,
          opciones: [
            o('inicio', 'Inicio'),
            o('servicios', 'Servicios'),
            o('tienda', 'Productos / Tienda'),
            o('nosotros', 'Nosotros'),
            o('portafolio', 'Trabajos / Portafolio'),
            o('precios', 'Precios'),
            o('blog', 'Blog / Noticias'),
            o('preguntas', 'Preguntas frecuentes'),
            o('contacto', 'Contacto'),
            o('trabaja', 'Trabaja con nosotros'),
          ],
        },
        {
          id: 'bloques',
          tipo: 'varias',
          etiqueta: 'Bloques para tu portada',
          estrella: true,
          opciones: [
            conImagen('bloque-portada-imagen', 'portada-imagen', 'Portada con imagen', 'Foto grande, frase y botón'),
            conImagen('bloque-portada-video', 'portada-video', 'Portada con video', 'Video de fondo'),
            conImagen('bloque-portada-texto', 'portada-texto', 'Portada solo texto', 'Una frase potente'),
            conImagen('bloque-servicios', 'servicios', 'Servicios', 'Tarjetas con lo que haces'),
            conImagen('bloque-proceso', 'proceso', 'Cómo trabajamos', 'Pasos numerados'),
            conImagen('bloque-cifras', 'cifras', 'Cifras', 'Años, clientes, tiempos'),
            conImagen('bloque-logos', 'logos', 'Logos de clientes', 'Empresas que confían en ti'),
            conImagen('bloque-testimonios', 'testimonios', 'Testimonios', 'Lo que dicen tus clientes'),
            conImagen('bloque-galeria', 'galeria', 'Galería de trabajos', 'Fotos de proyectos'),
            conImagen('bloque-antes-despues', 'antes-despues', 'Antes y después', 'Comparar con un deslizador'),
            conImagen('bloque-equipo', 'equipo', 'Equipo', 'Rostros y cargos'),
            conImagen('bloque-precios', 'precios', 'Planes y precios', 'Tabla comparativa'),
            conImagen('bloque-preguntas', 'preguntas', 'Preguntas frecuentes', 'Respuestas desplegables'),
            conImagen('bloque-formulario', 'formulario', 'Formulario', 'Contacto o cotización'),
            conImagen('bloque-agenda', 'agenda', 'Agenda en línea', 'Elegir día y hora'),
            conImagen('bloque-mapa', 'mapa', 'Mapa y dirección', 'Cómo llegar'),
            conImagen('bloque-whatsapp', 'whatsapp', 'Botón de WhatsApp', 'Flotante en toda la página'),
            conImagen('bloque-instagram', 'instagram', 'Feed de Instagram', 'Tus últimas publicaciones'),
            conImagen('bloque-noticias', 'noticias', 'Últimas noticias', 'Artículos o novedades'),
            conImagen('bloque-suscripcion', 'suscripcion', 'Suscripción', 'Recibir correos'),
          ],
        },
      ],
    },
    {
      corto: 'Lo práctico',
      area: 'diseno',
      tiempo: '≈ 4 min',
      titulo: 'Lo práctico',
      entrada: 'Quién pone qué, qué tiene que poder hacer el sitio, qué piezas necesitas para salir al mercado y para cuándo.',
      preguntas: [
        columnas(
          [
            {
              id: 'textos',
              tipo: 'una',
              etiqueta: '¿Quién escribe los textos?',
              opciones: [o('yo', 'Yo los tengo'), o('ideas', 'Tengo ideas, necesito ayuda'), o('ustedes', 'Que los escriban ustedes')],
            },
            { id: 'plazo', tipo: 'texto', etiqueta: '¿Para cuándo lo necesitas?', clave: true, ph: 'Una fecha o un evento (lanzamiento, feria…)' },
          ],
          [
            {
              id: 'visitas',
              tipo: 'una',
              etiqueta: '¿Desde dónde te visitan más?',
              opciones: [o('celular', 'Celular'), o('computador', 'Computador'), o('no-se', 'No lo sé')],
            },
            {
              id: 'dominio',
              tipo: 'una',
              etiqueta: '¿Tienes dominio (tunegocio.cl)?',
              opciones: [o('si', 'Sí'), o('no', 'No'), o('no-se', 'No sé qué es')],
            },
            {
              id: 'inapi',
              tipo: 'una',
              etiqueta: '¿Tu marca está registrada en INAPI?',
              opciones: [o('si', 'Sí'), o('en-tramite', 'En trámite'), o('no', 'No'), o('no-se', 'No sé qué es')],
            },
          ],
          [{ titulo: 'Lo que tienes' }, { titulo: 'Lo técnico' }]
        ),
        {
          id: 'funciones',
          tipo: 'varias',
          etiqueta: '¿Qué tiene que poder hacer el sitio?',
          otro: true,
          opciones: [
            o('pagos', 'Recibir pagos'),
            o('catalogo', 'Mostrar catálogo'),
            o('reservas', 'Reservar horas'),
            o('cotizar', 'Cotizar en línea'),
            o('noticias', 'Publicar noticias yo mismo'),
            o('idiomas', 'Varios idiomas'),
            o('clientes', 'Zona de clientes con clave'),
            o('correos', 'Enviar correos'),
            o('editar', 'Editar textos yo mismo'),
          ],
        },
        {
          id: 'piezas',
          tipo: 'varias',
          etiqueta: '¿Qué piezas de marca necesitas?',
          opciones: [
            o('tarjeta', 'Tarjeta de presentación'),
            o('firma', 'Firma de correo'),
            o('cotizacion', 'Plantilla de cotización'),
            o('propuesta', 'Plantilla de propuesta'),
            o('presentacion', 'Presentación comercial'),
            o('contrato', 'Contrato y factura'),
            o('instagram', 'Perfil de Instagram'),
            o('linkedin', 'Perfil de LinkedIn'),
            o('letrero', 'Letrero o fachada'),
            o('vehiculo', 'Vehículo o uniforme'),
            o('envases', 'Envases o etiquetas'),
            o('manual', 'Manual de marca'),
          ],
        },
        { id: 'extra', tipo: 'parrafo', etiqueta: '¿Algo más que debamos saber?', ph: 'Socios que opinan, miedos, ideas, algo que viste y te encantó…' },
      ],
    },
  ],
}
