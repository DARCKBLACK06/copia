import { db } from "../app/firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { showMessage } from "../app/showMessage.js";

const form = document.getElementById("formInquilino");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  try {
    await addDoc(collection(db, "inquilinos"), data);
    form.reset();
    document.getElementById("mensaje").classList.remove("hidden");
    showMessage("Inquilino registrado con éxito", "success");
  } catch (error) {
    console.error("Error al registrar inquilino:", error);
    showMessage("Error al registrar inquilino", "error");
  }

});
  console.log('Funcional');

