// =============================
// firestore.gs
// Acceso y escritura a Firestore vía REST API
// =============================

/**
 * Descarga todos los documentos de la colección "inquilino"
 */
function obtenerInquilinos() {
  const url = `${FIRESTORE_BASE_URL}/inquilino?key=${API_KEY}`;
  const resp = UrlFetchApp.fetch(url);
  const data = JSON.parse(resp.getContentText());
  return data.documents || [];
}

/**
 * Actualiza el campo estadoCerradura de un documento
 * @param {string} docName - ruta del documento (name completo)
 * @param {string} nuevoEstado - "encendido", "apagado", "pendiente", etc.
 */
function actualizarEstadoCerradura(docName, nuevoEstado) {
  const url = `https://firestore.googleapis.com/v1/${docName}?key=${API_KEY}&updateMask.fieldPaths=estadoCerradura`;
  const payload = JSON.stringify({
    fields: {
      estadoCerradura: { stringValue: nuevoEstado }
    }
  });
  const options = {
    method: 'PATCH',
    contentType: 'application/json',
    payload
  };
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

/**
 * Actualiza el campo estadoPago de un documento
 * @param {string} docName - ruta del documento (name completo)
 * @param {string} nuevoEstado - "pagado", "no pagado", etc.
 */
function actualizarEstadoPago(docName, nuevoEstado) {
  const url = `https://firestore.googleapis.com/v1/${docName}?key=${API_KEY}&updateMask.fieldPaths=estadoPago`;
  const payload = JSON.stringify({
    fields: {
      estadoPago: { stringValue: nuevoEstado }
    }
  });
  const options = {
    method: 'PATCH',
    contentType: 'application/json',
    payload
  };
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}
