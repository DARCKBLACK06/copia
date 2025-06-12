import { db } from '../app/firebase.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

export async function cargarDeptos() {
  try {
    const select = document.getElementById('departamentoSelect');
    if (!select) {
      console.error('No se encontró el select con id "departamentoSelect"');
      return;
    }

    const departamentosRef = collection(db, 'departamentos');
    const q = query(departamentosRef, where('disponible', '==', true));
    const querySnapshot = await getDocs(q);

    // Limpiar opciones anteriores excepto la primera
    select.length = 1; // mantiene solo la opción "Seleccione un departamento"

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const option = document.createElement('option');
      option.value = doc.id; // o data.numero si quieres el número real
      option.textContent = `Departamento ${data.numero || doc.id}`;
      select.appendChild(option);
    });

    console.log('Departamentos cargados en el select.');

  } catch (error) {
    console.error('Error cargando departamentos:', error);
  }
}
