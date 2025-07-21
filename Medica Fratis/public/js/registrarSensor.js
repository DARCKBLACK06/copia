export function generarCodigoArduino(numeroDepartamento, ssid, password) {
  return `
// ============================================
// Código para Departamento ${numeroDepartamento}
// Sensores: DHT22, MQ-2, YF-S201 (flujo de agua)
// Librería Firebase ESP Client by Mobizt
// ============================================
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "DHT.h"

// Config WiFi
#define WIFI_SSID "${ssid}"
#define WIFI_PASSWORD "${password}"

// Config Firebase
#define FIREBASE_HOST "mi-proyecto-iot-b161b-default-rtdb.firebaseio.com"
#define FIREBASE_SECRET "qnb6YxukBZMFfJKgrUS5KxVwmIkQeQUPYsfbLsTR"

// Pines sensores
#define DHTPIN 4
#define DHTTYPE DHT22

#define MQ2_PIN 34    // sensor de humo (analógico)
#define FLOW_SENSOR_PIN 14  // pin del YF-S201 (puedes ajustar)

// Variables globales para flujo agua
volatile int pulseCount;  
float flowRate;
unsigned long oldTime = 0;

DHT dht(DHTPIN, DHTTYPE);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Corregido aquí: ruta sin 'dpto' duplicado
String basePath = "/departamentos/depto${numeroDepartamento}/sensores";

unsigned long sendDataPrevMillis = 0;

void IRAM_ATTR pulseCounter() {
  pulseCount++;  // incrementa el pulso del sensor de flujo
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(MQ2_PIN, INPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);

  // Interrupción para contar pulsos del sensor de flujo
  pulseCount = 0;
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, RISING);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando al WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado al WiFi");

  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_SECRET;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  delay(1000);
}

void loop() {
  if (Firebase.ready() && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    // Leer DHT22
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // Leer MQ-2 analógico y mapear a porcentaje 0-100
    int humoRaw = analogRead(MQ2_PIN);
    float humo = map(humoRaw, 0, 4095, 0, 100);

    // Calcular flujo de agua (litros por minuto)
    unsigned long currentTime = millis();
    unsigned long deltaTime = currentTime - oldTime;

    // Calcular flowRate solo si ha pasado 1 segundo para evitar ruido
    if (deltaTime >= 1000) {
      detachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN));
      flowRate = (pulseCount / 7.5);  // fórmula típica YF-S201: pulses per liter
      pulseCount = 0;
      oldTime = currentTime;
      attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, RISING);
    }

    if (isnan(h) || isnan(t)) {
      Serial.println("Error leyendo DHT22");
      return;
    }

    Serial.printf("Humedad: %.2f%% | Temp: %.2fC | Humo: %.2f%% | Agua: %.3f L/min\\n", h, t, humo, flowRate);

    bool sendSuccess = true;

    // Guardar solo dentro de datos_completos para evitar redundancia
    FirebaseJson json;
    json.set("humedad", h);
    json.set("temperatura", t);
    json.set("humo", humo);
    json.set("agua", flowRate);
    json.set("timestamp", millis() / 1000);

    if (!Firebase.RTDB.setJSON(&fbdo, basePath + "/datos_completos", &json)) {
      Serial.println("Error enviando JSON: " + fbdo.errorReason());
      sendSuccess = false;
    }

    if (sendSuccess) {
      Serial.println("Datos enviados correctamente a Firebase");
    }
  }
}
  `;
}
