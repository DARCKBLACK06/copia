import { db } from "../app/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const contenedorCarrusel = document.getElementById("contenedorCarruselUsuarios");
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");

let tarjetas = [];
let indiceActual = 0;

export async function cargarUsuarios() {
  if (!contenedorCarrusel) return;
  contenedorCarrusel.innerHTML = "Cargando usuarios...";

  try {
    const querySnapshot = await getDocs(collection(db, "inquilinos"));
    tarjetas = [];

    if (querySnapshot.empty) {
      contenedorCarrusel.innerHTML = "<p>No hay usuarios registrados.</p>";
      return;
    }

    contenedorCarrusel.innerHTML = ""; // Limpia antes de renderizar

    querySnapshot.forEach(doc => {
      const data = doc.data();
      const tarjeta = document.createElement("div");
      tarjeta.classList.add(
        "card",
        "bg-light",
        "p-3",
        "position-absolute",
        "top-0",
        "start-50",
        "translate-middle-x"
      );
      tarjeta.style.display = "none";
      tarjeta.style.minHeight = "420px";
      tarjeta.style.maxWidth = "400px";
      tarjeta.style.width = "100%";
      tarjeta.style.borderRadius = "12px";
      tarjeta.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";

      tarjeta.innerHTML = `
        <div class="h-100 d-flex flex-column">
          <h5 class="card-title text-center border-bottom pb-2 mb-3">Datos del inquilino</h5>
          
          <div class="flex-grow-1 overflow-auto">
            <p><strong>Nombre:</strong> ${data.nombre}</p>
            <p><strong>Departamento:</strong> ${data.departamento}</p>
            <p><strong>Teléfono:</strong> ${data.telefono}</p>
          </div>

          <button class="btn btn-sm btn-primary ver-detalles mt-auto mb-2">Ver Detalles</button>

          <div class="d-flex justify-content-between">
            <button class="btn btn-outline-secondary btn-sm btn-anterior">←</button>
            <button class="btn btn-outline-secondary btn-sm btn-siguiente">→</button>
          </div>
        </div>
      `;

      tarjeta.querySelector(".ver-detalles").addEventListener("click", () => {
        mostrarModalDetalles(data);
      });

      tarjeta.querySelector(".btn-anterior").addEventListener("click", () => {
        if (tarjetas.length === 0) return;
        indiceActual = (indiceActual - 1 + tarjetas.length) % tarjetas.length;
        mostrarTarjeta(indiceActual);
      });

      tarjeta.querySelector(".btn-siguiente").addEventListener("click", () => {
        if (tarjetas.length === 0) return;
        indiceActual = (indiceActual + 1) % tarjetas.length;
        mostrarTarjeta(indiceActual);
      });

      tarjetas.push(tarjeta);
      contenedorCarrusel.appendChild(tarjeta);
    });

    mostrarTarjeta(indiceActual);

  } catch (error) {
    contenedorCarrusel.innerHTML = "<p>Error al cargar usuarios.</p>";
    console.error("Error cargando usuarios:", error);
  }
}

function mostrarTarjeta(indice) {
  tarjetas.forEach((tarjeta, i) => {
    tarjeta.style.display = i === indice ? "block" : "none";
  });
}

btnAnterior?.addEventListener("click", () => {
  if (tarjetas.length === 0) return;
  indiceActual = (indiceActual - 1 + tarjetas.length) % tarjetas.length;
  mostrarTarjeta(indiceActual);
});

btnSiguiente?.addEventListener("click", () => {
  if (tarjetas.length === 0) return;
  indiceActual = (indiceActual + 1) % tarjetas.length;
  mostrarTarjeta(indiceActual);
});

function mostrarModalDetalles(data) {
  let modalHtml = `
    <div class="modal fade" id="modalDetallesUser" tabindex="-1" aria-labelledby="modalDetallesUserLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header">
            <h5 class="modal-title" id="modalDetallesUserLabel">Detalles de ${data.nombre}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <p><strong>Nombre:</strong> ${data.nombre}</p>
            <p><strong>CURP:</strong> ${data.curp || "No disponible"}</p>
            <p><strong>Teléfono:</strong> ${data.telefono}</p>
            <p><strong>Departamento:</strong> ${data.departamento}</p>
            <p><strong>Contacto Emergencia:</strong> ${data.emergenciaNombre || "-"} (${data.emergenciaParentesco || "-"}) - ${data.emergenciaTelefono || "-"}</p>
            <p><strong>Contrato:</strong> ${data.inicioContrato || "-"} a ${data.finContrato || "-"}</p>
            <p><strong>Renta:</strong> $${data.montoRenta || "-"}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const contenedorModalExistente = document.getElementById("modalDetallesUser");
  if (contenedorModalExistente) contenedorModalExistente.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
  const modal = new bootstrap.Modal(document.getElementById("modalDetallesUser"));
  modal.show();
}
