// === Importaciones necesarias ===
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

import { db } from "../app/firebase.js"; // Conexión a Firestore
import { generarCodigoArduino } from "./registrarSensor.js"; // Función que genera código .ino personalizado
import { showMessage } from '../app/showMessage.js'; // Para mostrar mensajes tipo Toast

// === Referencias a elementos del DOM ===
const selectDeptos = document.getElementById("departamentoId");
const checkbox = document.getElementById("confirmarRegistro");
const botonGenerar = document.getElementById("btnGenerarCodigo");

// === Función: lista departamentos sin sensores ===
export async function listarDepartamentosSinSensor() {
  try {
    const departamentosRef = collection(db, "departamentos");
    const q = query(departamentosRef, where("tieneSensores", "==", false)); // Solo los que no tienen sensores
    const querySnapshot = await getDocs(q);

    if (!selectDeptos) return;

    // Limpia las opciones previas
    selectDeptos.innerHTML = '<option value="">Selecciona un departamento</option>';

    // Llena el <select> con departamentos disponibles
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

// === Habilita o deshabilita el botón según el checkbox de confirmación ===
function configurarCheckbox() {
  if (!checkbox || !botonGenerar) return;

  checkbox.addEventListener("change", () => {
    botonGenerar.disabled = !checkbox.checked; // Solo se habilita si está marcado
  });
}

// === Función para descargar un archivo .ino con el código generado ===
function descargarArchivo(nombreArchivo, contenido) {
  const blob = new Blob([contenido], { type: "text/plain" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(enlace.href); // Limpieza de memoria
}

// === Evento principal: al hacer clic en "Generar Código" ===
botonGenerar.addEventListener("click", async () => {
  const departamentoId = selectDeptos.value;
  const ssid = document.getElementById("wifiSSID").value.trim();
  const password = document.getElementById("wifiPassword").value.trim();

  // Validación de campos
  if (!departamentoId || !ssid || !password) {
    showMessage("Completa todos los campos antes de continuar.", "error");
    return;
  }

  try {
    // === Actualiza el campo "tieneSensores" en Firestore ===
    const deptoRef = doc(db, "departamentos", departamentoId);
    await updateDoc(deptoRef, { tieneSensores: true });

    // === Genera el código Arduino usando datos de WiFi y depto ===
    const codigo = generarCodigoArduino(departamentoId, ssid, password);

    // === Inicia la descarga del archivo .ino generado ===
    descargarArchivo(`sensor_depto_${departamentoId}.ino`, codigo);

    // === Recarga la lista de departamentos disponibles ===
    await listarDepartamentosSinSensor();

    // === Cierra el modal de registro con Bootstrap 5 ===
    const modalElement = document.getElementById("modalRegistroSensor");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    // === Reinicia el formulario y desactiva botón ===
    document.getElementById("formSensor").reset();
    botonGenerar.disabled = true;

    showMessage("Sensor registrado y código generado con éxito.");

  } catch (error) {
    console.error("Error registrando sensor:", error);
    showMessage("Error al registrar el sensor. Revisa consola.", "error");
  }
});

// === Inicialización automática al cargar el DOM ===
document.addEventListener("DOMContentLoaded", async () => {
  await listarDepartamentosSinSensor(); // Llenar el select al abrir modal
  configurarCheckbox(); // Activar lógica del checkbox
});
