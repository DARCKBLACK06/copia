// public/app/loginform.js
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from "./firebase.js";
import { showMessage } from "../app/showMessage.js";

// Asegúrate de que este ID coincida con tu formulario en HTML
const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    try {
        const credentials = await signInWithEmailAndPassword(auth, email, password)
        console.log('Sesión iniciada:', credentials)
        // Redirige al panel administrativo después del login exitoso
        setTimeout(() => {
            window.location.href = 'inicio.html';
        }, 1000);

    } catch (error) {
    console.error("Código de error:", error.code);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      showMessage('Correo o contraseña incorrectos', 'error');
    } else {
      showMessage('Error inesperado: ' + error.message, 'error');
    }
}


})
