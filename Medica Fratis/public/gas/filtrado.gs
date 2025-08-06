/**
 * filtrado.gs
 * 🔍 filtrarPorFechaPago
 *
 * Filtra inquilinos cuya fecha de pago está a 7 días o menos desde hoy.
 * Muestra en el log los que cumplen la condición y cuántos fueron omitidos.
 *
 * @param {Object[]} inquilinos - Lista de inquilinos desde Firestore.
 * @returns {Object[]} Solo los inquilinos filtrados (≤7 días).
 */
function filtrarPorFechaPago(inquilinos) {
  if (!Array.isArray(inquilinos)) {
    Logger.log("❌ 'inquilinos' no es un arreglo válido. Valor recibido:");
    Logger.log(JSON.stringify(inquilinos, null, 2));
    return [];
  }

  const hoy = getFechaActual();
  Logger.log(`📆 Fecha de hoy: ${hoy}`);

  const seleccionados = [];
  let omitidos = 0;

  inquilinos.forEach(inq => {
    const dias = calcularDiasRestantes(inq.fechaPago);
    if (dias !== null && dias <= 7) {
      Logger.log(`✅ ${inq.id} (${inq.nombre}) → fechaPago: ${inq.fechaPago} → Faltan ${dias} días`);
      seleccionados.push(inq);
    } else {
      omitidos++;
    }
  });

  Logger.log(`⏩ Inquilinos omitidos por fecha > 7 días: ${omitidos}`);
  return seleccionados;
}


/**
 * evaluarYActualizarEstadoPago
 *
 * Evalúa el estado de pago de un inquilino individual y actualiza Firestore si es necesario.
 * - Si faltan entre 0 y 7 días para la fecha de pago y el estado actual es "pagado", se cambia a "pendiente".
 * - Si la fecha de pago ya venció (días < 0) y el estado no es "no pagado", se cambia a "no pagado".
 * - Si el estado ya corresponde a la condición actual, no se realiza ninguna modificación.
 *
 * Esta función solo evalúa y actualiza a un inquilino. El control de a quién aplicársela es externo.
 *
 * @param {Object} inq - Objeto del inquilino con al menos los campos: id, fechaPago, estadoPago
 */
function evaluarYActualizarEstadoPago(inq) {
  const dias = calcularDiasRestantes(inq.fechaPago);

  // Si faltan de 0 a 7 días y aún está marcado como pagado → cambiar a pendiente
  if (dias >= 0 && dias <= 7 && inq.estadoPago === 'pagado') {
    actualizarCampoAnidado(inq.id, "statusControl.estadoPago", "pendiente");
    return;
  }

  // Si la fecha ya venció y no está marcado como "no pagado" → cambiar a no pagado
  if (dias < 0 && inq.estadoPago !== 'no pagado') {
    actualizarCampoAnidado(inq.id, "statusControl.estadoPago", "no pagado");
    return;
  }

  // En cualquier otro caso, no se hace nada
}

/**
 * evaluarYActualizarCerradura
 *
 * Evalúa el modo de control y el estado de pago del inquilino para decidir si debe
 * encender o apagar la cerradura. También revierte el modo manual a automático si la
 * fecha de expiración ya pasó.
 *
 * @param {Object} inq - Inquilino con campos: id, estadoPago, modoControl, manualExpira, cerradura, departamento
 */
function evaluarYActualizarCerradura(inq) {
  const modo = inq.modoControl;
  const estado = inq.estadoPago;
  const cerraduraActual = inq.cerradura;
  const id = inq.id;

  // 🕓 Si está en modo manual con fecha de expiración vencida → volver a automático
  if (modo === 'manual' && inq.manualExpira) {
    const ahora = new Date();
    const expiracion = new Date(inq.manualExpira);
    if (ahora > expiracion) {
      actualizarCampoAnidado(id, "statusControl.modoControl", "automatico");
      actualizarCampoAnidado(id, "statusControl.manualExpira", null);

      // Actualizar en memoria
      inq.modoControl = "automatico";
      inq.manualExpira = null;

      // Volver a evaluar ya como automático
      evaluarYActualizarCerradura(inq);
      return;
    } else {
      return; // Aún no vence → no tocar nada
    }
  }

  // 🛠️ Si es modo manual indefinido → no se toca cerradura
  if (modo === "manual" && !inq.manualExpira) {
    return;
  }

  // 🤖 Modo automático → actuar según estado de pago
  if (modo === "automatico") {
    // 🚫 Si ya está pagado y la cerradura está encendida → no hacer nada
    if (estado === "pagado" && cerraduraActual === "encendido") {
      return;
    }

    // 🔐 Si ya está no pagado y cerradura apagada → tampoco hacer nada
    if (estado === "no pagado" && cerraduraActual === "apagado") {
      return;
    }

    // 🔄 Si está pendiente/pagado pero cerradura apagada → encender
    if ((estado === "pagado" || estado === "pendiente") && cerraduraActual !== "encendido") {
      actualizarCerradura(id, "encendido");
    }

    // 🔒 Si no ha pagado → apagar si no lo está
    if (estado === "no pagado" && cerraduraActual !== "apagado") {
      actualizarCerradura(id, "apagado");
    }
  }
}

/**
 * evaluarYEnviarAvisoPago
 *
 * Según los días restantes para la fecha de pago, envía recordatorio, aviso final o urgente.
 *
 * @param {Object} inq - Objeto inquilino con: correo, nombre, departamento, fechaPago
 */
function evaluarYEnviarAvisoPago(inq) {
  const dias = calcularDiasRestantes(inq.fechaPago);

  // Validar que tenga todos los campos mínimos
  if (!inq.correo || !inq.nombre || !inq.departamento || dias === null) return;

  // Condiciones según días restantes
  if (dias === 5 || dias === 2) {
    enviarRecordatorioPago({
      tipo: "recordatorio",
      destinatario: inq.correo,
      nombre: inq.nombre,
      departamento: inq.departamento,
      fechaPago: inq.fechaPago
    });
  }

  if (dias === 0) {
    enviarRecordatorioPago({
      tipo: "ultimo",
      destinatario: inq.correo,
      nombre: inq.nombre,
      departamento: inq.departamento,
      fechaPago: inq.fechaPago
    });
  }

  if (dias === -1) {
    enviarRecordatorioPago({
      tipo: "urgente",
      destinatario: inq.correo,
      nombre: inq.nombre,
      departamento: inq.departamento,
      fechaPago: inq.fechaPago
    });
  }
}
