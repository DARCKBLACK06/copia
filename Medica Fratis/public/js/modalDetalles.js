// === Importaciones necesarias ===
import { db } from '../app/firebase.js'; // Conexión a Firestore
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js"; // Obtener documento por ID
import { cargarGraficasSensor, detenerActualizacion } from './graficasSensor.js'; // Gráficas del sensor y su control
import { mostrarEstadoPago } from './estadoPago.js'; // Mostrar estado de pago del inquilino
import { initModoControl } from './modoControl.js'; // Modo de control

// === Función principal: muestra la información completa de un inquilino en el modal ===
export async function mostrarDetallesInquilino(idInquilino) {
  limpiarModal();
  try {
    const docRef = doc(db, "inquilinos", idInquilino);   // Referencia al documento
    const docSnap = await getDoc(docRef);                // Consulta el documento

    if (docSnap.exists()) {
      const data = docSnap.data(); // Datos del inquilino

      // === Datos personales ===
      document.getElementById('modalNombre').textContent = data.infoPersonal?.nombre || "Sin nombre";
      document.getElementById('modalTelefono').textContent = data.infoPersonal?.telefono || "Sin teléfono";
      document.getElementById('modalCorreo').textContent = data.infoPersonal?.correo || "No disponible";
      document.getElementById('modalCurp').textContent = data.infoPersonal?.curp || "No disponible";

      // === Domicilio ===
      document.getElementById('modalCalle').textContent = data.infoPersonal?.domicilio?.calle || "No disponible";
      document.getElementById('modalColonia').textContent = data.infoPersonal?.domicilio?.colonia || "No disponible";

      // === Contrato ===
      document.getElementById('modalContratoDepartamento').textContent = data.contrato?.departamento || "No asignado";
      document.getElementById('modalFechaInicio').textContent = data.contrato?.fechaInicio || "No disponible";
      document.getElementById('modalFechaFin').textContent = data.contrato?.fechaFin || "No disponible";

      // === Identificación ===
      document.getElementById('modalIdentificacionTipo').textContent = data.infoPersonal?.identificacion?.tipo || "No disponible";
      document.getElementById('modalIdentificacionNumero').textContent = data.infoPersonal?.identificacion?.numero || "No disponible";

      // === Contacto de emergencia ===
      document.getElementById('modalContactoNombre').textContent = data.infoPersonal?.contactoEmergencia?.nombre || "No disponible";
      document.getElementById('modalContactoTelefono').textContent = data.infoPersonal?.contactoEmergencia?.telefono || "No disponible";
      document.getElementById('modalContactoParentesco').textContent = data.infoPersonal?.contactoEmergencia?.parentesco || "No disponible";

      // === Cargar gráficas del sensor asociado al departamento ===
      const departamentoId = data.contrato?.departamento;
      if (departamentoId) {
        cargarGraficasSensor(departamentoId); // Llama función de `graficasSensor.js`
        mostrarEstadoPago(idInquilino);
        initModoControl(idInquilino); // Inicializa el modo de control
      }


    } else {
      console.log("No se encontró el documento con ID:", idInquilino);
    }

  } catch (error) {
    console.error("Error al cargar detalles del inquilino:", error);
  }

}

// === Función auxiliar: limpia los campos del modal ===
export function limpiarModal() {
  detenerActualizacion(); // Detiene la actualización automática de las gráficas

  // Lista de IDs de campos del modal que se deben limpiar
  const campos = [
    'modalNombre', 'modalTelefono', 'modalCorreo', 'modalCurp',
    'modalCalle', 'modalColonia', 'modalDepartamento', 'modalFechaInicio',
    'modalFechaFin', 'modalIdentificacionTipo', 'modalIdentificacionNumero',
    'modalContactoNombre', 'modalContactoTelefono', 'modalContactoParentesco'
  ];

  // Limpia el contenido de todos los campos
  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}
