// === IMPORTACIONES INICIALES (Firebase, sesiones y herramientas) ===
import '../app/firebase.js';                   // Inicializa Firebase
import '../app/logout.js';                    // Función para cerrar sesión
import '../app/session.js';                   // Verifica si hay sesión activa
import '../app/signupform.js';                // Lógica para registro de usuarios
import { showMessage } from '../app/showMessage.js'; // Mostrar mensajes de error o éxito

// === FUNCIONALIDADES PRINCIPALES DEL DASHBOARD ===
import { inicializarRegistroDepartamento } from './registrarDepartamento.js'; // Modal de registrar deptos
import { mostrarUsuariosBasicos } from './usuariosCard.js';                   // Visualización básica de inquilinos
import { cargarNotificaciones } from './notifications.js';                   // Alertas de pagos próximos
import { listarDepartamentosSinSensor } from './modalRegistroSensor.js';    // Para modal de sensores
import { limpiarModal } from './modalDetalles.js';                           // Limpieza del modal detalles

// === PRIMER BLOQUE DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', () => {
  mostrarUsuariosBasicos(); // Carga primer usuario

  // Al cerrar el modal de detalles, limpia el contenido
  const modalElement = document.getElementById('modalDetalles');
  modalElement.addEventListener('hidden.bs.modal', () => {
    limpiarModal();
  });

  console.log("¡Bienvenido al panel de administración!");
});

// === SEGUNDO BLOQUE DOMContentLoaded (duplicado, pero funcionalmente separado) ===
document.addEventListener('DOMContentLoaded', () => {
  // Inicializaciones generales
  listarDepartamentosSinSensor();     // Llena dropdown del modal de sensor
  cargarNotificaciones();             // Carga alertas de pagos próximos
  inicializarRegistroDepartamento();  // Genera botones de dptos disponibles
  mostrarUsuariosBasicos();           // Refresca info de tarjetas

  // Evento para abrir modal de sensor desde algún botón (por si se habilita en el futuro)
  const btnModalSensor = document.getElementById('btnAbrirModalRegistroSensor');
  if (btnModalSensor) {
    btnModalSensor.addEventListener('click', () => {
      listarDepartamentosSinSensor();
      abrirModal(); // ❗ Esta función no está definida aquí, ojo si da error
    });
  }

  // === Lógica de toggle del sidebar lateral ===
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");

      // Cambia ícono dinámicamente
      const icon = toggleBtn.querySelector("i");
      if (icon) {
        icon.classList.toggle("bi-chevron-left");
        icon.classList.toggle("bi-chevron-right");
      }
    });
  }

  // Igualar altura de tarjetas (por estética visual)
  igualarAlturasDeTarjetas();
  window.addEventListener('resize', igualarAlturasDeTarjetas);

  console.log("¡Bienvenido al panel de administración!");
});

// === FUNCIÓN para que todas las tarjetas tengan la misma altura ===
function igualarAlturasDeTarjetas() {
  const tarjetas = document.querySelectorAll('.tarjeta-box');
  let alturaMax = 0;

  // Reinicia altura antes de calcular
  tarjetas.forEach(t => t.style.height = 'auto');

  // Encuentra altura máxima
  tarjetas.forEach(t => {
    const altura = t.offsetHeight;
    if (altura > alturaMax) alturaMax = altura;
  });

  // Aplica altura uniforme
  tarjetas.forEach(t => t.style.height = alturaMax + 'px');
}
