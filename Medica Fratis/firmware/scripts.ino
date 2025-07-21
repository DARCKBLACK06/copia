#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// Configuración WiFi
#define WIFI_SSID "tu_SSID"
#define WIFI_PASSWORD "tu_PASSWORD"

// Configuración Firebase
#define API_KEY "AIzaSyCXKWpkb5rR8WFss0PyVwExjLrO_OI30Tg"
#define DATABASE_URL "prueba-5a1c4-default-rtdb.firebaseio.com/"

// Configuración sensores
#define DHTPIN 4
#define DHTTYPE DHT22
#define MQPIN 34
#define FLOW_SENSOR_PIN 35
#define RELAY_PIN 32

// Umbrales para control
#define GAS_THRESHOLD 300
#define TEMP_THRESHOLD 40
#define FLOW_THRESHOLD 10 // litros/minuto

// Variables
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

DHT dht(DHTPIN, DHTTYPE);
unsigned long sendDataPrevMillis = 0;
int count = 0;
bool signupOK = false;

volatile int pulseCount;  
float flowRate;
unsigned int flowMilliLitres;
unsigned long totalMilliLitres;
unsigned long oldTime;

void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  
  // Inicializar sensores
  dht.begin();
  pinMode(MQPIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Inicia con relé apagado
  
  // Configurar caudalímetro
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  pulseCount = 0;
  flowRate = 0.0;
  flowMilliLitres = 0;
  totalMilliLitres = 0;
  oldTime = 0;
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);
  
  // Conectar WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Conectado con IP: ");
  Serial.println(WiFi.localIP());
  
  // Configurar Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Registro en Firebase exitoso");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }
  
  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // Leer sensores
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  int gasValue = analogRead(MQPIN);
  
  // Calcular caudal
  if ((millis() - oldTime) > 1000) {
    detachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN));
    flowRate = ((1000.0 / (millis() - oldTime)) * pulseCount) / 7.5;
    oldTime = millis();
    flowMilliLitres = (flowRate / 60) * 1000;
    totalMilliLitres += flowMilliLitres;
    
    pulseCount = 0;
    attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);
  }
  
  // Control del relé basado en umbrales
  bool safeConditions = (gasValue < GAS_THRESHOLD) && 
                       (temperature < TEMP_THRESHOLD) && 
                       (flowRate < FLOW_THRESHOLD);
  
  digitalWrite(RELAY_PIN, safeConditions ? HIGH : LOW);
  
  // Enviar datos a Firebase cada 5 segundos
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    
    // Enviar datos de sensores
    Firebase.RTDB.setFloat(&fbdo, "sensors/temperature", temperature);
    Firebase.RTDB.setFloat(&fbdo, "sensors/humidity", humidity);
    Firebase.RTDB.setInt(&fbdo, "sensors/gas", gasValue);
    Firebase.RTDB.setFloat(&fbdo, "sensors/flow_rate", flowRate);
    Firebase.RTDB.setFloat(&fbdo, "sensors/total_flow", totalMilliLitres / 1000.0);
    
    // Enviar estado del relé
    Firebase.RTDB.setBool(&fbdo, "relay/status", safeConditions);
    Firebase.RTDB.setString(&fbdo, "relay/last_update", String(millis()));
    
    // Enviar alertas si hay condiciones peligrosas
    if (!safeConditions) {
      String alertMsg = "";
      if (gasValue >= GAS_THRESHOLD) alertMsg += "Gas alto! ";
      if (temperature >= TEMP_THRESHOLD) alertMsg += "Temperatura alta! ";
      if (flowRate >= FLOW_THRESHOLD) alertMsg += "Flujo alto! ";
      
      Firebase.RTDB.setString(&fbdo, "alerts/last_alert", alertMsg);
      Firebase.RTDB.setInt(&fbdo, "alerts/timestamp", millis());
    }
    
    count++;
  }
  
  delay(100); // Pequeña pausa entre lecturas
}