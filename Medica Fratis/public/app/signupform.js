// ============================================
// signupform.js
// Registro de nuevos usuarios con Firebase Auth
// ============================================

// === Importaciones necesarias ===
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from './firebase.js';
import { showMessage } from './showMessage.js';

// === Referencia al formulario de registro ===
const signupform = document.querySelector('#signup-form');

// === Evento de envío del formulario ===
signupform.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = signupform['login-email'].value;
  const password = signupform['login-password'].value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Cerrar el modal si existe
    const signupModal = document.querySelector('#signupModal');
    const modal = bootstrap.Modal.getInstance(signupModal);
    if (modal) modal.hide();

    showMessage(`Registro exitoso: ${userCredential.user.email}`, 'success');
    signupform.reset();

  } catch (error) {
    // === Manejo de errores comunes ===
    switch (error.code) {
      case 'auth/invalid-email':
        showMessage("Correo no válido", "error");
        break;
      case 'auth/weak-password':
        showMessage("Contraseña demasiado débil", "error");
        break;
      case 'auth/email-already-in-use':
        showMessage("Correo ya en uso", "error");
        break;
      default:
        showMessage("Error inesperado", "error");
        console.error("Error en registro:", error.code, error.message);
        break;
    }
  }
});
