import { db } from '../app/firebase.js';
import { collection, doc, getDocs, setDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

const inquilinosCol = collection(db, 'inquilinos');
const departamentosCol = collection(db, 'departamentos');

function calcularDias(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = fin - inicio;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export async function registrarInquilino(formData) {
  try {
    // Obtener número para ID personalizado
    const snapshot = await getDocs(inquilinosCol);
    const count = snapshot.size + 1; // siguiente número

    const idInquilino = `inquilinodpto${count}`;

    // Datos para guardar
    const datosInquilino = {
      nombre: formData.get('nombre'),
      curp: formData.get('curp'),
      telefono: formData.get('telefono'),
      correo: formData.get('correo'),
      domicilio: {
        calle: formData.get('calle'),
        numero: formData.get('numero'),
        colonia: formData.get('colonia'),
        municipio: formData.get('municipio'),
        estado: formData.get('estado'),
        cp: formData.get('cp'),
      },
      contactoEmergencia: {
        nombre: formData.get('nombreEmergencia'),
        parentesco: formData.get('parentesco'),
        telefono: formData.get('telefonoEmergencia'),
      },
      contrato: {
        departamento: formData.get('departamento'),
        fechaInicio: formData.get('fechaInicio'),
        fechaFin: formData.get('fechaFin'),
        tiempoEstadia: calcularDias(formData.get('fechaInicio'), formData.get('fechaFin')),
        cantidadPago: parseInt(formData.get('cantidadPago'), 10),
      },
      identificacion: {
        tipo: formData.get('tipoIdentificacion'),
        numero: formData.get('numeroIdentificacion'),
      },
      creadoEn: new Date().toISOString(),
    };

    // Guardar inquilino
    await setDoc(doc(db, 'inquilinos', idInquilino), datosInquilino);

    // Actualizar departamento a no disponible
    const departamentoRef = doc(db, 'departamentos', datosInquilino.contrato.departamento);
    await updateDoc(departamentoRef, { disponible: false });

    console.log('Inquilino registrado y departamento actualizado sin problemas.');

    return { success: true, message: 'Registro exitoso' };

  } catch (error) {
    console.error('Error registrando inquilino:', error);
    return { success: false, message: 'Error en el registro' };
  }
}
