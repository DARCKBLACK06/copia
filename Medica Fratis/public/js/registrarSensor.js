export function generarCodigoArduino(numeroDepartamento, ssid, password) {
  return `
// ============================================
// Código para Departamento ${numeroDepartamento}
// Sensores: DHT22, MQ-2, YF-S201 (flujo de agua)
// Control de cerradura y LED de estado
// Librería: Firebase ESP Client by Mobizt
// ============================================

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "DHT.h"

// =================== CONFIGURACIÓN ===================
#define WIFI_SSID "${ssid}"
#define WIFI_PASSWORD "${password}"
#define FIREBASE_HOST "mi-proyecto-iot-b161b-default-rtdb.firebaseio.com"
#define FIREBASE_SECRET "qnb6YxukBZMFfJKgrUS5KxVwmIkQeQUPYsfbLsTR"

// === Pines ===
#define DHTPIN 4
#define DHTTYPE DHT22
#define MQ2_PIN 34
#define FLOW_SENSOR_PIN 14
#define RELAY_PIN 25
#define LED_AZUL 2

// =================== VARIABLES ===================
volatile int pulseCount = 0;
float flowRate = 0;
unsigned long oldTime = 0;

DHT dht(DHTPIN, DHTTYPE);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

String basePath = "/departamentos/depto${numeroDepartamento}/sensores";
unsigned long sendDataPrevMillis = 0;

// =================== INTERRUPCIÓN ===================
void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

// =================== SETUP ===================
void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(MQ2_PIN, INPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_AZUL, OUTPUT);

  // Estado inicial apagado
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_AZUL, LOW);

  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, RISING);

  // Conexión WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando al WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Conectado ✅");

  // Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_SECRET;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  delay(1000);
}

// =================== LOOP ===================
void loop() {
  if (Firebase.ready() && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    // === Lecturas ===
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int humoRaw = analogRead(MQ2_PIN);
    float humo = map(humoRaw, 0, 4095, 0, 100);

    // Flujo de agua
    unsigned long currentTime = millis();
    unsigned long deltaTime = currentTime - oldTime;
    if (deltaTime >= 1000) {
      detachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN));
      flowRate = (pulseCount / 7.5);
      pulseCount = 0;
      oldTime = currentTime;
      attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, RISING);
    }

    // Validar DHT22
    if (isnan(h) || isnan(t)) {
      Serial.println("Error leyendo DHT22");
      return;
    }

    // === Estado de cerradura ===
    String relayState = "apagado";
    if (Firebase.RTDB.getString(&fbdo, basePath + "/datos_completos/cerradura")) {
      relayState = fbdo.stringData();
      digitalWrite(RELAY_PIN, relayState == "encendido" ? LOW : HIGH);  // LOW activa el relé
      Serial.println("Estado cerradura: " + relayState);
    } else {
      Serial.println("Error leyendo cerradura: " + fbdo.errorReason());
    }

    // === Crear y enviar JSON ===
    FirebaseJson json;
    json.set("humedad", h);
    json.set("temperatura", t);
    json.set("humo", humo);
    json.set("agua", flowRate);
    json.set("cerradura", relayState);
    json.set("timestamp", millis() / 1000);

    bool enviado = Firebase.RTDB.setJSON(&fbdo, basePath + "/datos_completos", &json);

    if (enviado) {
      Serial.println("Datos enviados correctamente ✅");
      digitalWrite(LED_AZUL, HIGH);
      delay(200);
      digitalWrite(LED_AZUL, LOW);
    } else {
      Serial.println("Error al enviar: " + fbdo.errorReason());
    }
  }
}
`;
}
