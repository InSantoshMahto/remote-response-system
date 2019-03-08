/**
 * RGB. RGB led libraries.
*/

// include description files for other libraries used (if any)
#include "Arduino.h"

// include this library's for descriptions.
#include "rgb.h"

// contructor
Rgb::Rgb(int _red, int _green, int _blue)
{
    redLedPin = _red;
    blueLedPin = _blue;
    greenLedPin = _green;
}

void Rgb::red()
{
    worker(1, 0, 0);
}

void Rgb::green()
{
    worker(0, 1, 0);
}

void Rgb::blue()
{
    worker(0, 0, 1);
}

void Rgb::yellow()
{
    worker(1, 1, 0);
}

void Rgb::white()
{
    worker(1, 1, 1);
}

void Rgb::off()
{
    worker(0, 0, 0);
}

void Rgb::worker(int redValue, int greenValue, int blueValue)
{
    digitalWrite(redLedPin, redValue);
    digitalWrite(greenLedPin, greenValue);
    digitalWrite(blueLedPin, blueValue);
}