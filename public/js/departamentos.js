import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { auth, db } from "../app/firebase.js";
import { showMessage } from '../app/showMessage.js';

let inquilinosMap = new Map();

function crearTarjeta(inquilino) {
  if (!inquilino) {
    return `
      <div class="alert alert-warning" role="alert">
        No hay datos para este departamento.
      </div>
    `;
  }
  return `
    <div class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title">${inquilino.nombre || 'Sin Nombre'}</h5>
        <p class="card-text"><strong>Departamento:</strong> ${inquilino.departamento || 'N/A'}</p>
        <p class="card-text"><strong>Estado del contrato:</strong> ${inquilino.estadoContrato || 'Desconocido'}</p>
        <p class="card-text"><strong>Pago al día:</strong> ${inquilino.pagoAlDia ? "Sí" : "No"}</p>
      </div>
    </div>
  `;
}

async function cargarInquilinos() {
  try {
    const querySnapshot = await getDocs(collection(db, "inquilinos"));
    inquilinosMap.clear();

    querySnapshot.forEach(doc => {
      const data = doc.data();
      inquilinosMap.set(String(data.departamento), data);
    });

    poblarSelect();
  } catch (error) {
    console.error("Error cargando inquilinos:", error);
    showMessage("Error al cargar datos de inquilinos", "error");
  }
}

function poblarSelect() {
  const select = document.getElementById("departamentoSelect");
  select.innerHTML = '';

  for (let i = 1; i <= 41; i++) {
    select.innerHTML += `<option value="${i}">Departamento ${i}</option>`;
  }

  select.value = "1"; // Selecciona departamento 1 por defecto
  mostrarTarjeta("1");

  select.addEventListener("change", () => {
    mostrarTarjeta(select.value);
  });
}

function mostrarTarjeta(departamento) {
  const container = document.getElementById("tarjeta-container");
  if (!departamento) {
    container.innerHTML = "";
    return;
  }

  const inquilino = inquilinosMap.get(departamento) || null;
  container.innerHTML = crearTarjeta(inquilino);
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    cargarInquilinos();
  } else {
    window.location.href = "./index.html";
  }
});
