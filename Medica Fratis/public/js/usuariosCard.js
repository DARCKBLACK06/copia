// === Importaciones necesarias para Firebase y funciones del sistema ===
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js"; // Funciones para leer datos de Firestore
import { db } from '../app/firebase.js'; // Conexión a la base de datos
import { mostrarDetallesInquilino } from './modalDetalles.js'; // Función que muestra detalles en el modal

// === Variables globales para el control de usuarios ===
let usuarios = [];       // Lista de usuarios obtenidos desde Firestore
let indiceActual = 0;    // Índice actual del usuario mostrado

// === Función principal para obtener y mostrar usuarios de Firestore ===
export async function mostrarUsuariosBasicos() {
  try {
    const inquilinosSnapshot = await getDocs(collection(db, 'inquilinos')); // Consulta a la colección "inquilinos"
    usuarios = []; // Reinicia lista

    // Recorre los documentos y guarda los datos con su ID
    inquilinosSnapshot.forEach(doc => {
      usuarios.push({ id: doc.id, ...doc.data() }); // Combina ID con data del documento
    });

    // Si hay usuarios, muestra el primero y configura navegación
    if (usuarios.length > 0) {
      mostrarUsuario(indiceActual);
      configurarBotones();
    } else {
      // Si no hay usuarios
      document.getElementById('datosUsuario').innerHTML = "<p>No hay usuarios para mostrar.</p>";
    }

  } catch (error) {
    console.error("Error al cargar usuarios:", error); // Manejo de error en la consola
  }
}

// === Función para mostrar los datos básicos de un usuario en la tarjeta ===
function mostrarUsuario(i) {
  const usuario = usuarios[i]; // Obtiene el usuario actual
  if (!usuario) return;

  // Inserta la información en el contenedor HTML
  document.getElementById('datosUsuario').innerHTML = `
    <p><strong>Nombre:</strong> ${usuario.infoPersonal?.nombre || "Sin nombre"}</p>
    <p><strong>Teléfono:</strong> ${usuario.infoPersonal?.telefono || "Sin teléfono"}</p>
    <p><strong>Departamento:</strong> ${usuario.contrato?.departamento || "No asignado"}</p>
  `;
}

// === Función que asigna eventos a los botones de navegación y detalles ===
function configurarBotones() {
  // Botón "Anterior"
  document.getElementById('btnAnterior').onclick = () => {
    if (indiceActual > 0) {
      indiceActual--;
      mostrarUsuario(indiceActual); // Muestra el usuario anterior
    }
  };

  // Botón "Siguiente"
  document.getElementById('btnSiguiente').onclick = () => {
    if (indiceActual < usuarios.length - 1) {
      indiceActual++;
      mostrarUsuario(indiceActual); // Muestra el usuario siguiente
    }
  };

  // Botón "Detalles"
  document.getElementById('btnDetalles').onclick = () => {
    const usuario = usuarios[indiceActual];
    if (usuario) {
      mostrarDetallesInquilino(usuario.id); // Llama la función para mostrar detalles en modal
      const modalElement = document.getElementById('modalDetalles');
      const modal = new bootstrap.Modal(modalElement); // Instancia del modal
      modal.show(); // Muestra el modal
    }
  };
}
