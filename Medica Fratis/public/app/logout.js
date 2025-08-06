// ============================================
// logout.js
// Cierra sesión del usuario y redirige al login
// ============================================

// === Importaciones necesarias ===
import { signOut } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from "../app/firebase.js";
import { showMessage } from './showMessage.js';

// === Referencia al botón de cerrar sesión ===
const logout = document.querySelector('#logout');

// === Evento para cerrar sesión al hacer clic ===
logout.addEventListener('click', async () => {
  try {
    await signOut(auth);
    showMessage("Sesión cerrada correctamente", "success");
    window.location.href = "index.html"; // Redirigir al login
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
    showMessage("Error al cerrar sesión", "error");
  }
});
