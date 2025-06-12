import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { db } from "../app/firebase.js";
import { generarCodigoArduino } from "./registrarSensor.js";

let modal;

async function cargarDepartamentosSinSensor() {
  const select = document.getElementById('departamentoId');
  select.innerHTML = '<option value="">Selecciona un departamento</option>';
  try {
    const snapshot = await getDocs(collection(db, "departamentos"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.tieneSensores) {
        const option = document.createElement('option');
        option.value = docSnap.id;
        option.textContent = `Dpto ${data.numero} - Nivel ${data.nivel}`;
        select.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error cargando departamentos:", error);
  }
}

function abrirModal() {
  const modalEl = document.getElementById('modalRegistroSensor');
  modal = new bootstrap.Modal(modalEl);
  cargarDepartamentosSinSensor();
  modal.show();
}

function cerrarModal() {
  if (modal) modal.hide();
}

function inicializarEventoGenerarCodigo() {
  const btn = document.getElementById('btnGenerarCodigo');
  btn.addEventListener('click', async () => {
    const departamentoId = document.getElementById('departamentoId').value;
    const ssid = document.getElementById('wifiSSID').value.trim();
    const password = document.getElementById('wifiPassword').value.trim();

    if (!departamentoId || !ssid || !password) {
      alert('Completa todos los campos');
      return;
    }

    try {
      const docRef = doc(db, "departamentos", departamentoId);
      const docSnap = await docRef.get();
      if (!docSnap.exists()) {
        alert('Departamento no encontrado');
        return;
      }
      const data = docSnap.data();

      // Generar código Arduino
      const codigo = generarCodigoArduino(data.numero, ssid, password);

      // Descargar archivo .ino
      const blob = new Blob([codigo], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ESP32_dpto${data.numero}.ino`;
      a.click();
      URL.revokeObjectURL(url);

      // Actualizar estado del departamento
      await updateDoc(docRef, { tieneSensores: true });

      cerrarModal();
      alert('Código generado y estado actualizado.');
    } catch (error) {
      console.error("Error generando código o actualizando:", error);
      alert('Error: ' + error.message);
    }
  });
}

function inicializarModalRegistroSensor() {
  inicializarEventoGenerarCodigo();
}

export { abrirModal, inicializarModalRegistroSensor };
