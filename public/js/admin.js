import '../app/firebase.js';
import '../app/logout.js';
import '../app/session.js';
import '../app/signupform.js';
import { showMessage } from '../app/showMessage.js';
import { inicializarRegistroDepartamento } from './registrarDepartamento.js';
import { mostrarUsuariosBasicos } from './usuariosCard.js';
import { cargarNotificaciones } from './notifications.js';
import { listarDepartamentosSinSensor } from './modalRegistroSensor.js';
import { limpiarModal } from './modalDetalles.js';

document.addEventListener('DOMContentLoaded', () => {
  mostrarUsuariosBasicos();

  const modalElement = document.getElementById('modalDetalles');
  modalElement.addEventListener('hidden.bs.modal', () => {
    limpiarModal();
  });

  console.log("¡Bienvenido al panel de administración!");
});


document.addEventListener('DOMContentLoaded', () => {
  // Inicializaciones principales
  listarDepartamentosSinSensor();
  cargarNotificaciones();
  inicializarRegistroDepartamento();
  mostrarUsuariosBasicos();

  // Modal de Registro Sensor
  const btnModalSensor = document.getElementById('btnAbrirModalRegistroSensor');
  if (btnModalSensor) {
    btnModalSensor.addEventListener('click', () => {
      listarDepartamentosSinSensor();
      abrirModal();
    });
  }

  // Sidebar Toggle
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");

      const icon = toggleBtn.querySelector("i");
      if (icon) {
        icon.classList.toggle("bi-chevron-left");
        icon.classList.toggle("bi-chevron-right");
      }
    });
  }

  // Igualar altura de tarjetas
  igualarAlturasDeTarjetas();
  window.addEventListener('resize', igualarAlturasDeTarjetas);

  console.log("¡Bienvenido al panel de administración!");
});

function igualarAlturasDeTarjetas() {
  const tarjetas = document.querySelectorAll('.tarjeta-box');
  let alturaMax = 0;

  tarjetas.forEach(t => t.style.height = 'auto');
  tarjetas.forEach(t => {
    const altura = t.offsetHeight;
    if (altura > alturaMax) alturaMax = altura;
  });
  tarjetas.forEach(t => t.style.height = alturaMax + 'px');
}
