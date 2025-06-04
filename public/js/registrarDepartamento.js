import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { db } from "../app/firebase.js";
import { showMessage } from "../app/showMessage.js";

export function inicializarFormularioDepartamento() {
  const form = document.getElementById("formDepartamento");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const numero = document.getElementById("numeroDepartamento").value;
    const nivel = document.getElementById("nivelDepartamento").value;
    const sensores = document.getElementById("tieneSensores").checked;

    const idDoc = `dpto${numero}`; // Aquí generamos el ID personalizado

    try {
      await setDoc(doc(db, "departamentos", idDoc), {
        numero: Number(numero),
        nivel: Number(nivel),
        sensores: sensores,
        creadoEn: serverTimestamp()
      });

      showMessage(`✅ Departamento ${idDoc} registrado correctamente`, "success");
      form.reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById("modalDepartamento"));
      modal.hide();
    } catch (error) {
      console.error("Error al registrar departamento:", error);
      showMessage("❌ Error al registrar departamento", "error");
    }
  });
}
