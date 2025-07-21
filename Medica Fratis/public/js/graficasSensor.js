// === Conexión a Firebase Realtime Database ===
import { dbRealtime } from '../app/firebase.js';
import { ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

// === Control interno de suscripción y gráficas activas ===
let unsubscribe = null;
const chartInstances = {
  temperatura: null,
  humedad: null,
  humo: null,
  agua: null
};

// === Devuelve color según el valor medido para cada tipo de sensor ===
function obtenerColor(valor, tipo) {
  const rangos = {
    temperatura: [
      { limite: 18, color: '#28a745' },     // verde
      { limite: 26, color: '#ffc107' },     // amarillo
      { limite: Infinity, color: '#dc3545' } // rojo
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
      { limite: 0.1, color: '#6c757d' },    // gris (sin flujo)
      { limite: 5, color: '#28a745' },
      { limite: 10, color: '#ffc107' },
      { limite: Infinity, color: '#dc3545' }
    ]
  };
  return rangos[tipo].find(r => valor <= r.limite)?.color || '#6c757d';
}

// === Crea una gráfica tipo dona para el sensor especificado ===
function crearGraficaDona(ctx, label, valorInicial, tipo) {
  const color = obtenerColor(valorInicial, tipo);
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [label],
      datasets: [{
        data: [valorInicial, 100 - valorInicial],
        backgroundColor: [color, '#343a40'], // fondo oscuro
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

// === Actualiza o crea la gráfica en el canvas indicado ===
function actualizarGrafica(idCanvas, label, valor, tipo) {
  const ctx = document.getElementById(idCanvas);
  if (!ctx) return;

  const nuevoColor = obtenerColor(valor, tipo);

  if (chartInstances[tipo]) {
    // Ya existe -> actualiza
    chartInstances[tipo].data.datasets[0].data = [valor, 100 - valor];
    chartInstances[tipo].data.datasets[0].backgroundColor[0] = nuevoColor;
    chartInstances[tipo].update();
  } else {
    // No existe -> crea
    chartInstances[tipo] = crearGraficaDona(ctx, label, valor, tipo);
  }
}

// === Función principal: carga y muestra gráficas del sensor en tiempo real ===
export function cargarGraficasSensor(departamentoId) {
  const rutaSensor = `departamentos/depto${departamentoId}/sensores/datos_completos`;
  const rutaEstadoCerradura = `departamentos/depto${departamentoId}/sensores/datos_completos/cerradura`;

  const sensorRef = ref(dbRealtime, rutaSensor);
  const cerraduraRef = ref(dbRealtime, rutaEstadoCerradura);

  // Referencias DOM
  const contenedor = document.getElementById('contenedorGraficas');
  const contenedorMensaje = document.getElementById('contenedorMensajeSinSensor');
  const contenedorCerradura = document.getElementById('contenedorSwitchCerradura');
  const iconoCerradura = document.getElementById('iconoCerradura');
  const textoCerradura = document.getElementById('textoCerradura');
  const estadoPagado = document.getElementById('estadoencendido');
  const estadoNoPagado = document.getElementById('estadoapagado');
  const btnGuardarEstado = document.getElementById('btnGuardarEstado');

  unsubscribe = onValue(sensorRef, snapshot => {
    const datos = snapshot.val();

    // Si no hay datos o están vacíos -> mostrar solo el mensaje
    if (!datos || Object.keys(datos).length === 0) {
      contenedor.style.display = 'none';
      contenedorCerradura.style.display = 'none';
      contenedorMensaje.style.display = 'flex';

      // 💥 Destruir gráficas y ocultar sus contenedores
      Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
          chartInstances[key].destroy();
          chartInstances[key] = null;
        }

        // Ocultar visualmente cada .grafica-item individual
        const canvas = document.getElementById(`grafica${key.charAt(0).toUpperCase() + key.slice(1)}`);
        const graficaItem = canvas?.closest('.grafica-item');
        if (graficaItem) {
          graficaItem.style.display = 'none';
        }
      });

      return;
    }

    // Si hay datos -> mostrar gráficas y estado de cerradura
    contenedor.style.display = 'flex';
    contenedorCerradura.style.display = 'block';
    contenedorMensaje.style.display = 'none';

    // 🧼 Asegurar que se muestren todas las gráficas (por si estaban ocultas)
    document.querySelectorAll('.grafica-item').forEach(item => {
      item.style.display = 'flex';
    });

    // Actualiza gráficas con los datos del sensor
    actualizarGrafica('graficaTemperatura', 'Temperatura', datos.temperatura || 0, 'temperatura');
    actualizarGrafica('graficaHumedad', 'Humedad', datos.humedad || 0, 'humedad');
    actualizarGrafica('graficaHumo', 'Humo', datos.humo || 0, 'humo');
    actualizarGrafica('graficaAgua', 'Agua (L)', datos.agua || 0, 'agua');
  });



  // === Suscripción a estado de cerradura ===
  onValue(cerraduraRef, snapshot => {
    const estado = snapshot.val();
    if (!estado) return;

    // Cambia ícono y texto visual del estado
    if (iconoCerradura && textoCerradura) {
      if (estado === 'encendido') {
        iconoCerradura.textContent = '🔓';
        iconoCerradura.style.color = '#28a745';
        textoCerradura.textContent = 'Acceso permitido';
      } else {
        iconoCerradura.textContent = '🔒';
        iconoCerradura.style.color = '#dc3545';
        textoCerradura.textContent = 'Acceso denegado';
      }
    }

    // Cambia el botón seleccionado (radio)
    if (estadoPagado) estadoPagado.checked = estado === 'encendido';
    if (estadoNoPagado) estadoNoPagado.checked = estado === 'apagado';
  });

  // === Permite editar estado de cerradura manualmente ===
  if (btnGuardarEstado) {
    btnGuardarEstado.onclick = () => {
      const nuevoEstado = document.querySelector('input[name="estadoCerradura"]:checked')?.value;
      if (nuevoEstado) {
        set(cerraduraRef, nuevoEstado)
          .then(() => console.log(`✅ Estado actualizado a ${nuevoEstado}`))
          .catch(err => console.error('❌ Error al guardar estado:', err));
      }
    };
  }
}

// === Detiene actualizaciones en tiempo real y destruye gráficas ===
export function detenerActualizacion() {
  if (unsubscribe) {
    unsubscribe(); // Cancela escucha
    unsubscribe = null;
  }

  // Destruye todas las gráficas existentes
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
      chartInstances[key] = null;
    }
  });
}
