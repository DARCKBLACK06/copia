import { signOut } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from "../app/firebase.js"; // Corrige el path si es necesario
import { showMessage } from './showMessage.js';

export const logout = document.querySelector('#logout');

logout.addEventListener('click', async () => {
  await signOut(auth);
  showMessage("Sesión cerrada correctamente", "success");
  window.location.href = "index.html";
});
