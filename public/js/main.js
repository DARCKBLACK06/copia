import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from '../app/firebase.js'; // Asegúrate que 'auth' viene exportado desde aquí
import '../app/loginform.js';

import { initBackgroundSelector } from './modal.js';
import '../js/wallpapersave.js';

// Inicia el selector de fondo
document.addEventListener("DOMContentLoaded", () => {
  initBackgroundSelector();
});

// Detectar usuario autenticado
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Usuario autenticado:", user.email);
    // Redirigir a la página principal
    window.location.href = "inicio.html";
  } else {
    console.log("No hay usuario autenticado");
  }
});


