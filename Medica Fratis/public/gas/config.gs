/** =========================================================================
 * 📁 config.gs
 * Archivo de configuración principal del sistema
 * Define constantes globales de acceso a Firestore, RTDB, y estructura del proyecto
 * =========================================================================
 */

// === 🔐 Claves de acceso ===
const API_KEY = 'AIzaSyDt_zRk8puKQK843Ro9B_5SegOibMXFbIY'; // API key de Firebase (reemplazar si es necesario)
const PROJECT_ID = 'mi-proyecto-iot-b161b';               // ID del proyecto Firebase

// === 🔥 Firestore ===
const FIRESTORE_DATABASE = '(default)';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${FIRESTORE_DATABASE}/documents`;

// === 📡 Realtime Database (RTDB) ===
const RTDB_BASE_URL = `https://${PROJECT_ID}-default-rtdb.firebaseio.com`;

// === 🗂️ Colecciones clave de Firestore ===
const COLECCION_INQUILINOS = 'inquilinos';
const COLECCION_DEPARTAMENTOS = 'departamentos';

// === 🗂️ ID del Google Sheet (usar para pagos o reportes) ===
// Define esto si lo necesitas en módulos como mensualStats
//const SHEET_ID_CONSUMO = '1p5nzrfYMarmS5iAF0NYvVatUlCteurHlohnfryBaZk8';

// === ⏱️ Intervalos para temporizadores automáticos ===
const INTERVALO_REVISION_CONTINUA = 10; // Minutos (por si usas triggers cada X min)

// === 📁 Carpetas en Drive ===
// Puedes usarlas en mensualStats o gestión de reportes
// const CARPETA_REPORTES_ACTUAL = 'FOLDER_ID_ACTUAL';
// const CARPETA_REPORTES_RESPALDO = 'FOLDER_ID_RESPALDO';
