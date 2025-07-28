import { cargarDeptos } from './cargarDeptos.js';
import { registrarInquilino } from './registrarInquilino.js';

export async function inicializarFormulario() {
  await cargarDeptos();

  const form = document.getElementById('formulario-inquilino');
  if (!form) {
    console.error('❌ No se encontró el formulario');
    return;
  }

  const fechaInicioInput = form.querySelector('input[name="fechaInicio"]');
  const fechaFinInput = form.querySelector('input[name="fechaFin"]');
  const tiempoEstadiaInput = document.getElementById('tiempoEstadia');

  // === Función para calcular y mostrar los días de estadía ===
  function calcularDiasEstadia() {
    const inicio = new Date(fechaInicioInput.value);
    const fin = new Date(fechaFinInput.value);

    if (fechaInicioInput.value && fechaFinInput.value && !isNaN(inicio) && !isNaN(fin)) {
      const diffMs = fin - inicio;
      const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

      if (dias > 0) {
        tiempoEstadiaInput.value = `${dias} días`;
      } else {
        tiempoEstadiaInput.value = '';
        Toastify({
          text: '⚠️ La fecha final debe ser posterior a la inicial.',
          duration: 3000,
          style: { background: "orange" }
        }).showToast();
      }
    } else {
      tiempoEstadiaInput.value = '';
    }
  }

  // === Listeners para actualizar el campo de días ===
  fechaInicioInput.addEventListener('change', calcularDiasEstadia);
  fechaFinInput.addEventListener('change', calcularDiasEstadia);

  // === Envío del formulario ===
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // ✅ Validación de fecha de pago
    const fechaPago = formData.get('fechaPago');
    if (!fechaPago) {
      Toastify({
        text: '⚠️ Debes seleccionar una fecha de pago.',
        duration: 3000,
        style: { background: "orange" }
      }).showToast();
      return;
    }

    const resultado = await registrarInquilino(formData);

    Toastify({
      text: resultado.message,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: resultado.success ? "green" : "red" }
    }).showToast();

    if (resultado.success) {
      form.reset();
      tiempoEstadiaInput.value = '';
      await cargarDeptos();
    }
  });
}

console.log('📄 formularioinit.js cargado');
