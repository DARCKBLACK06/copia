export function generarCodigoArduino(numeroDepartamento, ssid, password) {
  return `
// ============================================
// Código generado para Departamento ${numeroDepartamento}
// Sensor: DHT22
// Bibliotecas necesarias:
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

// --- WiFi ---
#define WIFI_SSID "${ssid}"
#define WIFI_PASSWORD "${password}"

// --- Firebase ---
#define FIREBASE_HOST "mi-proyecto-iot-b161b-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "qnb6YxukBZMFfJKgrUS5KxVwmIkQeQUPYsfbLsTR"

FirebaseData firebaseData;
DHT dht(DHTPIN, DHTTYPE);

// Ruta personalizada en Firebase
String basePath = "/departamentos/${numeroDepartamento}";

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi conectado");

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  dht.begin();
}

void loop() {
  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();

  if (isnan(temperatura) || isnan(humedad)) {
    Serial.println("Error leyendo del sensor DHT22");
    return;
  }

  Serial.printf("Temperatura: %.2f °C | Humedad: %.2f %%\n", temperatura, humedad);

  // Enviar datos a Firebase
  Firebase.setFloat(firebaseData, basePath + "/temperatura", temperatura);
  Firebase.setFloat(firebaseData, basePath + "/humedad", humedad);

  delay(5000); // Envío cada 5 segundos
}

`;
}
