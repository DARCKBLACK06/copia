/**
 * ============================================================================
 * utils.gs
 * Funciones auxiliares para fechas, limpieza de cache y filtrado de inquilinos
 * ============================================================================
 */

/**
 * diasRestantes
 *
 * Calcula cuántos días faltan desde HOY hasta la fecha de pago.
 * El día actual se cuenta como 0. Si ya pasó, devuelve número negativo.
 *
 * Ejemplos:
 *   Hoy: 2025-07-31, fechaPago: 2025-08-03 → resultado: 3
 *   Hoy: 2025-07-31, fechaPago: 2025-07-31 → resultado: 0
 *   Hoy: 2025-07-31, fechaPago: 2025-07-28 → resultado: -3
 *
 * @param {string} fechaPago - Fecha en formato YYYY-MM-DD
 * @returns {number} Días restantes (positivo, 0 o negativo)
 */
function diasRestantes(fechaPago) {
  if (!fechaPago) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const pago = new Date(`${fechaPago}T00:00:00`);
  pago.setHours(0, 0, 0, 0);

  const diferencia = pago.getTime() - hoy.getTime();
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}

/**
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
 * filtrarYMarcarPendientes
 *
 * Paso 1.3 y Paso 1.4 del script nocturno.
 *
 * Filtra solo a los inquilinos cuya fecha de pago sea ≤7 días desde hoy
 * (incluye vencidos) y marca su estadoPago como 'pendiente'.
 * Luego, envía un correo de advertencia (recordatorio o urgente)
 * según los días restantes.
 *
 * Requiere: `actualizarEstadoPago()` y `enviarCorreoAdvertencia()` disponibles globalmente.
 *
 * @param {Object[]} inquilinos - Lista completa de inquilinos desde Firestore
 */
function filtrarYMarcarPendientes(inquilinos) {
  const seleccionados = inquilinos.filter(inq => {
    const dias = diasRestantes(inq.fechaPago);
    return dias !== null && dias <= 7;
  });

  Logger.log(`🔍 Inquilinos con fecha de pago en ≤7 días: ${seleccionados.length}`);

  const idsProcesados = [];

  seleccionados.forEach(inq => {
    const dias = diasRestantes(inq.fechaPago);

    actualizarEstadoPago(inq.id, "pendiente");
    enviarCorreoAdvertencia(inq.nombre, inq.correo, inq.fechaPago, dias);

    idsProcesados.push(inq.id);
  });

  Logger.log(`✅ Total marcados como 'pendiente': ${idsProcesados.length}`);
}
