import { dbRealtime } from '../app/firebase.js';
import { ref, onValue, off } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

let unsubscribe = null;
const chartInstances = {
  temperatura: null,
  humedad: null,
  humo: null
};

function crearGraficaDona(ctx, label, valorInicial) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [label],
      datasets: [{
        data: [valorInicial, 100 - valorInicial],
        backgroundColor: ['#17a2b8', '#495057'], // gris menos oscuro que antes
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
        title: {
          display: true,
          text: label,
          color: '#ffffff',
          font: { size: 14 }
        }
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
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${valor}`, width / 2, height / 2);
        ctx.restore();
      }
    }]
  });
}

export function cargarGraficasSensor(departamentoId) {
  const rutaSensor = `departamentos/depto${departamentoId}/sensor_DHT22/datos_completos`;
  const sensorRef = ref(dbRealtime, rutaSensor);

  if (unsubscribe) unsubscribe();

  unsubscribe = onValue(sensorRef, snapshot => {
    const datos = snapshot.val();
    if (!datos) return;

    actualizarGrafica('graficaTemperatura', 'Temperatura', Number(datos.temperatura) || 0, 'temperatura');
    actualizarGrafica('graficaHumedad', 'Humedad', Number(datos.humedad) || 0, 'humedad');
    actualizarGrafica('graficaHumo', 'Humo', Number(datos.humo) || 0, 'humo');
  });
}

function actualizarGrafica(idCanvas, label, valor, tipo) {
  const ctx = document.getElementById(idCanvas);
  if (!ctx) return;

  if (chartInstances[tipo]) {
    chartInstances[tipo].data.datasets[0].data = [valor, 100 - valor];
    chartInstances[tipo].update();
  } else {
    chartInstances[tipo] = crearGraficaDona(ctx, label, valor);
  }
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
