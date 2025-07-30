/**
 * firestore.gs
 * obtenerDatosBasicosInquilinos
 * 
 * Devuelve datos clave de todos los inquilinos, incluyendo:
 * ID, nombre, correo, teléfono, departamento, fechaPago,
 * estadoPago, modoControl y manualExpira (si aplica).
 * 
 * @returns {Object[]} Arreglo de objetos con datos de cada inquilino.
 */
function obtenerDatosBasicosInquilinos() {
  const url = `${FIRESTORE_BASE_URL}/inquilinos?key=${API_KEY}`;
  const opciones = {
    method: "get",
    contentType: "application/json"
  };

  try {
    const respuesta = UrlFetchApp.fetch(url, opciones);
    const datos = JSON.parse(respuesta.getContentText());

    if (!datos.documents || datos.documents.length === 0) {
      Logger.log("No se encontraron documentos en la colección 'inquilinos'.");
      return [];
    }

    const inquilinos = datos.documents.map((doc) => {
      const id = doc.name.split("/").pop();
      const campos = doc.fields;

      const nombre = campos?.infoPersonal?.mapValue?.fields?.nombre?.stringValue || "";
      const correo = campos?.infoPersonal?.mapValue?.fields?.correo?.stringValue || "";
      const telefono = campos?.infoPersonal?.mapValue?.fields?.telefono?.stringValue || "";
      const departamento = campos?.contrato?.mapValue?.fields?.departamento?.stringValue || "";
      const fechaPago = campos?.contrato?.mapValue?.fields?.fechaPago?.stringValue || "";
      const estadoPago = campos?.statusControl?.mapValue?.fields?.estadoPago?.stringValue || "Sin datos";
      const modoControl = campos?.statusControl?.mapValue?.fields?.modoControl?.stringValue || "automatico";

      let manualExpira = null;
      const manualField = campos?.statusControl?.mapValue?.fields?.manualExpira;
      if (manualField) {
        if (manualField.timestampValue) {
          manualExpira = manualField.timestampValue;
        } else if (manualField.stringValue) {
          manualExpira = manualField.stringValue;
        }
      }

      return {
        id,
        nombre,
        correo,
        telefono,
        departamento,
        fechaPago,
        estadoPago,
        modoControl,
        manualExpira
      };
    });

    return inquilinos;

  } catch (error) {
    Logger.log("Error al consultar inquilinos en Firestore: " + error);
    return [];
  }
}

/**
 * actualizarModoControl
 * 
 * Cambia el campo 'modoControl' a 'automatico' y elimina 'manualExpira'
 * en Firestore para el inquilino con ID dado.
 * 
 * @param {string} idInquilino - Ej. "inquilinodpto2"
 */
function actualizarModoControl(idInquilino) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/inquilinos/${idInquilino}?key=${API_KEY}&updateMask.fieldPaths=statusControl.modoControl&updateMask.fieldPaths=statusControl.manualExpira`;

  const payload = JSON.stringify({
    fields: {
      statusControl: {
        mapValue: {
          fields: {
            modoControl: { stringValue: "automatico" },
            manualExpira: { nullValue: null }
          }
        }
      }
    }
  });

  const opciones = {
    method: "patch",
    contentType: "application/json",
    payload: payload
  };

  try {
    const respuesta = UrlFetchApp.fetch(url, opciones);
    Logger.log(`Se cambió a modo automático: ${idInquilino}`);
    return JSON.parse(respuesta.getContentText());
  } catch (error) {
    Logger.log(`Error al actualizar modo automático para ${idInquilino}: ${error}`);
    return null;
  }
}

/**
 * actualizarEstadoCerradura
 * 
 * Sincroniza el estado de la cerradura en Realtime Database y Firestore.
 * 
 * @param {string} idInquilino - Ej. "inquilinodpto2"
 * @param {string} idDepto - Ej. "dpto2"
 * @param {string} estado - "encendido" o "apagado"
 */
function actualizarEstadoCerradura(idInquilino, idDepto, estado) {
  if (estado !== "encendido" && estado !== "apagado") {
    Logger.log(`Estado inválido de cerradura: ${estado}`);
    return;
  }

  // Realtime Database
  const path = `/departamentos/depto${idDepto}/sensores/telemetria_actual/cerradura`;
  const rtdbUrl = `${RTDB_BASE_URL}${path}.json`;

  try {
    const opcionesRTDB = {
      method: "put",
      contentType: "application/json",
      payload: JSON.stringify(estado)
    };
    UrlFetchApp.fetch(rtdbUrl, opcionesRTDB);
    Logger.log(`RTDB: cerradura → ${estado}`);
  } catch (error) {
    Logger.log(`Error al actualizar cerradura en RTDB: ${error}`);
  }

  // Firestore
  const fsUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/inquilinos/${idInquilino}?key=${API_KEY}&updateMask.fieldPaths=statusControl.cerradura`;

  const payloadFS = JSON.stringify({
    fields: {
      statusControl: {
        mapValue: {
          fields: {
            cerradura: { stringValue: estado }
          }
        }
      }
    }
  });

  try {
    const opcionesFS = {
      method: "patch",
      contentType: "application/json",
      payload: payloadFS
    };
    UrlFetchApp.fetch(fsUrl, opcionesFS);
    Logger.log(`Firestore: cerradura → ${estado}`);
  } catch (error) {
    Logger.log(`Error al actualizar cerradura en Firestore: ${error}`);
  }
}

/**
 * actualizarEstadoPago
 * 
 * Actualiza el campo 'estadoPago' en Firestore para el inquilino especificado.
 * 
 * @param {string} idInquilino - Ej. "inquilinodpto2"
 * @param {string} nuevoEstado - Ej. "pagado", "pendiente", "no pagado"
 */
function actualizarEstadoPago(idInquilino, nuevoEstado) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/inquilinos/${idInquilino}?key=${API_KEY}&updateMask.fieldPaths=statusControl.estadoPago`;

  const payload = JSON.stringify({
    fields: {
      statusControl: {
        mapValue: {
          fields: {
            estadoPago: { stringValue: nuevoEstado }
          }
        }
      }
    }
  });

  const opciones = {
    method: "patch",
    contentType: "application/json",
    payload: payload
  };

  try {
    const respuesta = UrlFetchApp.fetch(url, opciones);
    Logger.log(`Firestore: estadoPago → ${nuevoEstado} (${idInquilino})`);
    return JSON.parse(respuesta.getContentText());
  } catch (error) {
    Logger.log(`Error al actualizar estadoPago para ${idInquilino}: ${error}`);
    return null;
  }
}
