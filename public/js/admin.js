import '../app/firebase.js';
import '../app/logout.js';
import '../app/session.js';
import '../app/signupform.js';
import { showMessage } from '../app/showMessage.js';
import { inicializarRegistroDepartamento } from './registrarDepartamento.js';
import { cargarUsuarios } from './usuariosCard.js';
import { cargarNotificaciones } from './notifications.js';
import { inicializarModalRegistroSensor, abrirModal } from './modalRegistroSensor.js';

document.addEventListener('DOMContentLoaded', () => {
  inicializarModalRegistroSensor();
  cargarNotificaciones();
  inicializarRegistroDepartamento();
  cargarUsuarios();

  // Botón para abrir modal registro sensor
  document.getElementById('btnAbrirModalRegistroSensor').addEventListener('click', abrirModal);

  // Sidebar toggle
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    const icon = toggleBtn.querySelector("i");
    icon.classList.toggle("bi-chevron-left");
    icon.classList.toggle("bi-chevron-right");
  });

  // Ajuste de alturas en tarjetas
  igualarAlturasDeTarjetas();

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

window.addEventListener('resize', igualarAlturasDeTarjetas);
