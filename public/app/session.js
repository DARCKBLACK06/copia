import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { auth } from "../app/firebase.js";
import { showMessage } from './showMessage.js';

onAuthStateChanged(auth,  (user) => {
  if (user) {
    showMessage(`Bienvenido, ${user.email}`, "success");
  }
});
