import { db } from "../app/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const datosUsuario = document.getElementById("datosUsuario");
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const btnDetalles = document.getElementById("btnDetalles");

let usuarios = [];
let indiceActual = 0;

export async function cargarUsuarios() {
  if (!datosUsuario || !btnAnterior || !btnSiguiente || !btnDetalles) return;

  datosUsuario.innerHTML = "Cargando usuarios...";

  try {
    const querySnapshot = await getDocs(collection(db, "inquilinos"));

    if (querySnapshot.empty) {
      datosUsuario.innerHTML = "<p>No hay usuarios registrados.</p>";
      return;
    }

    usuarios = [];
    querySnapshot.forEach(doc => usuarios.push(doc.data()));
    indiceActual = 0;
    mostrarUsuario(indiceActual);

    btnAnterior.onclick = () => {
      indiceActual = (indiceActual - 1 + usuarios.length) % usuarios.length;
      mostrarUsuario(indiceActual);
    };

    btnSiguiente.onclick = () => {
      indiceActual = (indiceActual + 1) % usuarios.length;
      mostrarUsuario(indiceActual);
    };

    btnDetalles.onclick = () => {
      if (usuarios.length > 0) {
        importarYMostrarModalDetalles(usuarios[indiceActual]);
      }
    };

  } catch (error) {
    datosUsuario.innerHTML = "<p>Error al cargar usuarios.</p>";
    console.error("Error cargando usuarios:", error);
  }
}

function mostrarUsuario(indice) {
  const user = usuarios[indice];
  datosUsuario.innerHTML = `
    <p><strong>Nombre:</strong> ${user.nombre || "Sin nombre"}</p>
    <p><strong>Teléfono:</strong> ${user.telefono || "Sin teléfono"}</p>
    <p><strong>Departamento:</strong> ${user.departamento || "Sin departamento"}</p>
    
  `;
}

// Aquí importamos la función del modal, en otro archivo
async function importarYMostrarModalDetalles(user) {
  const { mostrarModalDetalles } = await import('./modalDetalles.js');
  mostrarModalDetalles(user);
}
