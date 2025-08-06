/**
 *firestore.gs
 * obtenerDatosBasicosInquilinos
 *
 * Consulta todos los documentos de la colección 'inquilinos' en Firestore usando API_KEY.
 * Extrae y retorna los campos clave necesarios para el sistema.
 *
 * Estructura esperada en Firestore:
 * - /inquilinos/{id}
 *   - infoPersonal.nombre, .correo, .telefono
 *   - contrato.departamento, .fechaPago
 *   - statusControl.estadoPago, .modoControl, .manualExpira
 *
 * @returns {Object[]} Lista de inquilinos con:
 *   id, nombre, correo, telefono, departamento, fechaPago, estadoPago, modoControl, manualExpira
 */
function obtenerDatosBasicosInquilinos() {
  // URL completa usando API_KEY (sin OAuth)
  const url = `${FIRESTORE_BASE_URL}/inquilinos?key=${API_KEY}`;
  const opciones = {
    method: "get",
    contentType: "application/json"
  };

  try {
    // Realizar la petición GET
    const respuesta = UrlFetchApp.fetch(url, opciones);
    const datos = JSON.parse(respuesta.getContentText());

    // Si no hay documentos, devolver arreglo vacío
    if (!datos.documents || datos.documents.length === 0) {
      Logger.log("⚠️ No se encontraron documentos en la colección 'inquilinos'.");
      return [];
    }

    // Convertir cada documento Firestore a un objeto plano del sistema
    const inquilinos = datos.documents.map((doc) => {
      const id = doc.name.split("/").pop(); // Obtener solo el ID final del documento
      const campos = doc.fields;

      // Acceder a campos anidados en mapas
      const nombre = campos?.infoPersonal?.mapValue?.fields?.nombre?.stringValue || "";
      const correo = campos?.infoPersonal?.mapValue?.fields?.correo?.stringValue || "";
      const telefono = campos?.infoPersonal?.mapValue?.fields?.telefono?.stringValue || "";
      const departamento = campos?.contrato?.mapValue?.fields?.departamento?.stringValue || "";
      const fechaPago = campos?.contrato?.mapValue?.fields?.fechaPago?.stringValue || "";
      const estadoPago = campos?.statusControl?.mapValue?.fields?.estadoPago?.stringValue || "Sin datos";
      const modoControl = campos?.statusControl?.mapValue?.fields?.modoControl?.stringValue || "automatico";
      const cantidadPago = campos?.contrato?.mapValue?.fields?.cantidadPago?.integerValue || campos?.contrato?.mapValue?.fields.cantidadPago?.doubleValue || "";
      const cerradura = campos?.statusControl?.mapValue?.fields?.cerradura?.stringValue || "";


      // Leer campo opcional manualExpira (puede ser timestampValue o stringValue)
      let manualExpira = null;
      const manualField = campos?.statusControl?.mapValue?.fields?.manualExpira;
      if (manualField) {
        if (manualField.timestampValue) {
          manualExpira = manualField.timestampValue;
        } else if (manualField.stringValue) {
          manualExpira = manualField.stringValue;
        }
      }

      // Retornar el objeto del inquilino
      return {
        id,
        nombre,
        correo,
        telefono,
        departamento,
        fechaPago,
        estadoPago,
        modoControl,
        manualExpira,
        cantidadPago,
        cerradura
      };
    });

    return inquilinos;

  } catch (error) {
    Logger.log("❌ Error al consultar inquilinos en Firestore: " + error);
    return [];
  }
}

/**
 * ✏️ actualizarEstadoPago (SEGURA)
 *
 * Solo actualiza el campo 'statusControl.estadoPago' sin borrar el resto.
 *
 * @param {string} idInquilino - ID del documento
 * @param {string} nuevoEstado - 'pagado' | 'pendiente' | 'no pagado'
 */
function actualizarEstadoPago(idInquilino, nuevoEstado) {
  const url = `${FIRESTORE_BASE_URL}/inquilinos/${idInquilino}?key=${API_KEY}&updateMask.fieldPaths=statusControl.estadoPago`;

  const payload = {
    fields: {
      statusControl: {
        mapValue: {
          fields: {
            estadoPago: { stringValue: nuevoEstado }
          }
        }
      }
    }
  };

  const opciones = {
    method: "patch",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const res = UrlFetchApp.fetch(url, opciones);
    const status = res.getResponseCode();
    if (status === 200) {
      Logger.log(`🟢 estadoPago actualizado a '${nuevoEstado}' para ${idInquilino}`);
    } else {
      Logger.log(`⚠️ Error actualizando ${idInquilino}: ${res.getContentText()}`);
    }
  } catch (e) {
    Logger.log(`❌ Error de red al actualizar ${idInquilino}: ${e}`);
  }
}

/**
 * actualizarCampoAnidado
 *
 * Actualiza un campo anidado específico de un documento en Firestore,
 * sin afectar otros campos ni sobrescribir mapas completos.
 *
 * @param {string} idDoc - ID del documento (ej. 'inquilinodpto04')
 * @param {string} campo - Ruta completa del campo (ej. 'statusControl.estadoPago')
 * @param {string|number|boolean|null} valor - Valor a establecer
 */
function actualizarCampoAnidado(idDoc, campo, valor) {
  const url = `${FIRESTORE_BASE_URL}/inquilinos/${idDoc}?key=${API_KEY}&updateMask.fieldPaths=${campo}`;

  // Determinar tipo del valor para Firestore
  let fieldValue = {};
  if (typeof valor === "string") {
    fieldValue = { stringValue: valor };
  } else if (typeof valor === "number") {
    fieldValue = { doubleValue: valor };
  } else if (typeof valor === "boolean") {
    fieldValue = { booleanValue: valor };
  } else if (valor === null) {
    fieldValue = { nullValue: null };
  } else {
    Logger.log(`Tipo de valor no soportado: ${typeof valor}`);
    return;
  }

  // Construir estructura anidada
  const partes = campo.split(".");
  let estructura = {};
  let actual = estructura;
  for (let i = 0; i < partes.length - 1; i++) {
    actual[partes[i]] = { mapValue: { fields: {} } };
    actual = actual[partes[i]].mapValue.fields;
  }
  actual[partes[partes.length - 1]] = fieldValue;

  const opciones = {
    method: "patch",
    contentType: "application/json",
    payload: JSON.stringify({ fields: estructura }),
    muteHttpExceptions: true
  };

  try {
    const res = UrlFetchApp.fetch(url, opciones);
    const status = res.getResponseCode();
    if (status === 200) {
      Logger.log(`Campo '${campo}' actualizado correctamente en ${idDoc}`);
    } else {
      Logger.log(`Error actualizando '${campo}' en ${idDoc}: ${res.getContentText()}`);
    }
  } catch (e) {
    Logger.log(`Error de red actualizando '${campo}' en ${idDoc}: ${e}`);
  }
}

/**
 * actualizarCerradura
 *
 * Cambia el valor de la cerradura de un inquilino en Firestore y Realtime Database.
 *
 * @param {string} idInquilino - ID del documento en Firestore (ej. 'inquilinodpto04')
 * @param {string} estado - 'encendido' o 'apagado'
 */
function actualizarCerradura(idInquilino, estado) {
  // Actualizar en Firestore
  actualizarCampoAnidado(idInquilino, "statusControl.cerradura", estado);

  // Extraer ID del departamento desde el ID del inquilino
  const depto = idInquilino.replace("inquilino", "depto");

  // Ruta en Realtime Database
  const urlRTDB = `${RTDB_BASE_URL}/departamentos/${depto}/sensores/telemetria_actual/cerradura.json?auth=${API_KEY}`;

  const opciones = {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(estado),
    muteHttpExceptions: true
  };

  try {
    const res = UrlFetchApp.fetch(urlRTDB, opciones);
    const status = res.getResponseCode();
    if (status === 200) {
      Logger.log(`Cerradura actualizada a '${estado}' en RTDB para ${depto}`);
    } else {
      Logger.log(`Error actualizando cerradura en RTDB (${depto}): ${res.getContentText()}`);
    }
  } catch (e) {
    Logger.log(`Error de red en RTDB al actualizar cerradura (${depto}): ${e}`);
  }
}


