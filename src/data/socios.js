/**
 * Los socios (decisiones 16 y 34 del brief). Los pinta /nosotros, cada uno en
 * su tarjeta, y el prerender los declara como `Person`: en /nosotros enteros,
 * y en la portada y los artículos por su `@id`, como fundadores y autores.
 *
 * `id` es el ancla de su tarjeta (/nosotros#diego), y la de su `Person`. Las
 * fotos son provisorias, y cada descripción dice solo lo que se puede comprobar
 * en la portada. `fotoSrcSet` suma una versión más liviana cuando la foto tiene
 * píxeles de sobra para el teléfono; la de Rodrigo no los tiene, y va sola.
 * `avatar` es su cara recortada, de 120 px (3× de lo que mide en la firma de
 * los artículos, Articulo.jsx): unos 2.5 KB, en vez de la foto entera.
 *
 * `premios` son ids de data/proyectos.js: el texto sale de la credencial de
 * cada uno, que es la que lleva su prueba.
 */

const DUOC_UC = { nombre: 'Duoc UC', url: 'https://www.duoc.cl' }

export const SOCIOS = [
  {
    id: 'diego',
    nombre: 'Diego',
    apellidos: 'Peña y Lillo Luhrs',
    titulo: 'Ingeniero Informático con Especialidad en Inteligencia Artificial',
    institucion: DUOC_UC,
    rol: 'Socio co-fundador',
    foto: '/image/Diego.jpeg',
    fotoSrcSet: '/image/Diego-720.webp 720w, /image/Diego.jpeg 960w',
    avatar: '/image/Diego-120.webp',
    perfiles: {
      github: 'https://github.com/DiegoPyLL',
      linkedin: 'https://www.linkedin.com/in/diegopyll/',
    },
    premios: ['hackathon', 'ctf-pdi'],
    descripcion:
      'Me interesa entender las cosas, no solo usarlas. Esa necesidad me llevó a la programación, a la inteligencia artificial y a la filosofía, porque saber cómo funciona algo no sirve de mucho si no te preguntas para qué existe. La misma curiosidad me acompaña en los autos, que terminaron convirtiéndose en CarFlip, y otros retos personales. Resuelvo problemas sin apuro por la primera respuesta: los desarmo, pruebo y ajusto hasta que la solución tiene sentido. Hoy construyo Volutus junto a Rodrigo, con la idea de hacer soluciones que resuelvan problemas de fondo.',
  },
  {
    id: 'rodrigo',
    nombre: 'Rodrigo',
    apellidos: 'Martínez Becker',
    titulo: 'Ingeniero Informático con Especialidad en Inteligencia Artificial',
    institucion: DUOC_UC,
    rol: 'Socio co-fundador',
    foto: '/image/Rodrigo.webp',
    avatar: '/image/Rodrigo-120.webp',
    perfiles: {
      github: 'https://github.com/Marbeck-one',
      linkedin: 'https://www.linkedin.com/in/rodrigo-mart%C3%ADnez-becker-74b6ab241/',
    },
    premios: ['cybergames', 'hackathon', 'ctf-pdi'],
    descripcion:
      'Hoy el conocimiento llega al instante y casi cualquier solución está a un par de prompts. Yo prefiero no apurarme y disfrutar lo que nos hace humanos: el proceso. Si tenemos a mano toda la inteligencia reunida, lo mínimo es sacar de ella buenas ideas. Por eso quiero que cada producto que hago se note hecho a mano y no en serie. Si el camino A es el más rápido y rentable, y el B el que nos deja más lejos, tomo el B. Con esa paciencia gané el primer lugar en Cisco CyberGames Americas 2026, y hoy construyo Volutus junto a mi socio Diego.',
  },
]

/** El socio de un `id`, como lo nombra el `autor` de un artículo (lib/meta.js). */
export const socioDe = (id) => SOCIOS.find((socio) => socio.id === id)
