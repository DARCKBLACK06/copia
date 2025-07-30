/**
 * diasRestantes
 *
 * Calcula cuántos días faltan desde HOY hasta la fecha de pago.
 * El día actual se cuenta como 0. Si ya pasó, devuelve número negativo.
 * 
 * @param {string} fechaPago - Fecha en formato YYYY-MM-DD
 * @returns {number} Días restantes (0 si es hoy, negativo si vencido)
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
 * Elimina datos temporales guardados en ScriptCache.
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
 * Filtra solo a los inquilinos cuya fecha de pago esté a ≤7 días (incluye vencidos).
 * Les marca estadoPago = 'pendiente'. Omite los demás.
 *
 * @param {Object[]} inquilinos - Lista completa desde Firestore
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
    idsProcesados.push(inq.id);
  });

  Logger.log(`✅ Total marcados como 'pendiente': ${idsProcesados.length}`);
}
