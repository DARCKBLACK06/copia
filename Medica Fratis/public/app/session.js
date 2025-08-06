// ============================================
// session.js
// Verifica si el usuario está autenticado.
// Si no lo está, lo redirige al login (index.html)
// ============================================

// === Importaciones necesarias ===
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from "./firebase.js";

// === Verificación del estado de autenticación ===
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Si no hay usuario autenticado, redirigir al login
    window.location.href = "index.html";
  }
});
