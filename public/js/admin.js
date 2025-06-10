import '../app/firebase.js';
import '../app/logout.js';
import '../app/session.js';
import '../app/signupform.js';
import { showMessage } from '../app/showMessage.js';
import { inicializarRegistroDepartamento } from './registrarDepartamento.js';
import { cargarUsuarios } from './usuariosCard.js';
import { cargarNotificaciones } from './notifications.js';

window.addEventListener('DOMContentLoaded', () => {
  cargarNotificaciones();
});


window.addEventListener('DOMContentLoaded', () => {
  inicializarRegistroDepartamento();
});

window.addEventListener('DOMContentLoaded', () => {
  inicializarRegistroDepartamento();
  cargarUsuarios();
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");

    const icon = toggleBtn.querySelector("i");
    icon.classList.toggle("bi-chevron-left");
    icon.classList.toggle("bi-chevron-right");
  });

  console.log("¡Bienvenido al panel de administración!");
});

function igualarAlturasDeTarjetas() {
  const tarjetas = document.querySelectorAll('.tarjeta-box');
  let alturaMax = 0;

  // Reinicia la altura para no acumular errores
  tarjetas.forEach(t => t.style.height = 'auto');

  // Encuentra la altura máxima
  tarjetas.forEach(t => {
    const altura = t.offsetHeight;
    if (altura > alturaMax) alturaMax = altura;
  });

  // Aplica la altura máxima a todas las tarjetas
  tarjetas.forEach(t => t.style.height = alturaMax + 'px');
}

// Llama a la función al cargar la página y al cambiar el tamaño de la ventana
window.addEventListener('load', igualarAlturasDeTarjetas);
window.addEventListener('resize', igualarAlturasDeTarjetas);
