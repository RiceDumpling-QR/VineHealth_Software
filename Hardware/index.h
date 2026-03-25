// declare all the indices

#ifndef indices
#define indices

float calculateNDVI(float nir, float red);
float calculateGNDVI(float nir, float red);
float calculateSAVI(float nir, float red, float L);
float calculateCWSI(float airTemp, float leafTemp, float wetTemp, float dryTemp);

#endif