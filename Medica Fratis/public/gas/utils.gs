/**
 * utils.gs
 * limpiarCache
 *
 * Elimina todos los datos temporales del ScriptCache de Google Apps Script.
 * Se recomienda ejecutarla al inicio de cada rutina para evitar residuos.
 */
function limpiarCache() {
  try {
    CacheService.getScriptCache().removeAll([]);
    Logger.log("🧹 Cache limpia correctamente.");
  } catch (error) {
    Logger.log("⚠️ Error al limpiar cache: " + error);
  }
}

/**
 * 📅 Calcula cuántos días faltan desde HOY (zona horaria local) hasta la fecha de pago.
 * @param {string} fechaPago - Fecha en formato 'YYYY-MM-DD'
 * @returns {number} Días restantes (positivo, 0 o negativo)
 */
function calcularDiasRestantes(fechaPago) {
  if (!fechaPago) return null;

  const zona = 'America/Mexico_City';

  const hoyStr = Utilities.formatDate(new Date(), zona, 'yyyy-MM-dd');
  const hoy = new Date(`${hoyStr}T00:00:00`);

  const pago = new Date(`${fechaPago}T00:00:00`);
  pago.setHours(0, 0, 0, 0);

  const diferencia = pago.getTime() - hoy.getTime();
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}
/**
 * 📆 Obtiene la fecha actual en formato 'YYYY-MM-DD' ajustada a zona horaria local.
 * @returns {string} Fecha de hoy (ej. '2025-08-05')
 */
function getFechaActual() {
  const zona = 'America/Mexico_City';
  return Utilities.formatDate(new Date(), zona, 'yyyy-MM-dd');
}

/**
 * removerAcentos
 *
 * Elimina acentos de un string para hacer comparaciones seguras.
 * Ejemplo: "díaz" → "diaz"
 *
 * @param {string} texto - Texto a limpiar
 * @returns {string} Texto sin acentos
 */
function removerAcentos(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * sumarMes
 *
 * Suma un mes a una fecha dada en formato 'YYYY-MM-DD', manteniendo el mismo día
 * siempre que sea posible. Si el mes resultante no tiene ese día, ajusta al último válido.
 *
 * @param {string} fechaStr - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} Nueva fecha con un mes sumado, también en 'YYYY-MM-DD'
 */
function sumarMes(fechaStr) {
  const fechaOriginal = new Date(fechaStr);
  const diaOriginal = fechaOriginal.getDate();

  // Sumar un mes
  fechaOriginal.setMonth(fechaOriginal.getMonth() + 1);

  // Si el nuevo mes no tiene el mismo día, se ajustará automáticamente
  // Aquí lo corregimos para que no se pase al mes anterior
  if (fechaOriginal.getDate() < diaOriginal) {
    // Ir al último día del mes actual
    fechaOriginal.setDate(0);
  }

  return Utilities.formatDate(fechaOriginal, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

/**
 * getDataFromRTDB
 *
 * Lee un nodo de Realtime Database y devuelve su contenido como objeto.
 *
 * @param {string} path - Ruta dentro de RTDB (ej. "departamentos/deptodpto01/sensores/telemetria_actual/maximos")
 * @returns {Object|null} Objeto con los datos o null si no se encontró nada
 */
function getDataFromRTDB(path) {
  try {
    const url = `${RTDB_BASE_URL}/${path}.json?auth=${getFirebaseSecret()}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const code = response.getResponseCode();

    if (code === 200) {
      const data = JSON.parse(response.getContentText());
      return data;
    } else {
      Logger.log(`❌ Error al leer RTDB (${code}) → ${path}`);
      return null;
    }
  } catch (e) {
    Logger.log(`⚠️ Excepción en getDataFromRTDB(${path}): ${e}`);
    return null;
  }
}

/**
 * getFirebaseSecret
 * 
 * Devuelve la clave secreta del Realtime Database, almacenada en PropertiesService.
 * Esto permite mantener segura la clave y facilitar la portabilidad.
 */
function getFirebaseSecret() {
  return PropertiesService.getScriptProperties().getProperty("FIREBASE_SECRET");
}
