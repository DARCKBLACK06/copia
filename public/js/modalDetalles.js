export function mostrarModalDetalles(user) {
  const modalHtml = `
    <div class="modal fade" id="modalDetallesUser" tabindex="-1" aria-labelledby="modalDetallesUserLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content bg-dark text-white">
          <div class="modal-header">
            <h5 class="modal-title" id="modalDetallesUserLabel">Detalles de ${user.nombre}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <p><strong>Nombre:</strong> ${user.nombre}</p>
            <p><strong>CURP:</strong> ${user.curp || "No disponible"}</p>
            <p><strong>Teléfono:</strong> ${user.telefono}</p>
            <p><strong>Departamento:</strong> ${user.departamento}</p>
            <p><strong>Contacto Emergencia:</strong> ${user.emergenciaNombre || "-"} (${user.emergenciaParentesco || "-"}) - ${user.emergenciaTelefono || "-"}</p>
            <p><strong>Contrato:</strong> ${user.inicioContrato || "-"} a ${user.finContrato || "-"}</p>
            <p><strong>Renta:</strong> $${user.montoRenta || "-"}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const modalExistente = document.getElementById("modalDetallesUser");
  if (modalExistente) modalExistente.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
  const modalBootstrap = new bootstrap.Modal(document.getElementById("modalDetallesUser"));
  modalBootstrap.show();
}
