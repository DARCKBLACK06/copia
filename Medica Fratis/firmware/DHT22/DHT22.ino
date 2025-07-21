#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "DHT.h"

// Configuración WiFi 
#define WIFI_SSID "Totalplay-75AD"
#define WIFI_PASSWORD "75ADFD68Mv2BxNkx"

// Configuración Firebase
#define FIREBASE_HOST "mi-proyecto-iot-b161b-default-rtdb.firebaseio.com"
#define FIREBASE_SECRET "qnb6YxukBZMFfJKgrUS5KxVwmIkQeQUPYsfbLsTR"

// Configuración DHT22
#define DHTPIN 4        // Pin del sensor
#define DHTTYPE DHT22   // Tipo de sensor DHT22

// Configuración LED
#define LED_PIN 2       // Pin del LED integrado (o usa otro GPIO)

DHT dht(DHTPIN, DHTTYPE); // Objeto DHT
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(LED_PIN, OUTPUT); // Configurar el pin del LED como salida
  
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
    
    // Indicar inicio de lectura con LED
    digitalWrite(LED_PIN, HIGH);
    
    // Leer datos del DHT22
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // Verificar si la lectura falló
    if (isnan(h) || isnan(t)) {
      Serial.println("¡Error leyendo el DHT22! Revisa conexiones.");
      digitalWrite(LED_PIN, LOW);
      return;
    }

    // Mostrar datos en el Serial Monitor
    Serial.print("Humedad: ");
    Serial.print(h);
    Serial.print("% | Temperatura: ");
    Serial.print(t);
    Serial.println("°C");

    // Enviar a Firebase
    bool sendSuccess = true;
    
    if (!Firebase.RTDB.setFloat(&fbdo, "sensor_DHT22/humedad", h)) {
      Serial.println("Error en humedad: " + fbdo.errorReason());
      sendSuccess = false;
    }
    
    if (!Firebase.RTDB.setFloat(&fbdo, "sensor_DHT22/temperatura", t)) {
      Serial.println("Error en temperatura: " + fbdo.errorReason());
      sendSuccess = false;
    }

    // Enviar JSON unificado
    FirebaseJson json;
    json.set("humedad", h);
    json.set("temperatura", t);
    json.set("timestamp", millis() / 1000);

    if (!Firebase.RTDB.setJSON(&fbdo, "sensor_DHT22/datos_completos", &json)) {
      Serial.println("Error en JSON: " + fbdo.errorReason());
      sendSuccess = false;
    }

    // Feedback visual con LED
    if (sendSuccess) {
      // Parpadeo rápido para indicar éxito
      for (int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(100);
        digitalWrite(LED_PIN, LOW);
        delay(100);
      }
      Serial.println("Datos enviados correctamente a Firebase");
    } else {
      // Parpadeo lento para indicar error
      for (int i = 0; i < 2; i++) {
        digitalWrite(LED_PIN, HIGH);
        delay(500);
        digitalWrite(LED_PIN, LOW);
        delay(500);
      }
    }
  }
}