import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { db } from '../app/firebase.js';
import { mostrarDetallesInquilino } from './modalDetalles.js';

let usuarios = [];
let indiceActual = 0;

export async function mostrarUsuariosBasicos() {
  try {
    const inquilinosSnapshot = await getDocs(collection(db, 'inquilinos'));
    usuarios = [];
    inquilinosSnapshot.forEach(doc => {
      usuarios.push({ id: doc.id, ...doc.data() });
    });

    if (usuarios.length > 0) {
      mostrarUsuario(indiceActual);
      configurarBotones();
    } else {
      document.getElementById('datosUsuario').innerHTML = "<p>No hay usuarios para mostrar.</p>";
    }
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
}

function mostrarUsuario(i) {
  const usuario = usuarios[i];
  if (!usuario) return;

  document.getElementById('datosUsuario').innerHTML = `
    <p><strong>Nombre:</strong> ${usuario.nombre || "Sin nombre"}</p>
    <p><strong>Teléfono:</strong> ${usuario.telefono || "Sin teléfono"}</p>
    <p><strong>Departamento:</strong> ${usuario.contrato?.departamento || "No asignado"}</p>
  `;
}

function configurarBotones() {
  document.getElementById('btnAnterior').onclick = () => {
    if (indiceActual > 0) {
      indiceActual--;
      mostrarUsuario(indiceActual);
    }
  };

  document.getElementById('btnSiguiente').onclick = () => {
    if (indiceActual < usuarios.length - 1) {
      indiceActual++;
      mostrarUsuario(indiceActual);
    }
  };

  document.getElementById('btnDetalles').onclick = () => {
    const usuario = usuarios[indiceActual];
    if (usuario) {
      mostrarDetallesInquilino(usuario.id);
      const modalElement = document.getElementById('modalDetalles');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  };
}
