import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDt_zRk8puKQK843Ro9B_5SegOibMXFblY",
  authDomain: "mi-proyecto-iot-b161b.firebaseapp.com",
  databaseURL: "https://mi-proyecto-iot-b161b-default-rtdb.firebaseio.com",
  projectId: "mi-proyecto-iot-b161b",
  storageBucket: "mi-proyecto-iot-b161b.firebasestorage.app",
  messagingSenderId: "302108382685",
  appId: "1:302108382685:web:3666bc3b9250059704d234"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);

// Inicializar Auth
export const auth = getAuth(app);

// Inicializar Firestore
export const db = getFirestore(app);