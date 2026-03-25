import csv

def calulate_ligth():

    red = 0
    green = 0
    blue = 0
    nir = 0

    with open("SpectroscopyDataSimulation/spectral_data.csv",  newline='', encoding='utf-8') as f: #
        read = csv.reader(f)
        header = next(read)

        for row in read:
            red += float(row[10])
            green += float(row[6])
            blue += float(row[3])
            nir += float(row[15])
        
        red = red / 10
        green = green / 10
        blue = blue / 10
        nir = nir / 10

    print(red, green, blue, nir)
    return red, green, blue, nir

calulate_ligth()

    