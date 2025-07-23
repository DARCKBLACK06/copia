// ../app/showMessage.js

/**
 * Muestra un mensaje flotante personalizado.
 * @param {string} message - Texto del mensaje.
 * @param {string} type - Tipo de mensaje: "success", "warning", "error".
 */
export function showMessage(message, type = "success") {
  const colors = {
    success: "#22c55e",     // Verde (modo automático)
    warning: "#facc15",     // Amarillo (manual por tiempo)
    error: "#dc2626"        // Rojo (manual indefinido)
  };

  Toastify({
    text: message,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "bottom",
    position: "right",
    stopOnFocus: true,
    style: {
      background: colors[type] || "#0ea5e9",  // Azul por defecto si se pasa algo raro
      color: "white",
      borderRadius: "6px",
      fontWeight: "bold"
    },
    onClick: function () {}
  }).showToast();
}
