// === Importa función para registrar un nuevo inquilino ===
import { registrarInquilino } from './registrarInquilino.js';

// === Importa función para cargar lista de departamentos disponibles ===
import { cargarDeptos } from './cargarDeptos.js';

// === Función principal que inicializa el formulario de inquilino ===
export async function inicializarFormulario() {
  await cargarDeptos(); // Llena el select de departamentos disponibles al iniciar

  const form = document.getElementById('formulario-inquilino');
  if (!form) {
    console.error('No se encontró el formulario con id "formulario-inquilino"');
    return;
  }

  // === Calcula los días entre fechaInicio y fechaFin, y actualiza campo visible ===
  function calcularDiasEstadia() {
    const inicio = form.querySelector('input[name="fechaInicio"]').value;
    const fin = form.querySelector('input[name="fechaFin"]').value;
    const tiempoEstadiaInput = form.querySelector('#tiempoEstadia');

    if (inicio && fin) {
      const fechaInicio = new Date(inicio);
      const fechaFin = new Date(fin);
      const diffTime = fechaFin - fechaInicio;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0) {
        tiempoEstadiaInput.value = diffDays + (diffDays === 1 ? ' día' : ' días');
      } else {
        tiempoEstadiaInput.value = '';
      }
    } else {
      tiempoEstadiaInput.value = '';
    }
  }

  // === Listeners para recalcular días automáticamente cuando cambien las fechas ===
  form.querySelector('input[name="fechaInicio"]').addEventListener('change', calcularDiasEstadia);
  form.querySelector('input[name="fechaFin"]').addEventListener('change', calcularDiasEstadia);

  // === Envío del formulario ===
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que se recargue la página
    const formData = new FormData(form); // Captura todos los datos del formulario

    const resultado = await registrarInquilino(formData); // Llama a función de registro

    if(resultado.success){
      // Notificación verde de éxito
      Toastify({
        text: resultado.message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "green" }
      }).showToast();

      // Limpiar formulario tras registro exitoso
      form.reset();
      form.querySelector('#tiempoEstadia').value = '';

    } else {
      // Notificación roja de error
      Toastify({
        text: resultado.message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "red" }
      }).showToast();
    }
  });
}

// === Mensaje de verificación en consola ===
console.log('Inicializando formulario...');
