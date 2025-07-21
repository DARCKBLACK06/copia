// === Importa la instancia de Firestore desde firebase.js ===
import { db } from '../app/firebase.js';

// === Importa funciones de Firestore para consultar documentos ===
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

// === Función para cargar departamentos disponibles en el <select> del formulario ===
export async function cargarDeptos() {
  try {
    // Obtiene el elemento <select> donde se mostrarán los departamentos
    const select = document.getElementById('departamentoSelect');
    if (!select) {
      console.error('No se encontró el select con id "departamentoSelect"');
      return;
    }

    // Referencia a la colección "departamentos" en Firestore
    const departamentosRef = collection(db, 'departamentos');

    // Consulta para traer solo los departamentos que estén disponibles
    const q = query(departamentosRef, where('disponible', '==', true));

    // Ejecuta la consulta
    const querySnapshot = await getDocs(q);

    // Limpia todas las opciones anteriores del select (excepto la primera)
    select.length = 1; // Deja solo "Seleccione un departamento"

    // Por cada departamento disponible, crea una opción en el select
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const option = document.createElement('option');

      option.value = doc.id; // El valor será el ID del documento en Firestore
      option.textContent = `Departamento ${data.numero || doc.id}`; // Texto visible

      select.appendChild(option);
    });

    console.log('✅ Departamentos cargados en el select.');

  } catch (error) {
    console.error('❌ Error cargando departamentos:', error);
  }
}
