// admin.js

import '../app/firebase.js';
import '../app/logout.js';
import '../app/session.js';
import '../app/signupform.js';
import { showMessage } from '../app/showMessage.js';
import { inicializarRegistroDepartamento } from './registrarDepartamento.js';
import { mostrarUsuariosBasicos } from './usuariosCard.js';
import { cargarNotificaciones } from './notifications.js';
import { inicializarRegistroSensor } from './registrarSensor.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializaciones únicas y ordenadas
  inicializarRegistroSensor();
  cargarNotificaciones();
  inicializarRegistroDepartamento();
  mostrarUsuariosBasicos();

  // Sidebar toggle
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");

    const icon = toggleBtn.querySelector("i");
    icon.classList.toggle("bi-chevron-left");
    icon.classList.toggle("bi-chevron-right");
  });

  // Ajuste de alturas en las tarjetas
  igualarAlturasDeTarjetas();

  console.log("¡Bienvenido al panel de administración!");
});

// Igualar alturas de tarjetas dinámicamente
function igualarAlturasDeTarjetas() {
  const tarjetas = document.querySelectorAll('.tarjeta-box');
  let alturaMax = 0;

  // Reinicia altura
  tarjetas.forEach(t => t.style.height = 'auto');

  // Encuentra la mayor
  tarjetas.forEach(t => {
    const altura = t.offsetHeight;
    if (altura > alturaMax) alturaMax = altura;
  });

  // Asigna la misma a todas
  tarjetas.forEach(t => t.style.height = alturaMax + 'px');
}

// También ajustar al redimensionar
window.addEventListener('resize', igualarAlturasDeTarjetas);
