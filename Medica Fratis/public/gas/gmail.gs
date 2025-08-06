/**
 * gmail.gs
 * obtenerCorreosDePago
 *
 * Verifica si existe un correo válido de comprobante de pago del inquilino.
 * Valida remitente, asunto, cuerpo con nombre, departamento y monto.
 *
 * @param {Object} inq - Objeto del inquilino (con .nombre, .correo, .departamento, .cantidadPago)
 * @returns {boolean} true si cumple con todos los criterios, false si no
 */
function obtenerCorreosDePago(inq) {
  const fechaHoy = getFechaActual().replace(/-/g, "/"); // formato Gmail: yyyy/mm/dd
  const query = `from:${inq.correo} subject:comprobante after:${fechaHoy}`;

  const threads = GmailApp.search(query, 0, 10);
  for (let i = 0; i < threads.length; i++) {
    const mensajes = threads[i].getMessages();
    for (let j = 0; j < mensajes.length; j++) {
      const mensaje = mensajes[j];
      const asunto = mensaje.getSubject().toLowerCase();
      const cuerpoOriginal = mensaje.getPlainBody();

      // Normalizar cuerpo: minúsculas, sin acentos
      const cuerpo = cuerpoOriginal
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const remitente = mensaje.getFrom().toLowerCase();

      // Validar campos
      const deptoValido = cuerpo.includes(inq.departamento.toLowerCase());
      const nombreValido = cuerpo.includes(
        inq.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      );

      // Validar monto con expresiones como $1300, 1,300, etc.
      const montoNumerico = inq.cantidadPago.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const montoRegex = new RegExp(`\\$?\\s?(${inq.cantidadPago}|${montoNumerico})\\b`);

      const montoValido = montoRegex.test(cuerpo);

      // Log para depuración
      Logger.log(`--- Correo analizado ---`);
      Logger.log(`De: ${remitente}`);
      Logger.log(`Asunto: ${asunto}`);
      Logger.log(`Cuerpo:\n${cuerpo}`);
      Logger.log(`Departamento válido: ${deptoValido}`);
      Logger.log(`Nombre válido: ${nombreValido}`);
      Logger.log(`Monto válido: ${montoValido}`);

      // Evaluación final
      if (
        remitente.includes(inq.correo.toLowerCase()) &&
        asunto.includes("comprobante") &&
        deptoValido &&
        montoValido &&
        nombreValido
      ) {
        Logger.log(`✔️ Correo válido encontrado para ${inq.id}`);

        const hilo = mensaje.getThread();

        // ✅ Agrega etiqueta "PagosProcesados" (la crea si no existe)
        const etiqueta = GmailApp.getUserLabelByName("PagosProcesados") || GmailApp.createLabel("PagosProcesados");
        hilo.addLabel(etiqueta);

        // ❌ Elimina etiqueta "INBOX" (Recibidos) del hilo
        hilo.moveToArchive(); // Esto lo elimina de "Recibidos" pero mantiene accesible por etiqueta

        return true;
      }

    }
  }

  Logger.log(`✖️ No se encontró correo válido para ${inq.id}`);
  Logger.log("Debug → inq.correo esperado: " + inq.correo.toLowerCase());
  Logger.log("Debug → departamento esperado: " + inq.departamento.toLowerCase());
  Logger.log("Debug → monto esperado: " + inq.cantidadPago);
  Logger.log("Debug → nombre esperado: " + inq.nombre.toLowerCase());

  return false;
}

/**
 * borrarCorreosAntiguos
 *
 * Elimina todos los correos con etiqueta 'PagosProcesados' que tengan
 * fecha anterior a 30 días desde hoy.
 *
 * @example
 * borrarCorreosAntiguos(); // Limpia correos antiguos procesados
 */
function borrarCorreosAntiguos() {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - 30);

  const fechaStr = Utilities.formatDate(fechaLimite, Session.getScriptTimeZone(), "yyyy/MM/dd");
  const query = `label:PagosProcesados before:${fechaStr}`;

  const threads = GmailApp.search(query);
  Logger.log(`🧾 Hilos encontrados con etiqueta 'PagosProcesados' antes de ${fechaStr}: ${threads.length}`);

  threads.forEach(thread => {
    try {
      thread.moveToTrash(); // Mover a la papelera
    } catch (e) {
      Logger.log("⚠️ Error al borrar hilo: " + e);
    }
  });

  Logger.log(`🗑️ Correos eliminados correctamente.`);
}

/**
 * verificarYActualizarPago
 *
 * Verifica si existe un correo de comprobante válido para el inquilino.
 * Si lo encuentra:
 *  - Cambia estadoPago a 'pagado'
 *  - Suma un mes a la fechaPago
 *  - Aplica la etiqueta 'PagosProcesados'
 *  - Elimina etiqueta 'INBOX'
 *  - Archiva el hilo
 *
 * @param {Object} inq - Objeto del inquilino con id, nombre, correo, departamento, cantidadPago, fechaPago
 */
function verificarYActualizarPago(inq) {
  const fechaHoy = getFechaActual().replace(/-/g, "/");
  const query = `from:${inq.correo} subject:comprobante after:${fechaHoy} -label:PagosProcesados`;

  const threads = GmailApp.search(query, 0, 10);
  for (let i = 0; i < threads.length; i++) {
    const mensajes = threads[i].getMessages();
    for (let j = 0; j < mensajes.length; j++) {
      const mensaje = mensajes[j];
      const asunto = mensaje.getSubject().toLowerCase();
      const cuerpo = removerAcentos(mensaje.getPlainBody().toLowerCase());
      const remitente = mensaje.getFrom().toLowerCase();

      const deptoValido = cuerpo.includes(inq.departamento.toLowerCase());
      const montoNumerico = inq.cantidadPago.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const montoRegex = new RegExp(`\\$?\\s?(${inq.cantidadPago}|${montoNumerico})\\b`);
      const montoValido = montoRegex.test(cuerpo);
      const nombreValido = cuerpo.includes(removerAcentos(inq.nombre.toLowerCase()));

      Logger.log(`--- Correo analizado ---`);
      Logger.log(`De: ${remitente}`);
      Logger.log(`Asunto: ${asunto}`);
      Logger.log(`Cuerpo:\n${cuerpo}`);
      Logger.log(`Departamento válido: ${deptoValido}`);
      Logger.log(`Nombre válido: ${nombreValido}`);
      Logger.log(`Monto válido: ${montoValido}`);

      if (
        remitente.includes(inq.correo.toLowerCase()) &&
        asunto.includes("comprobante") &&
        deptoValido &&
        montoValido &&
        nombreValido
      ) {
        Logger.log(`✔️ Correo válido encontrado para ${inq.id}`);
        Logger.log(`⏳ Fecha actual: ${inq.fechaPago}`);

        // ✅ 1. Cambiar estadoPago
        actualizarCampoAnidado(inq.id, "statusControl.estadoPago", "pagado");

        // ✅ 2. Sumar un mes a la fechaPago
        const nuevaFechaPago = sumarMes(getFechaActual());
        actualizarCampoAnidado(inq.id, "contrato.fechaPago", nuevaFechaPago);
        Logger.log(`🗓️ ${inq.id} → Nueva fecha de pago registrada: ${nuevaFechaPago}`);

        // ✅ 3. Etiquetar como PagosProcesados y archivar
        const hilo = threads[i];
        const etiquetaPagos = GmailApp.getUserLabelByName("PagosProcesados") || GmailApp.createLabel("PagosProcesados");
        hilo.addLabel(etiquetaPagos);
        hilo.moveToArchive();

        return true;
      }
    }
  }

  Logger.log(`✖️ No se encontró comprobante válido para ${inq.id}`);
  return false;
}

/**
 * enviarRecordatorioPago
 *
 * Envía un correo al inquilino para recordarle su fecha de pago. 
 * Se adapta al tipo de recordatorio: 'recordatorio', 'ultimo' o 'urgente'.
 * 
 * Para evitar SPAM, no envía el mismo tipo de mensaje más de una vez por día.
 *
 * @param {Object} opciones
 * @param {string} opciones.tipo - Tipo de aviso: 'recordatorio' | 'ultimo' | 'urgente'
 * @param {string} opciones.destinatario - Correo del inquilino
 * @param {string} opciones.nombre - Nombre del inquilino
 * @param {string} opciones.departamento - Departamento asignado (ej. dpto04)
 * @param {string} opciones.fechaPago - Fecha límite de pago (YYYY-MM-DD)
 */
function enviarRecordatorioPago({ tipo, destinatario, nombre, departamento, fechaPago }) {
  const cache = CacheService.getScriptCache();
  const hoy = getFechaActual();
  const clave = `aviso_${tipo}_${destinatario}_${hoy}`;

  // Evitar duplicado en el mismo día
  if (cache.get(clave)) {
    Logger.log(`⏳ Ya se envió '${tipo}' a ${destinatario} hoy. Se omite.`);
    return;
  }

  // 📬 Construcción del mensaje
  let asunto = "";
  let cuerpo = "";

  if (tipo === "recordatorio") {
    asunto = `📅 Recordatorio de pago - Departamento ${departamento}`;
    cuerpo = `Hola ${nombre},\n\nEste es un recordatorio amigable para informarte que tu pago correspondiente al departamento ${departamento} vence el día ${fechaPago}.\n\nTe recomendamos realizarlo a tiempo para evitar interrupciones en el servicio.\n\nGracias por tu atención.`;
  } else if (tipo === "ultimo") {
    asunto = `⏳ Último día para realizar tu pago - ${departamento}`;
    cuerpo = `Hola ${nombre},\n\nHoy es el último día para realizar el pago del departamento ${departamento}. Tu fecha límite es: ${fechaPago}.\n\nEvita inconvenientes y realiza tu pago cuanto antes.`;
  } else if (tipo === "urgente") {
    asunto = `⚠️ URGENTE: Pago vencido - Acceso restringido (${departamento})`;
    cuerpo = `Hola ${nombre},\n\nTu pago correspondiente al departamento ${departamento} venció el día ${fechaPago}.\n\nEl acceso ha sido restringido temporalmente. Te invitamos a realizar el pago para reestablecer los servicios.\n\nSi ya lo hiciste, espera la validación.`;
  } else {
    Logger.log(`❌ Tipo de aviso no reconocido: ${tipo}`);
    return;
  }

  // 📤 Enviar correo
  try {
    GmailApp.sendEmail(destinatario, asunto, cuerpo);
    Logger.log(`✅ Correo '${tipo}' enviado a ${destinatario}`);
    cache.put(clave, "1", 60 * 60 * 12); // Evitar reenvío por 12 h
  } catch (e) {
    Logger.log(`❌ Error al enviar correo a ${destinatario}: ${e}`);
  }
}

