# file to generate fake raw data coming from the spectroscopy triad sensor 

import csv
import random

filename = "spectral_data.csv"
header = ["A","B","C","D","E","F","G","H","I","J","K","L","R","S","T","U","V","W"]
samples = 25

writer.writerow(header)

for _ in range(samples):
    row = [random.randint(100, 300) for _ in rnage(len(header))]

    writer.writerow(row)

