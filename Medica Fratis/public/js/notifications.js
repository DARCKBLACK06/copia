// === Importación de conexión a Firestore y utilidades ===
import { db } from '../app/firebase.js';
import { collection, getDocs, query, where, Timestamp } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js';

// === Función principal para cargar las notificaciones de pagos próximos ===
export async function cargarNotificaciones() {
  // Obtiene el contenedor donde se mostrarán las notificaciones
  const container = document.getElementById('notifications-content');

  // Si no existe el contenedor, muestra un error y sale
  if (!container) {
    console.error('❌ No se encontró el contenedor de notificaciones.');
    return;
  }

  try {
    // === Definición del rango de fechas ===
    const hoy = new Date();           // Fecha actual
    const limite = new Date();        // Fecha límite para considerar pagos
    limite.setDate(hoy.getDate() + 5); // Pagos dentro de los próximos 5 días

    // === Consulta a la colección "pagos" en Firestore ===
    const pagosRef = collection(db, 'pagos'); // Referencia a la colección
    const q = query(
      pagosRef,
      where('fecha', '>=', Timestamp.fromDate(hoy)),     // Solo pagos desde hoy
      where('fecha', '<=', Timestamp.fromDate(limite))   // Hasta 5 días adelante
    );

    const querySnapshot = await getDocs(q); // Ejecuta la consulta
    container.innerHTML = '';               // Limpia notificaciones anteriores

    // === Si no hay pagos próximos ===
    if (querySnapshot.empty) {
      container.innerHTML = `<p class="text-muted">No hay pagos próximos.</p>`;
    } else {
      // === Recorre los documentos encontrados ===
      querySnapshot.forEach((doc) => {
        const pago = doc.data();
        const fechaPago = pago.fecha.toDate().toLocaleDateString(); // Formato legible

        // HTML para cada notificación
        const notiHTML = `
          <div class="alert alert-warning d-flex align-items-center" role="alert">
            <i class="bi bi-exclamation-circle-fill me-2"></i>
            🔔 Se aproxima el pago de <strong>${pago.inquilino}</strong> por <strong>$${pago.monto}</strong> el <strong>${fechaPago}</strong>
          </div>
        `;

        container.insertAdjacentHTML('beforeend', notiHTML); // Inserta notificación en el contenedor
      });
    }

    console.log('✅ Notificaciones cargadas correctamente desde Firestore.');
  } catch (error) {
    console.error('❌ Error al cargar notificaciones:', error);
  }
}
