function mostrarListaInquilinos() {
  limpiarCache();  // Limpia cache al inicio

  const inquilinos = obtenerDatosBasicosInquilinos();

  if (!inquilinos.length) {
    Logger.log("No hay inquilinos registrados.");
    return;
  }

  Logger.log(`Total de inquilinos encontrados: ${inquilinos.length}`);

  inquilinos.forEach((inquilino, index) => {
    const dias = diasRestantes(inquilino.fechaPago);
    const comprobantes = obtenerCorreosDePago(inquilino.nombre, inquilino.correo, inquilino.fechaPago);
    const tieneComprobante = comprobantes.length > 0;

    let estadoCalculado;
    if (dias === 0) {
      estadoCalculado = "Hoy vence";
    } else if (dias > 0) {
      estadoCalculado = `Faltan ${dias} día(s)`;
    } else {
      estadoCalculado = `Vencido hace ${Math.abs(dias)} día(s)`;
    }

    let tieneExpiracion = false;
    let yaExpirado = false;
    let fechaExpiraTexto = "no aplica";

    if (inquilino.manualExpira) {
      const ahora = new Date();
      const fechaExpira = new Date(inquilino.manualExpira);
      tieneExpiracion = true;
      yaExpirado = ahora > fechaExpira;
      fechaExpiraTexto = fechaExpira.toLocaleString();
    }

    Logger.log(` 👤 \nInquilino ${index + 1}`);
    Logger.log(`  ID:               ${inquilino.id}`);
    Logger.log(`  Nombre:           ${inquilino.nombre}`);
    Logger.log(`  Correo:           ${inquilino.correo}`);
    Logger.log(`  Teléfono:         ${inquilino.telefono}`);
    Logger.log(`  Departamento:     ${inquilino.departamento}`);
    Logger.log(`  Fecha de pago:    ${inquilino.fechaPago}`);
    Logger.log(`  Estado actual:    ${inquilino.estadoPago}`);
    Logger.log(`  Expira manual:    ${tieneExpiracion ? fechaExpiraTexto : "no aplica"}`);
    if (tieneExpiracion) {
     
    }
    Logger.log(`  Días restantes:   ${estadoCalculado}`);

    comprobantes.forEach((c, i) => {
      Logger.log(`     ${i + 1}. De: ${c.from} | Fecha: ${c.date.toLocaleString()} | Asunto: ${c.subject}`);
    });

    if (inquilino.modoControl === "automatico") {
      if (tieneComprobante) {
        Logger.log(`  → Acción: marcar como PAGADO`);
        actualizarEstadoPago(inquilino.id, "pagado");
        actualizarEstadoCerradura(inquilino.id, inquilino.departamento, "encendido");

      } else if (dias >= 0 && dias <= 5) {
        Logger.log(`  → Acción: marcar como PENDIENTE`);
        actualizarEstadoPago(inquilino.id, "pendiente");
        actualizarEstadoCerradura(inquilino.id, inquilino.departamento, "encendido");

      } else if (dias < 0 && !tieneComprobante) {
        Logger.log(`  → Acción: marcar como NO PAGADO`);
        actualizarEstadoPago(inquilino.id, "no pagado");
        actualizarEstadoCerradura(inquilino.id, inquilino.departamento, "apagado");

      } else {
        Logger.log(`  → Sin acción: fuera de ventana o ya pagado`);
      }

    } else if (inquilino.modoControl === "manual") {
      
      if (tieneComprobante) {
        Logger.log(`     Se puede marcar como PAGADO`);
        actualizarEstadoPago(inquilino.id, "pagado");
      }

      if (tieneExpiracion && yaExpirado) {
        Logger.log(`  Modo manual expiró. Cambiando a AUTOMÁTICO...`);
        actualizarModoControl(inquilino.id);

        // Refrescar localmente
        inquilino.modoControl = "automatico";
        inquilino.manualExpira = null;

        // Ejecutar lógica automática de inmediato
        if (tieneComprobante) {
          Logger.log(`  → Acción inmediata: marcar como PAGADO`);
          actualizarEstadoPago(inquilino.id, "pagado");
          actualizarEstadoCerradura(inquilino.id, inquilino.departamento, "encendido");

        } else if (dias >= 0 && dias <= 5) {
          Logger.log(`  → Acción inmediata: marcar como PENDIENTE`);
          actualizarEstadoPago(inquilino.id, "pendiente");
          actualizarEstadoCerradura(inquilino.id, inquilino.departamento, "encendido");

        } else if (dias < 0) {
          Logger.log(`  → Acción inmediata: marcar como NO PAGADO`);
          actualizarEstadoPago(inquilino.id, "no pagado");
          actualizarEstadoCerradura(inquilino.id, inquilino.departamento, "apagado");
        }
      }
    }
  });

  Logger.log("Finalizó la ejecución de mostrarListaInquilinos");
}
