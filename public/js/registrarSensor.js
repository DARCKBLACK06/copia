export function generarCodigoArduino(numeroDepartamento, ssid, password) {
  return `
// ============================================
// Código generado para Departamento ${numeroDepartamento}
// Sensores: DHT22 (Temperatura y Humedad), MQ-2 (Humo)
// Librería Firebase ESP Client by Mobizt (Firebase_ESP_Client.h)
// ============================================
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "DHT.h"

// Configuración WiFi 
#define WIFI_SSID "${ssid}"
#define WIFI_PASSWORD "${password}"

// Configuración Firebase
#define FIREBASE_HOST "mi-proyecto-iot-b161b-default-rtdb.firebaseio.com"
#define FIREBASE_SECRET "qnb6YxukBZMFfJKgrUS5KxVwmIkQeQUPYsfbLsTR"

// Configuración DHT22
#define DHTPIN 4        // Pin del sensor
#define DHTTYPE DHT22   // Tipo de sensor DHT22

// Configuración MQ-2
#define MQ2_PIN 34      // Pin analógico para MQ-2 (GPIO34 recomendado en ESP32)

// Configuración LED
#define LED_PIN 2       // Pin del LED integrado (o usa otro GPIO)

DHT dht(DHTPIN, DHTTYPE); // Objeto DHT
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

String basePath = "/departamentos/depto${numeroDepartamento}/sensor_DHT22";

unsigned long sendDataPrevMillis = 0;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(LED_PIN, OUTPUT); // Configurar el pin del LED como salida
  pinMode(MQ2_PIN, INPUT);  // Pin analógico MQ-2

  // Conexión WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando al WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_PIN, !digitalRead(LED_PIN)); // LED parpadeando durante conexión
  }
  Serial.println();
  Serial.print("¡Conectado! IP: ");
  Serial.println(WiFi.localIP());
  digitalWrite(LED_PIN, HIGH); // LED encendido al conectar

  // Configurar Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_SECRET;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  delay(1000);
  digitalWrite(LED_PIN, LOW); // LED apagado después de configurar Firebase
}

void loop() {
  if (Firebase.ready() && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    
    digitalWrite(LED_PIN, HIGH); // Indicar inicio de lectura

    // Leer datos DHT22
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // Leer MQ-2 analógico y mapear a porcentaje 0-100
    int humoRaw = analogRead(MQ2_PIN);
    float humo = map(humoRaw, 0, 4095, 0, 100);

    if (isnan(h) || isnan(t)) {
      Serial.println("¡Error leyendo el DHT22! Revisa conexiones.");
      digitalWrite(LED_PIN, LOW);
      return;
    }

    Serial.print("Humedad: ");
    Serial.print(h);
    Serial.print("% | Temperatura: ");
    Serial.print(t);
    Serial.print("°C | Humo: ");
    Serial.print(humo);
    Serial.println("%");

    bool sendSuccess = true;

    if (!Firebase.RTDB.setFloat(&fbdo, basePath + "/humedad", h)) {
      Serial.println("Error en humedad: " + fbdo.errorReason());
      sendSuccess = false;
    }
    if (!Firebase.RTDB.setFloat(&fbdo, basePath + "/temperatura", t)) {
      Serial.println("Error en temperatura: " + fbdo.errorReason());
      sendSuccess = false;
    }
    if (!Firebase.RTDB.setFloat(&fbdo, basePath + "/humo", humo)) {
      Serial.println("Error en humo: " + fbdo.errorReason());
      sendSuccess = false;
    }

    FirebaseJson json;
    json.set("humedad", h);
    json.set("temperatura", t);
    json.set("humo", humo);
    json.set("timestamp", millis() / 1000);

    if (!Firebase.RTDB.setJSON(&fbdo, basePath + "/datos_completos", &json)) {
      Serial.println("Error en JSON: " + fbdo.errorReason());
      sendSuccess = false;
    }

    // Feedback LED
    if (sendSuccess) {
      for (int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(100);
        digitalWrite(LED_PIN, LOW);
        delay(100);
      }
      Serial.println("Datos enviados correctamente a Firebase");
    } else {
      for (int i = 0; i < 2; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(500);
        digitalWrite(LED_PIN, LOW);
        delay(500);
      }
    }
  }
}
`;
}
