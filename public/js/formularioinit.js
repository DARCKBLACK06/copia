import { registrarInquilino } from './registrarinquilino.js';
import { cargarDeptos } from './cargarDeptos.js';


export async function inicializarFormulario() {
  await cargarDeptos();

  const form = document.getElementById('formulario-inquilino');
  if (!form) {
    console.error('No se encontró el formulario con id "formulario-inquilino"');
    return;
  }

  // Función para calcular días y actualizar el input
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

  // Añadir listeners para que se recalculen los días al cambiar fechas
  form.querySelector('input[name="fechaInicio"]').addEventListener('change', calcularDiasEstadia);
  form.querySelector('input[name="fechaFin"]').addEventListener('change', calcularDiasEstadia);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const resultado = await registrarInquilino(formData);

    if(resultado.success){
      Toastify({
        text: resultado.message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "green" }
      }).showToast();

      form.reset();
      form.querySelector('#tiempoEstadia').value = ''; // Limpia tiempo de estadía

    } else {
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

console.log('Inicializando formulario...');