// Espera a que cargue todo el DOM
document.addEventListener("DOMContentLoaded", () => {
  const fondoImgs = document.querySelectorAll('.background-option');
  const fileInput = document.getElementById('custom-bg-upload');
  const modalElement = document.getElementById('staticBackdrop');
  const modal = new bootstrap.Modal(modalElement);
  const acceptBtn = document.getElementById('acceptBtn');
  let selectedBackground = null;

  // Restaurar fondo desde localStorage
  const savedBg = localStorage.getItem("selectedBackground");
  if (savedBg) {
    document.body.style.backgroundImage = `url('${savedBg}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }

  // Selección de fondos predefinidos
  fondoImgs.forEach(img => {
    img.addEventListener('click', () => {
      selectedBackground = img.getAttribute('data-bg');
      aplicarFondo(selectedBackground);
    });
  });

  // Subida de imagen personalizada
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      selectedBackground = event.target.result;
      aplicarFondo(selectedBackground);
    };
    reader.readAsDataURL(file);
  });

  // Aplicar fondo y guardarlo
  function aplicarFondo(url) {
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    localStorage.setItem("selectedBackground", url);
  }

  // Botón aceptar
  acceptBtn.addEventListener('click', () => {
    if (selectedBackground) {
      modal.hide();
    } else {
      alert('Selecciona o carga una imagen primero.');
    }
  });
});
