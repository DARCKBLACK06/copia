export function inicializarRegistroSensor() {
  const btnGenerarCodigo = document.getElementById('btnGenerarCodigo');

  btnGenerarCodigo.addEventListener('click', () => {
    const numeroDepartamento = document.getElementById('numeroDepartamento').value.trim();
    const ssid = document.getElementById('ssidWifi').value.trim();
    const password = document.getElementById('passwordWifi').value.trim();

    if (!numeroDepartamento || !ssid || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const codigo = `
// ============================================
// Código generado para Departamento ${numeroDepartamento}
// Requiere las siguientes bibliotecas:
// - DHT sensor library by Adafruit
// - Adafruit Unified Sensor
// - Firebase ESP32 (by Mobizt)
// ============================================

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <DHT.h>

// --- Pines ---
#define DHTPIN 4         // Pin del sensor DHT22
#define DHTTYPE DHT22

#define MQ2_PIN 34       // Pin analógico del MQ-2
#define FLOW_SENSOR 26   // YF-S201: pin digital (con interrupción)
#define RELAY_PIN 27     // Relé para cerradura (activo en LOW)

// --- WiFi ---
#define WIFI_SSID "${ssid}"
#define WIFI_PASSWORD "${password}"

// --- Firebase ---
#define FIREBASE_HOST "mi-proyecto-iot-b161b-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "qnb6YxukBZMFfJKgrUS5KxVwmIkQeQUPYsfbLsTR"

FirebaseData firebaseData;
DHT dht(DHTPIN, DHTTYPE);

// --- Flujo de agua ---
volatile int flujoPulsos = 0;
unsigned long ultimoEnvio = 0;

String basePath = "departamento_${numeroDepartamento}";

void IRAM_ATTR contarPulso() {
  flujoPulsos++;
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Conectando a WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado a WiFi");

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  dht.begin();
  pinMode(MQ2_PIN, INPUT);
  pinMode(FLOW_SENSOR, INPUT_PULLUP);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Cerradura cerrada por defecto

  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR), contarPulso, RISING);
}

void loop() {
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();
  int mq2_valor = analogRead(MQ2_PIN);

  // Flujo en L/min aproximado
  unsigned long tiempoActual = millis();
  float flujoLmin = (flujoPulsos * 2.25);
  if (tiempoActual - ultimoEnvio >= 5000) {
    ultimoEnvio = tiempoActual;

    // Enviar a Firebase
    Firebase.setFloat(firebaseData, basePath + "/temperatura", temperatura);
    Firebase.setFloat(firebaseData, basePath + "/humedad", humedad);
    Firebase.setInt(firebaseData, basePath + "/gas", mq2_valor);
    Firebase.setFloat(firebaseData, basePath + "/flujo_agua", flujoLmin);

    // Lógica del relé (simulada aquí, deberías basarla en pago real)
    bool pagoRealizado = true; // Esto debería venir de Firebase
    digitalWrite(RELAY_PIN, pagoRealizado ? HIGH : LOW);
    
    flujoPulsos = 0; // Reset flujo
  }

  delay(1000);
}
`;

    // Generar archivo para descarga
    const blob = new Blob([codigo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ESP32_dpto${numeroDepartamento}.ino`; // <- AQUÍ ESTABA EL ERROR
    a.click();
    URL.revokeObjectURL(url);

    // Cerrar el modal después de descargar
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistroSensor'));
    modal.hide();
  });
}
