// Aquí puedes usar Chart.js u otra librería para renderizar las gráficas
export function renderizarGraficaSensor(containerId, datos, titulo = "Sensor") {
  // Este esqueleto se puede expandir luego
  const div = document.getElementById(containerId);
  div.innerHTML = `<p class="text-secondary">[Gráfica de "${titulo}" en desarrollo...]</p>`;
}
