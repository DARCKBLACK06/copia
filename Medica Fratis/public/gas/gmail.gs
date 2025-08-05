/**
 * gmail.gs
 * enviarCorreoAdvertencia
 *
 * Envía un correo de advertencia al inquilino según su estado de pago.
 * Si la fecha aún no vence → recordatorio
 * Si ya venció → aviso urgente
 *
 * @param {string} nombre - Nombre del inquilino
 * @param {string} correo - Correo del inquilino
 * @param {string} fechaPago - Fecha límite de pago (YYYY-MM-DD)
 * @param {number} dias - Días restantes (negativo si ya venció)
 */
function enviarCorreoAdvertencia(nombre, correo, fechaPago, dias) {
  const hoyTexto = new Date().toLocaleDateString("es-MX");
  let asunto, cuerpo;

  if (dias >= 0) {
    asunto = "📅 Recordatorio de pago";
    cuerpo = `Hola ${nombre},\n\nTe recordamos que tu fecha de corte es el ${fechaPago}.\nAún tienes ${dias} día(s) para realizar tu pago.\n\nGracias por tu atención.\n\nFecha actual: ${hoyTexto}`;
  } else {
    asunto = "⚠️ URGENTE – Tu pago está vencido";
    cuerpo = `Hola ${nombre},\n\nTu pago debió realizarse el ${fechaPago}.\nHan pasado ${Math.abs(dias)} día(s).\nTu acceso puede ser restringido si no regularizas tu situación.\n\nFecha actual: ${hoyTexto}`;
  }

  GmailApp.sendEmail(correo, asunto, cuerpo);
  Logger.log(`✉️ Correo enviado a ${correo} | Asunto: ${asunto}`);
}


/**
 * borrarCorreosAntiguos
 * 
 * Busca en Gmail todos los correos con el asunto que indica comprobante de pago
 * y elimina aquellos cuya fecha de recepción sea mayor a 30 días.
 * 
 * Este paso se ejecuta solo desde main.gs (una vez por día).
 * 
 * 🔍 Criterio: 
 * Asunto debe contener "Comprobante de pago - Departamento dpto"
 * 
 * 🗑️ Acción:
 * Si han pasado más de 30 días → se mueve el hilo a la papelera.
 */
function borrarCorreosAntiguos() {
  const threads = GmailApp.search('subject:"Comprobante de pago"');
  const hoy = new Date();
  let eliminados = 0;

  threads.forEach(thread => {
    const mensajes = thread.getMessages();
    const mensaje = mensajes[0]; // Primer mensaje del hilo
    const fecha = mensaje.getDate();
    const dias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));

    if (dias >= 1) { // 🧪 Prueba: eliminar si tiene al menos 1 día
      thread.moveToTrash();
      eliminados++;
    }
  });

  Logger.log(`🗑️ Correos antiguos eliminados: ${eliminados}`);
}
