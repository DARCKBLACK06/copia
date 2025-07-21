import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDt_zRk8puKQK843Ro9B_5SegOibMXFblY",
  authDomain: "prueba-5a1c4.firebaseapp.com",
  databaseURL: "https://prueba-5a1c4-default-rtdb.firebaseio.com",
  projectId: "prueba-5a1c4",
  storageBucket: "prueba-5a1c4.appspot.com",
  messagingSenderId: "302108382685",
  appId: "1:302108382685:web:3666bc3b9250059704d234"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);

// Realtime (solo sensores)
export const dbRealtime = getDatabase(app);

// Firestore (usuarios, contratos, pagos, fechas)
export const dbFirestore = getFirestore(app);
