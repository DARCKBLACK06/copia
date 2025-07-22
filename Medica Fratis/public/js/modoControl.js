// === Importaciones ===
import { db as dbFirestore } from '../app/firebase.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
import { dbRealtime } from '../app/firebase.js';
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

let idInquilinoGlobal = null;
let idDepartamentoGlobal = null;

export async function initModoControl(idInquilino, idDepartamento) {
  idInquilinoGlobal = idInquilino;
  idDepartamentoGlobal = idDepartamento;

  const modoBtn = document.getElementById('btn-modo-toggle');
  const modoMenu = document.getElementById('menu-modo-toggle');
  const opcionIndefinido = document.getElementById('opcion-indefinido');
  const opcionPersonalizado = document.getElementById('opcion-personalizado');
  const modoHoraBox = document.getElementById('modo-hora-box');
  const modoHoraInput = document.getElementById('modo-hora-input');
  const btnGuardarModo = document.getElementById('btn-guardar-modo');
  const editBtn = document.getElementById('relay-edit');
  const menu = document.getElementById('relay-menu');
  const saveBtn = document.getElementById('save-relay');
  const lockStatus = document.getElementById('lock-status');

  let pendingAction = null;
  let modoSeleccionado = 'automatico';
  let inManual = false;

  function bloquearCerradura(bloquear) {
    editBtn.disabled = bloquear;
    saveBtn.disabled = bloquear;
    lockStatus.disabled = bloquear;
    editBtn.title = bloquear ? 'Modo automático: no editable' : 'Editar estado de la cerradura';
    lockStatus.title = bloquear ? 'Bloqueado por modo automático' : 'Ver estado';
    if (bloquear) menu.classList.add('hidden');
  }

  async function checkModoFirestore() {
    const docRef = doc(dbFirestore, 'inquilinos', idInquilinoGlobal);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const modo = data.modoControl || 'automatico';
    const expira = data.manualExpira ? new Date(data.manualExpira) : null;

    if (modo === 'manual') {
      if (expira) setModoVisual('manual-personalizado', expira);
      else setModoVisual('manual-indefinido');
      bloquearCerradura(false);
      inManual = true;
    } else {
      setModoVisual('automatico');
      bloquearCerradura(true);
      inManual = false;
    }

    const estado = data.estadoCerradura || 'apagado';
    menu.querySelectorAll('[data-action]').forEach(b => {
      b.classList.remove('selected');
      if (b.getAttribute('data-action') === estado) {
        b.classList.add('selected');
        pendingAction = estado;
      }
    });
  }

  function setModoVisual(modo, expiraDate = null) {
    modoBtn.className = '';
    if (modo === 'automatico') {
      modoBtn.textContent = '⚙️ Modo automático';
      modoSeleccionado = 'automatico';
      opcionIndefinido.style.display = '';
      opcionPersonalizado.style.display = '';
      modoHoraBox.classList.add('hidden');
      btnGuardarModo.textContent = 'Guardar cambios';
    } else if (modo === 'manual-indefinido') {
      modoBtn.textContent = '🛠️ Manual (indefinido)';
      modoSeleccionado = 'manual-indefinido';
      modoHoraBox.classList.add('hidden');
    } else if (modo === 'manual-personalizado') {
      const hora = expiraDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';
      modoBtn.textContent = `🛠️ Manual (hasta ${hora})`;
      modoSeleccionado = 'manual-personalizado';
      modoHoraInput.value = expiraDate?.toTimeString().slice(0, 5) || '';
      modoHoraBox.classList.remove('hidden');
    }
  }

  modoBtn.addEventListener('click', () => {
    modoMenu.classList.toggle('hidden');
    if (modoSeleccionado !== 'automatico') {
      opcionIndefinido.style.display = 'none';
      opcionPersonalizado.style.display = 'none';
      btnGuardarModo.textContent = 'Volver a automático';
    } else {
      opcionIndefinido.style.display = '';
      opcionPersonalizado.style.display = '';
      btnGuardarModo.textContent = 'Guardar cambios';
    }
  });

  opcionIndefinido.onclick = () => {
    modoSeleccionado = 'manual-indefinido';
    modoHoraBox.classList.add('hidden');
  };
  opcionPersonalizado.onclick = () => {
    modoSeleccionado = 'manual-personalizado';
    modoHoraBox.classList.remove('hidden');
  };

  btnGuardarModo.onclick = async () => {
    const docRef = doc(dbFirestore, 'inquilinos', idInquilinoGlobal);

    if (modoSeleccionado !== 'automatico' && opcionIndefinido.style.display === 'none') {
      await updateDoc(docRef, { modoControl: 'automatico', manualExpira: null });
      Toastify({ text: 'Modo automático activado', duration: 2500, style: { background: '#00c853', color: '#fff' } }).showToast();
      modoMenu.classList.add('hidden');
      return checkModoFirestore();
    }

    if (modoSeleccionado === 'manual-indefinido') {
      await updateDoc(docRef, { modoControl: 'manual', manualExpira: null });
      Toastify({ text: 'Modo manual indefinido', duration: 2500, style: { background: '#b71c1c', color: '#fff' } }).showToast();
      modoMenu.classList.add('hidden');
      return checkModoFirestore();
    }

    if (modoSeleccionado === 'manual-personalizado') {
      const hora = modoHoraInput.value;
      if (!hora) return Toastify({ text: 'Hora requerida', duration: 2500, style: { background: '#ffc107', color: '#222' } }).showToast();
      const ahora = new Date();
      const [h, m] = hora.split(':');
      const expira = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m);
      if (expira <= ahora) return Toastify({ text: 'Hora inválida', duration: 2500, style: { background: '#b71c1c', color: '#fff' } }).showToast();

      await updateDoc(docRef, { modoControl: 'manual', manualExpira: expira.toISOString() });
      Toastify({ text: 'Modo manual personalizado activado', duration: 3000, style: { background: '#ffc107', color: '#222' } }).showToast();
      modoMenu.classList.add('hidden');
      return checkModoFirestore();
    }
  };

  editBtn.addEventListener('click', () => {
    if (!inManual) return;
    menu.classList.toggle('hidden');
  });

  menu.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!inManual) return;
      pendingAction = btn.getAttribute('data-action');
      menu.querySelectorAll('button[data-action]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  saveBtn.addEventListener('click', async () => {
    if (!inManual || !pendingAction) return;

    const docRef = doc(dbFirestore, 'inquilinos', idInquilinoGlobal);
    await updateDoc(docRef, { estadoCerradura: pendingAction });

    const dbPath = `departamentos/depto${idDepartamentoGlobal}/sensores/datos_completos/cerradura`;
    await set(ref(dbRealtime, dbPath), pendingAction);

    Toastify({ text: `Cerradura: ${pendingAction}`, duration: 2500, style: { background: '#0288d1', color: '#fff' } }).showToast();
    menu.classList.add('hidden');
    checkModoFirestore();
  });

  const cerraduraRef = ref(dbRealtime, `departamentos/depto${idDepartamentoGlobal}/sensores/datos_completos/cerradura`);
  onValue(cerraduraRef, (snapshot) => {
    const estado = snapshot.val();
    if (!estado) return;
    lockStatus.textContent = estado === 'encendido' ? '🔓 Abierto' : '🔒 Cerrado';
    lockStatus.className = `btn-status ${estado}`;
  });

  await checkModoFirestore();
  setInterval(checkModoFirestore, 20000);
}
