#include <DHT.h>
#include <Servo.h>
#include <SoftwareSerial.h>
SoftwareSerial bluetooth(A5, A4); // A4 = RX, A5 = TX

// حساس الحرارة
#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// الحساسات
#define SOIL_MOISTURE_PIN 3  // الدبوس الذي يتصل به حساس الرطوبة الرقمي
#define LIGHT_SENSOR_PIN A1
#define FLOW_SENSOR_PIN 9

// المخرجات
#define FAN_RELAY 4
#define RAIN_PUMP 5
#define WATER_PUMP 6
#define FERTILIZER_PUMP 7
#define HEATER_RELAY 8
#define LIGHT_BULB 10

Servo windowServo;

String command = "";
bool isAutoMode = true;

volatile int flowPulseCount = 0;
unsigned long lastFlowCheck = 0;
float flowRate = 0.0;

// إعدادات النبات
int plantType = 0; // 1=طماطم، 2=خيار، 3=فراولة
int fanTemp = 28;
int heaterTemp = 20;
int soilThreshold = 400;
int lightThreshold = 500;

void flowPulse() {
  flowPulseCount++;
}

void updatePlantSettings() {
  switch (plantType) {
    case 1: // طماطم
      fanTemp = 27;
      heaterTemp = 18;
      soilThreshold = 450;
      lightThreshold = 600;
      break;
    case 2: // خيار
      fanTemp = 26;
      heaterTemp = 17;
      soilThreshold = 420;
      lightThreshold = 550;
      break;
    case 3: // فراولة
      fanTemp = 25;
      heaterTemp = 16;
      soilThreshold = 480;
      lightThreshold = 500;
      break;
    default:
      fanTemp = 28;
      heaterTemp = 20;
      soilThreshold = 400;
      lightThreshold = 500;
  }
}

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);

  dht.begin();

  pinMode(SOIL_MOISTURE_PIN, INPUT);  // تهيئة الدبوس لحساس الرطوبة الرقمي
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulse, RISING);

  pinMode(FAN_RELAY, OUTPUT);
  pinMode(RAIN_PUMP, OUTPUT);
  pinMode(WATER_PUMP, OUTPUT);
  pinMode(FERTILIZER_PUMP, OUTPUT);
  pinMode(HEATER_RELAY, OUTPUT);
  pinMode(LIGHT_BULB, OUTPUT);

  windowServo.attach(12);
  windowServo.write(0);

  // الحالة الابتدائية: الأجهزة متوقفة
  digitalWrite(FAN_RELAY, LOW);
  digitalWrite(RAIN_PUMP, LOW);
  digitalWrite(WATER_PUMP, HIGH);
  digitalWrite(FERTILIZER_PUMP, HIGH);
  digitalWrite(HEATER_RELAY, LOW);
  digitalWrite(LIGHT_BULB, LOW);
}

void handleCommand(String cmdSource) {
  if (command == "MODE_AUTO") {
    isAutoMode = true;
    if (cmdSource == "serial") Serial.println("الوضع: تلقائي");
    else bluetooth.println("الوضع: تلقائي");
  } else if (command == "MODE_MANUAL") {
    isAutoMode = false;
    if (cmdSource == "serial") Serial.println("الوضع: يدوي");
    else bluetooth.println("الوضع: يدوي");
  }

  // اختيار نوع النبتة
  else if (command == "PLANT_TOMATO") {
    plantType = 1;
    bluetooth.println("تم اختيار: طماطم");
  } else if (command == "PLANT_CUCUMBER") {
    plantType = 2;
    bluetooth.println("تم اختيار: خيار");
  } else if (command == "PLANT_STRAWBERRY") {
    plantType = 3;
    bluetooth.println("تم اختيار: فراولة");
  }

  if (!isAutoMode) {
    if (command == "FAN_ON") digitalWrite(FAN_RELAY, HIGH);
    else if (command == "FAN_OFF") digitalWrite(FAN_RELAY, LOW);

    else if (command == "WATER_ON") digitalWrite(WATER_PUMP, HIGH);
    else if (command == "WATER_OFF") digitalWrite(WATER_PUMP, LOW);

    else if (command == "FERTILIZER_ON") digitalWrite(FERTILIZER_PUMP, HIGH);
    else if (command == "FERTILIZER_OFF") digitalWrite(FERTILIZER_PUMP, LOW);

    else if (command == "RAIN_ON") digitalWrite(RAIN_PUMP, HIGH);
    else if (command == "RAIN_OFF") digitalWrite(RAIN_PUMP, LOW);

    else if (command == "LIGHT_ON") digitalWrite(LIGHT_BULB, HIGH);
    else if (command == "LIGHT_OFF") digitalWrite(LIGHT_BULB, LOW);

    else if (command == "HEATER_ON") digitalWrite(HEATER_RELAY, HIGH);
    else if (command == "HEATER_OFF") digitalWrite(HEATER_RELAY, LOW);

    else if (command == "WINDOW_OPEN") windowServo.write(90);
    else if (command == "WINDOW_CLOSE") windowServo.write(0);

    if (cmdSource == "serial") Serial.println("OK: " + command);
    else bluetooth.println("OK: " + command);
  }
}

void loop() {
  if (bluetooth.available()) {
    command = bluetooth.readStringUntil('\n');
    command.trim();
    Serial.print("Received from Bluetooth: ");
    Serial.println(command);
    handleCommand("bluetooth");
  }

  if (Serial.available()) {
    command = Serial.readStringUntil('\n');
    command.trim();
    handleCommand("serial");
  }

  if (isAutoMode) {
    updatePlantSettings(); // ← تحديث الإعدادات حسب نوع النبتة

    float temp = dht.readTemperature();
    Serial.println(temp);
    if (isnan(temp)) {
      Serial.println("خطأ في قراءة حساس الحرارة");
      bluetooth.println("خطأ في قراءة حساس الحرارة");
      return;
    }

    int soilMoisture = digitalRead(SOIL_MOISTURE_PIN);  // قراءة حساس الرطوبة الرقمي
    int lightLevel = analogRead(LIGHT_SENSOR_PIN);

    if (millis() - lastFlowCheck >= 1000) {
      noInterrupts();
      int pulses = flowPulseCount;
      flowPulseCount = 0;
      interrupts();

      flowRate = pulses / 7.5;
      lastFlowCheck = millis();

      String data = "Temp: " + String(temp) + "C | Soil: " + (soilMoisture == HIGH ? "جافة" : "رطبة")
                    + " | Light: " + String(lightLevel)
                    + " | Flow: " + String(flowRate) + " L/min";
      bool fanIsOn = false;
      String json = "{";
        json += "\"temperature\":" + String(temp) + ",";
        json += "\"soilMoisture\":\"" + String(soilMoisture == HIGH ? "Dry" : "Wet") + "\",";
        json += "\"lightLevel\":" + String(lightLevel) + ",";
        json += "\"flowRate\":" + String(flowRate) + ",";
        json += "\"fanOn\":" + String(fanIsOn ? "true" : "false");
        json += "}";

      Serial.println(data);
      bluetooth.println(json);
    }

    bool fanIsOn = false;
    if (temp >= 30) {
      digitalWrite(FAN_RELAY, LOW);
      fanIsOn = true;
      digitalWrite(RAIN_PUMP, LOW);
    } else {
      digitalWrite(FAN_RELAY, HIGH);
      fanIsOn = false;
      digitalWrite(RAIN_PUMP, HIGH);
    }

    // ✅ تحريك السيرفو حسب حالة المروحة
    if (fanIsOn) {
      windowServo.write(90);  // فتح النافذة
    } else {
      windowServo.write(0);   // إغلاق النافذة
    }

    // تشغيل السخان حسب درجة الحرارة
    if (temp < 15) digitalWrite(HEATER_RELAY, HIGH);
    else digitalWrite(HEATER_RELAY, LOW);

    // ري وتسميد إذا كانت التربة جافة
    if (soilMoisture == HIGH) {  // إذا كانت التربة جافة
      digitalWrite(WATER_PUMP, LOW);
      digitalWrite(FERTILIZER_PUMP, LOW);
      delay(6000);
      digitalWrite(FERTILIZER_PUMP, HIGH);
      delay(3000);
      digitalWrite(WATER_PUMP, HIGH);
      delay(3000);
    }

    // تشغيل الضوء حسب الإضاءة
    if (lightLevel < 500) digitalWrite(LIGHT_BULB, HIGH);
    else digitalWrite(LIGHT_BULB, LOW);
  }
Serial.println("{\"temperature\":25.5,\"soil\":\"رطبة\",\"light\":600,\"flow\":1.2}");
  delay(200);
}
