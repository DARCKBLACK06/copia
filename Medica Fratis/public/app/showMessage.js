// ============================================
// showMessage.js
// Muestra notificaciones tipo Toast usando Toastify
// ============================================

/**
 * Muestra un mensaje flotante personalizado.
 * @param {string} message - Texto del mensaje.
 * @param {string} type - Tipo de mensaje ("success" o "error").
 */
export function showMessage(message, type = "success") {
  Toastify({
    text: message,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "bottom",      // Posición vertical
    position: "right",      // Posición horizontal
    stopOnFocus: true,      // No se cierra al pasar el mouse
    style: {
      background: type === "success" ? 'green' : 'red',
    },
    onClick: function () {} // Puedes añadir una acción aquí si deseas
  }).showToast();
}
