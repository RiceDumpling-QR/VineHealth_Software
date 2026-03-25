# file to generate fake raw data coming from the spectroscopy triad sensor 

import csv
import random

filename = "spectral_data.csv"
header = ["A","B","C","D","E","F","G","H","R","I","S","J","T","U","V","W","K","L"]
samples = 10 # assume we will set the sensor to collect one sample per minute


with open(filename, mode="w", newline="") as file:
    write = csv.writer(file)
    write.writerow(header)

    for _ in range(samples):
        row = []
        for i in range(len(header)):
            # numbers calulcated by looking at the peak for that letter and doing +-35
            if (i == 0): value = random.randint(375, 445) #A
            if (i == 1): value = random.randint(400, 470) #B
            if (i == 2): value = random.randint(425, 495) #C
            if (i == 3): value = random.randint(450, 520) #D
            if (i == 4): value = random.randint(475, 545) #E
            if (i == 5): value = random.randint(500, 570) #F
            if (i == 6): value = random.randint(525, 595) #G
            if (i == 7): value = random.randint(550, 620) #H
            if (i == 8): value = random.randint(575, 645) #R
            if (i == 9): value = random.randint(610, 680) #I
            if (i == 10): value = random.randint(645, 715) #S
            if (i == 11): value = random.randint(670, 740) #J
            if (i == 12): value = random.randint(695, 765) #T
            if (i == 13): value = random.randint(725, 795) #U
            if (i == 14): value = random.randint(775, 845) #V
            if (i == 15): value = random.randint(835, 895) #W
            if (i == 16): value = random.randint(865, 935) #K
            if (i == 17): value = random.randint(905, 975) #L

            row.append(value)

        write.writerow(row)


