import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { db } from '../app/firebase.js';
import { mostrarDetallesInquilino } from './modalDetalles.js';

let usuarios = [];
let indiceActual = 0;

export async function mostrarUsuariosBasicos() {
  try {
    const inquilinosSnapshot = await getDocs(collection(db, 'inquilinos'));
    usuarios = [];  // Limpia arreglo antes de cargar

    inquilinosSnapshot.forEach(doc => {
      const data = doc.data();
      usuarios.push({ id: doc.id, ...data });
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

  const nombre = usuario.nombre || "Sin nombre";
  const telefono = usuario.telefono || "Sin teléfono";
  const departamento = usuario.contrato?.departamento || "No asignado";

  document.getElementById('datosUsuario').innerHTML = `
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
    <p><strong>Departamento:</strong> ${departamento}</p>
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
      // Mostrar modal Bootstrap (asumiendo Bootstrap 5)
      const modalElement = document.getElementById('modalDetalles');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  };
}
