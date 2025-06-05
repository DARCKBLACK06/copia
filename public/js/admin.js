import '../app/firebase.js';
import '../app/logout.js';
import '../app/session.js';
import '../app/signupform.js';
import { showMessage } from '../app/showMessage.js';
import { inicializarRegistroDepartamento } from './registrarDepartamento.js';
import { cargarUsuarios } from './usuariosCard.js';

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

