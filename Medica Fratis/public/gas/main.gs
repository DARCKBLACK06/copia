/**
 * main.gs
 * 
 * Script ejecutado una vez por la noche.
 * Se encarga de:
 * 1. Limpiar la cache
 * 2. Cargar inquilinos desde Firestore
 * 3. Filtrar los que están a ≤ 7 días de su fecha de pago
 * 4. Marcar estadoPago = 'pendiente'
 * 5. Enviar correos de advertencia
 * 6. Respaldar valores máximos de sensores en Google Sheets
 * 7. Limpiar Firestore y RTDB (maximos)
 * 8. Borrar correos con más de 30 días
 */
function main() {
  limpiarCache(); // 🧹 Paso 1

  const inquilinos = obtenerDatosBasicosInquilinos(); // 🔎 Paso 2
  if (!inquilinos.length) {
    Logger.log("❌ No se encontraron inquilinos.");
    return;
  }

  filtrarYMarcarPendientes(inquilinos);      // 🔍 Paso 3-4: Marcar pendientes + enviar correos
  respaldarYLimpiarConsumoDiario();          // 📦 Paso 5-6-7: Guardar en Sheets y limpiar
  borrarCorreosAntiguos();                   // 🗑️ Paso 8: Limpiar correos antiguos
}
