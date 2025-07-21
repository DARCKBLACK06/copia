import { dbRealtime } from '../app/firebase.js';
import { ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

let unsubscribe = null;
const chartInstances = {
  temperatura: null,
  humedad: null,
  humo: null,
  agua: null
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
    ],
    agua: [
      { limite: 0.1, color: '#6c757d' },
      { limite: 5, color: '#28a745' },
      { limite: 10, color: '#ffc107' },
      { limite: Infinity, color: '#dc3545' }
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
  const rutaSensor = `departamentos/depto${departamentoId}/sensores/lecturas-sensores`;
  const rutaEstadoCerradura = `departamentos/depto${departamentoId}/sensores/cerradura`;

  const sensorRef = ref(dbRealtime, rutaSensor);
  const cerraduraRef = ref(dbRealtime, rutaEstadoCerradura);

  const contenedor = document.getElementById('contenedorGraficas');
  const contenedorAgua = document.getElementById('contenedorAgua'); // 🧃 Viva el agua
  const aviso = document.getElementById('mensajeSinSensor');

  const iconoCerradura = document.getElementById('iconoCerradura');
  const textoCerradura = document.getElementById('textoCerradura');
  const estadoPagado = document.getElementById('estadoPagado');
  const estadoNoPagado = document.getElementById('estadoNoPagado');
  const btnGuardarEstado = document.getElementById('btnGuardarEstado');

  if (unsubscribe) unsubscribe();

  unsubscribe = onValue(sensorRef, snapshot => {
    const datos = snapshot.val();

    if (!datos) {
      if (aviso) aviso.style.display = 'block';
      if (contenedor) contenedor.style.visibility = 'hidden';
      if (contenedorAgua) contenedorAgua.style.visibility = 'hidden';
      return;
    }

    if (aviso) aviso.style.display = 'none';
    if (contenedor) contenedor.style.visibility = 'visible';
    if (contenedorAgua) contenedorAgua.style.visibility = 'visible';

    actualizarGrafica('graficaTemperatura', 'Temperatura', datos.temperatura || 0, 'temperatura');
    actualizarGrafica('graficaHumedad', 'Humedad', datos.humedad || 0, 'humedad');
    actualizarGrafica('graficaHumo', 'Humo', datos.humo || 0, 'humo');
    actualizarGrafica('graficaAgua', 'Agua (L)', datos.agua || 0, 'agua');
  });

  onValue(cerraduraRef, snapshot => {
    const estado = snapshot.val();
    if (!estado) return;

    // Icono y texto visuales
    if (iconoCerradura && textoCerradura) {
      if (estado === 'pagado') {
        iconoCerradura.textContent = '🔓';
        iconoCerradura.style.color = '#28a745';
        textoCerradura.textContent = 'Acceso permitido';
      } else {
        iconoCerradura.textContent = '🔒';
        iconoCerradura.style.color = '#dc3545';
        textoCerradura.textContent = 'Acceso denegado';
      }
    }

    // Selección de radio buttons
    if (estadoPagado) estadoPagado.checked = estado === 'pagado';
    if (estadoNoPagado) estadoNoPagado.checked = estado === 'no pagado';
  });

  // Botón de guardar estado
  if (btnGuardarEstado) {
    btnGuardarEstado.onclick = () => {
      const nuevoEstado = document.querySelector('input[name="estadoCerradura"]:checked')?.value;
      if (nuevoEstado) {
        set(cerraduraRef, nuevoEstado)
          .then(() => {
            console.log(`✅ Estado actualizado a ${nuevoEstado}`);
          })
          .catch(err => console.error('❌ Error al guardar estado:', err));
      }
    };
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
