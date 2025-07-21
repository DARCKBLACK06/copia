#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>

// =================== CONFIG ===================
#define WIFI_SSID "Totalplay-75AD"
#define WIFI_PASSWORD "75ADFD68Mv2BxNkx"
#define FIREBASE_HOST "prueba-5a1c4-default-rtdb.firebaseio.com/"
#define FIREBASE_SECRET "I2ddgVPJ15IFg6mO2lZCmXNhgEDxFcpnCrRfVj9e"

// =================== PINES ===================
#define DHTPIN 4
#define DHTTYPE DHT22
#define MQ2_PIN 34
#define FLOW_SENSOR_PIN 14
#define RELAY_PIN 26       // Relé en GPIO26
#define LED_AZUL 2         // LED azul interno en GPIO2

// =================== VARIABLES ===================
volatile int pulseCount = 0;
float flowRate = 0;
unsigned long oldTime = 0;

DHT dht(DHTPIN, DHTTYPE);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

String basePath = "/departamentos/deptodpto1/sensores";
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

  // Apagar al inicio
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_AZUL, LOW);

  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, RISING);

  // Conectar a WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando al WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado al WiFi");

  // Configurar Firebase
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

    // Leer sensores
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int humoRaw = analogRead(MQ2_PIN);
    float humo = map(humoRaw, 0, 4095, 0, 100);

    // Calcular flujo de agua (YF-S201)
    unsigned long currentTime = millis();
    unsigned long deltaTime = currentTime - oldTime;
    if (deltaTime >= 1000) {
      detachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN));
      flowRate = (pulseCount / 7.5); // Ajustar según datasheet del YF-S201
      pulseCount = 0;
      oldTime = currentTime;
      attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, RISING);
    }

    // Validar datos del DHT22
    if (isnan(h) || isnan(t)) {
      Serial.println("Error leyendo DHT22");
      return;
    }

    // Imprimir datos
    Serial.printf("Humedad: %.2f%% | Temp: %.2f°C | Humo: %.2f%% | Agua: %.3f L/min\n", h, t, humo, flowRate);

    // Enviar datos a Firebase
    FirebaseJson json;
    json.set("humedad", h);
    json.set("temperatura", t);
    json.set("humo", humo);
    json.set("agua", flowRate);
    json.set("timestamp", millis() / 1000);

    // Leer estado del relé desde Firebase
    String relayState;
    if (Firebase.RTDB.getString(&fbdo, basePath + "/datos_completos/cerradura")) {
      relayState = fbdo.stringData();
      digitalWrite(RELAY_PIN, relayState == "encendido" ? LOW : HIGH);
      Serial.println("Estado del relé: " + relayState);
    } else {
      Serial.println("Error leyendo estado del relé: " + fbdo.errorReason());
    }

    // Incluir el estado actual del relé en el JSON
    json.set("cerradura", relayState);

    // Enviar JSON a Firebase
    bool sendSuccess = Firebase.RTDB.setJSON(&fbdo, basePath + "/datos_completos", &json);

    if (sendSuccess) {
      Serial.println("Datos enviados correctamente a Firebase");
      digitalWrite(LED_AZUL, HIGH);
      delay(200); // Breve encendido del LED como feedback
      digitalWrite(LED_AZUL, LOW);
    } else {
      Serial.println("Error enviando JSON: " + fbdo.errorReason());
    }
  }
}