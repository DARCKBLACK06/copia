/**
 * main_continuo.gs
 * 
 * 🔁 FUNCIÓN PRINCIPAL DE EJECUCIÓN PERIÓDICA (cada 30 minutos)
 * 
 * Esta función se encarga de supervisar el estado de todos los inquilinos en tiempo real.
 * Se ejecuta mediante un trigger programado cada 30 minutos y realiza lo siguiente:
 * 
 * 1. Revisa si algún inquilino en modo manual ya expiró su tiempo y revierte a modo automático.
 * 2. Verifica si hay pagos recibidos por correo.
 * 3. Evalúa el estado de pago y lo actualiza.
 * 4. Ajusta la cerradura según el estado de pago y el modo de control.
 * 5. Lee los datos máximos de sensores desde Realtime Database y los sube a Firestore.
 * 6. Limpia la caché para cerrar la ejecución sin datos residuales.
 */
function main_continuo() {
  // 📥 1. Obtener todos los inquilinos registrados en Firestore
  const inquilinos = obtenerDatosBasicosInquilinos();

  // 📅 2. Filtrar solo los inquilinos cuya fecha de pago está dentro del rango de revisión (<= 7 días)
  const filtrados = filtrarPorFechaPago(inquilinos);

  // 📋 3. Repetimos la consulta por claridad semántica
  //    (podría usarse directamente `inquilinos`, pero este paso aclara que usaremos todos)
  const todosInquilinos = obtenerDatosBasicosInquilinos();

  // 🔁 4. Revisión de modo manual:
  //    Si algún inquilino está en modo "manual por tiempo" y ya expiró, se regresa a modo automático.
  todosInquilinos.forEach(inq => {
    evaluarYActualizarCerradura(inq);  // <-- también verifica expiración de modo
  });

  // 📤 5. Supervisión de pagos y estado para los que están por pagar:
  filtrados.forEach(inq => {
    verificarYActualizarPago(inq);        // 📩 Escanea correos, etiqueta, evalúa si pagó
    evaluarYActualizarEstadoPago(inq);    // 🔄 Actualiza campo 'estadoPago' según fecha y pago
    evaluarYActualizarCerradura(inq);     // 🔒 Ajusta cerradura según modoControl y estadoPago
  });

  // 📊 6. Sensor Data:
  //    Extrae los valores máximos desde RTDB y los sube a Firestore si hay mejoras.
  cargarMaximosDesdeRTDB();

  // 🧹 7. Limpieza de caché interna (GmailApp, búsquedas, etc.)
  limpiarCache();
}
