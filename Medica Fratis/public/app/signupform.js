// public/app/signupform.js
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from './firebase.js';
import { showMessage } from './showMessage.js';

const signupform = document.querySelector('#signup-form');

signupform.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = signupform['login-email'].value;
  const password = signupform['login-password'].value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Ocultar modal
    const signupModal = document.querySelector('#signupModal');
    const modal = bootstrap.Modal.getInstance(signupModal);
    modal.hide();

    showMessage('Registro exitoso: ' + userCredential.user.email, 'success');

    signupform.reset();

  } catch (error) {
    if (error.code === 'auth/invalid-email') {
      showMessage("Correo no válido", "error");
    } else if (error.code === 'auth/weak-password') {
      showMessage("Contraseña demasiado débil", "error");
    } else if (error.code === 'auth/email-already-in-use') {
      showMessage("Correo ya en uso", "error");
    } else {
      showMessage("Error inesperado", "error");
    }
  }
});
