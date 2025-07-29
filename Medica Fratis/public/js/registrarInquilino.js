import { db } from '../app/firebase.js';
import {
  collection,
  doc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

// === Función para calcular días entre fechas ===
function calcularDias(fechaInicioStr, fechaFinStr) {
  const inicio = new Date(fechaInicioStr);
  const fin = new Date(fechaFinStr);
  if (isNaN(inicio) || isNaN(fin)) return 0;

  const diff = fin - inicio;
  return diff >= 0
    ? Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
    : 0;
}

// === Función principal ===
export async function registrarInquilino(formData) {
  try {
    const departamento = formData.get('departamento')?.trim();
    const idInquilino = `inquilino${departamento}`;

    const fechaInicio = formData.get('fechaInicio');
    const fechaFin = formData.get('fechaFin');
    const tiempoEstadia = calcularDias(fechaInicio, fechaFin);

    if (tiempoEstadia <= 0) {
      return { success: false, message: '⚠️ La fecha final debe ser posterior a la inicial.' };
    }

    const fechaPago = formData.get('fechaPago');
    if (!fechaPago) {
      return { success: false, message: '⚠️ Debes seleccionar una fecha de pago.' };
    }

    const datos = {
      infoPersonal: {
        nombre: formData.get('nombre')?.trim(),
        curp: formData.get('curp')?.trim(),
        telefono: formData.get('telefono')?.trim(),
        correo: formData.get('correo')?.trim(),
        domicilio: {
          calle: formData.get('calle')?.trim(),
          numero: formData.get('numero')?.trim(),
          colonia: formData.get('colonia')?.trim(),
          municipio: formData.get('municipio')?.trim(),
          estado: formData.get('estado')?.trim(),
          cp: formData.get('cp')?.trim()
        },
        contactoEmergencia: {
          nombre: formData.get('nombreEmergencia')?.trim(),
          parentesco: formData.get('parentesco')?.trim(),
          telefono: formData.get('telefonoEmergencia')?.trim()
        },
        identificacion: {
          tipo: formData.get('tipoIdentificacion')?.trim(),
          numero: formData.get('numeroIdentificacion')?.trim()
        }
      },

      contrato: {
        departamento,
        fechaInicio,
        fechaFin,
        tiempoEstadia,
        cantidadPago: parseInt(formData.get('cantidadPago'), 10),
        fechaPago
      },

      statusControl: {
        estadoPago: "pagado",
        modoControl: "automatico",
        manualExpira: null,
        cerradura: "encendido",
        creadoEn: new Date().toISOString(),
        sensores: {
          aguaMax: { valor: 0, fecha: null },
          temperaturaMax: { valor: 0, fecha: null },
          humedadMax: { valor: 0, fecha: null },
          humoMax: { valor: 0, fecha: null }
        }
      }
    };

    await setDoc(doc(db, 'inquilinos', idInquilino), datos);
    await updateDoc(doc(db, 'departamentos', departamento), {
      disponible: false
    });

    console.log(`✅ Inquilino ${idInquilino} registrado correctamente.`);
    return { success: true, message: '✅ Registro exitoso.' };

  } catch (error) {
    console.error('❌ Error registrando inquilino:', error);
    return { success: false, message: '❌ Ocurrió un error al registrar.' };
  }
}

console.log('✅ registrarInquilino.js cargado correctamente.');
