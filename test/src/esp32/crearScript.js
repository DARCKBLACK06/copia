import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta correcta al archivo JSON de credenciales
const KEYFILE = path.resolve(__dirname, 'gmail-api-test-464716-f1ca8ab5ec2c.json');

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE,
  scopes: [
    'https://www.googleapis.com/auth/script.projects',
    'https://www.googleapis.com/auth/script.deployments',
    'https://www.googleapis.com/auth/script.external_request',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/script.scriptapp'
  ]
});

async function crearScriptParaInquilino(nombre, correo, fechaPago, dptoID) {
  try {
    const authClient = await auth.getClient();
    const script = google.script({ version: 'v1', auth: authClient });

    // Paso 1: Crear nuevo proyecto Apps Script
    const createRes = await script.projects.create({
      requestBody: { title: `AutoRecordatorio_${dptoID}_${nombre}` }
    });

    const scriptId = createRes.data.scriptId;
    console.log(`🆔 Proyecto creado con ID: ${scriptId}`);

    // Paso 2: Código del script (dinámico por inquilino)
    const jsCode = `
function enviarRecordatorio() {
  var email = "${correo}";
  var nombre = "${nombre}";
  var fechaLimite = new Date("${fechaPago}");
  var hoy = new Date();

  var diff = (fechaLimite - hoy) / (1000 * 60 * 60 * 24);

  if (diff <= 5 && diff > 0) {
    MailApp.sendEmail({
      to: email,
      subject: "Recordatorio de pago - Departamento ${dptoID}",
      body: "Hola " + nombre + ",\\n\\nTe recordamos que debes realizar tu pago antes del " + fechaLimite.toLocaleDateString() + ". De lo contrario, se bloqueará tu acceso al departamento ${dptoID}.\\n\\nSaludos."
    });
  }
}
`;

    // Paso 3: Subir el código al proyecto
    await script.projects.updateContent({
      scriptId,
      requestBody: {
        files: [
          {
            name: 'recordatorio',
            type: 'SERVER_JS',
            source: jsCode
          }
        ]
      }
    });

    console.log('📥 Código subido exitosamente.');

    // Paso 4: Crear trigger para ejecución diaria a las 9:00 AM
    await script.projects.triggers.create({
      scriptId,
      requestBody: {
        function: 'enviarRecordatorio',
        trigger: {
          type: 'TIME_DRIVEN',
          timeDriven: {
            type: 'DAY_TIMER',
            hours: 9,
            minutes: 0
          }
        }
      }
    });

    console.log('⏰ Trigger programado para enviar recordatorios diariamente a las 9:00 AM');

    return scriptId;
  } catch (error) {
    console.error('❌ Error creando script o trigger:', error);
    throw error;
  }
}

// === PRUEBA MANUAL ===
crearScriptParaInquilino(
  'Francisco Estrada',
  'javpstrada32@gmail.com',
  '2025-07-07T13:00:00',
  'deptodpto1'
).then(() => console.log('✅ Script creado y configurado'))
  .catch(console.error);
