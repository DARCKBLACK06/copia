import { db } from '../app/firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

export async function mostrarEstadoPago(inquilinoId) {
  const foco = document.getElementById('pagoFoco');
  const texto = document.getElementById('pagoTexto');

  if (!foco || !texto) return;

  try {
    const docRef = doc(db, 'inquilinos', inquilinoId); // ✅ Consultamos directamente al inquilino
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      texto.textContent = 'Sin datos';
      foco.style.backgroundColor = 'gray';
      return;
    }

    const estado = docSnap.data().estadoPago?.toLowerCase(); // ✅ Traemos directamente el campo

    switch (estado) {
      case 'pagado':
        texto.textContent = 'Pagado';
        foco.style.backgroundColor = '#28a745'; // verde
        break;
      case 'proximo a pagar':
        texto.textContent = 'Próximo a pagar';
        foco.style.backgroundColor = '#ffc107'; // amarillo
        break;
      case 'no pagado':
        texto.textContent = 'No pagado';
        foco.style.backgroundColor = '#dc3545'; // rojo
        break;
      default:
        texto.textContent = 'Sin datos';
        foco.style.backgroundColor = 'gray';
    }

  } catch (error) {
    console.error("Error al obtener estado de pago:", error);
    texto.textContent = 'Error';
    foco.style.backgroundColor = 'gray';
  }
}
