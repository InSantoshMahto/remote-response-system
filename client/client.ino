#include <WiFi.h>
#include <PubSubClient.h>
#include <Keypad.h>
#include "rgb.h"

#ifndef SSID
#define SSID "your SSID"
#define PASS "your password"
#endif

/**
 * mqtt Config
 */

const char *mqttServer = "your server IpAddress";
const int mqttPort = 1883; //for ssl use 8883
const char *mqttUser = "your username";
const char *mqttPassword = "your password";

#define STATUS "XXXXXXXXX/status"
#define SESSION "XXXXXXXXX/session"
#define QUESTION "XXXXXXXXX/question"
#define ANS "XXXXXXXXX/ans"

WiFiClient client;
PubSubClient mqttClient(client);

// status valiable
bool sessionStatus = 0;
bool questionStatus = 0;
const char *myAns;

// pin for OUTPUT RGB LED
#define RED 21
#define GREEN 23
#define BLUE 22
// rgb led
Rgb rgb(RED, GREEN, BLUE);

/**
 * keypad
*/
const byte ROWS = 4; //four rows
const byte COLS = 3; //four columns

// pin for Keypad
#define rowOne 13
#define rowTwo 12
#define rowThree 14
#define rowFour 27
#define colOne 26
#define colTwo 25
#define colThree 33

//define the cymbols on the buttons of the keypads
char hexaKeys[ROWS][COLS] = {
    {'1', '2', '3'},
    {'4', '5', '6'},
    {'7', '8', '9'},
    {'*', '0', '#'}};

byte rowPins[ROWS] = {rowOne, rowTwo, rowThree, rowFour}; //connect to the row pinouts of the keypad
byte colPins[COLS] = {colOne, colTwo, colThree};          //connect to the column pinouts of the keypad

//initialize an instance of class NewKeypad
Keypad customKeypad = Keypad(makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS);

void ledStatus()
{
    if (sessionStatus)
    {
        if (questionStatus)
        {
            rgb.green();
            delay(25);
            rgb.off();
            delay(25);
        }
        else
            rgb.green();
    }
    else
    {
        rgb.blue();
    }
}

/**
 * wifi setup
 */
void initWifiStation()
{
    rgb.off();
    Serial.print("\nConnecting to WiFi");
    WiFi.mode(WIFI_AP_STA);
    WiFi.begin(SSID, PASS);
    while (WiFi.status() != WL_CONNECTED)
    {
        rgb.yellow();
        delay(500);
        Serial.print(".");
        rgb.off();
    }
    rgb.white();
    Serial.print("\nConnected to the IpAddress: ");
    Serial.println(WiFi.localIP());
}

void initMQTTClient()
{

    rgb.off();
    // Connecting to MQTT server
    while (!mqttClient.connected())
    {
        rgb.yellow();
        Serial.println(String("Connecting to MQTT (") + mqttServer + ")...");
        if (mqttClient.connect("your device id or client id", mqttUser, mqttPassword))
        {
            rgb.off();
            Serial.println("MQTT client connected");
            delay(500);
        }
        else
        {
            rgb.off();
            Serial.print("\nFailed with state ");
            Serial.println(mqttClient.state());

            if (WiFi.status() != WL_CONNECTED)
            {
                initWifiStation();
            }
            delay(500);
        }
    }

    rgb.blue();
    mqttClient.publish(STATUS, "Read to Rocks.");
    // Declare Pub/Sub topics
    mqttClient.subscribe(STATUS);
    mqttClient.subscribe(SESSION);
    mqttClient.subscribe(QUESTION);
    mqttClient.subscribe(ANS);
}

void PubSubCallback(char *topic, byte *payload, unsigned int length)
{
    String strPayload = "";
    String myTopic = topic;

    Serial.print("Topic:");
    Serial.println(topic);
    Serial.print("Message:");
    for (int i = 0; i < length; i++)
    {
        Serial.print((char)payload[i]);
        strPayload += (char)payload[i];
    }
    Serial.println();
    Serial.println("-----------------------");

    // session Started
    if (myTopic == SESSION && strPayload == "start")
        sessionStatus = 1;
    else if (strPayload == "stop")
        sessionStatus = 0;

    // session is started
    if (sessionStatus)
    {
        // question is started
        if (myTopic == QUESTION && strPayload == "start")
            questionStatus = 1;
        else if (myTopic == QUESTION && strPayload == "stop")
            questionStatus = 0;
    }
}

void setup()
{
    delay(1000);
    /**
     * pin mode  Config
    */
    pinMode(RED, OUTPUT);
    pinMode(GREEN, OUTPUT);
    pinMode(BLUE, OUTPUT);

    // boot
    rgb.blue();
    delay(500);
    rgb.green();
    delay(500);
    rgb.off();
    delay(500);

    // Serial monitor started
    Serial.begin(115200);
    Serial.println("\n\nPenPencil client Started:");

    // task
    initWifiStation();
    mqttClient.setServer(mqttServer, mqttPort);
    mqttClient.setCallback(PubSubCallback);
    initMQTTClient();
}

void loop()
{
    // mqtt reconnect if disconnected
    if (!mqttClient.connected())
    {
        initMQTTClient();
    }

    // mqtt loop
    mqttClient.loop();

    /**
     * keypad reletaed task
    */
    char customKey = customKeypad.getKey();

    if (customKey)
    {
        // Serial.println(customKey);
        String myKey = String(customKey);
        for (size_t i = 0; i < 1; i++)
        {
            myAns = &myKey[i];
        }
        Serial.print("key pressed:\t");
        Serial.println(myAns);
        if (questionStatus)
        {
            mqttClient.publish(ANS, myAns);
            Serial.println("ans publised.");
            questionStatus = 0;
        }
    }

    // notification or status
    ledStatus();
}
