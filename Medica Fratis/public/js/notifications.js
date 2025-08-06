import { db } from '../app/firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js';

function calcularDiasRestantes(fechaStr) {
  const hoy = new Date().toISOString().split('T')[0];       // "2025-07-28"
  const pago = new Date(fechaStr).toISOString().split('T')[0];

  const hoyDate = new Date(hoy);
  const pagoDate = new Date(pago);

  const diff = (pagoDate - hoyDate) / (1000 * 60 * 60 * 24);
  return Math.round(diff);
}


function crearAlertaVisual(depto, diasRestantes, nombre, estadoPago) {
  let color, mensaje;

  if (diasRestantes >= 4 && diasRestantes <= 7) {
    color = '#ffa500'; // naranja
    mensaje = `El pago vence en <strong>${diasRestantes} días</strong>`;
  } else if (diasRestantes >= 1 && diasRestantes <= 3) {
    color = '#dd0808'; // rojo
    mensaje = `El pago vence en <strong>${diasRestantes} días</strong>`;
  } else if (diasRestantes === 0) {
    color = '#000000'; // negro
    mensaje = `<strong>Hoy</strong> es la fecha límite de pago`;
  } else {
    color = '#000000'; // negro también
    mensaje = `<strong>Pago vencido</strong>`;
  }

  const alerta = document.createElement('div');
  alerta.className = 'alert-box';
  alerta.style.borderLeft = `5px solid ${color}`;
  alerta.innerHTML = `
    <div class="text">
      <span class="material-icons icon">notifications</span>
      <strong>${depto}:</strong>&nbsp;
      <span>${mensaje}</span><br>
      <span>Usuario <strong>${nombre}</strong></span>
    </div>
  `;

  const contenedor = document.getElementById('notifications-content');
  if (contenedor) contenedor.appendChild(alerta);
}

export async function mostrarNotificacionesPago() {
  const contenedor = document.getElementById('notifications-content');
  if (!contenedor) return;

  contenedor.innerHTML = ''; // Limpiar alertas anteriores

  const snapshot = await getDocs(collection(db, 'inquilinos'));

  snapshot.forEach(doc => {
    const data = doc.data();
    const depto = data.contrato?.departamento || doc.id;
    const estadoPago = data.statusControl?.estadoPago?.toLowerCase() || '';
    const fechaPago = data.contrato?.fechaPago;

    if (!fechaPago) return;

    const fechaObj = fechaPago.toDate ? fechaPago.toDate() : new Date(fechaPago);
    const diasRestantes = calcularDiasRestantes(fechaObj);

    if (estadoPago === 'pagado') return;
    if (diasRestantes > 7) return;

    const nombre = (data.infoPersonal?.nombre || 'Sin nombre')
      .replace(/\s+/g, ' ')
      .trim();

    crearAlertaVisual(depto, diasRestantes, nombre, estadoPago);
  });
}
