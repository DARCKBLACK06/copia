import { setupCharts, setRelay } from './main.js';
import { dbRealtime } from './firebase-config.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js';

// Verificar conexión con Firebase
get(ref(dbRealtime, '/'))
  .then(() => console.log('Conexión exitosa con Firebase Realtime Database'))
  .catch(error => console.error('Error conectando a Firebase:', error));

// Configurar gráficos
const charts = setupCharts();

// setRelay para botón global
window.setRelay = setRelay;
