/**
 * Borra todas las propiedades guardadas en ScriptProperties.
 * Úsalo solo si vas a resetear toda la configuración.
 */
function resetearConfiguracion() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  console.log('🧹 PropertiesService limpiado. Puedes volver a ejecutar configurarSistema() desde cero.');
}


function iniciarConfiguracion() {
  const propiedades = PropertiesService.getScriptProperties();

  // Crear carpeta raíz del proyecto si no existe
  const carpetaRaiz = obtenerOCrearCarpeta('Proyecto Medica Fratis');
  propiedades.setProperty('FOLDER_RAIZ_ID', carpetaRaiz.getId());

  // Crear subcarpeta del año actual (2025)
  const carpeta2025 = obtenerOCrearSubcarpeta(carpetaRaiz, '2025');
  propiedades.setProperty('FOLDER_2025_ID', carpeta2025.getId());

  // Crear carpeta 'reportes' y sus bloques
  const carpetaReportes = obtenerOCrearSubcarpeta(carpeta2025, 'reportes');
  propiedades.setProperty('FOLDER_REPORTE_2025_ID', carpetaReportes.getId());

  const bloques = ['bloque_1_10', 'bloque_11_20', 'bloque_21_30', 'bloque_31_41'];
  bloques.forEach(bloque => {
    obtenerOCrearSubcarpeta(carpetaReportes, bloque); // No guardamos los IDs de cada bloque
  });

  // Crear carpeta 'pagos'
  const carpetaPagos = obtenerOCrearSubcarpeta(carpeta2025, 'pagos');
  propiedades.setProperty('FOLDER_PAGOS_ID', carpetaPagos.getId());

  // Crear carpeta 'respaldos' con subcarpetas 'sensores' y 'correos'
  const carpetaRespaldos = obtenerOCrearSubcarpeta(carpeta2025, 'respaldos');
  propiedades.setProperty('FOLDER_RESPALDOS_ID', carpetaRespaldos.getId());

  const carpetaSensores = obtenerOCrearSubcarpeta(carpetaRespaldos, 'sensores');
  propiedades.setProperty('FOLDER_SENSORES_ID', carpetaSensores.getId());

  const carpetaCorreos = obtenerOCrearSubcarpeta(carpetaRespaldos, 'correos');
  propiedades.setProperty('FOLDER_CORREOS_ID', carpetaCorreos.getId());

  // Confirmar visualmente en log
  console.log('✅ Carpetas creadas y propiedades guardadas correctamente:');
  console.log('📁 FOLDER_RAIZ_ID: ' + carpetaRaiz.getId());
  console.log('📁 FOLDER_2025_ID: ' + carpeta2025.getId());
  console.log('📁 FOLDER_REPORTE_2025_ID: ' + carpetaReportes.getId());
  console.log('📁 FOLDER_PAGOS_ID: ' + carpetaPagos.getId());
  console.log('📁 FOLDER_RESPALDOS_ID: ' + carpetaRespaldos.getId());
  console.log('📁 FOLDER_SENSORES_ID: ' + carpetaSensores.getId());
  console.log('📁 FOLDER_CORREOS_ID: ' + carpetaCorreos.getId());
}

// Función auxiliar para buscar o crear carpeta por nombre en la raíz de Drive
function obtenerOCrearCarpeta(nombre) {
  const carpetas = DriveApp.getFoldersByName(nombre);
  return carpetas.hasNext() ? carpetas.next() : DriveApp.createFolder(nombre);
}

// Función auxiliar para buscar o crear subcarpeta dentro de otra carpeta
function obtenerOCrearSubcarpeta(carpetaPadre, nombre) {
  const carpetas = carpetaPadre.getFoldersByName(nombre);
  return carpetas.hasNext() ? carpetas.next() : carpetaPadre.createFolder(nombre);
}

function crearArchivosRespaldo() {
  const propiedades = PropertiesService.getScriptProperties();

  const carpetaSensores = DriveApp.getFolderById(propiedades.getProperty('FOLDER_SENSORES_ID'));
  const carpetaCorreos = DriveApp.getFolderById(propiedades.getProperty('FOLDER_CORREOS_ID'));

  // Crear archivo Historial_Sensores.xlsx (Google Sheets)
  const hojaSensores = SpreadsheetApp.create('Historial_Sensores');
  const archivoSensores = DriveApp.getFileById(hojaSensores.getId());
  carpetaSensores.addFile(archivoSensores);
  DriveApp.getRootFolder().removeFile(archivoSensores); // Lo quitamos del "Mi unidad"
  propiedades.setProperty('FILE_HISTORIAL_SENSORES_ID', hojaSensores.getId());

  // Crear archivo Historial_Correos.csv (Google Docs no permite crear CSV directo, usamos blob)
  const contenidoCSV = 'Fecha,Remitente,Asunto\n'; // encabezado
  const blobCSV = Utilities.newBlob(contenidoCSV, 'text/csv', 'Historial_Correos.csv');
  const archivoCorreos = carpetaCorreos.createFile(blobCSV);
  propiedades.setProperty('FILE_HISTORIAL_CORREOS_ID', archivoCorreos.getId());

  // Log para confirmar
  console.log('✅ Archivos de respaldo creados y registrados correctamente:');
  console.log('📄 FILE_HISTORIAL_SENSORES_ID: ' + hojaSensores.getId());
  console.log('📄 FILE_HISTORIAL_CORREOS_ID: ' + archivoCorreos.getId());
}

function configurarSistema() {
  console.log('🛠️ Iniciando configuración completa del sistema...');

  // Paso 1: Crear estructura de carpetas
  iniciarConfiguracion();

  // Paso 2: Crear archivos de respaldo
  crearArchivosRespaldo();

  console.log('✅ Configuración del sistema finalizada correctamente. Todo listo para usar.');
}
