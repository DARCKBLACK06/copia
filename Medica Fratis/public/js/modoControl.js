import { db } from '../app/firebase.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { showMessage } from '../app/showMessage.js';

export async function initModoControl(idInquilino) {
  const modoBtn = document.getElementById('btn-modo-toggle');
  const modoMenu = document.getElementById('menu-modo-toggle');
  const opcionIndefinido = document.getElementById('opcion-indefinido');
  const opcionPersonalizado = document.getElementById('opcion-personalizado');
  const opcionAutomatico = document.getElementById('opcion-automatico');
  const modoHoraBox = document.getElementById('modo-hora-box');
  const modoHoraInput = document.getElementById('modo-hora-input');
  const btnGuardarModo = document.getElementById('btn-guardar-modo');
  const textoModo = document.getElementById('textoModo');
  const circuloEstado = document.getElementById('estado-circulo');

  let modoSeleccionado = null;
  let modoActual = 'automatico';

  const docRef = doc(db, 'inquilinos', idInquilino);

  // Mostrar u ocultar opciones según modo actual
  const mostrarOpciones = (modo) => {
    if (modo === 'automatico') {
      opcionIndefinido.classList.remove('hidden');
      opcionPersonalizado.classList.remove('hidden');
      opcionAutomatico.classList.add('hidden');
    } else {
      opcionIndefinido.classList.add('hidden');
      opcionPersonalizado.classList.add('hidden');
      opcionAutomatico.classList.remove('hidden');
    }

    // Reset visual
    opcionIndefinido.classList.remove('modo-indefinido-activo');
    opcionPersonalizado.classList.remove('modo-personalizado-activo');
    opcionAutomatico.classList.remove('modo-automatico-activo');
    modoHoraBox.classList.add('hidden');
    modoHoraInput.value = '';
    btnGuardarModo.className = 'btn w-100 btn-guardar-automatico';
    btnGuardarModo.textContent = 'Guardar cambios';
  };

  // Consulta el estado en Firestore al abrir el menú
  const mostrarOpcionesDesdeFirestore = async () => {
    const snap = await getDoc(docRef);
    const datos = snap.data();
    const modoFirestore = datos?.modoControl || 'automatico';
    modoActual = modoFirestore;
    mostrarOpciones(modoFirestore);
  };

  // === Abrir menú
  modoBtn.onclick = async (e) => {
    e.stopPropagation();
    modoSeleccionado = null;
    await mostrarOpcionesDesdeFirestore();
    modoMenu.classList.toggle('hidden');
  };

  // Evitar cierre al hacer clic dentro
  modoMenu.addEventListener('click', (e) => e.stopPropagation());

  // Opción: manual indefinido
  opcionIndefinido.onclick = () => {
    modoSeleccionado = 'manual-indefinido';
    opcionIndefinido.classList.add('modo-indefinido-activo');
    opcionPersonalizado.classList.remove('modo-personalizado-activo');
    opcionAutomatico.classList.remove('modo-automatico-activo');
    modoHoraBox.classList.add('hidden');
    btnGuardarModo.className = 'btn w-100 btn-guardar-indefinido';
  };

  // Opción: manual por tiempo
  opcionPersonalizado.onclick = () => {
    modoSeleccionado = 'manual-personalizado';
    opcionIndefinido.classList.remove('modo-indefinido-activo');
    opcionPersonalizado.classList.add('modo-personalizado-activo');
    opcionAutomatico.classList.remove('modo-automatico-activo');
    modoHoraBox.classList.remove('hidden');
    btnGuardarModo.className = 'btn w-100 btn-guardar-personalizado';
  };

  // Opción: volver a automático
  opcionAutomatico.onclick = () => {
    modoSeleccionado = 'automatico';
    opcionAutomatico.classList.add('modo-automatico-activo');
    opcionIndefinido.classList.remove('modo-indefinido-activo');
    opcionPersonalizado.classList.remove('modo-personalizado-activo');
    modoHoraBox.classList.add('hidden');
    btnGuardarModo.className = 'btn w-100 btn-guardar-automatico';
  };

  // === Guardar cambios
  btnGuardarModo.onclick = async () => {
    const updates = {};

    if (modoSeleccionado === 'manual-indefinido') {
      updates.modoControl = 'manual';
      updates.manualExpira = null;
      textoModo.textContent = 'Modo manual indefinido';
      circuloEstado.style.backgroundColor = '#dc2626';
      showMessage('Has activado el modo manual indefinido', 'error');
    }

    if (modoSeleccionado === 'manual-personalizado') {
      const hora = modoHoraInput.value || '--:--';
      const ahora = new Date();
      const [h, m] = hora.split(':');
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m);
      updates.modoControl = 'manual';
      updates.manualExpira = fecha.toISOString();
      textoModo.textContent = `Modo manual (hasta ${hora})`;
      circuloEstado.style.backgroundColor = '#facc15';
      showMessage('Has activado el modo manual por tiempo', 'warning');
    }

    if (modoSeleccionado === 'automatico') {
      updates.modoControl = 'automatico';
      updates.manualExpira = null;
      textoModo.textContent = 'Modo automático';
      circuloEstado.style.backgroundColor = '#22c55e';
      showMessage('Has cambiado al modo automático', 'success');
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(docRef, updates);
      modoActual = updates.modoControl;
      mostrarOpciones(modoActual);
      modoMenu.classList.add('hidden');
    }
  };

  // === Cerrar menú al hacer clic fuera
  window.addEventListener('click', () => {
    modoMenu.classList.add('hidden');
    modoHoraBox.classList.add('hidden');
  });
}
