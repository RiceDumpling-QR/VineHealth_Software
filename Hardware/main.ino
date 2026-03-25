// main files for ESP32

#include <Adafruit_BME280.h>
# include "index.h"

Adafruit_BME280 bme;
float temperature, humidity;

void setup(){
    // Wifi and sensor setup
    Serial.begin(115200);
    delay(100);

    // start temperature and humidity sensor
    bme.begin(0x76);   
}

void loop(){
    // call index functions
    float ndvi = calculateNDVI(nir, red);
    float gndvi = calculateNDVI(nir, green);
    float savi = calculateSAVI(nir, red, L);
    float cwsi = calculateCWSI(airTemp, leafTemp, wetTemp, dryTemp);

    // call thermal camera

    // send via wifi

    // save to sd card
}