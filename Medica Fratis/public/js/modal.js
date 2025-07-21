// === Función principal: inicializa el selector de fondo personalizado ===
export function initBackgroundSelector() {
  const backgroundOptions = document.querySelectorAll(".background-option"); // Todas las imágenes clicables de fondo

  // === Aplicar fondo guardado previamente en localStorage ===
  const savedBackground = localStorage.getItem("user-background");
  if (savedBackground) {
    document.body.style.backgroundImage = `url(${savedBackground})`;   // Aplica imagen como fondo
    document.body.style.backgroundSize = "cover";                      // Ajusta tamaño al body
    document.body.style.backgroundPosition = "center";                 // Centra el fondo
  }

  // === Asignar evento de clic a cada opción visual de fondo ===
  backgroundOptions.forEach(option => {
    option.addEventListener("click", () => {
      const selectedBg = option.getAttribute("data-bg"); // Ruta de imagen desde atributo personalizado
      setBackground(selectedBg);                         // Aplica y guarda la imagen
    });
  });

  // === Función interna: aplica el fondo seleccionado y lo guarda ===
  function setBackground(imageUrl) {
    document.body.style.backgroundImage = `url(${imageUrl})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    localStorage.setItem("user-background", imageUrl); // Guarda selección
  }
}
