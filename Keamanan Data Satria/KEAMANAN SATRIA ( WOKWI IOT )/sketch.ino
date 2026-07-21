#include <WiFi.h>
#include <DHT.h>
#include <HTTPClient.h>

#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""

// URL WAJIB pakai /rest/v1/sensor_data
#define SUPABASE_URL "https://pqeeujhjioclijlsafif.supabase.co/rest/v1/sensor_data"
#define SUPABASE_API_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZWV1amhqaW9jbGlqbHNhZmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjIwODIsImV4cCI6MjA5ODQ5ODA4Mn0.keY1b1XJe9ri3d-H4Eaj4dk0UivC7ppX-3my_DcGz7M"

#define DHTPIN 15
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Mode Wi-Fi Station
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.println("\nMenghubungkan ke Wokwi-GUEST...");
  
  // Timeout 15 detik
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 30) {
    delay(500);
    Serial.print(".");
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[SUCCESS]: Wi-Fi Terhubung!");
  } else {
    Serial.println("\n[ERROR]: Gagal. Tekan F5 (Refresh) di Browser Anda.");
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float s = dht.readTemperature();
    float k = dht.readHumidity();

    if (!isnan(s) && !isnan(k)) {
      HTTPClient http;
      http.begin(SUPABASE_URL);
      http.addHeader("apikey", SUPABASE_API_KEY);
      http.addHeader("Authorization", "Bearer " + String(SUPABASE_API_KEY));
      http.addHeader("Content-Type", "application/json");

      String json = "{\"suhu\":" + String(s) + ",\"kelembaban\":" + String(k) + "}";
      int code = http.POST(json);
      
      Serial.println("Data: " + String(s) + "C, " + String(k) + "% | Status: " + String(code));
      http.end();
    }
  }
  delay(10000); // Kirim tiap 10 detik
}