/**
 * respaldarLecturasDiarias
 *
 * Guarda los valores máximos de sensores de cada inquilino en una hoja de cálculo
 * y limpia esos máximos en Realtime Database para iniciar nuevo conteo diario.
 */
function respaldarLecturasDiarias() {
  const propiedades = PropertiesService.getScriptProperties();
  const sheetId = propiedades.getProperty('FILE_HISTORIAL_SENSORES_ID');
  const hoja = SpreadsheetApp.openById(sheetId).getActiveSheet();
  const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

  // Agregar encabezado si es la primera vez
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(["Fecha", "ID Inquilino", "Departamento", "Temperatura Max", "Humedad Max","Humo Max", "Agua Max"]);
  }

  const inquilinos = obtenerDatosBasicosInquilinos();

  inquilinos.forEach(inq => {
    const id = inq.id;
    const departamento = inq.departamento;

    // Leer máximos desde Firestore
    const sensores = obtenerMaximosSensores(id);

    // Registrar en Sheet
    hoja.appendRow([
      fecha,
      id,
      departamento,
      sensores.temperaturaMax,
      sensores.humedadMax,
      sensores.humoMax,
      sensores.aguaMax
    ]);

    // Limpiar en Realtime Database
    const url = `${RTDB_BASE_URL}/departamentos/depto${departamento}/sensores/telemetria_actual/maximos.json?auth=${API_KEY}`;
    const data = {
      temperatura: 0,
      humedad: 0,
      humo: 0,
      agua: 0
    };
    UrlFetchApp.fetch(url, {
      method: "put",
      contentType: "application/json",
      payload: JSON.stringify(data),
      muteHttpExceptions: true
    });

    // Limpiar en Firestore
    // Limpiar en Firestore → statusControl.sensores.{campo}.valor = 0 + fecha = null
    const campos = ["aguaMax", "humedadMax", "humoMax", "temperaturaMax"];

    campos.forEach(campo => {
      actualizarCampoAnidado(id, `statusControl.sensores.${campo}.valor`, 0);
      actualizarCampoAnidado(id, `statusControl.sensores.${campo}.fecha`, null);
    });



    Logger.log(`✅ Respaldo y limpieza completados para ${id}`);
  });

  console.log('📋 Respaldo diario finalizado: sensores registrados, RTDB y Firestore reiniciados.');
}
