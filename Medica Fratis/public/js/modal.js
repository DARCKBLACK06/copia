export function initBackgroundSelector() {
  const backgroundOptions = document.querySelectorAll(".background-option");

  // Cargar fondo guardado
  const savedBackground = localStorage.getItem("user-background");
  if (savedBackground) {
    document.body.style.backgroundImage = `url(${savedBackground})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  }

  // Selección de fondo predeterminado
  backgroundOptions.forEach(option => {
    option.addEventListener("click", () => {
      const selectedBg = option.getAttribute("data-bg");
      setBackground(selectedBg);
    });
  });

  function setBackground(imageUrl) {
    document.body.style.backgroundImage = `url(${imageUrl})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    localStorage.setItem("user-background", imageUrl);
  }
}
