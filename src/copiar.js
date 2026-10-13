// Los botones que copian un texto de la página: `data-copiar` es el id del
// elemento que lo guarda. Hoy, la política de privacidad en Markdown, para
// pegarla en un chat de IA (ver Privacidad.jsx).
//
// El texto ya viene en el HTML y se copia dentro del mismo clic: Safari solo
// deja escribir en el portapapeles mientras dura el gesto, y esperar una
// descarga lo perdería. El botón confirma unos segundos y vuelve; lo mismo se
// anuncia en `.copiar-aviso` para el lector de pantalla.

const AVISOS = {
  hecho: 'Copiado. Pégalo en el chat de tu IA.',
  error: 'No se pudo copiar. Selecciona el texto de la página y cópialo a mano.',
}

const DURACION = 3000

export default function initCopiar() {
  const aviso = document.querySelector('.copiar-aviso')

  document.querySelectorAll('[data-copiar]').forEach((boton) => {
    let volver
    boton.addEventListener('click', async () => {
      const texto = document.getElementById(boton.dataset.copiar).textContent
      try {
        await navigator.clipboard.writeText(texto)
        boton.dataset.estado = 'hecho'
      } catch {
        // Sin permiso, o sin `navigator.clipboard` fuera de HTTPS.
        boton.dataset.estado = 'error'
      }
      aviso.textContent = AVISOS[boton.dataset.estado]

      clearTimeout(volver)
      volver = setTimeout(() => {
        delete boton.dataset.estado
        aviso.textContent = ''
      }, DURACION)
    })
  })
}
