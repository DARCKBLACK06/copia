// === Importa la función que inicializa el selector de fondo ===
import { initBackgroundSelector } from '../js/wallpapersave.js';

// === Espera a que todo el DOM esté cargado para iniciar ===
document.addEventListener("DOMContentLoaded", () => {
  initBackgroundSelector(); // Inicializa el sistema de cambio de fondo de pantalla
});

// === Log para depuración / verificación en consola ===
console.log("Scripts cargados");
