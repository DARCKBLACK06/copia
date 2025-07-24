/**
 * 
 * Crea los triggers automáticos del sistema
 * Ejecuta esta función UNA sola vez cada que reinstales el sistema.
 */
// triggers.gs
function crearTriggersAutomatizados() {
  // Elimina triggers previos para evitar duplicados
  const allTriggers = ScriptApp.getProjectTriggers();
  allTriggers.forEach(t => ScriptApp.deleteTrigger(t));

  // Trigger diario para enviar correos y avisos (main)
  ScriptApp.newTrigger('gestionarCerradurasYAvisos')
    .timeBased()
    .atHour(0) // 0 = medianoche
    .everyDays(1)
    .create();

  // Trigger cada hora para verificación continua y expiraciones (main_continuo)
  ScriptApp.newTrigger('verificarPagosContinuo')
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log('Triggers creados: gestión diaria y verificación continua cada hora.');
}
