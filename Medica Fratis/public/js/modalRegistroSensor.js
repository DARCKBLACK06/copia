// modalRegistroSensor.js
import { collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { db } from "../app/firebase.js";
import { generarCodigoArduino } from "./registrarSensor.js";
import { showMessage } from '../app/showMessage.js';

const selectDeptos = document.getElementById("departamentoId");
const checkbox = document.getElementById("confirmarRegistro");
const botonGenerar = document.getElementById("btnGenerarCodigo");

// Listar departamentos sin sensor
export async function listarDepartamentosSinSensor() {
  try {
    const departamentosRef = collection(db, "departamentos");
    const q = query(departamentosRef, where("tieneSensores", "==", false));
    const querySnapshot = await getDocs(q);

    if (!selectDeptos) return;

    selectDeptos.innerHTML = '<option value="">Selecciona un departamento</option>';

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = `Depto ${data.numero} - Nivel ${data.nivel}`;
      selectDeptos.appendChild(option);
    });

  } catch (error) {
    console.error("Error listando departamentos sin sensor:", error);
    showMessage("Error al cargar departamentos", "error");
  }
}

// Habilitar o deshabilitar botón según checkbox
function configurarCheckbox() {
  if (!checkbox || !botonGenerar) return;

  checkbox.addEventListener("change", () => {
    botonGenerar.disabled = !checkbox.checked;
  });
}

// Descargar archivo .ino
function descargarArchivo(nombreArchivo, contenido) {
  const blob = new Blob([contenido], { type: "text/plain" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

// Acción al dar click en "Generar Código"
botonGenerar.addEventListener("click", async () => {
  const departamentoId = selectDeptos.value;
  const ssid = document.getElementById("wifiSSID").value.trim();
  const password = document.getElementById("wifiPassword").value.trim();

  if (!departamentoId || !ssid || !password) {
    showMessage("Completa todos los campos antes de continuar.", "error");
    return;
  }

  try {
    // Actualizar Firestore
    const deptoRef = doc(db, "departamentos", departamentoId);
    await updateDoc(deptoRef, { tieneSensores: true });

    // Generar código
    const codigo = generarCodigoArduino(departamentoId, ssid, password);

    // Descargar archivo
    descargarArchivo(`sensor_depto_${departamentoId}.ino`, codigo);

    // Actualizar lista en el select
    await listarDepartamentosSinSensor();

    // Cerrar modal con Bootstrap 5
    const modalElement = document.getElementById("modalRegistroSensor");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    // Resetear formulario y botón
    document.getElementById("formSensor").reset();
    botonGenerar.disabled = true;

    showMessage("Sensor registrado y código generado con éxito.");

  } catch (error) {
    console.error("Error registrando sensor:", error);
    showMessage("Error al registrar el sensor. Revisa consola.", "error");
  }
});

// Ejecutar al cargar DOM
document.addEventListener("DOMContentLoaded", async () => {
  await listarDepartamentosSinSensor();
  configurarCheckbox();
});
