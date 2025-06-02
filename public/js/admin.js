// public/js/admin.js

// Importa lógica de Firebase
import '../app/firebase.js';

// Importa cierre de sesión
import '../app/logout.js';

// Importa mensaje de bienvenida (controlado por sessionStorage)
import '../app/session.js';

// Importa utilidades generales
import { showMessage } from '../app/showMessage.js';

// Sidebar colapsable
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
