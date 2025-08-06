import { db, dbRealtime } from '../app/firebase.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";
import { showMessage } from '../app/showMessage.js';

// =================================================================
// modoControl.js
// =================================================================
// Este módulo inicializa y gestiona el "Modo de Control" (automático/manual)
// para la cerradura de un inquilino, así como el bloqueo/desbloqueo del
// menú de la cerradura según el modo actual.

/**
 * Habilita o deshabilita el botón de edición de cerradura.
 * @param {boolean} isEnabled - true para habilitar, false para bloquear
 */
function setCerraduraEnabled(isEnabled) {
  const btn = document.getElementById('btnDropdownCerradura');
  if (!btn) return;

  if (isEnabled) {
    // Modo manual: botón activo y desplegable
    btn.disabled = false;
    btn.setAttribute('data-bs-toggle', 'dropdown');
    btn.title = 'Editar estado';
  } else {
    // Modo automático: botón bloqueado y sin desplegable
    btn.disabled = true;
    btn.removeAttribute('data-bs-toggle');
    btn.title = 'Modo automático — cambia a manual para editar';
  }
}

/**
 * Actualiza el texto y color del círculo de estado según el modo.
 * @param {string} modo - 'automatico' o 'manual'
 * @param {string|null} manualExpira - ISO string de expiración, o null
 */
function actualizarEstadoDelModoUI(modo, manualExpira) {
  const textoModo = document.getElementById('textoModo');
  const circuloEstado = document.getElementById('estado-circulo');
  if (!textoModo || !circuloEstado) return;

  if (modo === 'automatico') {
    // Modo automático: verde
    textoModo.textContent = 'Modo automático';
    circuloEstado.style.backgroundColor = '#22c55e';
  } else {
    // Modo manual
    if (!manualExpira) {
      // Manual indefinido: rojo
      textoModo.textContent = 'Modo manual indefinido';
      circuloEstado.style.backgroundColor = '#dc2626';
    } else {
      // Manual personalizado: amarillo y muestra hora de expiración
      const fecha = new Date(manualExpira);
      const hh = String(fecha.getHours()).padStart(2, '0');
      const mm = String(fecha.getMinutes()).padStart(2, '0');
      textoModo.textContent = `Modo manual (hasta ${hh}:${mm})`;
      circuloEstado.style.backgroundColor = '#facc15';
    }
  }
}

/**
 * Inicializa el modo de control para un inquilino dado.
 * Lee Firestore, actualiza UI y gestiona eventos de menú.
 * @param {string} idInquilino - ID del documento en Firestore
 */
export async function initModoControl(idInquilino) {
  // Elementos del DOM
  const modoBtn = document.getElementById('btn-modo-toggle');
  const modoMenu = document.getElementById('menu-modo-toggle');
  const opcionIndefinido = document.getElementById('opcion-indefinido');
  const opcionPersonalizado = document.getElementById('opcion-personalizado');
  const opcionAutomatico = document.getElementById('opcion-automatico');
  const modoHoraBox = document.getElementById('modo-hora-box');
  const modoHoraInput = document.getElementById('modo-hora-input');
  const btnGuardarModo = document.getElementById('btn-guardar-modo');

  let modoSeleccionado = null;
  const docRef = doc(db, 'inquilinos', idInquilino);

  /**
   * Muestra u oculta las opciones del menú de modo según el modo actual.
   * @param {string} modo - 'automatico' o 'manual'
   */
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
    // Reset de estilos y valores del menú
    opcionIndefinido.classList.remove('modo-indefinido-activo');
    opcionPersonalizado.classList.remove('modo-personalizado-activo');
    opcionAutomatico.classList.remove('modo-automatico-activo');
    modoHoraBox.classList.add('hidden');
    modoHoraInput.value = '';
    btnGuardarModo.className = 'btn w-100 btn-guardar-automatico';
    btnGuardarModo.textContent = 'Guardar cambios';
  };

  /**
   * Lee Firestore, actualiza UI y bloquea/desbloquea cerradura.
   */
  const mostrarOpcionesDesdeFirestore = async () => {
    const snap = await getDoc(docRef);
    const datos = snap.data() || {};
    const modoFirestore = datos.statusControl?.modoControl || 'automatico';

    mostrarOpciones(modoFirestore);
    actualizarEstadoDelModoUI(modoFirestore, datos.statusControl?.manualExpira);
    // Solo habilita la cerradura en modo manual
    setCerraduraEnabled(modoFirestore === 'manual');
  };

  // -----------------------------
  // 1) Al abrir el modal: cargar estado inicial
  // -----------------------------
  await mostrarOpcionesDesdeFirestore();

  // -----------------------------
  // 2) Abrir/ocultar menú de modos
  // -----------------------------
  modoBtn.onclick = async (e) => {
    e.stopPropagation();
    modoSeleccionado = null;
    await mostrarOpcionesDesdeFirestore();
    modoMenu.classList.toggle('hidden');
  };
  modoMenu.addEventListener('click', (e) => e.stopPropagation());

  // -----------------------------
  // 3) Manejo de selección de opciones
  // -----------------------------
  opcionIndefinido.onclick = () => {
    modoSeleccionado = 'manual-indefinido';
    opcionIndefinido.classList.add('modo-indefinido-activo');
    opcionPersonalizado.classList.remove('modo-personalizado-activo');
    opcionAutomatico.classList.remove('modo-automatico-activo');
    modoHoraBox.classList.add('hidden');
    btnGuardarModo.className = 'btn w-100 btn-guardar-indefinido';
  };

  opcionPersonalizado.onclick = () => {
    modoSeleccionado = 'manual-personalizado';
    opcionIndefinido.classList.remove('modo-indefinido-activo');
    opcionPersonalizado.classList.add('modo-personalizado-activo');
    opcionAutomatico.classList.remove('modo-automatico-activo');
    modoHoraBox.classList.remove('hidden');
    btnGuardarModo.className = 'btn w-100 btn-guardar-personalizado';
  };

  opcionAutomatico.onclick = () => {
    modoSeleccionado = 'automatico';
    opcionAutomatico.classList.add('modo-automatico-activo');
    opcionIndefinido.classList.remove('modo-indefinido-activo');
    opcionPersonalizado.classList.remove('modo-personalizado-activo');
    modoHoraBox.classList.add('hidden');
    btnGuardarModo.className = 'btn w-100 btn-guardar-automatico';
  };

  // -----------------------------
  // 4) Guardar cambios de modo en Firestore
  // -----------------------------
  btnGuardarModo.onclick = async () => {
    const updates = {};
    if (modoSeleccionado === 'manual-indefinido') {
      updates["statusControl.modoControl"] = 'manual';
      updates["statusControl.manualExpira"] = null;
      showMessage('Has activado el modo manual indefinido', 'error');
    }
    if (modoSeleccionado === 'manual-personalizado') {
      const hora = modoHoraInput.value || '00:00';
      const [h, m] = hora.split(':');
      const ahora = new Date();
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), +h, +m);
      updates["statusControl.modoControl"] = 'manual';
      updates["statusControl.manualExpira"] = fecha.toISOString();
      showMessage('Has activado el modo manual por tiempo', 'warning');
    }
    if (modoSeleccionado === 'automatico') {
      updates["statusControl.modoControl"] = 'automatico';
      updates["statusControl.manualExpira"] = null;
      showMessage('Has cambiado al modo automático', 'success');
    }

    if (Object.keys(updates).length) {
      // 4.1) Guardar cambios
      await updateDoc(docRef, updates);
      // 4.2) Refrescar UI y cerrar menú
      await mostrarOpcionesDesdeFirestore();
      modoMenu.classList.add('hidden');
    }
  };

  // -----------------------------
  // 5) Edición lógica del estado de la cerradura
  // -----------------------------
  const btnGuardarEstado = document.getElementById('btnGuardarEstado');
  btnGuardarEstado.onclick = async () => {
    const seleccionado = document.querySelector('input[name="estadoCerradura"]:checked');
    if (!seleccionado) return;
    const nuevoEstado = seleccionado.value; // 'encendido' o 'apagado'

    // Actualizar icono y texto
    const icono = document.getElementById('iconoCerradura');
    const texto = document.getElementById('textoCerradura');
    if (nuevoEstado === 'apagado') {
      icono.textContent = '🔒';
      icono.style.color = '#dc2626';
      texto.textContent = 'Acceso bloqueado';
      showMessage('Cerradura apagada', 'error');
    } else {
      icono.textContent = '🔓';
      icono.style.color = '#22c55e';
      texto.textContent = 'Acceso permitido';
      showMessage('Cerradura encendida', 'success');
    }

    // Sincronizar con Realtime Database
    const snap = await getDoc(docRef);
    const datos = snap.data() || {};
    const depto = datos.contrato?.departamento || datos.departamentoId;
    if (depto) {
      const path = `/departamentos/depto${depto}/sensores/telemetria_actual/cerradura`;
      await set(ref(dbRealtime, path), nuevoEstado);
      await updateDoc(docRef, {
        'statusControl.cerradura': nuevoEstado
      });
    }

    // -----------------------------
    // Cerrar menú al hacer clic fuera
    // -----------------------------
    window.addEventListener('click', () => {
      modoMenu.classList.add('hidden');
      modoHoraBox.classList.add('hidden');
    });
  };
}
