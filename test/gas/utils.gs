// ============================
// utils.gs - UTILIDADES GENERALES
// ============================

/**
 * Limpia caché de Firestore
 */
function limpiarCache() {
  const cache = CacheService.getScriptCache();
  cache.remove('FIRESTORE_INQUILINOS');
}

/**
 * Parsea fecha ISO (YYYY-MM-DD) a Date
 */
function parseFechaISO(str) {
  return new Date(str + "T00:00:00");
}

/**
 * Días restantes o vencidos según fecha de pago
 */
function diasRestantes(fechaPago) {
  const hoy = new Date();
  const pago = parseFechaISO(fechaPago);
  return Math.floor((pago - hoy) / (1000 * 60 * 60 * 24));
}

/**
 * Log visible en Registro de ejecuciones
 */
function logInfo(mensaje) {
  console.log(mensaje);
}

/**
 * Enviar correos automáticos
 */
function enviarCorreo(destinatario, nombre, dias, fechaPago, tipo) {
  let asunto, mensaje;

  if (tipo === "pendiente") {
    asunto = "Aviso de pago pendiente";
    mensaje =
      `Hola ${nombre},\n\n` +
      `Te recordamos que tu pago vence el ${fechaPago}. Quedan ${dias} día(s).\n\n` +
      `Por favor realiza tu pago a tiempo.\n\nGracias,\nAdministración.`;
  } else if (tipo === "vencido") {
    asunto = "URGENTE: Pago de renta vencido";
    mensaje =
      `Hola ${nombre},\n\n` +
      `Tu pago correspondiente al ${fechaPago} está VENCIDO (hace ${-dias} día(s)).\n` +
      `Por favor realiza el pago de inmediato y envía el comprobante.\n\nGracias,\nAdministración.`;
  } else {
    asunto = "Aviso";
    mensaje = `Hola ${nombre},\n\nEste es un aviso automático de la administración.`;
  }

  MailApp.sendEmail(destinatario, asunto, mensaje);
}

/**
 * Sincroniza estado de cerradura con Realtime Database
 */
function actualizarRTDB(path, valor) {
  const url = `https://${PROJECT_ID}-default-rtdb.firebaseio.com${path}.json`;
  const options = {
    method: 'PUT',
    contentType: 'application/json',
    payload: JSON.stringify(valor)
  };
  UrlFetchApp.fetch(url, options);
}

/**
 * Si expiró el modo manual, lo cambia a automático y sincroniza cerradura
 */
function verificarExpiracionModoManual() {
  const inquilinos = obtenerInquilinos();
  if (!inquilinos.length) return;

  inquilinos.forEach(doc => {
    const f = doc.fields;
    const docName = doc.name;
    const nombre = f.nombre.stringValue;
    const depto = f.departamentoId.stringValue;
    const modoControl = f.modoControl?.stringValue || 'automatico';
    const manualExpira = f.manualExpira?.stringValue || null;

    if (modoControl !== 'manual') return;

    let expirado = false;
    if (manualExpira) {
      const expiraDate = new Date(manualExpira);
      if (new Date() >= expiraDate) expirado = true;
    } else {
      // Si es indefinido, no se cambia automáticamente por tiempo
      return;
    }

    if (expirado) {
      // 1. Cambiar a automático
      const url = `https://firestore.googleapis.com/v1/${docName}?key=${API_KEY}&updateMask.fieldPaths=modoControl&updateMask.fieldPaths=manualExpira`;
      const payload = JSON.stringify({
        fields: {
          modoControl: { stringValue: 'automatico' },
          manualExpira: { nullValue: null }
        }
      });
      const options = { method: 'PATCH', contentType: 'application/json', payload };
      UrlFetchApp.fetch(url, options);
      logInfo(`🔄 ${nombre}: MODO cambiado a AUTOMÁTICO (expiró a las ${new Date(manualExpira).toLocaleString()})`);

      // 2. Determinar estado de cerradura en automático
      const estadoPago = f.estadoPago?.stringValue.toLowerCase() || 'no pagado';
      let nuevoEstado = 'apagado';
      if (estadoPago === 'pagado' || estadoPago === 'pendiente') {
        nuevoEstado = 'encendido';
      }

      // 3. Firestore → estadoCerradura
      actualizarEstadoCerradura(docName, nuevoEstado);
      logInfo(`🔁 ${nombre}: cerradura → ${nuevoEstado.toUpperCase()}`);

      // 4. Realtime DB → cerrar o abrir cerradura en el ESP32
      const path = `/departamentos/deptodpto${depto}/sensores/datos_completos/cerradura`;
      actualizarRTDB(path, nuevoEstado);
      logInfo(`🌐 ${nombre}: Realtime DB cerradura → ${nuevoEstado}`);
    }
  });
}
