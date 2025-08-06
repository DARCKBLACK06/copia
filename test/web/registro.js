import { dbFirestore } from './firebase-config.js';
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const form = document.getElementById('formRegistro');
const diasSpan = document.getElementById('diasEstadia');
const inicio = document.getElementById('fechaInicio');
const fin = document.getElementById('fechaFin');

function calcularDias() {
  const fechaInicio = new Date(inicio.value);
  const fechaFin = new Date(fin.value);
  if (inicio.value && fin.value && fechaFin > fechaInicio) {
    const diff = (fechaFin - fechaInicio) / (1000 * 60 * 60 * 24);
    diasSpan.textContent = diff;
  } else {
    diasSpan.textContent = '-';
  }
}

inicio.addEventListener('change', calcularDias);
fin.addEventListener('change', calcularDias);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const depId = document.getElementById('departamento').value;
  const nombre = document.getElementById('nombre').value.trim();

  if (!depId || !nombre) {
    alert('Completa todos los campos requeridos');
    return;
  }

  const idDoc = `inquilinoDepto${depId}`;

  const nuevoInquilino = {
    nombre: nombre,
    correo: document.getElementById('correo').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    departamentoId: depId,
    fechaInicio: inicio.value,
    fechaFin: fin.value,
    diasEstadia: diasSpan.textContent,
    fechaPago: document.getElementById('fechaPago').value,
    estadoCerradura: 'pagado',
    creado: serverTimestamp()
  };

  try {
    const refDoc = doc(dbFirestore, 'inquilino', idDoc);
    await setDoc(refDoc, nuevoInquilino);
    alert(`Inquilino del departamento ${depId} guardado exitosamente.`);
    form.reset();
    diasSpan.textContent = '-';
  } catch (error) {
    console.error('Error al guardar inquilino en Firestore:', error);
  }
});
console.log('Registro de inquilino listo');