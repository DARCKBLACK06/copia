// Función principal que inicializa la lógica de selección y guardado de fondo de pantalla
export function initBackgroundSelector() {
  // Selecciona todas las imágenes de fondo predefinidas
  const fondoImgs = document.querySelectorAll('.background-option');

  // Input de carga de imagen personalizada
  const fileInput = document.getElementById('custom-bg-upload');

  // Referencia al modal de selección de fondo
  const modalElement = document.getElementById('staticBackdrop');
  const modal = new bootstrap.Modal(modalElement); // Instancia del modal de Bootstrap

  // Botón "Aceptar" del modal
  const acceptBtn = document.getElementById('acceptBtn');

  // Variable que almacenará el fondo seleccionado
  let selectedBackground = null;

  // === Restaurar fondo guardado previamente desde localStorage ===
  const savedBg = localStorage.getItem("selectedBackground");
  if (savedBg) {
    aplicarFondo(savedBg); // Aplica automáticamente el fondo anterior
  }

  // === Manejo de selección de fondos predefinidos (por clic en imagen) ===
  fondoImgs.forEach(img => {
    img.addEventListener('click', () => {
      selectedBackground = img.getAttribute('data-bg'); // Obtiene el atributo data-bg
      aplicarFondo(selectedBackground); // Aplica el fondo seleccionado
    });
  });

  // === Manejo de carga de imagen personalizada (archivo local) ===
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]; // Obtiene el archivo subido
    if (!file) return; // Si no hay archivo, no hace nada

    const reader = new FileReader(); // Lector de archivos
    reader.onload = function(event) {
      selectedBackground = event.target.result; // Convierte imagen a Base64
      aplicarFondo(selectedBackground); // Aplica imagen personalizada
    };
    reader.readAsDataURL(file); // Lee el archivo como URL base64
  });

  // === Función que aplica el fondo al <body> y lo guarda en localStorage ===
  function aplicarFondo(url) {
    document.body.style.backgroundImage = `url('${url}')`; // Aplica fondo
    document.body.style.backgroundSize = 'cover';          // Escalado completo
    document.body.style.backgroundPosition = 'center';     // Centrado
    localStorage.setItem("selectedBackground", url);       // Guarda fondo
  }

  // === Botón "Aceptar": cierra el modal solo si hay fondo seleccionado ===
  acceptBtn.addEventListener('click', () => {
    if (selectedBackground) {
      modal.hide(); // Oculta el modal si hay selección
    } else {
      alert('Selecciona o carga una imagen primero.'); // Mensaje si no hay fondo
    }
  });
}
