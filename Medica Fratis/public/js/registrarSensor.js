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
#include <Preferences.h>
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
float aguaTotal = 0;
float temperaturaMax = 0;
float humedadMax = 0;
float humoMax = 0;
float aguaMax = 0;

unsigned long oldTime = 0;
unsigned long sendDataPrevMillis = 0;

Preferences prefs;
DHT dht(DHTPIN, DHTTYPE);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

String basePath = "/departamentos/depto${numeroDepartamento}/sensores";

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
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_AZUL, LOW);

  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, RISING);

  // Recuperar datos previos
  prefs.begin("mediciones", false);
  aguaTotal = prefs.getFloat("aguaTotal", 0);
  temperaturaMax = prefs.getFloat("tempMax", 0);
  humedadMax = prefs.getFloat("humMax", 0);
  humoMax = prefs.getFloat("humoMax", 0);
  aguaMax = prefs.getFloat("aguaMax", 0);
  prefs.end();

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
  if (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0) {
    sendDataPrevMillis = millis();

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int humoRaw = analogRead(MQ2_PIN);
    float humo = map(humoRaw, 0, 4095, 0, 100);

    unsigned long currentTime = millis();
    unsigned long deltaTime = currentTime - oldTime;
    if (deltaTime >= 1000) {
      detachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN));
      flowRate = (pulseCount / 7.5); // L/min
      aguaTotal += flowRate * (deltaTime / 60000.0); // Litros acumulados
      pulseCount = 0;
      oldTime = currentTime;
      attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, RISING);
    }

    if (isnan(h) || isnan(t)) {
      Serial.println("Error leyendo DHT22");
      return;
    }

    // Detectar máximos
    if (t > temperaturaMax) temperaturaMax = t;
    if (h > humedadMax) humedadMax = h;
    if (humo > humoMax) humoMax = humo;
    if (flowRate > aguaMax) aguaMax = flowRate;

    // Guardar en memoria
    prefs.begin("mediciones", false);
    prefs.putFloat("aguaTotal", aguaTotal);
    prefs.putFloat("tempMax", temperaturaMax);
    prefs.putFloat("humMax", humedadMax);
    prefs.putFloat("humoMax", humoMax);
    prefs.putFloat("aguaMax", aguaMax);
    prefs.end();

    String relayState = "apagado";
    if (Firebase.ready() && Firebase.RTDB.getString(&fbdo, basePath + "/telemetria_actual/cerradura")) {
      relayState = fbdo.stringData();
      digitalWrite(RELAY_PIN, relayState == "encendido" ? LOW : HIGH);
    }

    // Crear JSON
    FirebaseJson json;
    json.set("humedad", h);
    json.set("temperatura", t);
    json.set("humo", humo);
    json.set("agua", flowRate);
    json.set("aguaTotal", aguaTotal);
    json.set("cerradura", relayState);
    json.set("timestamp", millis() / 1000);

    FirebaseJson maximos;
    maximos.set("temperatura", temperaturaMax);
    maximos.set("humedad", humedadMax);
    maximos.set("humo", humoMax);
    maximos.set("agua", aguaMax);
    json.set("maximos", maximos);

    // Enviar si hay WiFi y Firebase listo
    if (WiFi.status() == WL_CONNECTED && Firebase.ready()) {
      bool enviado = Firebase.RTDB.setJSON(&fbdo, basePath + "/telemetria_actual", &json);
      if (enviado) {
        Serial.println("✅ Datos enviados a Firebase");
        digitalWrite(LED_AZUL, HIGH);
        delay(200);
        digitalWrite(LED_AZUL, LOW);
      } else {
        Serial.println("❌ Error al enviar: " + fbdo.errorReason());
      }
    } else {
      Serial.println("⚠️ No hay conexión WiFi o Firebase no está listo.");
    }
  }
}
`;
}
