/**
 * Lo que ofrecemos, en el orden en que la página lo cuenta.
 *
 * Vive aquí, en un módulo plano, porque lo leen dos sitios: el menú del
 * formulario (`Contacto.jsx`) y el Worker que recibe el envío, que solo acepta
 * estos valores. El Worker no puede importar un `.jsx` sin arrastrar React, y
 * copiar la lista en dos archivos es la forma segura de que un día no coincidan.
 *
 * Las tres primeras son las que la página respalda con obra: la web y la app
 * de PonleNota, el agente del hackathon. «Otro» recoge el resto.
 */
export const SERVICIOS = ['Una página web', 'Una app', 'Un agente de IA', 'Otro']
