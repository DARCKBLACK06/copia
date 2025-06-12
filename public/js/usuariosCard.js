import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { db } from '../app/firebase.js';
export async function mostrarUsuariosBasicos() {
  try {
    const inquilinosSnapshot = await getDocs(collection(db, 'inquilinos'));
    inquilinosSnapshot.forEach(doc => {
      const data = doc.data();
      console.log("--- Inquilino ---");
      console.log(data); // 👈 Muestra la estructura real

      const nombre = data.nombre || "Sin nombre";
      const telefono = data.telefono || "Sin teléfono";
      const departamento = data.contrato?.departamento || "No asignado";

      console.log("Nombre:", nombre);
      console.log("Teléfono:", telefono);
      console.log("Departamento:", departamento);

      console.log("-----------------");
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
}
console.log("Cargados usuarios");