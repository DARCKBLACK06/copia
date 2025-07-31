/**
 * iniciarConfiguracion.gs
 * 
 * Ejecutar este script una sola vez para inicializar la estructura de carpetas y hojas
 * del sistema en Google Drive. Guarda los IDs necesarios en PropertiesService para que
 * el resto del sistema funcione de forma dinámica.
 */
function iniciarConfiguracion() {
  const ROOT_NOMBRE = "ProyectoMedicaFratis";
  const MES_ACTUAL = new Date().toISOString().slice(0, 7); // "2025-07"

  const props = PropertiesService.getScriptProperties();

  // === Crear carpeta raíz si no existe ===
  let carpetaRaiz = DriveApp.getFoldersByName(ROOT_NOMBRE);
  let carpetaProyecto = carpetaRaiz.hasNext() ? carpetaRaiz.next() : DriveApp.createFolder(ROOT_NOMBRE);
  props.setProperty("FOLDER_PROYECTO", carpetaProyecto.getId());

  // === Crear subcarpeta PagosComprobantes/2025-07 ===
  let carpetaPagos = getOrCreateSubfolder(carpetaProyecto, "PagosComprobantes");
  let carpetaMes = getOrCreateSubfolder(carpetaPagos, MES_ACTUAL);
  props.setProperty("FOLDER_PAGOS_COMPROBANTES", carpetaMes.getId());

  // === Crear subcarpeta ReportesMensuales ===
  let carpetaReportes = getOrCreateSubfolder(carpetaProyecto, "ReportesMensuales");
  props.setProperty("FOLDER_REPORTES_MENSUALES", carpetaReportes.getId());

  // === Crear Sheets: consumo_diario y historial_pagos ===
  const hojaConsumo = getOrCreateSheet(carpetaProyecto, "consumo_diario", ["Fecha", "ID Inquilino", "Nombre", "Temperatura", "Humedad", "Agua", "Humo"]);
  const hojaPagos = getOrCreateSheet(carpetaProyecto, "historial_pagos", ["Fecha", "ID Inquilino", "Nombre", "Monto", "Correo", "Archivo"]);

  props.setProperty("SHEET_ID_CONSUMO", hojaConsumo.getId());
  props.setProperty("SHEET_ID_HISTORIAL_PAGOS", hojaPagos.getId());

  Logger.log("✅ Configuración inicial completada.");
}

/**
 * getOrCreateSubfolder
 * Crea una subcarpeta dentro de una carpeta si no existe
 */
function getOrCreateSubfolder(parentFolder, nombre) {
  const carpetas = parentFolder.getFoldersByName(nombre);
  return carpetas.hasNext() ? carpetas.next() : parentFolder.createFolder(nombre);
}

/**
 * getOrCreateSheet
 * Crea un archivo de Google Sheets con hoja y encabezados si no existe
 */
function getOrCreateSheet(parentFolder, nombre, encabezados) {
  const archivos = parentFolder.getFilesByName(nombre);
  if (archivos.hasNext()) {
    return SpreadsheetApp.open(archivos.next());
  } else {
    const sheet = SpreadsheetApp.create(nombre);
    DriveApp.getFileById(sheet.getId()).moveTo(parentFolder);
    const hoja = sheet.getSheets()[0];
    hoja.setName(nombre);
    hoja.appendRow(encabezados);
    return sheet;
  }
}
