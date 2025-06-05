// usuariosCard.js
import { db } from "../app/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const contenedorUsuarios = document.getElementById("dataUser");

export async function cargarUsuarios() {
  if (!contenedorUsuarios) return;
  contenedorUsuarios.innerHTML = "Cargando usuarios...";

  try {
    const querySnapshot = await getDocs(collection(db, "inquilinos"));
    if (querySnapshot.empty) {
      contenedorUsuarios.innerHTML = "<p>No hay usuarios registrados.</p>";
      return;
    }

    contenedorUsuarios.innerHTML = ""; // limpia para mostrar datos
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const tarjeta = document.createElement("div");
      tarjeta.classList.add("tarjeta-inquilino", "mb-3", "p-3", "border", "rounded", "bg-light");

      tarjeta.innerHTML = `
        <h6>${data.nombre}</h6>
        <p><strong>Departamento:</strong> ${data.departamento}</p>
        <p><strong>Teléfono:</strong> ${data.telefono}</p>
        <button class="btn btn-sm btn-primary ver-detalles">Ver Detalles</button>
      `;

      tarjeta.querySelector(".ver-detalles").addEventListener("click", () => {
        mostrarModalDetalles(data);
      });

      contenedorUsuarios.appendChild(tarjeta);
    });

  } catch (error) {
    contenedorUsuarios.innerHTML = "<p>Error al cargar usuarios.</p>";
    console.error("Error cargando usuarios:", error);
  }
}

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

  // Añadimos modal al body y luego lo mostramos
  const contenedorModalExistente = document.getElementById("modalDetallesUser");
  if (contenedorModalExistente) {
    contenedorModalExistente.remove();
  }
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  const modal = new bootstrap.Modal(document.getElementById("modalDetallesUser"));
  modal.show();
}
