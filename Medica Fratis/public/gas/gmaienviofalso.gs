/**
 * gmailenviofalso.gs
 * eliminarDepartamentos6a41
 * 
 * Elimina los documentos de Firestore y nodos en Realtime Database
 * correspondientes a los departamentos del 6 al 41 (inclusive).
 */
function eliminarDepartamentos6a41() {
  for (let i = 6; i <= 41; i++) {
    const num = i.toString().padStart(2, '0'); // "06", "07", ...
    const idDepto = `dpto${num}`;

    // --- Eliminar de Firestore ---
    const urlFirestore = `${FIRESTORE_BASE_URL}/departamentos/${idDepto}?key=${API_KEY}`;
    try {
      UrlFetchApp.fetch(urlFirestore, { method: "DELETE" });
      Logger.log(`🗑️ Firestore → Departamento ${idDepto} eliminado.`);
    } catch (error) {
      Logger.log(`❌ Error al eliminar ${idDepto} en Firestore: ${error}`);
    }

    // --- Eliminar de Realtime Database ---
    const urlRTDB = `${RTDB_BASE_URL}/departamentos/${idDepto}.json`;
    try {
      UrlFetchApp.fetch(urlRTDB, { method: "DELETE" });
      Logger.log(`🗑️ RTDB → Nodo ${idDepto} eliminado.`);
    } catch (error) {
      Logger.log(`❌ Error al eliminar ${idDepto} en RTDB: ${error}`);
    }
  }

  Logger.log("✅ Eliminación de departamentos del 6 al 41 finalizada.");
}
