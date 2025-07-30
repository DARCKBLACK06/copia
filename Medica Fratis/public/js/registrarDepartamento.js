// === Importaciones necesarias para Firestore y funciones auxiliares ===
import {
  collection,
  doc,
  getDocs,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { db } from "../app/firebase.js";
import { showMessage } from "../app/showMessage.js"; // Función para mostrar notificaciones

// === Constantes y referencias del DOM ===
const MAX_DPTOS = 41; // Número máximo de departamentos disponibles

const gridDptos = document.getElementById("gridDptos"); // Contenedor visual de botones de departamentos
const formDepartamento = document.getElementById("formDepartamento"); // Formulario principal
const nivelHiddenInput = document.getElementById("nivelDepartamento"); // Input oculto para guardar el valor seleccionado del piso
const nivelDropdownBtn = document.getElementById("nivelDropdownBtn"); // Botón que muestra el piso seleccionado
const nivelDropdownItems = document.querySelectorAll(
  "#nivelDropdownMenu .dropdown-item"
); // Opciones del dropdown

// === Variables internas del módulo ===
let dptoSeleccionado = null; // Almacena qué departamento fue seleccionado
let departamentosRegistrados = new Set(); // Conjunto para evitar registros duplicados

// === Inicializa el dropdown de pisos ===
nivelDropdownItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const valor = item.getAttribute("data-value");
    nivelHiddenInput.value = valor;
    nivelDropdownBtn.textContent = `Piso ${valor}`;
  });
});

// === Función principal: genera botones de departamentos y marca los ocupados ===
export async function inicializarRegistroDepartamento() {
  gridDptos.innerHTML = ""; // Limpia el grid antes de llenarlo

  await cargarDepartamentosRegistrados(); // Carga departamentos ya ocupados

  // Crea 41 botones, del 01 al 41
  for (let i = 1; i <= MAX_DPTOS; i++) {
    const numeroFormateado = i.toString().padStart(2, "0"); // 01, 02, ..., 41
    const dptoId = `dpto${numeroFormateado}`;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = numeroFormateado;
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

  // === Carga los departamentos registrados actualmente desde Firestore ===
  async function cargarDepartamentosRegistrados() {
    departamentosRegistrados.clear(); // Limpia el conjunto

    try {
      const snapshot = await getDocs(collection(db, "departamentos"));
      snapshot.forEach((doc) => {
        departamentosRegistrados.add(doc.id); // Agrega el ID al conjunto
      });
    } catch (error) {
      console.error("Error cargando departamentos:", error);
      showMessage("Error al cargar departamentos registrados", "error");
    }
  }

  // === Función para seleccionar un botón de departamento ===
  function seleccionarDpto(button, dptoId) {
    // Deselecciona cualquier botón anterior
    [...gridDptos.children].forEach((btn) => btn.classList.remove("selected"));

    button.classList.add("selected"); // Marca el botón actual
    dptoSeleccionado = dptoId;
  }

  // === Evento: manejar envío del formulario de registro de departamento ===
  formDepartamento.addEventListener("submit", async (e) => {
    e.preventDefault(); // Previene recarga

    // Validaciones previas
    if (!dptoSeleccionado) {
      showMessage("Debes seleccionar un número de departamento", "error");
      return;
    }

    const nivel = parseInt(nivelHiddenInput.value);
    if (!nivel || isNaN(nivel) || nivel < 1) {
      showMessage("Nivel inválido. Selecciona un piso válido", "error");
      return;
    }

    const tieneSensores = formDepartamento.tieneSensores.value === "true";
    const disponible = formDepartamento.disponible.value === "true";

    // Validación extra por si hubo un cambio reciente en la base
    if (departamentosRegistrados.has(dptoSeleccionado)) {
      showMessage("Este departamento ya está registrado", "error");
      return;
    }

    // Construcción del objeto a guardar en Firestore
    const nuevoDepto = {
      numero: parseInt(dptoSeleccionado.replace("dpto", "")),
      nivel: nivel,
      tieneSensores: tieneSensores,
      disponible: disponible,
    };

    try {
      await setDoc(doc(db, "departamentos", dptoSeleccionado), nuevoDepto); // Guarda en Firestore
      showMessage(
        `Departamento ${nuevoDepto.numero} registrado con éxito`,
        "success"
      );

      // Reset del formulario
      formDepartamento.reset();
      nivelDropdownBtn.textContent = "Seleccionar Piso";
      nivelHiddenInput.value = "";
      dptoSeleccionado = null;

      // Refresca los botones
      await inicializarRegistroDepartamento();

      // Cierra el modal (requiere Bootstrap 5)
      const modalEl = document.getElementById("modalDepartamento");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance.hide();
    } catch (error) {
      console.error("Error guardando departamento:", error);
      showMessage("Error al registrar departamento", "error");
    }
  });
}
