/**
 * sheets.gs
 * asegurarHojaConsumo
 * 
 * Crea la hoja "consumo_diario" si no existe y le pone encabezados.
 */
function asegurarHojaConsumo() {
  const ss = SpreadsheetApp.openById(SHEET_ID_CONSUMO);
  let hoja = ss.getSheetByName("consumo_diario");

  if (!hoja) {
    hoja = ss.insertSheet("consumo_diario");
    hoja.appendRow(["Fecha", "ID Inquilino", "Nombre", "Temperatura", "Humedad", "Agua", "Humo"]);
    Logger.log("📄 Hoja 'consumo_diario' creada con encabezados.");
  }
}


/**
 * registrarConsumoEnSheet
 *
 * Agrega una fila a la hoja "consumo_diario" con los datos máximos
 * registrados ese día para el inquilino.
 *
 * @param {string} id - ID del inquilino (ej: inquilinodpto01)
 * @param {string} nombre - Nombre del inquilino
 * @param {Object} sensores - Objeto con valores de sensores
 */
function registrarConsumoEnSheet(id, nombre, sensores) {
  asegurarHojaConsumo();
  const hoja = SpreadsheetApp.openById(SHEET_ID_CONSUMO).getSheetByName("consumo_diario");
  const fechaHoy = new Date();
  hoja.appendRow([
    fechaHoy.toLocaleDateString("es-MX"),
    id,
    nombre,
    sensores.temperatura || 0,
    sensores.humedad || 0,
    sensores.agua || 0,
    sensores.humo || 0
  ]);
}
