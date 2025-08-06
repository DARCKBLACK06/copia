// ============================================
// loginform.js
// Maneja el inicio de sesión usando Firebase Auth
// ============================================

// === Importaciones necesarias ===
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from "./firebase.js";
import { showMessage } from "../app/showMessage.js";

// === Referencia al formulario de login ===
const loginForm = document.querySelector('#login-form');

// === Evento al enviar el formulario ===
loginForm.addEventListener('submit', async e => {
  e.preventDefault();

  // Obtener valores de campos
  const email = loginForm['login-email'].value.trim();
  const password = loginForm['login-password'].value.trim();

  try {
    // Iniciar sesión con Firebase Auth
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Sesión iniciada:', credentials);

    // Mostrar mensaje y redirigir al dashboard
    showMessage(`Bienvenido, ${credentials.user.email}`, "success");
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);

  } catch (error) {
    console.error("❌ Código de error:", error.code, error.message);

    // Errores comunes de autenticación
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      showMessage('Correo o contraseña incorrectos', 'error');
    } else {
      showMessage('Error inesperado. Intenta más tarde.', 'error');
    }
  }
});
