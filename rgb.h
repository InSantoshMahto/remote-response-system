/**
 * rgh library created by Santosh Mahto.
 * RGB lib for remote projects.
*/

#ifndef Rgb_h
#define Rgb_h

class Rgb
{
  private:
    int redLedPin, greenLedPin, blueLedPin;
  public:
    Rgb(int, int, int);
    void red();
    void green();
    void yellow();
    void blue();
    void white();
    void off();
    void worker(int, int, int);
};

#endif