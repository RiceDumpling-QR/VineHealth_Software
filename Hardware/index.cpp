# include "index.h"

// NDVI
float calculateNDVI(float nir, float red){
    if ((nir + red == 0)) return 0; // division by 0
    return (nir - red) / (nir + red)
}

// GNDVI
float calculateGNDVI(float nir, float green){
    if ((nir + green == 0)) return 0; // division by 0
    return (nir - green) / (nir + green)
}

// SAVI
float calculateSAVI(float nir, float red, float L){
    denumerator = nir + red + L
    if (denumerator == 0) return 0; // division by 0
    numerator = nir - red
    return (numerator/denumerator) * (1 + L)
}

// CWSI
float calculateCWSI(float airTemp, float leafTemp, float wetTemp, float dryTemp){
    denumerator = (leafTemp - airTemp) - (wetTemp - airTemp)
    if (denumerator == 0) return 0; // division by 0
    numerator = (dryTemp - airTemp) - (wetTemp - airTemp)

    return (numerator/denumerator)
}