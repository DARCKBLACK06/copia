// =============================
// main.gs
// FLUJO PRINCIPAL: GESTIÓN DE CERRADURAS Y ENVÍO DE AVISOS
// =============================

function gestionarCerradurasYAvisos() {
  logInfo("▶️  Inicio gestión y envíos de avisos");
  limpiarCache();

  const inquilinos = obtenerInquilinos();
  if (!inquilinos.length) {
    logInfo("ℹ️  No se encontraron inquilinos.");
  } else {
    inquilinos.forEach(doc => {
      const f         = doc.fields;
      const nombre    = f.nombre.stringValue;
      const correo    = f.correo.stringValue;
      const depto     = f.departamentoId.stringValue;
      const fechaPago = f.fechaPago.stringValue;
      const docName   = doc.name;
      const dias      = diasRestantes(fechaPago);
      const modoControl = f.modoControl ? f.modoControl.stringValue : 'automatico';

      if (dias > 5) return;

      // 1) Obtener comprobantes
      const comprobantes = obtenerCorreosDePago(nombre, correo, fechaPago);
      logInfo(`📧 ${nombre} (Depto ${depto}): Correos encontrados: ${comprobantes.length}`);

      comprobantes.forEach(c => {
        logInfo(`   • Correo de: ${c.from} | Fecha: ${c.date.toLocaleString()}`);
      });

      // 2) Actualizaciones y envíos
      if (modoControl === 'automatico') {
        if (dias >= 0 && dias <= 5) {
          actualizarEstadoCerradura(docName, 'pendiente');
          logInfo(`⌛ ${nombre}: faltan ${dias} día(s) → estadoCerradura=PENDIENTE`);
          enviarCorreo(correo, nombre, dias, fechaPago, 'pendiente');

        } else if (dias < 0 && comprobantes.length === 0) {
          actualizarEstadoCerradura(docName, 'no pagado');
          logInfo(`⚠️ ${nombre}: vencido hace ${-dias} día(s) → estadoCerradura=NO PAGADO`);
          enviarCorreo(correo, nombre, dias, fechaPago, 'vencido');
        }
      } else {
        logInfo(`🔒 ${nombre}: En modo MANUAL, NO se actualiza la cerradura.`);
      }

      // Estado de pago se puede actualizar siempre
      if (comprobantes.length > 0) {
        actualizarEstadoPago(docName, 'pagado');
        logInfo(`✅ ${nombre}: comprobante encontrado → estadoPago=PAGADO`);
      }
    });
  }

  logInfo("✅  Gestión y envíos de avisos completados");
  limpiarCache();
  logInfo("🗑️  Caché limpiada al finalizar");
}
