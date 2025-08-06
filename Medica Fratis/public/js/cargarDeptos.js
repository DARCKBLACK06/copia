// === Importa Firestore ===
import { db } from "../app/firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

// === Función: Cargar departamentos disponibles en el formulario ===
export async function cargarDeptos() {
  try {
    const select = document.getElementById("departamentoSelect");
    if (!select) {
      console.error('❌ No se encontró el select con id "departamentoSelect"');
      return;
    }

    // Limpia opciones anteriores (mantiene la primera)
    select.length = 1;

    // Consulta departamentos disponibles
    const departamentosRef = collection(db, "departamentos");
    const disponiblesQuery = query(
      departamentosRef,
      where("disponible", "==", true)
    );
    const snapshot = await getDocs(disponiblesQuery);

    if (snapshot.empty) {
      const option = document.createElement("option");
      option.disabled = true;
      option.textContent = "No hay departamentos disponibles";
      select.appendChild(option);
      console.warn("⚠️ No hay departamentos disponibles.");
      return;
    }

    // Construye arreglo de departamentos
    const departamentos = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      departamentos.push({ id: doc.id, ...data });
    });

    // Ordena numéricamente por el campo "numero"
    departamentos.sort((a, b) => {
      const numA = parseInt(a.numero || a.id, 10);
      const numB = parseInt(b.numero || b.id, 10);
      return numA - numB;
    });

    // Llena el select con los departamentos ordenados
    departamentos.forEach((dep) => {
      const option = document.createElement("option");
      option.value = dep.id;
      const piso = dep.nivel ? ` - Piso ${dep.nivel}` : "";
      option.textContent = `Departamento ${String(dep.numero).padStart(2, "0")}${piso}`;
      select.appendChild(option);
    });

    console.log("✅ Departamentos disponibles cargados correctamente.");
  } catch (error) {
    console.error("❌ Error al cargar departamentos:", error);
  }
}

console.log("Modulo cargado");
