import { dbRealtime } from '../app/firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

let unsubscribe = null;
const chartInstances = {
  temperatura: null,
  humedad: null,
  humo: null
};

function obtenerColor(valor, tipo) {
  const rangos = {
    temperatura: [
      { limite: 18, color: '#28a745' },
      { limite: 26, color: '#ffc107' },
      { limite: Infinity, color: '#dc3545' }
    ],
    humedad: [
      { limite: 40, color: '#dc3545' },
      { limite: 60, color: '#ffc107' },
      { limite: 100, color: '#28a745' }
    ],
    humo: [
      { limite: 30, color: '#28a745' },
      { limite: 60, color: '#ffc107' },
      { limite: 100, color: '#dc3545' }
    ]
  };
  return rangos[tipo].find(r => valor <= r.limite)?.color || '#6c757d';
}

function crearGraficaDona(ctx, label, valorInicial, tipo) {
  const color = obtenerColor(valorInicial, tipo);
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [label],
      datasets: [{
        data: [valorInicial, 100 - valorInicial],
        backgroundColor: [color, '#343a40'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        title: { display: true, text: label, color: '#fff', font: { size: 14 } }
      }
    },
    plugins: [{
      id: 'valorCentro',
      beforeDraw(chart) {
        const { width, height, ctx } = chart;
        const valor = Math.round(chart.data.datasets[0].data[0]);
        ctx.save();
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${valor}`, width / 2, height / 2);
        ctx.restore();
      }
    }]
  });
}

function actualizarGrafica(idCanvas, label, valor, tipo) {
  const ctx = document.getElementById(idCanvas);
  if (!ctx) return;
  const nuevoColor = obtenerColor(valor, tipo);
  if (chartInstances[tipo]) {
    chartInstances[tipo].data.datasets[0].data = [valor, 100 - valor];
    chartInstances[tipo].data.datasets[0].backgroundColor[0] = nuevoColor;
    chartInstances[tipo].update();
  } else {
    chartInstances[tipo] = crearGraficaDona(ctx, label, valor, tipo);
  }
}

export function cargarGraficasSensor(departamentoId) {
  const rutaSensor = `departamentos/depto${departamentoId}/sensor_DHT22/datos_completos`;
  const sensorRef = ref(dbRealtime, rutaSensor);

  const contenedor = document.getElementById('contenedorGraficas');
  const aviso = document.getElementById('mensajeSinSensor');

  if (unsubscribe) unsubscribe();

  unsubscribe = onValue(sensorRef, snapshot => {
    const datos = snapshot.val();

    if (!datos) {
      if (aviso) aviso.style.display = 'block';
      if (contenedor) contenedor.style.visibility = 'hidden';
      return;
    }

    if (aviso) aviso.style.display = 'none';
    if (contenedor) contenedor.style.visibility = 'visible';

    actualizarGrafica('graficaTemperatura', 'Temperatura', datos.temperatura || 0, 'temperatura');
    actualizarGrafica('graficaHumedad', 'Humedad', datos.humedad || 0, 'humedad');
    actualizarGrafica('graficaHumo', 'Humo', datos.humo || 0, 'humo');
  });
}

export function detenerActualizacion() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
      chartInstances[key] = null;
    }
  });
}
