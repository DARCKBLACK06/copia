function main() {
  limpiarCache(); // Paso 1.1

  const inquilinos = obtenerDatosBasicosInquilinos(); // Paso 1.2
  if (!inquilinos.length) {
    Logger.log("❌ No se encontraron inquilinos.");
    return;
  }

  filtrarYMarcarPendientes(inquilinos); // Paso 1.3 y 1.4
}
