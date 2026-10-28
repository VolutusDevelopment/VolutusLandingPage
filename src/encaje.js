// El encaje de la portada, de /nosotros y de la tienda (Servicios.css,
// Nosotros.css y Tienda.css) deja bajar libre en sus zonas más altas que la
// pantalla: desde el borde de arriba de una de `ABAJO` hasta el final de la
// página, y desde el principio hasta el borde de abajo de una de `ARRIBA`.
// Pero con la rueda del ratón Chrome encaja cada tick al terminar, por
// dirección: desde donde quedó avanza otro tick más, y en una zona libre la
// página bajaba el doble y en dos tirones. El touchpad no, porque encaja donde
// quedó. Por eso, adentro de una zona libre la página no encaja (`.libre`). Se
// apaga un cuarto de pantalla pasado el borde y no en él: al volver, el encaje
// se prende donde la página todavía puede quedarse, y no la mueve.
const ABAJO = ['.servicios + .seccion', '.atardecer + .seccion > .contenedor', '.tienda-incluye + .seccion']
const ARRIBA = ['.tienda-incluye .titular']

export default function initEncaje() {
  const libres = new Set()

  // Encaja mientras cada borde está entero en su franja: para `ABAJO`, de un
  // cuarto de pantalla sobre la ventana hasta el final de la página, y para
  // `ARRIBA`, del principio hasta un cuarto bajo ella. Una franja y no una
  // línea, para que avise aunque el scroll la salte en un cuadro.
  const vigilar = (selectores, rootMargin) => {
    const bordes = document.querySelectorAll(selectores.join())
    if (!bordes.length) return
    const vigia = new IntersectionObserver(
      (entradas) => {
        for (const { target, intersectionRatio } of entradas) {
          if (intersectionRatio < 1) libres.add(target)
          else libres.delete(target)
        }
        document.documentElement.classList.toggle('libre', libres.size > 0)
      },
      { rootMargin, threshold: 1 },
    )
    bordes.forEach((borde) => vigia.observe(borde))
  }

  vigilar(ABAJO, '25% 0px 100000px 0px')
  vigilar(ARRIBA, '100000px 0px 25% 0px')
}
