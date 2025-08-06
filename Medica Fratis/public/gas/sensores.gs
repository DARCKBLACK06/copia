/**
 * sensores.gs
 * cargarMaximosDesdeRTDB
 *
 * Recorre todos los departamentos en Realtime Database y extrae los valores
 * máximos del día desde:
 *   departamentos/deptodptoXX/sensores/telemetria_actual/maximos
 *
 * Luego actualiza esos datos en Firestore bajo:
 *   inquilinos/inquilinodptoXX/statusControl/sensores/{xxxMax}
 *
 * Solo actualiza si el valor nuevo es mayor al actual.
 */
function cargarMaximosDesdeRTDB() {
  const rtdbUrl = `${RTDB_BASE_URL}/departamentos.json`;

  try {
    const respuesta = UrlFetchApp.fetch(rtdbUrl);
    const data = JSON.parse(respuesta.getContentText());

    if (!data) {
      Logger.log("⚠️ No se encontraron departamentos en RTDB.");
      return;
    }

    const fechaActual = new Date().toISOString();

    for (const deptoKey in data) {
      const sensores = data[deptoKey]?.sensores?.telemetria_actual?.maximos;
      if (!sensores) {
        Logger.log(`⏭️ ${deptoKey} sin datos de maximos.`);
        continue;
      }

      const match = deptoKey.match(/dpto(\d{2})$/i);
      if (!match) {
        Logger.log(`⚠️ Formato de ID inválido: ${deptoKey}`);
        continue;
      }

      const numero = match[1];
      const idInquilino = `inquilinodpto${numero}`;

      // Obtener datos actuales desde Firestore
      const docUrl = `${FIRESTORE_BASE_URL}/inquilinos/${idInquilino}?key=${API_KEY}`;
      const doc = JSON.parse(UrlFetchApp.fetch(docUrl).getContentText());

      const actuales = doc.fields?.statusControl?.mapValue?.fields?.sensores?.mapValue?.fields || {};

      const campos = ["agua", "humedad", "humo", "temperatura"];
      const updates = {};

      campos.forEach(campo => {
        const nuevoValor = Number(sensores[campo]);
        if (isNaN(nuevoValor)) return;

        const campoFirestore = `${campo}Max`;
        const actualValor = Number(actuales?.[campoFirestore]?.mapValue?.fields?.valor?.doubleValue || 0);

        if (nuevoValor > actualValor) {
          updates[campoFirestore] = {
            mapValue: {
              fields: {
                valor: { doubleValue: nuevoValor },
                fecha: { stringValue: fechaActual }
              }
            }
          };
          Logger.log(`📈 ${idInquilino} → ${campo}Max actualizado de ${actualValor} → ${nuevoValor}`);
        } else {
          Logger.log(`⏩ ${idInquilino} → ${campo}Max sin cambios (${nuevoValor} <= ${actualValor})`);
        }
      });

      if (Object.keys(updates).length === 0) {
        Logger.log(`✅ ${idInquilino} → Sin cambios en ningún sensor`);
        continue;
      }

      const payload = {
        fields: {
          statusControl: {
            mapValue: {
              fields: {
                sensores: {
                  mapValue: {
                    fields: updates
                  }
                }
              }
            }
          }
        }
      };

      const patchUrl = `${FIRESTORE_BASE_URL}/inquilinos/${idInquilino}?key=${API_KEY}&` +
        Object.keys(updates)
          .map(f => `updateMask.fieldPaths=statusControl.sensores.${f}`)
          .join("&");

      UrlFetchApp.fetch(patchUrl, {
        method: "PATCH",
        contentType: "application/json",
        payload: JSON.stringify(payload)
      });
    }

  } catch (error) {
    Logger.log(`❌ Error al consultar o actualizar datos: ${error}`);
  }
}
