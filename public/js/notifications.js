// notifications.js
import { db } from '../app/firebase.js';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js';

// Función para cargar las notificaciones
export async function cargarNotificaciones() {
  const container = document.getElementById('notificaciones-container');
  if (!container) {
    console.error('❌ No se encontró el contenedor de notificaciones.');
    return;
  }

  try {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 5); // Pagos próximos en los próximos 5 días

    const pagosRef = collection(db, 'pagos');
    const q = query(
      pagosRef,
      where('fecha', '>=', Timestamp.fromDate(hoy)),
      where('fecha', '<=', Timestamp.fromDate(limite))
    );

    const querySnapshot = await getDocs(q);
    container.innerHTML = ''; // Limpiar anteriores

    if (querySnapshot.empty) {
      container.innerHTML = `<p class="text-muted">No hay pagos próximos.</p>`;
    } else {
      querySnapshot.forEach((doc) => {
        const pago = doc.data();
        const fechaPago = pago.fecha.toDate().toLocaleDateString();

        const notiHTML = `
          <div class="alert alert-warning d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-circle-fill me-2"></i>
            🔔 Se aproxima el pago de <strong>${pago.inquilino}</strong> por <strong>$${pago.monto}</strong> el <strong>${fechaPago}</strong>
          </div>
        `;

        container.insertAdjacentHTML('beforeend', notiHTML);
      });
    }

    console.log('✅ Notificaciones cargadas correctamente desde Firestore.');
  } catch (error) {
    console.error('❌ Error al cargar notificaciones:', error);
  }
}
