// registrarDepartamento.js

import { collection, doc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { db } from "../app/firebase.js";
import { showMessage } from '../app/showMessage.js';

const MAX_DPTOS = 50;  // Número máximo de departamentos que puedes registrar

const gridDptos = document.getElementById("gridDptos");
const formDepartamento = document.getElementById("formDepartamento");
const nivelInput = document.getElementById("nivelDepartamento");

let dptoSeleccionado = null;
let departamentosRegistrados = new Set();

// Genera botones para dptos y marca los ya registrados
export async function inicializarRegistroDepartamento() {
  // Limpia grid antes de crear botones
  gridDptos.innerHTML = "";

  // Carga departamentos registrados de Firestore
  await cargarDepartamentosRegistrados();

  // Crear botones para dptos del 1 a MAX_DPTOS
  for (let i = 1; i <= MAX_DPTOS; i++) {
    const dptoId = `dpto${i}`;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = i;
    btn.className = "btn btn-outline-light";

    if (departamentosRegistrados.has(dptoId)) {
      btn.disabled = true;
      btn.classList.add("btn-danger");
      btn.title = "Departamento ya registrado";
    } else {
      btn.addEventListener("click", () => seleccionarDpto(btn, dptoId));
    }

    gridDptos.appendChild(btn);
  }
}

// Carga departamentos existentes para evitar duplicados
async function cargarDepartamentosRegistrados() {
  departamentosRegistrados.clear();

  try {
    const snapshot = await getDocs(collection(db, "departamentos"));
    snapshot.forEach(doc => {
      departamentosRegistrados.add(doc.id);
    });
  } catch (error) {
    console.error("Error cargando departamentos:", error);
    showMessage("Error al cargar departamentos registrados", "error");
  }
}

// Marca un departamento seleccionado y desmarca los otros
function seleccionarDpto(button, dptoId) {
  // Deseleccionar previos
  [...gridDptos.children].forEach(btn => btn.classList.remove("selected"));

  // Seleccionar este
  button.classList.add("selected");
  dptoSeleccionado = dptoId;
}

// Maneja el envío del formulario
formDepartamento.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!dptoSeleccionado) {
    showMessage("Debes seleccionar un número de departamento", "error");
    return;
  }

  const nivel = nivelInput.value.trim();
  if (!nivel || isNaN(nivel) || nivel < 1) {
    showMessage("Nivel inválido. Debe ser un número entero mayor o igual a 1", "error");
    return;
  }

  const tieneSensores = formDepartamento.tieneSensores.value === "true";

  // Validar si ya existe (por si hubo cambios en firestore después)
  if (departamentosRegistrados.has(dptoSeleccionado)) {
    showMessage("Este departamento ya está registrado", "error");
    return;
  }

  // Preparar objeto para guardar
  const nuevoDepto = {
    numero: parseInt(dptoSeleccionado.replace("dpto", "")),
    nivel: parseInt(nivel),
    tieneSensores: tieneSensores
  };

  try {
    await setDoc(doc(db, "departamentos", dptoSeleccionado), nuevoDepto);
    showMessage(`Departamento ${nuevoDepto.numero} registrado con éxito`, "success");

    // Reset formulario y selección
    formDepartamento.reset();
    dptoSeleccionado = null;

    // Recarga la cuadrícula para actualizar estados
    await inicializarRegistroDepartamento();

    // Cierra modal (asumiendo Bootstrap 5)
    const modalEl = document.getElementById("modalDepartamento");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

  } catch (error) {
    console.error("Error guardando departamento:", error);
    showMessage("Error al registrar departamento", "error");
  }
});
