import { dbRealtime } from './firebase-config.js';
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js';
import { initModoControl } from './modo-control.js';

// === CHARTS DONUT ===
function createDonutChart(ctx, label, colorFn) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [label],
      datasets: [{
        data: [0, 100],
        backgroundColor: [colorFn(0), '#2f2f2f'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false },
        datalabels: {
          display: true,
          color: '#fff',
          font: { size: 18, weight: 'bold' },
          formatter: (value, ctx) => ctx.chart.data.datasets[0].data[0].toFixed(1)
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function getColorByValue(value, type) {
  if (type === 'temp') return value >= 30 ? '#f44336' : value >= 20 ? '#ffc107' : '#4caf50';
  if (type === 'hum') return value >= 70 ? '#2196f3' : value >= 40 ? '#ffc107' : '#4caf50';
  if (type === 'gas') return value >= 70 ? '#f44336' : value >= 40 ? '#ffc107' : '#4caf50';
  if (type === 'flow') return value >= 10 ? '#4caf50' : value >= 5 ? '#ffc107' : '#f44336';
  return '#999';
}

const charts = {
  temp: createDonutChart(document.getElementById('tempChart'), '°C', v => getColorByValue(v, 'temp')),
  hum: createDonutChart(document.getElementById('humChart'), '%', v => getColorByValue(v, 'hum')),
  gas: createDonutChart(document.getElementById('mq2Chart'), '%', v => getColorByValue(v, 'gas')),
  flow: createDonutChart(document.getElementById('flowChar'), 'L/min', v => getColorByValue(v, 'flow')),
};

function updateDonutChart(chart, value, type) {
  chart.data.datasets[0].data[0] = value;
  chart.data.datasets[0].data[1] = 100 - value;
  chart.data.datasets[0].backgroundColor[0] = getColorByValue(value, type);
  chart.update();
}

const dataRef = ref(dbRealtime, '/departamentos/deptodpto1/sensores/datos_completos');
onValue(dataRef, snapshot => {
  const data = snapshot.val();
  if (!data) return;
  const { temperatura, humedad, humo, agua } = data;
  updateDonutChart(charts.temp, temperatura, 'temp');
  updateDonutChart(charts.hum, humedad, 'hum');
  updateDonutChart(charts.gas, humo, 'gas');
  updateDonutChart(charts.flow, agua, 'flow');
});

// --- Tarjeta de estado de pago se puede dejar aquí o mover a modo-control.js si lo prefieres ---
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js';
import { dbFirestore } from './firebase-config.js';

async function mostrarEstadoPago() {
  const docRef = doc(dbFirestore, 'inquilino', 'inquilinoDepto01');
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const cont = document.getElementById('estado-pago');
  const texto = document.getElementById('texto-estado-pago');
  const estado = (data.estadoPago || '').toLowerCase();
  cont.classList.remove('pagado','pendiente','nopagado');
  if (estado === 'pagado') {
    cont.classList.add('pagado');
    texto.textContent = 'Pagado';
  } else if (estado === 'pendiente') {
    cont.classList.add('pendiente');
    texto.textContent = 'Pago Aproximado';
  } else {
    cont.classList.add('nopagado');
    texto.textContent = 'No Pagado';
  }
}
mostrarEstadoPago();

initModoControl();
