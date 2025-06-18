export function generarCodigoArduino(numeroDepartamento, ssid, password) {
  return `
// ============================================
// Código generado para Departamento ${numeroDepartamento}
// Sensor: DHT22
// Librerías necesarias:
// - DHT sensor library by Adafruit (v1.4.6)
// - Firebase Arduino Client Library for ESP8266 and ESP32 (v4.4.17)
// ============================================

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "DHT.h"

// WiFi
#define WIFI_SSID "${ssid}"
#define WIFI_PASSWORD "${password}"

// Firebase
#define FIREBASE_HOST "mi-proyecto-iot-b161b-default-rtdb.firebaseio.com"
#define FIREBASE_SECRET "qnb6YxukBZMFfJKgrUS5KxVwmIkQeQUPYsfbLsTR"

// Sensor DHT
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// LED para indicar estados
#define LED_PIN 2

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;

String mac;
String basePath;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(LED_PIN, OUTPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando al WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConectado a WiFi.");
  digitalWrite(LED_PIN, HIGH);

  mac = WiFi.macAddress();
  basePath = "/departamentos/deptodpto${numeroDepartamento}/" + mac + "/sensor_DHT22";

  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_SECRET;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (Firebase.ready() && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    float t = dht.readTemperature();
    float h = dht.readHumidity();

    if (isnan(t) || isnan(h)) {
      Serial.println("Error leyendo del sensor DHT22");
      return;
    }

    Serial.printf("Temp: %.2f °C | Hum: %.2f %%\n", t, h);

    FirebaseJson json;
    json.set("temperatura", t);
    json.set("humedad", h);
    json.set("timestamp", millis() / 1000);

    if (Firebase.RTDB.setFloat(&fbdo, basePath + "/temperatura", t) &&
        Firebase.RTDB.setFloat(&fbdo, basePath + "/humedad", h) &&
        Firebase.RTDB.setJSON(&fbdo, basePath + "/datos_completos", &json)) {
      Serial.println("✔ Datos enviados a Firebase");
    } else {
      Serial.println("✖ Error al enviar: " + fbdo.errorReason());
    }

    // Feedback LED
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
  }
}
`;
}
