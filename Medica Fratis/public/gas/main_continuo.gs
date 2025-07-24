function verificarPagosContinuo() {
  logInfo("▶️  Inicio verificarPagosContinuo");
  limpiarCache();

  verificarExpiracionModoManual();  // Importante: puede devolver a automático

  const inquilinos = obtenerInquilinos();
  if (!inquilinos.length) {
    logInfo("ℹ️  No se encontraron inquilinos.");
    return;
  }

  inquilinos.forEach(doc => {
    const f = doc.fields;
    const nombre = f.nombre.stringValue;
    const correo = f.correo.stringValue;
    const depto = f.departamentoId.stringValue;
    const fechaPago = f.fechaPago.stringValue;
    const docName = doc.name;
    const dias = diasRestantes(fechaPago);
    const modoControl = f.modoControl ? f.modoControl.stringValue : 'automatico';

    if (dias > 5) return;

    // Obtener correos comprobantes
    const comprobantes = obtenerCorreosDePago(nombre, correo, fechaPago);
    logInfo(`📧 ${nombre} (Depto ${depto}): Correos encontrados: ${comprobantes.length}`);
    comprobantes.forEach(c => {
      logInfo(`   • Correo de: ${c.from} | Fecha: ${c.date.toLocaleString()}`);
    });

    if (modoControl === 'automatico') {
      if (comprobantes.length > 0) {
        // Estado pagado
        actualizarEstadoPago(docName, 'pagado');
        actualizarEstadoCerradura(docName, 'encendido');
        const path = `/departamentos/deptodpto${depto}/sensores/datos_completos/cerradura`;


        actualizarRTDB(path, 'encendido');
        logInfo(`✅ ${nombre}: estadoPago=PAGADO, cerradura=ENCENDIDO`);
      } else if (dias >= 0 && dias <= 5) {
        // Pendiente
        actualizarEstadoPago(docName, 'pendiente');
        actualizarEstadoCerradura(docName, 'encendido');
        const path = `/departamentos/depto${depto}/sensores/datos_completos/cerradura`;
        actualizarRTDB(path, 'encendido');
        logInfo(`⌛ ${nombre}: faltan ${dias} días → estado=pendiente, cerradura=ENCENDIDO`);
      } else if (dias < 0) {
        // No pagado
        actualizarEstadoPago(docName, 'no pagado');
        actualizarEstadoCerradura(docName, 'apagado');
        const path = `/departamentos/depto${depto}/sensores/datos_completos/cerradura`;
        actualizarRTDB(path, 'apagado');
        logInfo(`⚠️ ${nombre}: vencido hace ${-dias} días → estado=NO PAGADO, cerradura=APAGADO`);
      }
    } else {
      logInfo(`🔒 ${nombre}: En modo MANUAL, NO se actualiza la cerradura.`);

      // Pero sí puede actualizar estado de pago
      if (comprobantes.length > 0) {
        actualizarEstadoPago(docName, 'pagado');
        logInfo(`✅ ${nombre}: comprobante encontrado → estadoPago=PAGADO`);
      }
    }
  });

  logInfo("✅  Fin verificarPagosContinuo");
  limpiarCache();
  logInfo("🗑️  Caché limpiada al finalizar verificarPagosContinuo");
}
