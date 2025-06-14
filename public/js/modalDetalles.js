import { db } from '../app/firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

export async function mostrarDetallesInquilino(idInquilino) {
  try {
    const docRef = doc(db, "inquilinos", idInquilino);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      document.getElementById('modalNombre').textContent = data.nombre || "Sin nombre";
      document.getElementById('modalTelefono').textContent = data.telefono || "Sin teléfono";

      document.getElementById('modalCalle').textContent = data.domicilio?.calle || "No disponible";
      document.getElementById('modalColonia').textContent = data.domicilio?.colonia || "No disponible";

      document.getElementById('modalDepartamento').textContent = data.contrato?.departamento || "No asignado";
      document.getElementById('modalFechaInicio').textContent = data.contrato?.fechaInicio || "No disponible";
      document.getElementById('modalFechaFin').textContent = data.contrato?.fechaFin || "No disponible";

      document.getElementById('modalIdentificacionTipo').textContent = data.identificacion?.tipo || "No disponible";
      document.getElementById('modalIdentificacionNumero').textContent = data.identificacion?.numero || "No disponible";

      document.getElementById('modalContactoNombre').textContent = data.contactoEmergencia?.nombre || "No disponible";
      document.getElementById('modalContactoTelefono').textContent = data.contactoEmergencia?.telefono || "No disponible";
      document.getElementById('modalContactoParentesco').textContent = data.contactoEmergencia?.parentesco || "No disponible";
    } else {
      console.log("No se encontró el documento con ID:", idInquilino);
    }
  } catch (error) {
    console.error("Error al cargar detalles del inquilino:", error);
  }
}
