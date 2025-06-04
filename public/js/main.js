import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from '../app/firebase.js';
import '../app/loginform.js';

import { initBackgroundSelector } from '../js/wallpapersave.js'; // ← ¡CORRECTO!

// Inicia el selector de fondo al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  initBackgroundSelector(); // ← LLAMADA correcta
});

// Detectar usuario autenticado
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Usuario autenticado:", user.email);
    window.location.href = "inicio.html";
  } else {
    console.log("No hay usuario autenticado");
  }
});
