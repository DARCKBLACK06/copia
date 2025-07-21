import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from "./firebase.js";
import { showMessage } from "../app/showMessage.js";

const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', async e => {
  e.preventDefault();

  const email = loginForm['login-email'].value.trim();
  const password = loginForm['login-password'].value.trim();

  try {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sesión iniciada:', credentials);
    showMessage(`Bienvenido, ${credentials.user.email}`, "success");
    setTimeout(() => {
      window.location.href = 'inicio.html';
    }, 1000);

  } catch (error) {
    console.error("Código de error:", error.code, error.message);

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
