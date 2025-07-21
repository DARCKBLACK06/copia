import { dbFirestore, dbRealtime } from './firebase-config.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js';
import { ref, set, onValue } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js';

export function initModoControl() {
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
  let modoActual = 'automatico';
  let expiraDate = null;
  let inManual = false;

  function bloquearCerradura(bloquear) {
    if (bloquear) {
      editBtn.setAttribute('disabled', true);
      saveBtn.setAttribute('disabled', true);
      lockStatus.setAttribute('disabled', true);

      // Mensajes aclaratorios para el admin
      editBtn.title = "Modo bloqueado: solo lectura en automático";
      lockStatus.title = "Modo automático: no se puede modificar manualmente";

      menu.classList.add('hidden');
    } else {
      editBtn.removeAttribute('disabled');
      saveBtn.removeAttribute('disabled');
      lockStatus.removeAttribute('disabled');

      // Mensajes normales para modo manual
      editBtn.title = "Editar estado de la cerradura";
      lockStatus.title = "Ver estado actual";

      // Si quieres, puedes limpiar el menú o dejarlo abierto si lo permite el flujo
    }
  }


  async function checkModoFirestore() {
    const docRef = doc(dbFirestore, 'inquilino', 'inquilinoDepto01');
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      setModoVisual('automatico');
      bloquearCerradura(true);
      inManual = false;
      return;
    }
    const data = snap.data();

    // Cargar modo
    if (data.modoControl === 'manual') {
      if (data.manualExpira) {
        expiraDate = new Date(data.manualExpira);
        setModoVisual('manual-personalizado', expiraDate);
      } else {
        setModoVisual('manual-indefinido');
      }
      bloquearCerradura(false);
      inManual = true;
    } else {
      setModoVisual('automatico');
      bloquearCerradura(true);
      inManual = false;
    }

    // Cargar estado actual de la cerradura y marcarlo
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
    modoBtn.classList.remove('automatico', 'manual-indefinido', 'manual-personalizado');
    if (modo === 'automatico') {
      modoBtn.classList.add('automatico');
      modoBtn.textContent = "🟢 🛠 Modo automatico";
      modoSeleccionado = 'automatico';
      opcionIndefinido.classList.remove('selected');
      opcionPersonalizado.classList.remove('selected');
      modoHoraInput.value = "";
    } else if (modo === 'manual-indefinido') {
      modoBtn.classList.add('manual-indefinido');
      modoBtn.textContent = "🔴 🛠 Modo Manual (indefinido)";
      modoSeleccionado = 'manual-indefinido';
      opcionIndefinido.classList.add('selected');
      opcionPersonalizado.classList.remove('selected');
      modoHoraInput.value = "";
    } else if (modo === 'manual-personalizado') {
      modoBtn.classList.add('manual-personalizado');
      const horaTxt = expiraDate ? expiraDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      modoBtn.textContent = `🟡 🛠 Modo Manual (hasta ${horaTxt})`;
      modoSeleccionado = 'manual-personalizado';
      opcionIndefinido.classList.remove('selected');
      opcionPersonalizado.classList.add('selected');
      if (expiraDate) {
        modoHoraInput.value = expiraDate.toTimeString().slice(0, 5);
      }
    }
  }

  // Menú de selección de modo
  modoBtn.addEventListener('click', () => {
    modoMenu.classList.toggle('hidden');
    if (modoSeleccionado !== 'automatico') {
      opcionIndefinido.style.display = "none";
      opcionPersonalizado.style.display = "none";
      modoHoraBox.classList.add('hidden');
      btnGuardarModo.textContent = "Volver a automático";
      btnGuardarModo.className = "modo-guardar-btn automatico";
    } else {
      opcionIndefinido.style.display = "";
      opcionPersonalizado.style.display = "";
      btnGuardarModo.textContent = "Guardar cambios";
      btnGuardarModo.className = "modo-guardar-btn automatico";
    }
  });

  opcionIndefinido.addEventListener('click', () => {
    modoSeleccionado = 'manual-indefinido';
    opcionIndefinido.classList.add('selected');
    opcionPersonalizado.classList.remove('selected');
    modoHoraBox.classList.add('hidden');
    btnGuardarModo.className = "modo-guardar-btn manual-indefinido";
  });

  opcionPersonalizado.addEventListener('click', () => {
    modoSeleccionado = 'manual-personalizado';
    opcionPersonalizado.classList.add('selected');
    opcionIndefinido.classList.remove('selected');
    modoHoraBox.classList.remove('hidden');
    btnGuardarModo.className = "modo-guardar-btn manual-personalizado";
  });

btnGuardarModo.addEventListener('click', async () => {
  const docRef = doc(dbFirestore, 'inquilino', 'inquilinoDepto01');

  if (modoSeleccionado !== 'automatico' &&
    opcionIndefinido.style.display === "none" &&
    opcionPersonalizado.style.display === "none") {
    await updateDoc(docRef, { modoControl: 'automatico', manualExpira: null });
    setModoVisual('automatico');
    bloquearCerradura(true);
    modoMenu.classList.add('hidden');
    Toastify({
      text: "Modo cambiado a automático",
      duration: 3000,
      style: { background: "#00c853", color: "#fff" },
      gravity: "top",
      position: "right"
    }).showToast();
    await checkModoFirestore();
    return;
  }

  if (modoSeleccionado === 'manual-indefinido') {
    await updateDoc(docRef, { modoControl: 'manual', manualExpira: null });
    setModoVisual('manual-indefinido');
    bloquearCerradura(false);
    modoMenu.classList.add('hidden');
    Toastify({
      text: "Modo cambiado a manual indefinido",
      duration: 3500,
      style: { background: "#b71c1c", color: "#fff" },
      gravity: "top",
      position: "right"
    }).showToast();
    await checkModoFirestore();
    return;
  }

  if (modoSeleccionado === 'manual-personalizado') {
    const hora = modoHoraInput.value;
    if (!hora) {
      Toastify({
        text: "Selecciona una hora de expiración",
        duration: 2700,
        style: { background: "#ffc107", color: "#222" },
        gravity: "top",
        position: "right"
      }).showToast();
      return;
    }

    const ahora = new Date();
    const [h, m] = hora.split(':');
    const expira = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), h, m);

    // 🔒 Si la hora ya pasó hoy, no continuar
    if (expira <= ahora) {
      Toastify({
        text: "Selecciona una hora posterior a la actual",
        duration: 3000,
        style: { background: "#b71c1c", color: "#fff" },
        gravity: "top",
        position: "right"
      }).showToast();
      return;
    }

    await updateDoc(docRef, {
      modoControl: 'manual',
      manualExpira: expira.toISOString()
    });

    setModoVisual('manual-personalizado', expira);
    bloquearCerradura(false);
    modoMenu.classList.add('hidden');

    Toastify({
      text: `Modo manual activado hasta las ${expira.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      duration: 4000,
      style: { background: "#ffc107", color: "#222" },
      gravity: "top",
      position: "right"
    }).showToast();

    await checkModoFirestore();
    return;
  }
});


  // === CONTROL DEL RELÉ EN MODO MANUAL ===
  editBtn.addEventListener('click', () => {
    if (!inManual) return;
    menu.classList.toggle('hidden');
  });

  menu.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!inManual) return;
      pendingAction = btn.getAttribute('data-action');
      menu.querySelectorAll('[data-action]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  saveBtn.addEventListener('click', async () => {
    if (!inManual) return;
    if (!pendingAction) {
      Toastify({ text: "Selecciona 🔓 o 🔒 antes de guardar", duration: 2000, style: { background: "#b71c1c", color: "#fff" } }).showToast();
      return;
    }

    try {
      const docRef = doc(dbFirestore, 'inquilino', 'inquilinoDepto01');
      await updateDoc(docRef, { estadoCerradura: pendingAction });

      const refRelay = ref(dbRealtime, '/departamentos/deptodpto01/sensores/datos_completos/cerradura');
      await set(refRelay, pendingAction);

      menu.classList.add('hidden');
      Toastify({ text: `Cerradura actualizada a ${pendingAction === 'encendido' ? '🔓 Abierto' : '🔒 Cerrado'}`, duration: 2000, style: { background: "#018786", color: "#fff" } }).showToast();

      await checkModoFirestore();
    } catch (e) {
      console.error("Error actualizando cerradura:", e);
      Toastify({ text: "Error al guardar el estado", duration: 3000, style: { background: "#b71c1c", color: "#fff" } }).showToast();
    }
  });

  // === Estado visual sincronizado con Realtime Database ===
  const cerraduraRef = ref(dbRealtime, '/departamentos/deptodpto01/sensores/datos_completos/cerradura');
  onValue(cerraduraRef, (snapshot) => {
    const estado = snapshot.val();
    if (!estado) return;
    lockStatus.textContent = estado === 'encendido' ? '🔓 Abierto' : '🔒 Cerrado';
    lockStatus.className = `btn-status ${estado}`;
  });

  // Inicializa estado
  checkModoFirestore();
  setInterval(checkModoFirestore, 20000);
}
