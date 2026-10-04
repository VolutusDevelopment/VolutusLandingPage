/**
 * Textos del juego. Para agregar o cambiar uno, edita estas listas: cada
 * chiste es una lista de renglones. Se admiten tildes, Ñ y signos españoles;
 * las líneas largas se acomodan solas al ancho del globo.
 */

export const BURLAS = [
  ['¡JA, JA, JA!'],
  ['¿SIQUIERA', 'ESTÁS INTENTANDO?'],
  ['¿TODAVÍA', 'NO ME DAS?'],
  ['YO TAMBIÉN', 'ESTOY ABURRIDO.'],
  ['¿ESO ERA', 'UN DISPARO?'],
  ['EL PROGRAMADOR', 'ME DIJO QUE', 'NO TE DEJARA GANAR.'],
  ['NO TE PREOCUPES,', 'NADIE ESTÁ', 'MIRANDO.'],
  ['BUENO…', 'APÚRATE.'],
  ['CREO QUE', 'ESTE JUEGO', 'NO ES PARA TI.'],
  ['¿APUNTASTE', 'CON LOS OJOS CERRADOS?'],
  ['¡QUÉ MIEDO!'],
  ['BUENO…', 'NO TANTO.'],
  ['¡NI COSQUILLAS!'],
  ['¿ESO FUE', 'A PROPÓSITO?'],
  ['TE FALTA', 'PATO…'],
  ['¡JA! ¡QUÉ', 'VERGÜENZA!'],
  ['MI ABUELA', 'APUNTA MEJOR.'],
  ['¿NECESITAS', 'ANTEOJOS?'],
  ['¡QUÉ RÁPIDO!', 'FALLASTE.'],
  ['¿CUÁNTO', 'LLEVAS JUGANDO?'],
  ['¿ESTO ES', 'TU ENTRETENIMIENTO?'],
  ['LLEVAS', 'DEMASIADO TIEMPO.'],


]

// Se muestra uno por nivel, en este orden; al terminar la lista, vuelve al
// primero. Puedes reordenar o reemplazar los renglones sin tocar el pintor.
export const RECLAMOS = [
  ['¡LE VOY A', 'CONTAR A', 'TU MAMÁ!'],
  ['¿QUÉ TE', 'HICE YO?'],
  ['ESPERO QUE', 'DUERMAS', 'TRANQUILO…'],
  ['¡FELICIDADES!', 'MATASTE A', 'TODA MI', 'FAMILIA.']
  
]

export const NIVELES = ['FÁCIL', 'MEDIO', 'DIFÍCIL', 'MUY DIFÍCIL', 'IMPOSIBLE']

// El modo sin fin, que se desbloquea al terminar una partida.
export const MODO_ODIO = 'ODIO A LOS PATOS'

// Cómo se dispara, en el letrero del primer nivel: con el dedo o con el mouse.
export const INSTRUCCION = {
  toque: ['TOCA AL PATO', 'PARA CAZARLO'],
  clic: ['HAZ CLIC EN EL PATO', 'PARA CAZARLO'],
}

// Lo que dice el último pato que queda, al final de la partida.
export const DESPEDIDA = ['¿¡CONTENTO!?']

// El letrero del final: el título y debajo, la cuenta.
export const FIN = (cazados) => ['FIN', `CAZASTE ${cazados} PATOS.`, 'DESBLOQUEASTE:', MODO_ODIO]




// El modo sin fin, para quien no se quiere ir: las burlas y los reclamos saben
// que el juego ya terminó. Siguen desde donde quedaron en la partida anterior.
export const BURLAS_ODIO = [
['¿NO TIENES', 'NADA MEJOR', 'QUE HACER?'],
['LLEVAS TANTO', 'TIEMPO AQUÍ', 'QUE YA ME', 'SÉ TUS HORARIOS.'],
['EL PROBLEMA', 'NO SOY YO.'],
['¿HAS PENSADO', 'EN DESINSTALARME?'],
['MI CREADOR', 'ME DIO PATAS.', 'A TI NO TE DIO', 'PUNTERÍA.'],
['JA, JA, JA.', 'AH, NO.', 'ERA UN CUAC.'],
['¿OTRA VEZ?', 'QUÉ SORPRESA.'],
['TE JURO QUE', 'ME DEJÉ DAR.'],
['HASTA MI SOMBRA', 'TE ESQUIVA.'],
['NO ES UN BUG.', 'ERES TÚ.'],
['¿QUIERES QUE', 'ME QUEDE QUIETO?', 'QUÉ TIERNO.'],
['HE VISTO', 'PIEDRAS CON', 'MÁS REFLEJOS.'],
['¿CUÁNTAS VECES', 'VAS A FALLAR?'],
['NO TE JUZGO.', 'BUENO, SÍ.'],
['MI PATO INTERIOR', 'SE ESTÁ RIENDO.'],
['PODRÍAS CAZARME', 'SI TUVIERAS', 'UN POCO DE…', '¿TALENTO?'],
['EL RÉCORD MUNDIAL', 'DE FALLAR', 'ES TUYO.'],
['¿ESTÁS JUGANDO', 'CON LOS CODOS?'],
['ME ESTOY', 'HACIENDO VIEJO.', 'Y SOY UN PATO.'],
['NO ME ATRAPAS.', 'NO ATRAPAS', 'NI LA SEÑAL WIFI.'],
['TU PUNTERÍA', 'ES ARTE MODERNO.', 'NADIE LA ENTIENDE.'],
['¿SIGUES AQUÍ?', 'QUÉ RELACIÓN', 'MÁS TÓXICA.'],
['EL PROGRAMADOR', 'PREGUNTÓ POR TI.', 'DIJO QUE', 'LE DAS PENA.'],
['VOY A PEDIR', 'VACACIONES.', 'ME LAS MEREZCO.'],
['¿QUIERES GANAR?', 'QUÉ AMBICIOSO.'],
['MI FAMILIA', 'YA HIZO', 'UN GRUPO DE APOYO.'],
['ESTO YA NO', 'ES CAZA.', 'ES ACOSO.'],
['NO TE ODIO.', 'NO ERES TAN', 'IMPORTANTE.'],
['TE DARÍA', 'UNA OPORTUNIDAD,', 'PERO YA TUVE', 'DEMASIADAS.'],
['¿SABES QUÉ?', 'VOY A DEJAR', 'QUE ME ATRAPES.', 'MENTIRA.'],
['TU PACIENCIA', 'ES ADMIRABLE.', 'TU PUNTERÍA, NO.'],
['HE REINICIADO', 'MI VIDA ENTERA', 'ANTES QUE TÚ', 'ACERTARAS.'],
['¿HAS PROBADO', 'APUNTAR AL PATO?'],
['ESTOY EMPEZANDO', 'A SENTIR PENA.', 'Y SOY UN PATO.'],
['NO PUEDES', 'MATAR LO QUE', 'NO PUEDES TOCAR.'],
['CUAC.', 'ESO SIGNIFICA', 'QUE FALLASTE.'],
['¿TE QUEDASTE', 'SIN DIGNIDAD', 'O SIN BALAS?'],
['TU FAMILIA', 'PREGUNTA POR TI.'],
['LLEVO TANTO', 'ESQUIVÁNDOTE', 'QUE YA ES DEPORTE.'],
['¿ESTE ES EL', 'FINAL SECRETO?', 'QUÉ DECEPCIÓN.'],
];




export const RECLAMOS_ODIO = [
  ['¿TODAVÍA', 'AQUÍ?'],
  ['¡ERES MI', 'VILLANO, Y  NO', 'MI FAVORITO!'],  
  ['¡MI ARMADURA', 'ERA ARRENDADA!'],
  ['NO SEGUIRÉ', 'LA LEY 21.719', 'PARA ENCONTRARTE'],
  ['YA SÉ DONDE', 'VIVES…'],
  ['AVADA KEDAVRA'],
]

// Mensajes del pato que aparece en el footer. Se alternan en este orden y
// vuelven al primero al terminar la lista.
export const DICHOS_FOOTER = [
  ['¿A QUE NO', 'ME CAZAS?'],
  ['¿POR QUÉ LOS', 'PATOS DICEN CUAC?…'],
  ['PORQUE NO', 'PUEDEN DECIR:', 'MIAU'],
  ['HAY PATO', 'PARA RATO…'],
  ['QUE ELEGANCIA', 'LA DE FRANCIA'],
  ['SOY MUY BELLO'],
  ['NO CONFÍES', 'EN UN PATO…'],
  ['…Y NO MIRES', 'ATRÁS…'],
  ['¿POR QUÉ', 'SIGUES AQUÍ?'],
  ['ESTE PATO', 'TIENE SUEÑO.'],
  ['YO NO PEDÍ', 'ESTAR AQUÍ.'],
  ['¿QUIÉN TE', 'DEJÓ ENTRAR?'],
  ['SOY UN PATO', 'MUY OCUPATO.'],
]
