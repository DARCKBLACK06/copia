/**
 * main.gs (versión provisional de prueba)
 * 
 * Ejecuta las funcionalidades que ya están disponibles:
 * 1. Limpia cache
 * 2. Carga inquilinos desde Firestore
 * 3. Filtra los que están a ≤ 7 días de su fecha de pago
 * 4. Evalúa y actualiza estado de pago
 * 5. Verifica si hay comprobantes de pago (actualiza fecha si hay)
 * 6. Aplica lógica de cerradura automática
 * 7. Envía correos de aviso (5, 2, 0, -1 días)
 * 8. Borra correos antiguos (PagosProcesados > 30 días)
 */
function main() {
  limpiarCache(); // 🧹 Paso 1

  const inquilinos = obtenerDatosBasicosInquilinos(); // 🔎 Paso 2
  if (!inquilinos.length) {
    Logger.log("❌ No se encontraron inquilinos.");
    return;
  }

  const filtrados = filtrarPorFechaPago(inquilinos); // 🎯 Paso 3

  filtrados.forEach(inq => {
    evaluarYActualizarEstadoPago(inq);             // 📌 Paso 4
    verificarYActualizarPago(inq);                  // 📩 Paso 5
    evaluarYActualizarCerradura(inq);               // 🔐 Paso 6
    evaluarYEnviarAvisoPago(inq); // ✅ esta SÍ existe y está funcional // 📨 Paso 7
  });

  borrarCorreosAntiguos(); // 🗑️ Paso 8
}
